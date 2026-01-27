import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // 1. Manually load env variables based on the current mode (e.g., production)
  // This makes SENTRY_AUTH_TOKEN available to this config file
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      sentryVitePlugin({
        org: "ai-solutions",
        project: "python-fastapi",
        // 2. Explicitly pass the token from the loaded env
        authToken: env.SENTRY_AUTH_TOKEN,
      }),
    ],

    build: {
      sourcemap: true,

      // 3. Solve the "Large Chunk" warning
      // This splits your code into 'vendor' (libraries) and 'index' (your logic)
      // It makes the initial load feel much faster for the user.
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
