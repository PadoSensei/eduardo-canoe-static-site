// vite.config.js
import { sentryVitePlugin } from "@sentry/vite-plugin"; // CORRECTED: was @sentry/react
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // 1. Manually load env variables based on the current mode (e.g., production)
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      // 2. Configure Sentry Plugin correctly
      sentryVitePlugin({
        org: "ai-solutions",
        project: "python-fastapi",
        authToken: env.SENTRY_AUTH_TOKEN,
      }),
    ],

    // 3. SENIOR FIX: Stop Vite from trying to optimize Playwright dependencies
    // This resolves the chromium-bidi errors we saw in the previous run
    optimizeDeps: {
      exclude: ["@playwright/test", "playwright-core", "chromium-bidi"],
    },

    build: {
      sourcemap: true,
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
