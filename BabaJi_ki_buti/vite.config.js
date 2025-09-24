// vite.config.ts
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  server: {
  proxy: {
    "/auth": {
      target: "http://localhost:8090",
      changeOrigin: true,
      secure: false,
      //rewrite: (path) => path.replace(/^\/auth/, ""), // ⬅️ add this
    },
  },
}

});
