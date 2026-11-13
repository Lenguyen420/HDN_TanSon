const { test } = require("node:test");
const assert = require("node:assert/strict");
const { buildSync } = require("esbuild");
function load(file) {
  const { outputFiles } = buildSync({
    entryPoints: [file],
    bundle: true,
    write: false,
    platform: "node",
    format: "cjs",
    define: {
      "import.meta.env": JSON.stringify({ VITE_USE_MOCK_DATA: false }),
    },
  });
  const result = { exports: {} };
  new Function("module", "exports", "require", outputFiles[0].text)(
    result,
    result.exports,
    require,
  );
  return result.exports;
}

test("license picker rejects unsupported or large files; draft storage never persists the license photo", async () => {
  const image = load("src/services/business-license.ts");
  assert.equal(image.validBusinessLicenseImage(""), false);
  assert.equal(
    image.validBusinessLicenseImage("data:image/svg+xml;base64,AAAA"),
    false,
  );
  assert.equal(
    image.validBusinessLicenseImage("https://example.com/image.jpg"),
    false,
  );
  await assert.rejects(
    image.prepareBusinessLicenseImage(
      new File(["pdf"], "license.pdf", { type: "application/pdf" }),
    ),
    /JPG/,
  );
  await assert.rejects(
    image.prepareBusinessLicenseImage({
      type: "image/png",
      size: 10 * 1024 * 1024 + 1,
    }),
    /10 MiB/,
  );
  const original = global.localStorage;
  const storage = new Map();
  global.localStorage = {
    getItem: (key) => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value),
  };
  try {
    const service = load("src/services/registration.ts");
    const photo = "data:image/png;base64,AAAA";
    service.saveRegistrationDraft({
      ...service.readRegistrationDraft([]),
      fullName: "Tên đã nhập",
      businessLicenseImage: photo,
    });
    const stored = storage.get("tanson-registration-draft");
    assert.ok(!stored.includes(photo));
    assert.ok(!stored.includes("businessLicenseImage"));
    assert.equal(service.readRegistrationDraft([]).businessLicenseImage, "");
    assert.equal(service.readRegistrationDraft([]).fullName, "Tên đã nhập");
  } finally {
    global.localStorage = original;
  }
});
