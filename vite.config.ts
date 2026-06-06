import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.VITE_API_URL || "http://localhost:8000";

  const proxyConfig = {
    "/backend": {
      target: apiTarget,
      changeOrigin: true,
      secure: false,
      rewrite: (requestPath: string) => requestPath.replace(/^\/backend/, ""),
    },
  };

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
      strictPort: false,
      proxy: proxyConfig,
    },
    preview: {
      proxy: proxyConfig,
    },
  };
});
