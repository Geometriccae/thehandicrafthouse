import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Skip Nitro Cloudflare worker for standard Hostinger deploy
  nitro: false,
  tanstackStart: {
    server: { entry: "server" },
    // Disable prerender crawler so Hostinger / container builds don't fail with ECONNREFUSED/ETIMEDOUT
    prerender: {
      enabled: false,
    },
    spa: {
      enabled: false,
    },
  },
  vite: {
    resolve: {
      tsconfigPaths: true,
    },
    server: {
      host: true,
      proxy: {
        "/api": {
          target: "http://localhost:5001",
          changeOrigin: true,
        },
      },
    },
  },
});
