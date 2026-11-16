const { test } = require("node:test");
const assert = require("node:assert/strict");
const { build } = require("esbuild");
test("fee form selects a local image and submits image/note without transaction code or URL", async (t) => {
  const h = { values: [], index: 0 },
    image = "data:image/png;base64,iVBORw0KGgoAAA==";
  global.feeFormHarness = h;
  t.after(() => delete global.feeFormHarness);
  const { outputFiles } = await build({
    entryPoints: ["src/components/fees/fee-payment.tsx"],
    bundle: true,
    write: false,
    platform: "node",
    format: "cjs",
    jsx: "automatic",
    plugins: [
      {
        name: "fee-form",
        setup(b) {
          b.onResolve(
            { filter: /^(react|react\/jsx-runtime|@\/)/ },
            (args) => ({ path: args.path, namespace: "fixture" }),
          );
          b.onLoad({ filter: /.*/, namespace: "fixture" }, ({ path }) => {
            let contents;
            if (path === "react")
              contents =
                "export function useState(initial){const h=globalThis.feeFormHarness,i=h.index++;if(!(i in h.values))h.values[i]=initial;return [h.values[i],v=>h.values[i]=v];} export function useRef(value){const h=globalThis.feeFormHarness,i=h.index++;return h.values[i]??={current:value};}";
            else if (path === "react/jsx-runtime")
              contents =
                'export const jsx=(type,props)=>({type,props});export const jsxs=jsx;export const Fragment="fragment";';
            else if (path.endsWith("fee-proof-image"))
              contents =
                'export const prepareFeeProofImage=async file=>{if(file.type!=="image/png")throw Error("Chọn ảnh JPG, PNG hoặc WebP");return ' +
                JSON.stringify(image) +
                ";};";
            else if (path.endsWith("membership-fees"))
              contents = 'export const feeStatusLabels={unpaid:"Chưa đóng"};';
            else
              contents =
                "export const formatDate=v=>v;export const formatMoney=v=>String(v);";
            return { contents, loader: "js" };
          });
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
  const FeePayment = module.exports.default,
    submitted = [];
  const props = {
    due: {
      id: "due-1",
      amountDue: 1000000,
      status: "unpaid",
      campaign: {
        status: "published",
        title: "Hội phí",
        year: 2027,
        dueDate: "2027-12-31",
      },
    },
    busy: false,
    onSubmit: async (p) => submitted.push(p),
  };
  const render = () => {
    h.index = 0;
    return FeePayment(props);
  };
  const nodes = (node) =>
    !node || typeof node !== "object"
      ? []
      : [node, ...[node.props?.children].flat(Infinity).flatMap(nodes)];
  let tree = render(),
    all = nodes(tree);
  assert.deepEqual(
    all.filter((n) => n.type === "input").map((n) => n.props.type),
    ["file"],
  );
  assert.equal(
    all.find(
      (n) => n.type === "button" && n.props.className === "primary-button",
    ).props.disabled,
    true,
  );
  const input = all.find((n) => n.type === "input");
  input.props.onChange({
    currentTarget: { files: [{ type: "image/png" }], value: "photo.png" },
  });
  await new Promise(setImmediate);
  all = nodes(render());
  assert.equal(all.find((n) => n.type === "img").props.src, image);
  assert.equal(
    all.find(
      (n) => n.type === "button" && n.props.className === "primary-button",
    ).props.disabled,
    false,
  );
  all.find((n) => n.type === "form").props.onSubmit({ preventDefault() {} });
  assert.deepEqual(submitted, [{ proofImage: image, note: "" }]);
  all
    .find((n) => n.type === "input")
    .props.onChange({ currentTarget: { files: [], value: "" } });
  await new Promise(setImmediate);
  all = nodes(render());
  assert.equal(
    all.find((n) => n.type === "img").props.src,
    image,
    "cancelling the picker must retain the selected photo",
  );
  all
    .find((n) => n.type === "input")
    .props.onChange({
      currentTarget: {
        files: [{ type: "application/pdf" }],
        value: "test.pdf",
      },
    });
  await new Promise(setImmediate);
  all = nodes(render());
  assert.ok(all.some((n) => n.props?.role === "alert"));
  assert.equal(
    all.find(
      (n) => n.type === "button" && n.props.className === "primary-button",
    ).props.disabled,
    false,
  );
});
