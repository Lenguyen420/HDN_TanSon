import { defineConfig, type ProxyOptions } from "vite";
import zaloMiniApp from "zmp-vite-plugin";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

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
    plugins: [zaloMiniApp(), react()],
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
