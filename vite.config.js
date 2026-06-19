import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_"); // only load public VITE_ vars
  const isProd = mode === "production";

  return {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    plugins: [
      react(),
      ...(isProd
        ? [
            sentryVitePlugin({
              org: process.env.SENTRY_ORG,
              project: process.env.SENTRY_PROJECT,
              authToken: process.env.SENTRY_AUTH_TOKEN, // never from loadEnv
            }),
          ]
        : []),
    ],
    optimizeDeps: {
      exclude: ["@playwright/test", "playwright-core", "chromium-bidi"],
    },
    build: {
      sourcemap: "hidden", // upload to Sentry, hidden from browsers
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
