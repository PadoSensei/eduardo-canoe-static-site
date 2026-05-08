# Task #019 - Post-Deploy Verification Guide

## 1. Netlify Dashboard Verification Checklist

Before triggering the next build, ensure the following are set in the Netlify UI (**Site configuration > Environment variables**):

- [ ] **Variable Name:** `VITE_API_URL`
- [ ] **Value:** `[YOUR_NEW_BACKEND_URL]` (e.g., your new Netlify backend or specific production API endpoint)
- [ ] **Scopes:** Ensure it is available in "Builds" and "Runtime".
- [ ] **Cleanup:** Remove any legacy variables named `VITE_API_BASE_URL`.

**Crucial:** When deploying, select **"Clear cache and deploy site"** from the Deploys menu to ensure no artifacts from the old `.env` files remain.

## 2. Browser Validation (The Forensic Check)

After the site is deployed, open the browser and navigate to the application. Open the Developer Tools (F12) and check the Console.

### Observe API Logs

The system is configured to log every API call. Look for lines like this:
`🛰️ API Call: https://... | Origin: ...`

### Manual Console Verification

Run the following script in the browser console to verify the active configuration:

```javascript
// This checks the internal config object used by the API layer
import("./src/core/config.ts")
  .then((m) => {
    const config = m.default;
    console.log(
      "%c --- Environment Forensic Audit ---",
      "color: #10b981; font-weight: bold;"
    );
    console.log("Active API Base URL:", config.apiBaseUrl);
    if (config.apiBaseUrl.includes("railway.app")) {
      console.error("❌ FAILURE: Still pointing to the old Railway URL!");
    } else {
      console.log("✅ SUCCESS: Configuration updated correctly.");
    }
  })
  .catch((e) => {
    console.log(
      "Note: Direct import failed (expected in production). Please check the Network tab for API request URLs."
    );
  });
```

### Network Tab Audit

1. Go to the **Network** tab.
2. Filter by `Fetch/XHR`.
3. Refresh the page.
4. Click on any request (e.g., `available?tour_date=...`).
5. Verify the **Request URL** in the "Headers" sub-tab. It should NOT contain `railway.app`.

## 3. Cache Invalidation

If the old URL still appears:

1. Open the site in an **Incognito/Private window**.
2. If it works correctly there, you have a local Service Worker or Disk Cache issue.
3. In the "Application" tab of DevTools, click **"Clear site data"** to force a fresh state.
