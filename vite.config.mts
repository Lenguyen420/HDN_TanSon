import { defineConfig } from "vite";
import zaloMiniApp from "zmp-vite-plugin";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

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
        "/api": { target: "http://localhost:4000", changeOrigin: true },
        "/uploads": { target: "http://localhost:4000", changeOrigin: true },
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
