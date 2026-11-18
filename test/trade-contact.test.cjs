const { test } = require("node:test");
const assert = require("node:assert/strict");
const { build } = require("esbuild");

test("trade contact uses browser links and the Zalo SDK with a browser fallback", async (t) => {
  const { outputFiles } = await build({
    entryPoints: ["src/components/trade/trade-contact-link.tsx"],
    bundle: true,
    write: false,
    platform: "node",
    format: "cjs",
    jsx: "automatic",
    supported: { "dynamic-import": false },
    external: ["react/jsx-runtime", "zmp-sdk/apis"],
    plugins: [{
      name: "trade-contact-analytics",
      setup(builder) {
        builder.onResolve({ filter: /^\.\/trade$/ }, () => ({ path: "mock", namespace: "analytics" }));
        builder.onLoad({ filter: /.*/, namespace: "analytics" }, () => ({
          contents: "export const tradeRequest = async (...args) => globalThis.tradeContactCalls.push(args);",
        }));
      },
    }],
  });
  const previousWindow = global.window;
  const previousNavigator = Object.getOwnPropertyDescriptor(global, "navigator");
  const calls = global.tradeContactCalls = [];
  global.window = { location: { hostname: "localhost", assign: (href) => calls.push(["assign", href]) } };
  Object.defineProperty(global, "navigator", { configurable: true, value: { userAgent: "Test browser" } });
  t.after(() => {
    global.window = previousWindow;
    if (previousNavigator) Object.defineProperty(global, "navigator", previousNavigator);
    else delete global.navigator;
    delete global.tradeContactCalls;
  });

  const result = { exports: {} };
  const load = (name) => name === "zmp-sdk/apis" ? {
    openPhone: async (options) => calls.push(["openPhone", options]),
    openWebview: async (options) => {
      calls.push(["openWebview", options]);
      throw new Error("SDK unavailable");
    },
  } : require(name);
  new Function("module", "exports", "require", outputFiles[0].text)(result, result.exports, load);
  const render = result.exports.default;
  const post = { id: "post", contactPhone: "84 912 345 678", contactZalo: "https://zalo.me/0912345678/" };
  const phone = () => render({ post, children: "Gọi điện" });
  assert.equal(phone().props.href, "tel:+84912345678");
  phone().props.onClick({ preventDefault: () => assert.fail("Browser uses the link") });
  assert.deepEqual(calls.pop(), ["trade-posts/post/interactions", "POST", { type: "CONTACT_PHONE" }]);
  assert.equal(render({ post: { ...post, contactPhone: "" } }), null);

  global.window.location.hostname = "h5.zdn.vn";
  let intercepted = 0;
  const event = { preventDefault: () => intercepted++ };
  phone().props.onClick(event);
  assert.equal(intercepted, 1);
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(calls.pop(), ["openPhone", { phoneNumber: "+84912345678" }]);

  const zalo = render({ post, channel: "zalo", children: "Zalo" });
  assert.equal(zalo.props.href, "https://zalo.me/0912345678");
  zalo.props.onClick(event);
  assert.equal(intercepted, 2);
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(calls.slice(-3), [
    ["trade-posts/post/interactions", "POST", { type: "CONTACT_ZALO" }],
    ["openWebview", { url: zalo.props.href }],
    ["assign", zalo.props.href],
  ]);
});
