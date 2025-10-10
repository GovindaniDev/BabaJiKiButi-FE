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
       '/api': {
        target: 'http://127.0.0.1:8080',   // <-- your Spring host:port
        changeOrigin: true,
        // ws: true,
        // rewrite: (path) => path,         // no rewrite needed
      },
      "/auth": {
        target: "http://127.0.0.1:8080",       // ✅ host:port only
        changeOrigin: true,
        secure: false,
        
      },
    },
  },
});
