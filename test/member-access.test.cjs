const { test } = require("node:test");
const assert = require("node:assert/strict");
const { build } = require("esbuild");

test("Zalo member access verifies identity before loading private directory", async (t) => {
  global.window = global;
  const originalFetch = global.fetch;
  t.after(() => { global.fetch = originalFetch; delete global.sdkFailure; });
  const { outputFiles } = await build({
    entryPoints: ["src/services/member-access.ts"], bundle: true, write: false, platform: "node", format: "esm",
    define: { "import.meta.env": JSON.stringify({ VITE_API_BASE_URL: "http://localhost:4000/api/v1" }) },
    plugins: [{ name: "test-zalo-sdk", setup(build) {
      build.onResolve({ filter: /^zmp-sdk\/apis$/ }, () => ({ path: "zalo", namespace: "test-sdk" }));
      build.onLoad({ filter: /.*/, namespace: "test-sdk" }, () => ({ contents: `
        export async function getSetting() { if(globalThis.sdkFailure) throw Error("SDK unavailable"); return {authSetting: globalThis.authSetting || {}}; }
        export async function authorize({scopes}) { globalThis.requestedScopes=scopes; return {"scope.userInfo": !globalThis.profileDenied, "scope.userPhonenumber": !globalThis.phoneDenied}; }
        export async function getUserInfo() { return {userInfo: {id: "untrusted-client", name: "Client name"}}; }
        export async function getAccessToken() { return "verified-token"; }
        export async function getPhoneNumber() { if (globalThis.phoneFailure) throw Error("Phone unavailable"); return {token: "phone-proof"}; }
      ` }));
    } }],
  });
  const service = await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString("base64")}`);
  const reply = data => new Response(JSON.stringify(data));

  await t.test("unlinked identity never requests the directory", async () => {
    let requests = 0;
    global.fetch = async (url, options) => {
      requests += 1;
      assert.match(url, /member\/session$/);
      assert.equal(options.method, "POST");
      assert.deepEqual(JSON.parse(options.body), { phoneToken: "phone-proof" });
      assert.equal(options.headers.Authorization, "Bearer verified-token");
      return reply({ data: { zaloUserId: "123456789", linked: false, member: null, user: { id: "123456789", name: "Tên Zalo" } } });
    };
    const result = await service.authenticateZaloMember();
    assert.equal(requests, 1);
    assert.deepEqual(result.members, []);
    assert.equal(result.identity.zaloUserId, "123456789");
    assert.deepEqual(global.requestedScopes, ["scope.userInfo", "scope.userPhonenumber"]);
  });

  await t.test("linked identity loads all directory pages with verified token", async () => {
    const pages = [];
    global.fetch = async (url, options) => {
      assert.equal(options.headers.Authorization, "Bearer verified-token");
      if (url.endsWith("session")) return reply({ data: { zaloUserId: "123456789", linked: true, member: { id: "m1" }, user: { id: "123456789", name: "Tên Zalo" } } });
      pages.push(url);
      return reply({ data: [{ id: `m${pages.length}` }], pagination: { total: 2 } });
    };
    const result = await service.authenticateZaloMember();
    assert.equal(result.members.length, 1);
    assert.equal(pages.length, 0);
    assert.equal((await service.getMemberDirectory("verified-token")).length, 2);
    assert.match(pages[1], /page=2&limit=100$/);
  });

  await t.test("phone denial still saves profile without a phone claim", async () => {
    global.phoneDenied = true;
    global.fetch = async (url, options) => {
      assert.match(url, /member\/session$/);
      assert.deepEqual(JSON.parse(options.body), {});
      return reply({ data: { linked: false, member: null, user: { id: "123456789", name: "Tên Zalo" } } });
    };
    assert.equal((await service.authenticateZaloMember()).identity.user.name, "Tên Zalo");
    delete global.phoneDenied;
  });

  await t.test("profile denial never writes to backend", async () => {
    global.profileDenied = true;
    global.fetch = () => { throw Error("Unexpected backend call"); };
    await assert.rejects(service.authenticateZaloMember(), /Bạn cần cho phép/);
    delete global.profileDenied;
  });

  await t.test("existing permissions skip authorize and phone SDK failure still saves the profile", async () => {
    global.authSetting = {"scope.userInfo": true, "scope.userPhonenumber": true};
    global.phoneFailure = true;
    global.requestedScopes = undefined;
    global.fetch = async (url, options) => {
      assert.match(url, /member\/session$/);
      assert.deepEqual(JSON.parse(options.body), {});
      return reply({data: {linked: false, member: null, user: {id: "123456789", name: "Tên thật từ backend"}}});
    };
    try {
      const result = await service.authenticateZaloMember();
      assert.equal(global.requestedScopes, undefined);
      assert.equal(result.identity.user.name, "Tên thật từ backend");
      assert.match(result.identity.phoneNotice, /Chưa lấy được/);
    } finally {
      delete global.authSetting;
      delete global.phoneFailure;
    }
  });

  await t.test("backend failure is not shown as successful consent storage", async () => {
    global.fetch = async () => new Response(JSON.stringify({message: "Backend unavailable"}), {status: 503});
    await assert.rejects(service.authenticateZaloMember(), /Backend unavailable/);
  });

  await t.test("SDK unavailable does not call backend or fake login", async () => {
    global.sdkFailure = true;
    global.fetch = () => { throw Error("Unexpected backend call"); };
    await assert.rejects(service.authenticateZaloMember(), /mở mini app trong Zalo/);
  });
});
