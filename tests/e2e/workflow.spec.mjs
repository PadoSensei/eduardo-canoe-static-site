import { test, expect, request } from "@playwright/test";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ADMIN_SESSION_FILE = path.join(__dirname, "../.auth/admin.json");

test.describe("Railway Production Loop", () => {
  const guestName = `E2E-TEST-${Math.floor(Math.random() * 9999)}`;
  const guestEmail = "e2e@ai-solutions.irish";
  const API_URL = "https://web-production-625b6.up.railway.app";
  const testDate = "2026-04-02";

  test("should complete a full booking lifecycle on Railway", async ({
    page,
  }) => {
    test.setTimeout(120000);

    // =========================================================
    // 0. LOAD ADMIN TOKEN & INJECT INTO ALL ADMIN API CALLS
    // =========================================================
    const sessionFile = JSON.parse(fs.readFileSync(ADMIN_SESSION_FILE, "utf8"));
    const adminToken = sessionFile.origins?.[0]?.localStorage?.find((entry) =>
      entry.name.includes("auth-token")
    )?.value;

    const parsedToken = adminToken ? JSON.parse(adminToken).access_token : null;
    expect(parsedToken, "No access_token found in admin.json").toBeTruthy();
    console.log("🔑 Admin token loaded from session file");

    // Inject JWT at network layer for all Railway admin calls
    await page.route(`${API_URL}/api/v1/admin/**`, async (route) => {
      await route.continue({
        headers: {
          ...route.request().headers(),
          Authorization: `Bearer ${parsedToken}`,
        },
      });
    });

    // =========================================================
    // 1. GUEST JOURNEY: NAVIGATE AND SET DATE
    // =========================================================
    await page.goto("/book");
    await page.waitForLoadState("networkidle");

    // Register the tours/available listener BEFORE setting the date
    // so we capture the fetch that React fires on date change
    const toursResponsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes("/tours/available") &&
        resp.request().method() === "GET",
      { timeout: 20000 }
    );

    // Playwright's .fill() on a date input doesn't reliably fire React's
    // synthetic onChange. We set the value via the DOM and dispatch both
    // 'input' and 'change' events to guarantee React picks it up.
    await page.evaluate((date) => {
      const input = document.querySelector("#tour-date-input");
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      ).set;
      nativeSetter.call(input, date);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }, testDate);

    console.log(`📅 Date set to ${testDate}, waiting for tours API...`);

    // Wait for the actual network response and inspect it
    const toursResponse = await toursResponsePromise;
    expect(
      toursResponse.status(),
      `Tours endpoint returned ${toursResponse.status()}`
    ).toBe(200);

    const toursBody = await toursResponse.json();
    console.log(`🗓️ Tours API returned ${toursBody.length} tour(s)`);
    console.log(
      `🗓️ Tour details: ${toursBody
        .map((t) => `${t.display_name} (is_bookable: ${t.is_bookable})`)
        .join(", ")}`
    );

    // Hard fail early if backend returns no bookable tours for this date
    const bookableTours = toursBody.filter((t) => t.is_bookable);
    expect(
      bookableTours.length,
      `No bookable tours returned for ${testDate} — check tour instances in Railway DB`
    ).toBeGreaterThan(0);

    // =========================================================
    // 2. WAIT FOR TOUR CARDS TO RENDER
    // =========================================================

    // Wait for the loading spinner to clear
    await expect(page.getByTestId("loading-state")).toBeHidden({
      timeout: 15000,
    });

    // The tour cards each contain an h4 with the tour name.
    // We wait for the first one to appear.
    const firstTourHeading = page.locator("h4.font-lora").first();
    await firstTourHeading.waitFor({ state: "visible", timeout: 15000 });

    const bookedTourName = await firstTourHeading.innerText();
    console.log(`🛶 Booking tour: ${bookedTourName}`);

    // Click the Book Now button inside the same card as the heading
    const firstTourCard = firstTourHeading.locator("..").locator("..");
    const bookBtn = page
      .getByRole("button", { name: /Book Now|Reservar/i })
      .first();
    await bookBtn.click();

    // =========================================================
    // 3. FILL IN BOOKING FORM
    // =========================================================
    await page.fill('input[placeholder*="full name"]', guestName);
    await page.fill('input[placeholder*="email.com"]', guestEmail);
    await page.fill('input[placeholder*="84"]', "123456789");
    await page.check('input[type="checkbox"]');
    await page.getByRole("button", { name: /Confirm/i }).click();

    await expect(
      page.getByText(/(Booking Reserved|Reserva Iniciada)/i)
    ).toBeVisible({ timeout: 15000 });

    // =========================================================
    // 4. RETRIEVE DATA & SIGN WEBHOOK
    // =========================================================
    const storage = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("pending_booking"))
    );

    const bookingId = storage.currentBooking.id;
    const totalPrice = storage.currentBooking.total_price;
    console.log(`📝 Created Booking ID: ${bookingId}`);

    const payloadObject = {
      event: "OPENPIX:CHARGE_COMPLETED",
      charge: {
        correlationID: bookingId.toString(),
        value: Math.round(totalPrice * 100),
        status: "COMPLETED",
      },
    };

    const payloadString = JSON.stringify(payloadObject);
    const secret = process.env.VITE_WEBHOOK_SECRET;
    const signature = crypto
      .createHmac("sha1", secret || "fallback")
      .update(payloadString)
      .digest("hex");

    // =========================================================
    // 5. SPOOF PAYMENT TO RAILWAY
    // =========================================================
    const apiRequest = await request.newContext();

    const webhookResponse = await apiRequest.post(
      `${API_URL}/api/v1/webhooks/pix`,
      {
        data: payloadString,
        headers: {
          "x-openpix-signature": signature,
          "Content-Type": "application/json",
        },
      }
    );

    expect(webhookResponse.status()).toBe(200);
    console.log("💰 Webhook accepted by Railway!");

    // Give Railway time to process the payment
    await page.waitForTimeout(4000);

    // =========================================================
    // 6. VERIFY GUEST SUCCESS VIEW
    // =========================================================
    await expect(page.getByText(/(Payment Confirmed|Confirmado)/i)).toBeVisible(
      { timeout: 25000 }
    );

    // =========================================================
    // 7. ADMIN: NAVIGATE TO DASHBOARD
    // =========================================================
    await page.goto("/admin");
    await page.waitForURL(/\/admin/, { timeout: 15000 });
    await page.waitForLoadState("networkidle");

    // =========================================================
    // 8. ADMIN: NAVIGATE CALENDAR TO CORRECT MONTH
    // =========================================================
    const [targetYear, targetMonth, targetDay] = testDate.split("-");
    const dayToClick = targetDay.replace(/^0+/, "");
    const now = new Date();

    const monthsToAdvance =
      (parseInt(targetYear, 10) - now.getFullYear()) * 12 +
      (parseInt(targetMonth, 10) - (now.getMonth() + 1));

    console.log(`📅 Advancing calendar ${monthsToAdvance} month(s)`);

    for (let i = 0; i < monthsToAdvance; i++) {
      // Try aria-label first, fall back to chevron button
      await page.getByLabel("Next Month").click();
    }

    // =========================================================
    // 9. ADMIN: CLICK THE TARGET DAY
    // =========================================================

    // Register manifest listener before clicking
    const manifestResponsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes("/admin/manifest/") &&
        resp.request().method() === "GET",
      { timeout: 20000 }
    );

    // Click day — scoped to avoid gray padding days from adjacent months
    // by looking for the day number that is NOT muted/gray
    const activeDay = page
      .locator("div.cursor-pointer:not(.text-gray-300)")
      .filter({
        has: page.locator("span", { hasText: new RegExp(`^${dayToClick}$`) }),
      })
      .first();

    await activeDay.waitFor({ state: "visible", timeout: 10000 });
    await activeDay.click();

    const manifestResponse = await manifestResponsePromise;
    const manifestStatus = manifestResponse.status();
    console.log(`📋 Manifest API status: ${manifestStatus}`);

    expect(
      manifestStatus,
      `Manifest returned ${manifestStatus} — check Railway auth`
    ).toBe(200);

    const manifestBody = await manifestResponse.json();
    console.log(`📋 Tours in manifest: ${manifestBody.length}`);
    console.log(
      `📋 Tour names: ${manifestBody.map((t) => t.display_name).join(", ")}`
    );

    expect(
      manifestBody.length,
      `Manifest returned 0 tours for ${testDate}`
    ).toBeGreaterThan(0);

    // =========================================================
    // 10. ADMIN: OPEN THE CORRECT TOUR CARD
    // =========================================================
    await expect(page.getByText(/Loading Manifest/i)).toBeHidden({
      timeout: 10000,
    });

    await expect(
      page.getByRole("heading", { name: /Daily Schedule/i })
    ).toBeVisible({ timeout: 10000 });

    // Match the tour card by the same name the guest booked
    const tourManifestCard = page
      .locator("div.shadow-sm")
      .filter({ hasText: bookedTourName })
      .first();

    await tourManifestCard.waitFor({ state: "visible", timeout: 10000 });
    await tourManifestCard.click();

    // =========================================================
    // 11. FINAL ASSERTION: GUEST IN PASSENGER LIST
    // =========================================================
    await expect(page.getByText(/Operational Manifest/i)).toBeVisible({
      timeout: 10000,
    });

    console.log(`🔍 Looking for guest: ${guestName}`);
    await expect(page.getByText(guestName)).toBeVisible({ timeout: 15000 });

    console.log("✅ Full Production Loop Verified on Railway.");
  });
});
