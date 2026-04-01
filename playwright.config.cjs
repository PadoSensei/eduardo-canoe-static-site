// @ts-check
const { defineConfig, devices } = require("@playwright/test");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const ADMIN_SESSION_FILE = path.join(__dirname, "tests/.auth/admin.json");

module.exports = defineConfig({
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
  },

  projects: [
    // =========================================================
    // SETUP — Runs once before any dependent project.
    // Mints a real Supabase session via service role magic link
    // and saves browser storage state to disk.
    // =========================================================
    {
      name: "setup",
      testMatch: /auth\.setup\.mjs/,
      use: { ...devices["Desktop Chrome"] },
    },

    // =========================================================
    // 1. ADMIN DASHBOARD TESTS
    // Uses saved Supabase session — no bypass needed.
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
    // Public paths only — no auth dependency.
    // =========================================================
    {
      name: "guest-chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: [/admin\.spec\.mjs/, /workflow\.spec\.mjs/],
    },

    // =========================================================
    // 3. GUEST FLOW TESTS (MOBILE)
    // Checks responsiveness for tourists on phones at the lagoon.
    // =========================================================
    {
      name: "guest-mobile-safari",
      use: { ...devices["iPhone 12"] },
      testIgnore: [/admin\.spec\.mjs/, /workflow\.spec\.mjs/],
    },

    // =========================================================
    // 4. PRODUCTION WORKFLOW
    // Full booking lifecycle against live Railway backend.
    // Depends on setup so admin JWT is available for manifest calls.
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
  },
});
