const test = require("node:test");
const assert = require("node:assert/strict");
const { buildSync } = require("esbuild");

test("event dates use Vietnam time and check-in retries retain their private receipt", async (t) => {
  const { outputFiles } = buildSync({ entryPoints: ["src/services/event-workspace.ts"], bundle: true, write: false, platform: "node", format: "esm", external: ["zmp-sdk/apis"], define: { "import.meta.env": JSON.stringify({ VITE_API_BASE_URL: "https://backend.example/api/v1", VITE_USE_MOCK_DATA: "false" }) } });
  const service = await import("data:text/javascript;base64," + Buffer.from(outputFiles[0].text).toString("base64"));
  assert.equal(service.eventToday(new Date("2026-11-11T18:00:00Z")), "2026-11-12");
  assert.equal(service.matchesEventPeriod("2026-11-09", "week", "2026-11-12"), true);
  assert.equal(service.matchesEventPeriod("2026-11-16", "week", "2026-11-12"), false);
  assert.equal(service.eventStatus({ event: { date: "2026-11-12" } }, "2026-11-12"), "Diễn ra hôm nay");
  assert.equal(service.eventStatus({}, "2026-11-12"), "Chưa có lịch");
  const events = [{ id: "old", event: { date: "2000-01-01" } }, { id: "late", event: { date: "2099-12-30" } }, { id: "next", event: { date: "2099-01-01" } }];
  assert.deepEqual(service.sortEvents(events).map(event => event.id), ["next", "late", "old"]);
  const saved = { window: global.window, localStorage: global.localStorage, fetch: global.fetch };
  t.after(() => Object.assign(global, saved));
  const storage = new Map();
  global.window = global;
  global.localStorage = { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) };
  let failedToken;
  global.fetch = async (_url, options) => { failedToken = JSON.parse(options.body).token; throw new Error("offline"); };
  await assert.rejects(service.checkInEvent("event-a", "Nguyễn A", "Công ty A"), /Không thể kết nối/);
  assert.match(failedToken, /^[a-f0-9]{64}$/);
  global.fetch = async (url, options) => {
    assert.equal(url, "https://backend.example/api/v1/public/events/event-a/check-in");
    if (options.method === "POST") assert.equal(JSON.parse(options.body).token, failedToken);
    else assert.equal(options.headers["X-Attendance-Token"], failedToken);
    return new Response(JSON.stringify({ data: { eventId: "event-a", name: "Nguyễn A", company: "Công ty A", checkedAt: "2026-11-12T02:00:00Z" } }));
  };
  assert.equal((await service.checkInEvent("event-a", "Nguyễn A", "Công ty A")).receipt.name, "Nguyễn A");
  assert.equal((await service.getEventAttendance("event-a")).eventId, "event-a");
  assert.equal(await service.getEventAttendance("unknown"), null);
  await assert.rejects(service.openEventFile("javascript:alert(1)"), /HTTPS/);
  let joinToken;
  global.fetch = async (url, options) => {
    const body = options.body ? JSON.parse(options.body) : null;
    if (url.endsWith("/event-b/join")) {
      joinToken = body.token;
      return new Response(JSON.stringify({data:{eventId:"event-b",name:body.name,company:body.company,registeredAt:"2026-11-12T00:00:00Z",checkedAt:null,status:"registered"}}));
    }
    if (url.endsWith("/event-updates")) {
      assert.equal(body.tokens.find(item=>item.eventId==="event-b").token,joinToken);
      return new Response(JSON.stringify({data:[{id:"reminder-b",title:"Nhắc lịch"}],participations:[{eventId:"event-b",status:"registered"}]}));
    }
    if (url.endsWith("/event-b/check-in")) {
      assert.equal(body.token,joinToken,"joining and check-in must use the same receipt");
      return new Response(JSON.stringify({data:{eventId:"event-b",name:"Nguyễn B",company:"",checkedAt:"2026-11-12T02:00:00Z"}}));
    }
    throw new Error("Unexpected URL");
  };
  assert.equal((await service.joinEvent("event-b","Nguyễn B","")).participation.status,"registered");
  assert.equal((await service.getEventUpdates()).data[0].id,"reminder-b");
  await service.checkInEvent("event-b","Nguyễn B","");

});
