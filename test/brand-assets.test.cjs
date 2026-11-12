const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFile } = require("node:fs/promises");

test("logo and utility icons embed the original fixed local assets", async () => {
  const { createServer } = await import("vite");
  const server = await createServer({ logLevel: "silent", server: { middlewareMode: true } });
  try {
    const { association } = await server.ssrLoadModule("/src/datas/association.ts");
    const { utilities } = await server.ssrLoadModule("/src/datas/utilities.ts");
    const assets = [
      [association.logo, "src/assets/logo/logo.jpg", "image/jpeg"],
      ...utilities.map((utility, index) => [utility.icon, `src/assets/icon/${["about", "membership-fee", "participation", "sponsorship", "contact", "event-assistant"][index]}.png`, "image/png"]),
    ];
    assert.equal(assets.length, 7);
    for (const [url, file, mime] of assets) {
      const prefix = `data:${mime};base64,`;
      assert.ok(url.startsWith(prefix), `${file} must be embedded`);
      assert.deepEqual(Buffer.from(url.slice(prefix.length), "base64"), await readFile(file));
    }
  } finally {
    await server.close();
  }
});
