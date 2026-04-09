// @ts-check
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

const ADMIN_SESSION_FILE = path.join(__dirname, "tests/.auth/admin.json");

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",

  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    actionTimeout: 15000,
    navigationTimeout: 20000,
  },

  projects: [
    // =========================================================
    // SETUP — Runs once before any dependent project.
    // =========================================================
    {
      name: "setup",
      testMatch: /auth\.setup\.mjs/,
      use: { ...devices["Desktop Chrome"] },
    },

    // =========================================================
    // 1. ADMIN DASHBOARD TESTS
    // =========================================================
    {
      name: "admin-chromium",
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: ADMIN_SESSION_FILE,
      },
      testMatch: /admin\.spec\.mjs/,
    },

    // =========================================================
    // 2. GUEST FLOW TESTS (DESKTOP)
    // =========================================================
    {
      name: "guest-chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: [/admin\.spec\.mjs/, /workflow\.spec\.mjs/],
    },

    // =========================================================
    // 3. GUEST FLOW TESTS (MOBILE) - Skip in CI
    // =========================================================
    ...(!process.env.CI
      ? [
          {
            name: "guest-mobile-safari",
            use: { ...devices["iPhone 12"] },
            testIgnore: [/admin\.spec\.mjs/, /workflow\.spec\.mjs/],
          },
        ]
      : []),

    // =========================================================
    // 4. PRODUCTION WORKFLOW
    // =========================================================
    {
      name: "production-workflow",
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: ADMIN_SESSION_FILE,
      },
      testMatch: /workflow\.spec\.mjs/,
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "pipe",
    timeout: 60000,
  },
});
