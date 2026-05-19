import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiBaseUrl = env.VITE_API_BASE_URL || "http://localhost:8005/api";
  const apiOrigin = apiBaseUrl.replace(/\/api\/?$/, "");

  return {
    server: {
      host: "::",
      port: 8080,
      watch: {
        usePolling: true,
        interval: 1000,
      },
      hmr: {
        overlay: false,
      },
      proxy: {
        "/api": {
          target: apiOrigin,
          changeOrigin: false, // preserve Host header so backend can resolve subdomain
          secure: false,
        },
        "/storage": {
          target: apiOrigin,
          changeOrigin: false,
          secure: false,
        },
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
