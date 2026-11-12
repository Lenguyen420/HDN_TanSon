const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSync } = require('esbuild');
test('event participation history only includes owned events with server attendance status', async () => {
  const { outputFiles } = buildSync({entryPoints:['src/services/event-history.ts'],bundle:true,write:false,platform:'node',format:'esm'});
  const { buildEventHistory } = await import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].text).toString('base64'));
  const events = [{id:'a',title:'Hội nghị',event:{date:'2026-11-01',venue:'Hội trường'}},{id:'b',title:'Giao lưu',event:{date:'2026-11-10',venue:'Tân Sơn'}},{id:'other',title:'Chưa đăng ký'}];
  const result = buildEventHistory(events,[{eventId:'a',status:'attended'},{eventId:'b',status:'absent'},{eventId:'removed',status:'registered'},{eventId:'a',status:'attended'}]);
  assert.deepEqual(result.map(x=>[x.eventId,x.status]),[['b','absent'],['a','attended'],['removed','registered']]);
  assert.equal(result[1].title,'Hội nghị'); assert.equal(result[1].venue,'Hội trường');
  assert.equal(result[2].eventAvailable,false); assert.equal(result[2].date,'');
  assert.deepEqual(buildEventHistory(events,[]),[]);
});
