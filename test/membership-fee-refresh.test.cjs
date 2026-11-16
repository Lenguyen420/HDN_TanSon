const { test } = require("node:test");
const assert = require("node:assert/strict");
const { build } = require("esbuild");
test("returning from the phone photo picker refreshes fees without unmounting the payment form", async (t) => {
  const saved = { window: global.window, document: global.document };
  global.window = new EventTarget();
  global.document = Object.assign(new EventTarget(), {
    visibilityState: "visible",
  });
  const due = {
    id: "due-1",
    status: "unpaid",
    campaign: { status: "published" },
  };
  const h = {
    values: [],
    index: 0,
    effects: [],
    trace: [],
    calls: 0,
    api: {
      list: async () => [due],
      detail: async () => ({ ...due }),
      submit: async () => {},
    },
  };
  global.feeRefreshHarness = h;
  t.after(() => {
    for (const x of h.values) if (x?.cleanup) x.cleanup();
    Object.assign(global, saved);
    delete global.feeRefreshHarness;
  });
  const { outputFiles } = await build({
    entryPoints: ["src/components/fees/use-fees.ts"],
    bundle: true,
    write: false,
    platform: "node",
    format: "cjs",
    plugins: [
      {
        name: "fee-refresh",
        setup(b) {
          b.onResolve({ filter: /^(react|@\/)/ }, (args) => ({
            path: args.path,
            namespace: "fixture",
          }));
          b.onLoad({ filter: /.*/, namespace: "fixture" }, ({ path }) => ({
            loader: "js",
            contents:
              path === "react"
                ? `
      const same=(a,b)=>a&&b&&a.length===b.length&&a.every((v,i)=>Object.is(v,b[i]));
      export function useState(initial){const h=globalThis.feeRefreshHarness,i=h.index++;if(!(i in h.values))h.values[i]=initial;return[h.values[i],v=>{h.trace.push([i,v]);h.values[i]=v;}];}
      export function useRef(initial){const h=globalThis.feeRefreshHarness,i=h.index++;return h.values[i]??={current:initial};}
      export function useCallback(fn,deps){const h=globalThis.feeRefreshHarness,i=h.index++;if(!same(h.values[i]?.deps,deps))h.values[i]={deps,fn};return h.values[i].fn;}
      export function useEffect(fn,deps){const h=globalThis.feeRefreshHarness,i=h.index++;if(!same(h.values[i]?.deps,deps)){const prev=h.values[i];h.values[i]={deps};h.effects.push(()=>{prev?.cleanup?.();h.values[i].cleanup=fn();});}}
    `
                : path.endsWith("/api")
                  ? "export class ApiError extends Error{constructor(message,status){super(message);this.status=status;}}"
                  : "export const getMyFees=()=>{const h=globalThis.feeRefreshHarness;h.calls++;return h.api.list();};export const getMyFee=id=>globalThis.feeRefreshHarness.api.detail(id);export const submitFeeProof=(id,p)=>globalThis.feeRefreshHarness.api.submit(id,p);",
          }));
        },
      },
    ],
  });
  const module = { exports: {} };
  new Function("module", "exports", "require", outputFiles[0].text)(
    module,
    module.exports,
    require,
  );
  const render = () => {
    h.index = 0;
    const controller = module.exports.default(true);
    for (const effect of h.effects.splice(0)) effect();
    return controller;
  };
  const settle = () => new Promise(setImmediate);
  let controller = render();
  await settle();
  controller = render();
  await controller.open("due-1");
  controller = render();
  assert.equal(controller.loading, false);
  assert.equal(controller.detail.id, "due-1");
  let finish;
  h.api.detail = () => new Promise((resolve) => (finish = resolve));
  h.trace = [];
  const before = h.calls;
  window.dispatchEvent(new Event("focus"));
  controller = render();
  assert.equal(controller.loading, false);
  assert.equal(controller.detail.id, "due-1");
  document.dispatchEvent(new Event("visibilitychange"));
  assert.equal(
    h.calls,
    before + 1,
    "focus and visibilitychange must share the refresh",
  );
  assert.equal(
    h.trace.some(([index, value]) => index === 2 && value === true),
    false,
    "must not show a loading screen while the image returns",
  );
  finish({ ...due });
  await settle();
  controller = render();
  assert.equal(controller.detail.id, "due-1");
  assert.equal(controller.loading, false);
  h.api.detail = async () => ({ ...due });
  h.api.list = async () => {
    throw Error("Offline");
  };
  h.trace = [];
  window.dispatchEvent(new Event("focus"));
  await settle();
  controller = render();
  assert.equal(
    controller.detail.id,
    "due-1",
    "a background network failure must preserve the photo form",
  );
  assert.equal(controller.loading, false);
  assert.equal(controller.error, "Offline");
});
