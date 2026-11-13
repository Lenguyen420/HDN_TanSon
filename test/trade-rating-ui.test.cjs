const { test } = require("node:test");
const assert = require("node:assert/strict");
const { build } = require("esbuild");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
test("rating action remains visible on own posts and only other users can submit", async (t) => {
  t.after(() => {
    delete global.ratingUi;
  });
  const { outputFiles } = await build({
    entryPoints: ["src/components/trade/trade-reviews.tsx"],
    bundle: true,
    write: false,
    platform: "node",
    format: "cjs",
    jsx: "automatic",
    external: ["react/jsx-runtime"],
    plugins: [
      {
        name: "rating-ui",
        setup(b) {
          b.onResolve(
            {
              filter:
                /^(react|@\/services\/trade|\.\/use-trade|\.\/trade-images)$/,
            },
            (a) => ({ path: a.path, namespace: "mock" }),
          );
          b.onLoad({ filter: /.*/, namespace: "mock" }, ({ path }) => ({
            loader: "js",
            contents:
              path === "react"
                ? "export const useEffect=()=>{};export const useState=v=>{const h=globalThis.ratingUi,i=h.index++;return [i===0?h.open:v,()=>{}];};"
                : path === "./use-trade"
                  ? 'export const useTradeAction=()=>({busy:false,error:"",run:async f=>f()});export const useTradeList=()=>({data:[],loading:false,error:"",refresh:()=>{}});'
                  : path === "./trade-images"
                    ? "export default ()=>null;"
                    : "export const tradeImage=v=>v;export const tradeRequest=async()=>({data:[]});",
          }));
        },
      },
    ],
  });
  const result = { exports: {} };
  new Function("module", "exports", "require", outputFiles[0].text)(
    result,
    result.exports,
    require,
  );
  for (const owner of [true, false])
    for (const open of [false, true]) {
      global.ratingUi = { index: 0, open };
      const html = renderToStaticMarkup(
        React.createElement(result.exports.default, {
          postId: "post",
          ownerId: "owner",
          actor: { id: owner ? "owner" : "reader" },
          onLogin: async () => ({ id: "reader" }),
        }),
      );
      assert.match(html, /aria-expanded=/);
      if (!open) assert.match(html, />Đánh giá<\/button>/);
      else {
        assert.equal((html.match(/type="radio"/g) || []).length, 5);
        const textarea = html.match(/<textarea[^>]*>/)[0];
        assert.equal(textarea.includes('required=""'), false);
        assert.match(html, /Nội dung \(không bắt buộc\)/);
        const submit = html.match(
          /<button[^>]*class="primary-button"[^>]*>/,
        )[0];
        assert.equal(submit.includes('disabled=""'), owner);
        if (owner) assert.match(html, /Bạn là người đăng tin nên không thể tự gửi đánh giá/);
      }
    }
});
