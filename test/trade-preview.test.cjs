const {test}=require("node:test");
const assert=require("node:assert/strict");
const {build}=require("esbuild");
const {resolve}=require("node:path");
async function client(dev, enabled) {
  const {outputFiles}=await build({entryPoints:["src/services/trade.ts"],bundle:true,write:false,platform:"node",format:"cjs",alias:{"@":resolve("src")},external:["zmp-sdk/apis"],define:{"import.meta.env":JSON.stringify({DEV:dev,VITE_TRADE_PREVIEW:enabled,VITE_API_BASE_URL:"http://localhost/api/v1"})}});
  const result={exports:{}};
  new Function("module","exports","require",outputFiles[0].text)(result,result.exports,require);
  return result.exports;
}

test("local trade preview opens protected screens without registration, OA, SDK or backend requests",async t=>{
 const saved={window:global.window,fetch:global.fetch,localStorage:global.localStorage};
 global.window=new EventTarget();global.window.location={origin:"http://localhost"};
 global.fetch=()=>{throw Error("Preview must not call backend");};
 global.localStorage={getItem:()=>null};
 t.after(()=>Object.assign(global,saved));
 const service=await client(true,"true");
 const actor=await service.loginTrade();assert.equal(actor.role,"BUSINESS");assert.equal(actor.status,"ACTIVE");
 assert.equal(service.currentTradeUser().id,actor.id);
 const categories=await service.tradeRequest("trade-post-categories");assert.ok(categories.data.length);
 const browse=await service.tradeRequest("trade-posts");assert.equal(browse.data.length,2);
 const mine=await service.tradeRequest("trade-posts/me", "GET",undefined,true);assert.equal(mine.data[0].ownerId,actor.id);
 const created=await service.tradeRequest("trade-posts","POST",{title:"Tin test",summary:"Tóm tắt",description:"Mô tả",imageIds:[]},true);
 assert.equal(created.data.status,"DRAFT");
 await service.tradeRequest("trade-posts/"+created.data.id+"/submit","PATCH",{},true);
 const managed=await service.tradeRequest("trade-posts/"+created.data.id+"/manage","GET",undefined,true);
 assert.equal(managed.data.status,"PENDING");
 const partner=browse.data.find(p=>!p.isOwner);
 await service.tradeRequest("trade-posts/"+partner.id+"/save","POST",{},true);
 assert.equal((await service.tradeRequest("trade-posts/me/saved","GET",undefined,true)).data[0].id,partner.id);
 const conversation=await service.tradeRequest("trade-conversations","POST",{tradePostId:partner.id,message:"Xin chào"},true);
 let updates=0;const stop=service.watchTradeConversation(conversation.data.id,()=>updates++);
 await service.tradeRequest("trade-conversations/"+conversation.data.id+"/messages","POST",{content:"Tin nhắn test"},true);
 assert.equal(updates,1);stop();
 const messages=await service.tradeRequest("trade-conversations/"+conversation.data.id+"/messages","GET",undefined,true);
 assert.ok(messages.data.some(m=>m.content==="Tin nhắn test"));
 assert.equal((await service.tradeRequest("trade-notifications","GET",undefined,true)).data.length,1);
 const review=await service.tradeRequest("trade-posts/"+partner.id+"/reviews","POST",{rating:5,content:"Đánh giá thử"},true);
 assert.equal(review.data.content,"Đánh giá thử");
 assert.equal((await service.tradeRequest("reviews/me?tradePostId="+partner.id,"GET",undefined,true)).data.length,1);
 const comment=await service.tradeRequest("trade-posts/"+partner.id+"/comments","POST",{content:"Còn hàng không?"},true);
 assert.equal((await service.tradeRequest("trade-posts/"+partner.id+"/comments")).data[0].id,comment.data.id);
 assert.equal((await service.tradeRequest("trade-posts/"+partner.id+"/comments/"+comment.data.id)).data.content,"Còn hàng không?");
 await assert.rejects(service.tradeRequest("trade-posts/"+partner.id+"/comments/"+comment.data.id+"/reply","PUT",{content:"Giả chủ tin"},true),/Chỉ người đăng tin/);
 assert.ok((await service.tradeRequest("trade-posts/me/analytics","GET",undefined,true)).data.totals);
});

test("production builds and disabled local previews retain the real authentication flow",async t=>{
 const saved={window:global.window,fetch:global.fetch,localStorage:global.localStorage};
 global.window={setTimeout,clearTimeout,dispatchEvent:()=>{},location:{origin:"http://localhost"}};
 global.localStorage={getItem:key=>key==="tanson-registration-receipts"?JSON.stringify(["a".repeat(64)]):null};
 t.after(()=>Object.assign(global,saved));
 for(const [dev,enabled] of [[false,"true"],[true,"false"]]) {
  let calls=0;
  global.fetch=async(url)=>{
   calls++;assert.ok(url.endsWith("/trade-session"));
   return new Response(JSON.stringify({success:true,data:{accessToken:"real-token",expiresIn:1800,user:{id:"real-user",role:"USER",status:"ACTIVE",displayName:"Người dùng"}}}));
  };
  const service=await client(dev,enabled);
  assert.equal(service.currentTradeUser(),null);
  assert.equal((await service.loginTrade()).id,"real-user");assert.equal(calls,1);
 }
});
