const {test}=require("node:test");
const assert=require("node:assert/strict");
const {build}=require("esbuild");
const {resolve}=require("node:path");
test("private trade inbox stays anonymous without receipts, maps pending notices and excludes public broadcasts",async t=>{
 const saved={window:global.window,document:global.document};
 global.window=new EventTarget();global.document=new EventTarget();document.visibilityState="visible";
 let poll,cleared=false;window.setInterval=fn=>{poll=fn;return 1;};window.clearInterval=()=>{cleared=true;};
 global.tradeHarness={states:[],receipts:[],calls:0};
 t.after(()=>{Object.assign(global,saved);delete global.tradeHarness;});
 const {outputFiles}=await build({entryPoints:["src/components/shared/use-trade-notifications.ts"],bundle:true,write:false,platform:"node",format:"cjs",alias:{"@":resolve("src")},plugins:[{name:"trade-inbox-test",setup(b){
 b.onResolve({filter:/^(react|@\/services\/(trade|registration-notifications))$/},a=>({path:a.path,namespace:"mock"}));
 b.onLoad({filter:/.*/,namespace:"mock"},({path})=>({loader:"js",contents:path==="react"?'export const useEffect=fn=>{globalThis.tradeHarness.effect=fn}; export const useState=v=>{const h=globalThis.tradeHarness,i=h.states.length;h.states.push(v);return [v,n=>{h.states[i]=n}];};':path.endsWith("registration-notifications")?'export const registrationTokens=()=>globalThis.tradeHarness.receipts;':'export const currentTradeUser=()=>null;export const tradeRequest=async()=>{globalThis.tradeHarness.calls++;return {data:[{id:"private",type:"TRADE_POST_PENDING",title:"Tin sản phẩm",tradePostId:"post",createdAt:"2026-11-13T03:00:00Z",read:false},{id:"public",type:"TRADE_POST_NEW",title:"Tin đã duyệt",tradePostId:"post2",createdAt:"2026-11-13T03:00:00Z",read:false}]};};'}));
 }}]});
 const moduleResult={exports:{}};new Function("module","exports","require",outputFiles[0].text)(moduleResult,moduleResult.exports,require);
 moduleResult.exports.default();const cleanup=tradeHarness.effect();await new Promise(r=>setImmediate(r));assert.equal(tradeHarness.calls,0);
 tradeHarness.receipts=["a".repeat(64)];window.dispatchEvent(new Event("tanson-registration-updated"));await new Promise(r=>setImmediate(r));
 assert.equal(tradeHarness.calls,1);const notices=tradeHarness.states[0];assert.equal(notices.length,1);assert.equal(notices[0].tradePostId,"post");assert.equal(notices[0].tradeManaged,true);assert.equal(notices[0].scope,"private");assert.equal(notices[0].time,"10:00");assert.match(notices[0].title,/chờ Hội duyệt/);
 document.visibilityState="hidden";poll();await new Promise(r=>setImmediate(r));assert.equal(tradeHarness.calls,1);
 cleanup();assert.equal(cleared,true);window.dispatchEvent(new Event("focus"));assert.equal(tradeHarness.calls,1);
});
