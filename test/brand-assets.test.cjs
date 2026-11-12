const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFile } = require("node:fs/promises");

test("branding keeps the original image bytes and loads them as cacheable files", async () => {
  const { createServer } = await import("vite");
  const server = await createServer({
    logLevel: "silent",
    server: { host: "127.0.0.1", port: 0 },
  });
  try {
    await server.listen();
    const base = server.resolvedUrls.local[0];
    const { association } = await server.ssrLoadModule(
      "/src/datas/association.ts",
    );
    const { utilities } = await server.ssrLoadModule("/src/datas/utilities.ts");
    const assets = [
      [association.logo, "src/assets/logo/logo.jpg"],
      ...utilities.map((utility) => {
        const names = { about: "about", fees: "membership-fee", activities: "participation", sponsorships: "sponsorship", contact: "contact", "event-assistant": "event-assistant", "tan-son-ward": "tan-son-ward", "giao-thuong": "giao-thuong", "ban-do": "ban-do" };
        assert.ok(names[utility.id], "Missing icon mapping for " + utility.id);
        return [utility.icon, "src/assets/icon/" + names[utility.id] + ".png"];
      }),
    ];
    for (const [url, file] of assets) {
      assert.ok(
        !url.startsWith("data:"),
        file + " must not inflate JavaScript",
      );
      const response = await fetch(new URL(url, base));
      assert.equal(response.status, 200);
      assert.deepEqual(
        Buffer.from(await response.arrayBuffer()),
        await readFile(file),
      );
    }
  } finally {
    await server.close();
  }
});
