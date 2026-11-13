const { test } = require("node:test");
const assert = require("node:assert/strict");
const { buildSync } = require("esbuild");

test("about player uses API video URLs, supports YouTube and hides empty or invalid values", async () => {
  global.window = global;
  const { outputFiles } = buildSync({
    stdin: {
      contents:
        'import React from "react"; import {renderToStaticMarkup} from "react-dom/server"; import Video from "./src/components/about/introduction-video"; export const render = url => renderToStaticMarkup(React.createElement(Video,{url}));',
      resolveDir: process.cwd(),
    },
    bundle: true,
    write: false,
    platform: "node",
    format: "cjs",
    packages: "external",
    define: {
      "import.meta.env": JSON.stringify({
        VITE_API_BASE_URL: "http://localhost:4000/api/v1",
      }),
    },
  });
  const compiled = { exports: {} };
  new Function("module", "exports", "require", "window", outputFiles[0].text)(
    compiled,
    compiled.exports,
    require,
    global,
  );
  const { render } = compiled.exports;
  assert.equal(render(""), "");
  assert.equal(render(undefined), "");
  assert.equal(render("javascript:alert(1)"), "");
  const url =
    "/uploads/introduction-videos/00000000-0000-4000-8000-000000000000.mp4";
  const video = render(url);
  assert.match(video, /<video/);
  assert.ok(video.includes('src="http://localhost:4000' + url + '"'));
  assert.match(video, /controls/);
  assert.ok(!video.includes("gioi-thieu.mp4"));
  const youtube = render("https://youtu.be/M7lc1UVf-VE");
  assert.match(youtube, /<iframe/);
  assert.match(youtube, /youtube-nocookie.com\/embed\/M7lc1UVf-VE/);
});
