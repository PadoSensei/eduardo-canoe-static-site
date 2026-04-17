import { test as setup, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ADMIN_SESSION_FILE = path.join(__dirname, "../.auth/admin.json");

setup("authenticate admin", async ({ page }) => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log(`📡 Connecting to Supabase: ${supabaseUrl}`);

  // FE-CI: Skip real auth if we are in CI with a mock URL
  if (supabaseUrl?.includes("mock.supabase.co") || !supabaseUrl) {
    console.log("🛠️ Mock Supabase detected. Generating dummy session...");
    const mockToken = {
      access_token: "mock-token",
      refresh_token: "mock-refresh",
      token_type: "bearer",
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: {
        id: "mock-user-id",
        email: "admin@example.com",
      },
    };

    const dummyState = {
      cookies: [],
      origins: [
        {
          origin: "http://localhost:5173",
          localStorage: [
            {
              name: "sb-mock-auth-token",
              value: JSON.stringify(mockToken),
            },
          ],
        },
        {
          origin: "http://127.0.0.1:5173",
          localStorage: [
            {
              name: "sb-mock-auth-token",
              value: JSON.stringify(mockToken),
            },
          ],
        },
      ],
    };
    const fs = await import("fs");
    const dir = path.dirname(ADMIN_SESSION_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ADMIN_SESSION_FILE, JSON.stringify(dummyState, null, 2));
    console.log(`💾 Mock session persisted to: ${ADMIN_SESSION_FILE}`);
    return;
  }

  // 1. HARDENED CLIENT: Custom fetch with 60s timeout
  // This prevents the UND_ERR_CONNECT_TIMEOUT from killing the script early
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: (url, options) =>
        fetch(url, { ...options, signal: AbortSignal.timeout(60000) }),
    },
  });

  // 2. RETRY LOGIC: Handle cold starts (tries up to 3 times)
  let data = null;
  let error = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    console.log(`🔑 Generating magic link (Attempt ${attempt}/3)...`);
    const result = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: process.env.E2E_ADMIN_EMAIL,
      options: { redirectTo: "http://localhost:5173/" },
    });

    if (!result.error) {
      data = result.data;
      break;
    }
    error = result.error;
    console.warn(`⚠️ Attempt ${attempt} failed: ${error.message}`);
    if (attempt < 3) await new Promise((res) => setTimeout(res, 2000));
  }

  expect(
    error,
    `Magic link generation failed after 3 attempts: ${error?.message}`
  ).toBeNull();
  console.log("✅ Magic link generated successfully");

  // Navigate to action_link — Supabase redirects to localhost with tokens in hash
  // We use 'networkidle' to ensure the redirect has fully processed
  console.log("🚀 Navigating to action link...");
  await page.goto(data.properties.action_link, { waitUntil: "networkidle" });

  // Wait until we land on localhost with the hash
  await page.waitForURL(/localhost:5173/, { timeout: 15000 });

  // Grab tokens directly from the hash before the app processes anything
  const { accessToken, refreshToken } = await page.evaluate(() => {
    const params = new URLSearchParams(window.location.hash.replace("#", ""));
    return {
      accessToken: params.get("access_token"),
      refreshToken: params.get("refresh_token"),
    };
  });

  console.log("🔍 Access token present in hash:", !!accessToken);
  expect(
    accessToken,
    "No access_token found in the redirect hash"
  ).toBeTruthy();

  // Inject directly into localStorage — skip waiting for Supabase client
  // Project ID is the first part of the hostname: jgewbscublmkjwipkpjy
  const storageKey = `sb-${
    new URL(supabaseUrl).hostname.split(".")[0]
  }-auth-token`;

  console.log(`💉 Injecting session into ${storageKey}`);
  await page.evaluate(
    ({ key, accessToken, refreshToken }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken,
          token_type: "bearer",
          expires_at: Math.floor(Date.now() / 1000) + 3600,
        })
      );
    },
    { key: storageKey, accessToken, refreshToken }
  );

  // Buffer: Give the browser a moment to acknowledge the new storage
  await page.waitForTimeout(1000);

  // Navigate to admin with session now in localStorage
  console.log("🚀 Navigating to /admin with injected session...");
  await page.goto("/admin", { waitUntil: "networkidle" });

  // 3. FIX: USE ROLE-BASED SELECTOR
  // Dashboard.jsx renders an H1 with 'Operations'.
  // Role-based selectors are much more stable for testing than generic text matches.
  const dashboardHeading = page.getByRole("heading", { name: /Operations/i });
  await expect(dashboardHeading).toBeVisible({ timeout: 20000 });

  console.log("✅ Admin Dashboard reached and session verified");

  // 4. Persistence
  await page.context().storageState({ path: ADMIN_SESSION_FILE });
  console.log(`💾 Admin session state persisted to: ${ADMIN_SESSION_FILE}`);
});
