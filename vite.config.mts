import { defineConfig, type Plugin, type ProxyOptions } from "vite";
import zaloMiniApp from "zmp-vite-plugin";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";

// Đóng gói logo và icon cùng ứng dụng, không phụ thuộc URL ảnh của iframe/backend.
function fixedBrandAssets(): Plugin {
  return {
    name: "fixed-brand-assets",
    enforce: "pre",
    async load(id) {
      const file = id.split("?")[0].replace(/\\/g, "/");
      if (!/\/src\/assets\/(?:logo\/logo\.jpg|icon\/(?:about|membership-fee|participation|sponsorship|contact|event-assistant)\.png)$/.test(file)) return;
      const bytes = await readFile(file);
      this.addWatchFile(file);
      const mime = file.endsWith(".jpg") ? "image/jpeg" : "image/png";
      return `export default ${JSON.stringify(`data:${mime};base64,${bytes.toString("base64")}`)};`;
    },
  };
}

const backendProxy: ProxyOptions = {
  // Local development forwards API requests to the deployed backend.
  target: "https://behdntanson.vercel.app",
  changeOrigin: true,
  configure(proxy) {
    proxy.on("error", (_error, _request, response) => {
      if ("writeHead" in response && !response.headersSent) {
        response.writeHead(503, { "Content-Type": "application/json; charset=utf-8" });
        response.end(JSON.stringify({ message: "Không thể kết nối backend Vercel. Vui lòng kiểm tra kết nối mạng rồi thử lại." }));
      }
    });
  },
};

// https://vitejs.dev/config/
export default () => {
  return defineConfig({
    root: ".",
    base: "",
    plugins: [fixedBrandAssets(), zaloMiniApp(), react()],
    css: {
      preprocessorOptions: {
        scss: { api: "modern" },
      },
    },
    server: {
      proxy: {
        "/api": backendProxy,
        "/uploads": backendProxy,
      },
    },
    build: {
      assetsInlineLimit: 0,
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  });
};
