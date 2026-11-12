const { test } = require("node:test");
const assert = require("node:assert/strict");
const { build } = require("esbuild");
const { resolve } = require("node:path");
test("trade client browses publicly, exchanges only secret receipts, sends JWT for mutations and handles 204", async () => {
  const saved = {
    window: global.window,
    localStorage: global.localStorage,
    fetch: global.fetch,
  };
  const token = "a".repeat(64),
    calls = [],
    actor = {
      id: "member-user",
      role: "BUSINESS",
      status: "ACTIVE",
      displayName: "Hội viên",
    };
  try {
    global.window = {
      setTimeout,
      clearTimeout,
      location: { origin: "http://localhost" },
      dispatchEvent: () => {},
    };
    global.localStorage = {
      getItem: (key) =>
        key === "tanson-registration-receipts" ? JSON.stringify([token]) : null,
    };
    global.fetch = async (url, options = {}) => {
      calls.push({ url, options });
      if (String(url).endsWith("/trade-session"))
        return new Response(
          JSON.stringify({
            success: true,
            data: { accessToken: "trade-jwt", expiresIn: 1800, user: actor },
          }),
        );
      if (options.method === "DELETE")
        return new Response(null, { status: 204 });
      return new Response(JSON.stringify({ success: true, data: [] }));
    };
    const { outputFiles } = await build({
      entryPoints: ["src/services/trade.ts"],
      bundle: true,
      write: false,
      platform: "node",
      format: "cjs",
      alias: { "@": resolve("src") },
      external: ["zmp-sdk/apis"],
      define: {
        "import.meta.env": JSON.stringify({
          VITE_API_BASE_URL: "http://localhost/api/v1",
        }),
      },
    });
    const module = { exports: {} };
    new Function("module", "exports", "require", outputFiles[0].text)(
      module,
      module.exports,
      require,
    );
    const client = module.exports;
    await client.tradeRequest("trade-posts");
    assert.equal(calls.length, 1);
    assert.equal(calls[0].options.headers.Authorization, undefined);
    const [one, two] = await Promise.all([
      client.loginTrade(),
      client.loginTrade(),
    ]);
    assert.equal(one.id, actor.id);
    assert.equal(two.id, actor.id);
    assert.equal(
      calls.filter((call) => String(call.url).endsWith("/trade-session"))
        .length,
      1,
    );
    assert.deepEqual(JSON.parse(calls[1].options.body), { tokens: [token] });
    assert.equal(calls[1].options.headers.Authorization, undefined);
    const removed = await client.tradeRequest(
      "trade-posts/post-id/save",
      "DELETE",
      undefined,
      true,
    );
    assert.equal(removed.success, true);
    assert.equal(
      calls.at(-1).options.headers.Authorization,
      "Bearer trade-jwt",
    );
  } finally {
    global.window = saved.window;
    global.localStorage = saved.localStorage;
    global.fetch = saved.fetch;
  }
});
