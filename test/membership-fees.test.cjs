const { test } = require("node:test");
const assert = require("node:assert/strict");
const { build } = require("esbuild");
async function client() {
  const result = await build({
    entryPoints: ["src/services/membership-fees.ts"],
    bundle: true,
    write: false,
    platform: "node",
    format: "cjs",
    plugins: [
      {
        name: "no-zalo-sdk",
        setup(b) {
          b.onResolve({ filter: /^zmp-sdk/ }, () => {
            throw Error("Fee client must not import Zalo SDK");
          });
        },
      },
    ],
    define: {
      "import.meta.env": JSON.stringify({
        VITE_API_BASE_URL: "http://localhost/api/v1",
      }),
    },
  });
  const module = { exports: {} };
  new Function("module", "exports", "require", result.outputFiles[0].text)(
    module,
    module.exports,
    require,
  );
  return module.exports;
}
test("fee client uses receipt sessions, deduplicates login and refreshes only once on 401", async (t) => {
  const saved = {
    window: global.window,
    fetch: global.fetch,
    localStorage: global.localStorage,
  };
  global.window = { setTimeout, clearTimeout };
  const receipt = "a".repeat(64);
  global.localStorage = { getItem: () => JSON.stringify([receipt]) };
  t.after(() => Object.assign(global, saved));
  const calls = [];
  let loginCount = 0,
    unauthorized = false,
    denyAll = false;
  global.fetch = async (url, options) => {
    calls.push({ url: String(url), options });
    const u = new URL(url);
    if (u.pathname.endsWith("/session")) {
      loginCount++;
      await new Promise((resolve) => setTimeout(resolve, 5));
      return new Response(
        JSON.stringify({
          data: {
            accessToken: "fee-jwt-" + loginCount,
            expiresIn: 1800,
            member: { id: "member-a", name: "A" },
          },
        }),
      );
    }
    if (denyAll || unauthorized) {
      unauthorized = false;
      return new Response(JSON.stringify({ message: "Expired" }), {
        status: 401,
      });
    }
    return new Response(
      JSON.stringify(
        options.method === "POST"
          ? { data: { status: "pending" } }
          : u.pathname.endsWith("my-dues")
            ? {
                data: [{ id: "due-" + u.searchParams.get("page") }],
                pagination: { total: 2 },
              }
            : { data: { id: "own-due", status: "pending_confirmation" } },
      ),
    );
  };
  const api = await client();
  const [rows, detail] = await Promise.all([
    api.getMyFees(),
    api.getMyFee("own-due"),
  ]);
  assert.equal(rows.length, 2);
  assert.equal(detail.status, "pending_confirmation");
  assert.equal(loginCount, 1);
  const login = calls.find((c) => c.url.endsWith("/session"));
  assert.deepEqual(JSON.parse(login.options.body), { tokens: [receipt] });
  assert.equal(login.options.headers.Authorization, undefined);
  for (const call of calls.filter((c) => !c.url.endsWith("/session"))) {
    assert.equal(call.options.headers.Authorization, "Bearer fee-jwt-1");
    assert.equal(call.url.includes(receipt), false);
  }
  const proof = {
    transactionRef: "REF-1",
    proofUrl: "https://example.com/proof",
    note: "Đã chuyển",
  };
  unauthorized = true;
  await api.submitFeeProof("own-due", proof);
  assert.equal(loginCount, 2);
  const sent = calls.at(-1);
  assert.equal(
    new URL(sent.url).pathname,
    "/api/v1/membership-fees/my-dues/own-due/payment-proof",
  );
  assert.equal(sent.options.headers.Authorization, "Bearer fee-jwt-2");
  assert.deepEqual(JSON.parse(sent.options.body), proof);
  denyAll = true;
  await assert.rejects(api.getMyFee("own-due"), /Expired/);
  assert.equal(loginCount, 3);
});
test("fees with no receipt do not call backend or Zalo; unapproved receipts show backend errors", async (t) => {
  const saved = {
    window: global.window,
    fetch: global.fetch,
    localStorage: global.localStorage,
  };
  global.window = { setTimeout, clearTimeout };
  global.localStorage = { getItem: () => "[]" };
  t.after(() => Object.assign(global, saved));
  let calls = 0;
  global.fetch = async () => {
    calls++;
    return new Response(JSON.stringify({ message: "Hồ sơ chưa được duyệt" }), {
      status: 403,
    });
  };
  const api = await client();
  await assert.rejects(api.getMyFees(), /Thiết bị này chưa có mã bí mật/);
  assert.equal(calls, 0);
  global.localStorage = { getItem: () => JSON.stringify(["b".repeat(64)]) };
  await assert.rejects(api.getMyFees(), /Hồ sơ chưa được duyệt/);
  assert.equal(calls, 1);
});
