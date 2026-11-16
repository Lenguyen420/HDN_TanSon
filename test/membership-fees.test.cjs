const {test} = require("node:test");
const assert = require("node:assert/strict");
const {build} = require("esbuild");
async function client() {
  const result = await build({
    entryPoints:["src/services/membership-fees.ts"], bundle:true,write:false,platform:"node",format:"cjs",
    plugins:[{name:"fee-sdk", setup(b) {
      b.onResolve({filter:/^zmp-sdk\/apis$/}, () => ({path:"sdk",namespace:"fee"}));
      b.onLoad({filter:/.*/,namespace:"fee"}, () => ({contents:'export const getAccessToken = async () => { if(globalThis.feeTestDenied) throw Error("denied"); return "verified-zalo-token"; };'}));
    }}],
    define:{"import.meta.env":JSON.stringify({VITE_API_BASE_URL:"http://localhost/api/v1"})},
  });
  const module = {exports:{}};
  new Function("module","exports","require",result.outputFiles[0].text)(module,module.exports,require);
  return module.exports;
}
test("fees require Zalo auth, paginate owned dues and submit only proof without claiming paid", async t => {
  const saved={window:global.window,fetch:global.fetch};
  global.window={setTimeout,clearTimeout}; global.feeTestDenied=false;
  t.after(()=>{Object.assign(global,saved);delete global.feeTestDenied;});
  const calls=[];
  global.fetch=async(url,options)=>{
    calls.push({url,options});
    const u=new URL(url);
    return new Response(JSON.stringify(options.method==="POST" ? {data:{status:"pending"}} : u.pathname.endsWith("my-dues") ? {data:[{id:"due-"+u.searchParams.get("page")}],pagination:{total:2}} : {data:{id:"own-due",status:"pending_confirmation"}}));
  };
  const api=await client();
  assert.equal((await api.getMyFees()).length,2);
  assert.equal(calls.length,2);
  for(const call of calls) assert.equal(call.options.headers.Authorization,"Bearer verified-zalo-token");
  const detail=await api.getMyFee("own-due");
  assert.equal(detail.status,"pending_confirmation");
  await api.submitFeeProof("own-due",{transactionRef:"REF-1",proofUrl:"https://example.com/proof",note:"Đã chuyển"});
  const submission=calls.at(-1);
  assert.equal(new URL(submission.url).pathname,"/api/v1/membership-fees/my-dues/own-due/payment-proof");
  assert.equal(submission.options.method,"POST");
  assert.deepEqual(JSON.parse(submission.options.body),{transactionRef:"REF-1",proofUrl:"https://example.com/proof",note:"Đã chuyển"});
  global.feeTestDenied=true;
  const before=calls.length;
  await assert.rejects(api.getMyFees(),/Zalo/);
  assert.equal(calls.length,before);
});

