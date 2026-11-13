import { defineConfig, type ProxyOptions, type ConfigEnv, loadEnv } from "vite";
import zaloMiniApp from "zmp-vite-plugin";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const backendProxy: ProxyOptions = {
  // Development and admin use the deployed Vercel backend.
  target: "https://behdntanson.vercel.app",
  changeOrigin: true,
  configure(proxy) {
    proxy.on("error", (_error, _request, response) => {
      if ("writeHead" in response && !response.headersSent) {
        response.writeHead(503, { "Content-Type": "application/json; charset=utf-8" });
        response.end(JSON.stringify({ message: "Không thể kết nối backend. Vui lòng kiểm tra kết nối mạng rồi thử lại." }));
      }
    });
  },
};

// https://vitejs.dev/config/
export default ({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const proxy = { ...backendProxy, target: env.VITE_API_PROXY_TARGET?.trim() || backendProxy.target };
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
        "/api": proxy,
        "/uploads": proxy,
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
