const test = require("node:test");
const assert = require("node:assert/strict");
const { build } = require("esbuild");
const load = async (options) => { const {outputFiles} = await build({bundle:true,write:false,platform:"node",format:"esm",...options}); return import('data:text/javascript;base64,'+Buffer.from(outputFiles[0].text).toString('base64')); };

test("registration results use persisted secret receipts rather than claimed Zalo IDs", async (t) => {
  const oldWindow=global.window, oldStorage=global.localStorage, oldFetch=global.fetch;
  global.window=global;
  const storage=new Map();
  global.localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)};
  t.after(()=>{global.window=oldWindow;global.localStorage=oldStorage;global.fetch=oldFetch;});
  const service=await load({entryPoints:["src/services/registration-notifications.ts"],define:{"import.meta.env":JSON.stringify({VITE_API_BASE_URL:"https://backend.example/api/v1"})}});
  global.fetch=()=>{throw Error("No receipt should not request private results");};
  assert.deepEqual(await service.getRegistrationNotifications(),[]);
  const a=service.prepareRegistrationTracking(),b=service.prepareRegistrationTracking();
  assert.match(a.token,/^[a-f0-9]{64}$/);assert.notEqual(a.token,b.token);assert.equal(a.persisted,true);
  const fresh=await load({entryPoints:["src/services/registration-notifications.ts"],define:{"import.meta.env":JSON.stringify({VITE_API_BASE_URL:"https://backend.example/api/v1",TEST_RELOAD:true})}});
  global.fetch=async(url,options)=>{
    assert.equal(url,"https://backend.example/api/v1/public/registration-notifications");
    assert.equal(options.method,"POST");
    assert.deepEqual(JSON.parse(options.body),{tokens:[a.token,b.token]});
    assert.ok(!url.includes(a.token));
    return new Response(JSON.stringify({data:[{id:"registration-a-reviewed",title:"Đã duyệt"}]}));
  };
  assert.equal((await fresh.getRegistrationNotifications())[0].id,"registration-a-reviewed");
  global.localStorage.setItem=()=>{throw Error("Quota exceeded");};
  assert.equal(service.prepareRegistrationTracking().persisted,false);
});

test("notification polling pauses while hidden, prevents overlaps and cleans up listeners", async (t) => {
  const oldWindow=global.window,oldDocument=global.document;
  const win=new EventTarget(),doc=new EventTarget();
  doc.visibilityState="visible";
  let interval,cleared=false,calls=0,release;
  win.setInterval=(fn,ms)=>{assert.equal(ms,5000);interval=fn;return 1;};
  win.clearInterval=()=>{cleared=true;};
  global.window=win;global.document=doc;
  global.pollStates=[];
  global.pollRequest=()=>{calls++;return new Promise(resolve=>{release=resolve;});};
  t.after(()=>{global.window=oldWindow;global.document=oldDocument;delete global.pollStates;delete global.pollRequest;delete global.pollEffect;});
  const hook=await load({entryPoints:["src/components/shared/use-registration-notifications.ts"],plugins:[{name:"poll-harness",setup(build){
    build.onResolve({filter:/^(react|@\/services\/registration-notifications)$/},args=>({path:args.path,namespace:"mock"}));
    build.onLoad({filter:/.*/,namespace:"mock"},({path})=>({contents:path==="react" ? 'export const useEffect=fn=>{globalThis.pollEffect=fn;}; export const useState=initial=>{const i=globalThis.pollStates.length;globalThis.pollStates.push(initial);return [initial,v=>{globalThis.pollStates[i]=v;}];};' : 'export const getRegistrationUpdates=async()=>({data: await globalThis.pollRequest(),profiles: []});'}));
  }}]});
  hook.default();const cleanup=global.pollEffect();
  const flush=()=>new Promise(resolve=>setImmediate(resolve));
  assert.equal(calls,1);interval();interval();assert.equal(calls,1);
  const result=[{id:"registration-a-reviewed"}];
  release(result);await flush();assert.equal(calls,2);
  release(result);await flush();assert.deepEqual(global.pollStates[0],result);
  doc.visibilityState="hidden";interval();assert.equal(calls,2);
  doc.visibilityState="visible";doc.dispatchEvent(new Event("visibilitychange"));assert.equal(calls,3);
  cleanup();assert.equal(cleared,true);
  release([{id:"late-result"}]);await flush();assert.deepEqual(global.pollStates[0],result);
  win.dispatchEvent(new Event("focus"));assert.equal(calls,3);
});