// vite.config.ts
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  server: {
    port: 5173,
    proxy: {
      "/auth": {
        target: "http://127.0.0.1:8090",       // ✅ host:port only
        changeOrigin: true,
        secure: false,
        
      },
    },
  },
});
