import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  // 1. Load ALL env vars (empty prefix) to access SENTRY_ variables from .env
  const env = loadEnv(mode, process.cwd(), "");
  const isProd = mode === "production";

  return {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    plugins: [
      react(),
      // 2. Conditional Sentry Plugin
      ...(isProd
        ? [
            sentryVitePlugin({
              // SENIOR MOVE: Use the 'env' object to satisfy ESLint and prevent project drift
              org: env.SENTRY_ORG || "ai-solutions-s6",
              project: env.SENTRY_PROJECT || "eduardo-canoe-frontend",
              authToken: env.SENTRY_AUTH_TOKEN,
            }),
          ]
        : []),
    ],
    optimizeDeps: {
      exclude: ["@playwright/test", "playwright-core", "chromium-bidi"],
    },
    build: {
      // 3. 'hidden' sourcemaps provide forensic data to Sentry
      // without exposing raw code to the browser's DevTools.
      sourcemap: isProd ? "hidden" : true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
            sentry: ["@sentry/react"],
          },
        },
      },
    },
  };
});
