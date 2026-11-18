const { test } = require("node:test");
const assert = require("node:assert/strict");
const { build } = require("esbuild");

test("LocalGo samples follow the public directory and deduplicate companies", async (t) => {
  const { outputFiles } = await build({
    entryPoints: ["src/services/localgo-samples.ts"],
    bundle: true,
    write: false,
    platform: "node",
    format: "cjs",
    plugins: [{
      name: "sample-directory",
      setup(builder) {
        builder.onResolve({ filter: /^\.\/association$/ }, () => ({ path: "directory", namespace: "mock" }));
        builder.onLoad({ filter: /.*/, namespace: "mock" }, () => ({
          contents: "export const getAppData = async (options) => globalThis.mockLocalGoDirectory(options);",
        }));
      },
    }],
  });
  const result = { exports: {} };
  new Function("module", "exports", "require", outputFiles[0].text)(result, result.exports, require);
  const { listLocalGoSamples } = result.exports;
  const members = [
    { id: "a", company: "Công ty Mẫu Hoàng Gia", phone: "0000000000", companyAddress: "Địa chỉ riêng" },
    { id: "b", company: " công ty mẫu  hoàng gia " },
    { id: "c", company: "Doanh nghiệp Đông Sơn" },
    { id: "d", company: " " },
  ];
  global.mockLocalGoDirectory = ({ resources }) => {
    assert.deepEqual(resources, ["members"]);
    return { members };
  };
  t.after(() => { delete global.mockLocalGoDirectory; });

  const samples = await listLocalGoSamples("");
  assert.deepEqual(samples.map((place) => place.name), ["Công ty Mẫu Hoàng Gia", "Doanh nghiệp Đông Sơn"]);
  assert.ok(samples.every((place) => place.isSample && place.memberId === null && !place.phone));
  assert.ok(samples.every((place) => place.address === "Vị trí minh họa tại Tân Sơn"));
  assert.notDeepEqual(samples[0].location.coordinates, samples[1].location.coordinates);
  assert.deepEqual((await listLocalGoSamples("dong son")).map((place) => place.id), ["sample-c"]);
  assert.deepEqual(await listLocalGoSamples("địa chỉ riêng"), []);
  members.push({ id: "e", company: "Hội viên mới" });
  assert.equal((await listLocalGoSamples("")).length, 3);
});
