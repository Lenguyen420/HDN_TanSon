const { test } = require("node:test");
const assert = require("node:assert/strict");
const { build } = require("esbuild");
const { resolve } = require("node:path");
async function client() {
  const { outputFiles } = await build({
    entryPoints: ["src/services/localgo.ts"],
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
  const result = { exports: {} };
  new Function("module", "exports", "require", outputFiles[0].text)(
    result,
    result.exports,
    require,
  );
  return result.exports;
}
const valid = () => ({
  name: "Cửa hàng Tân Sơn",
  category: "mua-sam",
  description: "Dịch vụ hội viên",
  address: "Phường Tân Sơn",
  location: { type: "Point", coordinates: [106.632, 10.811] },
  coverImage: "https://example.com/cover.jpg",
});
test("LocalGo browses anonymously, paginates consistent map results and sends verified JWT for owner mutations", async (t) => {
  const saved = {
    window: global.window,
    fetch: global.fetch,
    localStorage: global.localStorage,
  };
  global.window = {
    setTimeout,
    clearTimeout,
    location: { origin: "http://localhost" },
    dispatchEvent: () => {},
  };
  global.localStorage = {
    getItem: (key) =>
      key === "tanson-registration-receipts"
        ? JSON.stringify(["a".repeat(64)])
        : null,
  };
  t.after(() => Object.assign(global, saved));
  const calls = [];
  global.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    if (String(url).endsWith("trade-session"))
      return new Response(
        JSON.stringify({
          data: {
            accessToken: "verified-jwt",
            expiresIn: 1800,
            user: { role: "BUSINESS", status: "ACTIVE", memberId: "member-a" },
          },
        }),
      );
    if (options.method === "DELETE") return new Response(null, { status: 204 });
    if (options.method === "POST" || options.method === "PATCH")
      return new Response(
        JSON.stringify({
          data: { id: "place-a", ...JSON.parse(options.body) },
        }),
      );
    const page = new URL(url).searchParams.get("page");
    return new Response(
      JSON.stringify({
        data: [{ ...valid(), id: page }],
        pagination: { total: 2, page: Number(page), limit: 1 },
      }),
    );
  };
  const c = await client();
  const result = await c.listLocalGoPlaces("cửa hàng & cà phê", "mua-sam");
  assert.equal(result.data.length, 2);
  assert.equal(result.pagination.total, 2);
  assert.equal(calls[0].options.headers.Authorization, undefined);
  assert.equal(
    new URL(calls[0].url).searchParams.get("search"),
    "cửa hàng & cà phê",
  );
  await c.saveLocalGoPlace(valid());
  const create = calls.find(
    (item) =>
      item.url.endsWith("localgo/places") && item.options.method === "POST",
  );
  assert.equal(create.options.headers.Authorization, "Bearer verified-jwt");
  assert.equal(JSON.parse(create.options.body).memberId, undefined);
  await c.setLocalGoVisibility("place-a", false);
  assert.deepEqual(JSON.parse(calls.at(-1).options.body), { isVisible: false });
  await c.deleteLocalGoPlace("place-a");
  assert.equal(calls.at(-1).options.method, "DELETE");
  await c.listLocalGoPlaces("", "", true);
  assert.ok(calls.at(-1).url.includes("localgo/my-places"));
});
test("LocalGo rejects guests, unsafe links and invalid coordinates without publishing", async (t) => {
  const saved = {
    window: global.window,
    fetch: global.fetch,
    localStorage: global.localStorage,
  };
  global.window = {
    setTimeout,
    clearTimeout,
    location: { origin: "http://localhost" },
    dispatchEvent: () => {},
  };
  global.localStorage = {
    getItem: (key) =>
      key === "tanson-registration-receipts"
        ? JSON.stringify(["b".repeat(64)])
        : null,
  };
  t.after(() => Object.assign(global, saved));
  let writes = 0;
  global.fetch = async () => {
    writes++;
    return new Response(
      JSON.stringify({
        data: {
          accessToken: "guest",
          expiresIn: 1800,
          user: { role: "USER", status: "ACTIVE", memberId: null },
        },
      }),
    );
  };
  const c = await client();
  assert.equal(c.validCoordinates([106.6, 10.8]), true);
  for (const coords of [
    [181, 10],
    [106, -91],
    [NaN, 10],
    [106, 10, 2],
  ])
    assert.equal(c.validCoordinates(coords), false);
  assert.throws(() =>
    c.validateLocalGoDraft({ ...valid(), website: "javascript:alert(1)" }),
  );
  assert.throws(() =>
    c.validateLocalGoDraft({
      ...valid(),
      content: "<script>alert(1)</script>",
    }),
  );
  assert.throws(() => c.validateLocalGoDraft({ ...valid(), coverImage: "" }));
  assert.equal(
    new URL(c.localGoDirections(valid())).searchParams.get("destination"),
    "10.811,106.632",
  );
  await assert.rejects(c.saveLocalGoPlace(valid()), /hội viên đang hoạt động/);
  assert.equal(writes, 1);
});
