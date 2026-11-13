const { test } = require("node:test");
const assert = require("node:assert/strict");
const { build } = require("esbuild");
const load = async (options) => {
  const { outputFiles } = await build({
    bundle: true,
    write: false,
    platform: "node",
    format: "esm",
    ...options,
  });
  return import(
    "data:text/javascript;base64," +
      Buffer.from(outputFiles[0].text).toString("base64")
  );
};

test("public feed is anonymous, resolves images and opens the corresponding article", async (t) => {
  const oldWindow = global.window,
    oldFetch = global.fetch;
  global.window = global;
  t.after(() => {
    global.window = oldWindow;
    global.fetch = oldFetch;
  });
  const services = await load({
    entryPoints: ["src/services/content.ts"],
    loader: { ".webp": "dataurl" },
    define: {
      "import.meta.env": JSON.stringify({
        VITE_API_BASE_URL: "https://backend.example/api/v1",
      }),
    },
  });
  global.fetch = async (url, options) => {
    assert.equal(
      url,
      "https://backend.example/api/v1/public/notification-feed?page=1&limit=100",
    );
    assert.equal(options.headers.Authorization, undefined);
    assert.equal(options.body, undefined);
    return new Response(
      JSON.stringify({
        data: [
          {
            id: "content-news-1",
            title: "Tin tức mới",
            image: "uploads/news/image.webp",
            related: { category: "news", articleId: "1" },
          },
          {id:"company-anniversary-2026-test",title:"Chúc mừng 10 năm thành lập Công ty A",source:"company-anniversary",category:"Sinh nhật doanh nghiệp",company:"Công ty A",anniversaryYears:10,date:"2026-11-13"},
        ],
        pagination: { total: 2 },
      }),
    );
  };
  const notices = await services.getNotifications();
  assert.equal(notices[0].scope, "public");
  assert.equal(notices[0].unread, true);
  assert.equal(
    notices[0].image,
    "https://backend.example/uploads/news/image.webp",
  );
  assert.deepEqual(notices[0].related, { category: "news", articleId: "1" });
  assert.equal(notices[1].source,"company-anniversary");
  assert.equal(notices[1].scope,"public");
  assert.equal(notices[1].unread,true);
  assert.equal(notices[1].anniversaryYears,10);
  assert.equal(notices[1].related,undefined);
});

test("merging inboxes preserves private recipients, stable IDs and per-device read state", async () => {
  const { mergeNotifications } = await load({
    entryPoints: ["src/services/notifications.ts"],
  });
  const publicNotice = {
    id: "content-news-1",
    date: "2026-11-13",
    unread: true,
    title: "Tin mới",
  };
  const personal = {
    id: "registration-a-reviewed",
    date: "2026-11-14",
    unread: true,
    title: "Hồ sơ của bạn",
  };
  const merged = mergeNotifications([publicNotice, publicNotice], [personal], {
    [publicNotice.id]: true,
  });
  assert.equal(merged.length, 2);
  assert.equal(merged[0].id, personal.id);
  assert.equal(merged[0].scope, "private");
  assert.equal(merged[1].scope, "public");
  assert.equal(merged[1].unread, false);
  const edited = mergeNotifications(
    [{ ...publicNotice, title: "Đã sửa" }],
    [],
    { [publicNotice.id]: true },
  );
  assert.equal(
    edited[0].unread,
    false,
    "editing content must not reset read state",
  );
  assert.deepEqual(mergeNotifications([], [], {}), []);
});

test("public inbox polls without OA, pauses in the background and cleans up on unmount", async (t) => {
  const oldWindow = global.window,
    oldDocument = global.document;
  const win = new EventTarget(),
    doc = new EventTarget();
  doc.visibilityState = "visible";
  let interval,
    cleared = false,
    calls = 0,
    release;
  win.setInterval = (fn, ms) => {
    assert.equal(ms, 15000);
    interval = fn;
    return 1;
  };
  win.clearInterval = () => {
    cleared = true;
  };
  global.window = win;
  global.document = doc;
  global.publicStates = [];
  global.publicRequest = () => {
    calls++;
    return new Promise((resolve) => {
      release = resolve;
    });
  };
  t.after(() => {
    global.window = oldWindow;
    global.document = oldDocument;
    delete global.publicStates;
    delete global.publicRequest;
    delete global.publicEffect;
  });
  const hook = await load({
    entryPoints: ["src/components/shared/use-public-notifications.ts"],
    plugins: [
      {
        name: "public-poll-harness",
        setup(build) {
          build.onResolve(
            { filter: /^(react|@\/services\/(content|api))$/ },
            (args) => ({ path: args.path, namespace: "mock" }),
          );
          build.onLoad({ filter: /.*/, namespace: "mock" }, ({ path }) => ({
            contents:
              path === "react"
                ? "export const useEffect=fn=>{globalThis.publicEffect=fn;};export const useState=initial=>{const i=globalThis.publicStates.length;globalThis.publicStates.push(initial);return [initial,v=>{globalThis.publicStates[i]=v;}];};"
                : path.endsWith("/api")
                  ? "export const useMockData=false;"
                  : "export const getNotifications=()=>globalThis.publicRequest();",
          }));
        },
      },
    ],
  });
  hook.default();
  const cleanup = global.publicEffect();
  const flush = () => new Promise((resolve) => setImmediate(resolve));
  assert.equal(calls, 1);
  interval();
  interval();
  assert.equal(calls, 1);
  release([{ id: "news-1" }]);
  await flush();
  assert.deepEqual(global.publicStates[0], [{ id: "news-1" }]);
  doc.visibilityState = "hidden";
  interval();
  assert.equal(calls, 1);
  doc.visibilityState = "visible";
  doc.dispatchEvent(new Event("visibilitychange"));
  assert.equal(calls, 2);
  cleanup();
  release([{ id: "late" }]);
  await flush();
  assert.deepEqual(global.publicStates[0], [{ id: "news-1" }]);
  assert.equal(cleared, true);
  win.dispatchEvent(new Event("focus"));
  assert.equal(calls, 2);
});
