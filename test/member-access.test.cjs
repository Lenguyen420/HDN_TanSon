const { test } = require("node:test");
const assert = require("node:assert/strict");
const { build } = require("esbuild");

test("consented SDK profiles are saved without identity verification", async (t) => {
  global.window = global;
  const originalFetch = global.fetch;
  t.after(() => { global.fetch = originalFetch; delete global.sdkDenied; delete global.sdkGranted; delete global.sdkFailure; delete global.requestedScopes; });
  const {outputFiles} = await build({
    entryPoints: ["src/services/member-access.ts"], bundle: true, write: false, platform: "node", format: "esm",
    define: { "import.meta.env": JSON.stringify({ VITE_API_BASE_URL: "https://behdntanson.vercel.app/api/v1" }) },
    plugins: [{name: "sdk", setup(build) {
      build.onResolve({filter: /^zmp-sdk\/apis$/}, () => ({path: "sdk", namespace: "mock"}));
      build.onLoad({filter: /.*/, namespace: "mock"}, () => ({contents: [
        'export async function getSetting() { if(globalThis.sdkFailure) throw Error("unavailable"); return {authSetting: {"scope.userInfo": !!globalThis.sdkGranted}}; }',
        'export async function authorize({scopes}) { globalThis.requestedScopes=scopes; return {"scope.userInfo": !globalThis.sdkDenied}; }',
        'export async function getUserInfo() { return {userInfo: {id: "123456789", name: "Tên SDK", avatar: "https://example.com/avatar.jpg"}}; }',
        'export async function getAccessToken() { throw Error("Must not request token"); }',
        'export async function getPhoneNumber() { throw Error("Must not request phone"); }'
      ].join('\n')}));
    }}]
  });
  const service = await import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].text).toString('base64'));
  await t.test("permission grant saves only SDK ID/name/avatar and grants no membership", async () => {
    let calls = 0;
    global.fetch = async (url, options) => {
      calls++;
      assert.equal(url, "https://behdntanson.vercel.app/api/v1/public/zalo-profiles");
      assert.equal(options.headers.Authorization, undefined);
      const body = JSON.parse(options.body);
      assert.deepEqual(body, {zaloUserId: "123456789", name: "Tên SDK", avatar: "https://example.com/avatar.jpg"});
      return new Response(JSON.stringify({data: {verificationStatus: "unverified", linked: false, member: null, user: {id: body.zaloUserId, name: body.name, avatar: body.avatar, phone: null}}}));
    };
    const result = await service.saveZaloSdkProfile();
    assert.deepEqual(global.requestedScopes, ["scope.userInfo"]);
    assert.equal(calls, 1); assert.equal(result.identity.linked, false);
    assert.equal(result.identity.user.name, "Tên SDK"); assert.deepEqual(result.members, []);
  });
  await t.test("existing permission does not show an extra consent request", async () => {
    global.sdkGranted = true; global.requestedScopes = undefined;
    await service.saveZaloSdkProfile();
    assert.equal(global.requestedScopes, undefined); delete global.sdkGranted;
  });
  await t.test("denial and unavailable SDK never write a profile", async () => {
    global.fetch = () => { throw Error("Unexpected write"); };
    global.sdkDenied = true;
    await assert.rejects(service.saveZaloSdkProfile(), /Bạn cần cho phép/); delete global.sdkDenied;
    global.sdkFailure = true;
    await assert.rejects(service.saveZaloSdkProfile(), /mở mini app trong Zalo/); delete global.sdkFailure;
  });
  await t.test("database failure does not claim the profile was saved", async () => {
    global.fetch = async () => new Response(JSON.stringify({message: "Database unavailable"}), {status: 503});
    await assert.rejects(service.saveZaloSdkProfile(), /Database unavailable/);
  });
});
