const { test } = require("node:test");
const assert = require("node:assert/strict");
const { build } = require("esbuild");
test("protected tab navigation waits for consent and database save", async (t) => {
  const {outputFiles} = await build({
    entryPoints: ["src/components/app-shell.tsx"], bundle: true, write: false, platform: "node", format: "esm", jsx: "automatic",
    plugins: [{name: "navigation-harness", setup(build) {
      build.onResolve({filter: /^(react|react\/jsx-runtime|zmp-ui|@\/)/}, args => ({path: args.path, namespace: "harness"}));
      build.onLoad({filter: /.*/, namespace: "harness"}, ({path}) => {
        let contents;
        if (path === "react") contents = `
          export function useState(initial) {
            const h = globalThis.navigationHarness, i = h.index++;
            if (!(i in h.values)) h.values[i] = i === 0 ? h.data : typeof initial === "function" ? initial() : initial;
            return [h.values[i], value => { h.values[i] = typeof value === "function" ? value(h.values[i]) : value; }];
          }
          export function useRef(value) { const h = globalThis.navigationHarness, i = h.index++; return h.values[i] ??= {current: value}; }
          export const useMemo = fn => fn();
          export const useEffect = () => {};
          export const useLayoutEffect = () => {};
        `;
        else if (path === "react/jsx-runtime") contents = 'export const jsx = (type, props) => ({type, props}); export const jsxs = jsx; export const Fragment = "fragment";';
        else if (path.endsWith("shared/use-registration-notifications")) contents = 'export default () => ({notifications: [], profiles: globalThis.navigationHarness.registrationProfiles || [], setProfiles: () => {}, error: ""});';
        else if (path === "zmp-ui") contents = 'export const Page = "page";';
        else if (path.endsWith("services/member-access")) contents = 'export const saveZaloSdkProfile = () => globalThis.navigationHarness.authenticate();';
        else if (path.endsWith("services/registration-notifications")) contents = 'export const updateRegistrationProfile = async () => []; export const syncRegistrationAvatar = async () => [];';
        else if (path.endsWith("services/profile")) contents = 'export const readProfileEdits = () => null; export const applyProfileEdits = data => data; export const saveProfileEdits = () => {};';
        else if (path.endsWith("services/association")) contents = 'export const getAppData = async () => globalThis.navigationHarness.data;';
        else if (path.endsWith("services/notifications")) contents = 'export const readNotificationState = () => ({}); export const saveNotificationState = () => true;';
        else contents = 'export default ' + JSON.stringify(path) + ';';
        return {contents, loader: "js"};
      });
    }}]
  });
  const {default: AppShell} = await import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].text).toString('base64'));
  const saved = () => ({identity: {user: {id: "123", name: "Tên đã lưu"}, member: null}});
  const reset = () => { global.navigationHarness = {index: 0, values: [], data: {isDemo: false, members: [], profile: {}, notifications: [], association: {}}, authenticate: async () => saved()}; };
  const render = () => { global.navigationHarness.index = 0; return AppShell(); };
  function find(node, predicate) {
    if (!node || typeof node !== "object") return null;
    if (predicate(node)) return node;
    for (const child of [node.props?.children].flat(Infinity)) { const hit = find(child, predicate); if (hit) return hit; }
    return null;
  }
  const nav = () => find(render(), node => node.type === "@/components/bottom-navigation").props;
  t.after(() => { delete global.navigationHarness; });
  await t.test("deduplicates requests and reuses the saved profile for either tab", async () => {
    reset(); let resolve, calls = 0;
    global.navigationHarness.authenticate = () => { calls++; return new Promise(r => {resolve = r;}); };
    const pending = nav().onChange("profile");
    assert.equal(calls, 1);
    assert.equal(nav().activeTab, "home");
    await nav().onChange("register");
    assert.equal(calls, 1);
    resolve(saved()); await pending;
    assert.equal(nav().activeTab, "profile");
    await nav().onChange("register");
    assert.equal(nav().activeTab, "register"); assert.equal(calls, 1);
  });
  await t.test("refusal or database failure keeps the current page and allows retry", async () => {
    for (const tab of ["profile", "register"]) {
      reset();
      global.navigationHarness.authenticate = async () => { throw Error("Không lưu được thông tin"); };
      await nav().onChange(tab);
      assert.equal(nav().activeTab, "home");
      assert.ok(find(render(), node => node.props?.role === "alert"));
      global.navigationHarness.authenticate = async () => saved();
      await nav().onChange(tab); assert.equal(nav().activeTab, tab);
    }
  });
  await t.test("private profile without avatar preserves the public directory portrait", async () => {
    reset();
    global.navigationHarness.data.members = [{id:"m1",name:"Hội viên",avatar:"https://example.com/member.jpg"}];
    global.navigationHarness.registrationProfiles = [{id:"r1",status:"approved",member:{id:"m1",name:"Hội viên",company:"Công ty"}}];
    const home = find(render(), node => node.type === "@/pages/home/home");
    assert.equal(home.props.data.members.find(member => member.id === "m1").avatar, "https://example.com/member.jpg");
  });

  await t.test("a late consent result does not override a newer navigation", async () => {
    reset(); let resolve;
    global.navigationHarness.authenticate = () => new Promise(r => {resolve = r;});
    const pending = nav().onChange("profile");
    await nav().onChange("notifications");
    resolve(saved()); await pending;
    assert.equal(nav().activeTab, "notifications");
  });
});