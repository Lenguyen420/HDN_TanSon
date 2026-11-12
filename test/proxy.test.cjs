const { test } = require("node:test");
const assert = require("node:assert/strict");

test("dev proxy returns actionable JSON when backend is unavailable", async () => {
  const { createServer } = await import("vite");
  const server = await createServer({
    logLevel: "silent",
    server: {
      host: "127.0.0.1", port: 0, open: false,
      proxy: { "/api": { target: "http://127.0.0.1:1" } },
    },
  });
  try {
    await server.listen();
    const port = server.httpServer.address().port;
    const response = await fetch(`http://127.0.0.1:${port}/api/v1/public/settings`);
    assert.equal(response.status, 503);
    assert.match(response.headers.get("content-type"), /application\/json/);
    assert.match((await response.json()).message, /Không thể kết nối backend Vercel/);
  } finally {
    await server.close();
  }
});
