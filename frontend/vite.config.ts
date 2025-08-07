import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs";

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  server: {
    port: 3000,
    open: false,
    host: "0.0.0.0",
    ...(isProduction
      ? {}
      : {
          https: {
            key: fs.readFileSync("certs/front.key"),
            cert: fs.readFileSync("certs/front.cert"),
          },
        }),
    proxy: {
      "/api": {
        target: 'https://api-gateway:8443',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, // ✅ Keep this
      },
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
