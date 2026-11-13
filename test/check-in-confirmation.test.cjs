const { test } = require("node:test");
const assert = require("node:assert/strict");
const { build } = require("esbuild");

test("check-in shows the registered name without inputs and prevents duplicate confirmation taps", async () => {
  const { outputFiles } = await build({
    entryPoints: ["src/components/event-check-in/check-in-form.tsx"],
    bundle: true,
    write: false,
    platform: "node",
    format: "cjs",
    packages: "external",
    plugins: [
      {
        name: "confirmation-hooks",
        setup(build) {
          build.onResolve({ filter: /^react$/ }, () => ({
            path: "react",
            namespace: "mock",
          }));
          build.onLoad({ filter: /.*/, namespace: "mock" }, () => ({
            contents:
              "export const useRef=value=>({current:value});export const useState=value=>[value,()=>{}];",
          }));
        },
      },
    ],
  });
  const compiled = { exports: {} };
  new Function("module", "exports", "require", outputFiles[0].text)(
    compiled,
    compiled.exports,
    require,
  );
  let calls = 0,
    release;
  const view = compiled.exports.default({
    name: "Hội viên đã đăng ký",
    company: "Công ty A",
    onSubmit: () => {
      calls++;
      return new Promise((resolve) => {
        release = resolve;
      });
    },
  });
  const nodes = [];
  function visit(node) {
    if (!node || typeof node !== "object") return;
    nodes.push(node);
    for (const child of [node.props?.children].flat(Infinity)) visit(child);
  }
  visit(view);
  assert.ok(
    !nodes.some(
      (node) =>
        node.type === "input" ||
        node.type === "textarea" ||
        node.type === "form",
    ),
  );
  assert.ok(
    nodes.some(
      (node) =>
        node.type === "strong" && node.props.children === "Hội viên đã đăng ký",
    ),
  );
  const button = nodes.find((node) => node.type === "button");
  assert.equal(button.props.children, "Xác nhận điểm danh");
  button.props.onClick();
  button.props.onClick();
  assert.equal(calls, 1);
  release({ persisted: true });
  await new Promise((resolve) => setImmediate(resolve));
});
