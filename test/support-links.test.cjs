const { test } = require("node:test");
const assert = require("node:assert/strict");
const { build } = require("esbuild");

test("support Zalo link uses the native WebView in Mini App", async (t) => {
  const { outputFiles } = await build({
    entryPoints: ["src/components/contact/support-links.tsx"],
    bundle: true,
    write: false,
    platform: "node",
    format: "cjs",
    jsx: "automatic",
    supported: { "dynamic-import": false },
    external: ["zmp-sdk/apis", "react/jsx-runtime"],
    plugins: [{
      name: "mock-icon",
      setup(builder) {
        builder.onResolve({ filter: /^@\/components\/icons$/ }, () => ({
          path: "app-icon",
          namespace: "mock",
        }));
        builder.onLoad({ filter: /.*/, namespace: "mock" }, () => ({
          contents: "export default () => null;",
        }));
      },
    }],
  });
  const previousWindow = global.window;
  const previousNavigator = Object.getOwnPropertyDescriptor(global, "navigator");
  const navigations = [];
  const location = { hostname: "localhost", assign: (url) => navigations.push(url) };
  global.window = { location };
  Object.defineProperty(global, "navigator", {
    configurable: true,
    value: { userAgent: "Test browser" },
  });
  t.after(() => {
    global.window = previousWindow;
    if (previousNavigator) Object.defineProperty(global, "navigator", previousNavigator);
    else delete global.navigator;
  });

  const opened = [];
  let nativeFails = false;
  const sdk = {
    async openWebview(options) {
      opened.push(options);
      if (nativeFails) throw new Error("WebView unavailable");
    },
  };
  const result = { exports: {} };
  const load = (name) => name === "zmp-sdk/apis" ? sdk : require(name);
  new Function("module", "exports", "require", outputFiles[0].text)(result, result.exports, load);
  const messages = [];
  const url = "https://zalo.me/0917545191";
  const view = result.exports.default({
    contact: { hotlines: [], zaloUrl: url },
    onMessage: (message) => messages.push(message),
  });
  const link = view.props.children.find((element) => element.type === "a");
  assert.equal(link.props.href, url);

  let intercepted = 0;
  const click = { preventDefault: () => intercepted++ };
  await link.props.onClick(click);
  assert.equal(intercepted, 0);
  assert.deepEqual(opened, []);

  location.hostname = "h5.zdn.vn";
  await link.props.onClick(click);
  assert.equal(intercepted, 1);
  assert.deepEqual(opened, [{ url, config: { style: "normal" } }]);
  assert.deepEqual(navigations, []);

  nativeFails = true;
  await link.props.onClick(click);
  assert.equal(intercepted, 2);
  assert.deepEqual(navigations, [url]);
  assert.match(messages.at(-1), /0917545191/);
});

