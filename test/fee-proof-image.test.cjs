const { test } = require("node:test");
const assert = require("node:assert/strict");
const { buildSync } = require("esbuild");
test("fee photos handle missing MIME, decode failures and timeouts without toBlob or FileReader hangs", async (t) => {
  const { outputFiles } = buildSync({
    entryPoints: ["src/services/fee-proof-image.ts"],
    bundle: true,
    write: false,
    platform: "node",
    format: "cjs",
  });
  const module = { exports: {} };
  new Function("module", "exports", "require", outputFiles[0].text)(
    module,
    module.exports,
    require,
  );
  const api = module.exports,
    original = {
      Image: global.Image,
      document: global.document,
      setTimeout: global.setTimeout,
      clearTimeout: global.clearTimeout,
    };
  const oldCreate = URL.createObjectURL,
    oldRevoke = URL.revokeObjectURL;
  let mode = "ok",
    created = 0,
    revoked = 0;
  const jpeg =
    "data:image/jpeg;base64," +
    Buffer.from([255, 216, 255, 1, 2, 3, 4, 5, 6, 7, 8, 9]).toString("base64");
  URL.createObjectURL = () => {
    created++;
    return "blob:fee-image";
  };
  URL.revokeObjectURL = () => {
    revoked++;
  };
  global.Image = class {
    naturalWidth = 2000;
    naturalHeight = 1500;
    set src(_value) {
      if (mode === "ok") queueMicrotask(() => this.onload?.());
      if (mode === "error") queueMicrotask(() => this.onerror?.());
    }
  };
  global.document = {
    createElement: () => ({
      getContext: () => ({ fillRect() {}, drawImage() {} }),
      toBlob() {
        throw Error("Should not use toBlob");
      },
      toDataURL: () => jpeg,
    }),
  };
  t.after(() => {
    Object.assign(global, original);
    URL.createObjectURL = oldCreate;
    URL.revokeObjectURL = oldRevoke;
  });
  assert.equal(
    await api.prepareFeeProofImage(
      new File(["image"], "proof.PNG", { type: "" }),
    ),
    jpeg,
  );
  assert.equal(
    await api.prepareFeeProofImage(
      new File(["image"], "proof.jpg", { type: "application/octet-stream" }),
    ),
    jpeg,
  );
  await assert.rejects(
    api.prepareFeeProofImage(
      new File(["pdf"], "proof.pdf", { type: "application/pdf" }),
    ),
    /JPG/,
  );
  await assert.rejects(
    api.prepareFeeProofImage({ type: "image/png", size: 10 * 1024 * 1024 + 1 }),
    /10 MiB/,
  );
  mode = "error";
  await assert.rejects(
    api.prepareFeeProofImage(
      new File(["image"], "bad.png", { type: "image/png" }),
    ),
    /Không đọc được ảnh/,
  );
  mode = "hang";
  global.setTimeout = (callback) => {
    queueMicrotask(callback);
    return 0;
  };
  global.clearTimeout = () => {};
  await assert.rejects(
    api.prepareFeeProofImage(
      new File(["image"], "hang.png", { type: "image/png" }),
    ),
    /Đọc ảnh quá lâu/,
  );
  assert.equal(
    created,
    revoked,
    "temporary image URLs must always be released",
  );
});
