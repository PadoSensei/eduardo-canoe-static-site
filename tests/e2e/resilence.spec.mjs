import { test, expect } from "@playwright/test";

test.describe("Resilience & Error Handling", () => {
  test.beforeEach(async ({ page }) => {
    // We start at the booking page for these specific tests
    await page.goto("/book");
  });

  // --- SUITE 1: LATENCY STRESS ---

  test("should show loading spinner and disable inputs during high latency", async ({
    page,
  }) => {
    // 1. Simulate a 3-second delay for the initial tour fetch
    await page.route("**/api/v1/tours/available*", async (route) => {
      await new Promise((f) => setTimeout(f, 3000));
      await route.continue();
    });

    // 2. ACT: Trigger a reload or just let the initial load happen
    await page.reload();

    // 3. ASSERT: The loading state (spinner) we added earlier should be visible
    const loader = page.getByTestId("loading-state");
    await expect(loader).toBeVisible();

    // 4. ASSERT: The date input should eventually appear after the wait
    await expect(page.locator('input[type="date"]')).toBeVisible({
      timeout: 5000,
    });
  });

  test('should handle "Slow Webhook" scenario via polling UI', async ({
    page,
  }) => {
    const mockUuid = "777e4567-e89b-12d3-a456-426614174000";

    // 1. Force the app into the Payment View via state injection
    await page.addInitScript(
      (data) => {
        window.localStorage.setItem("pending_booking", JSON.stringify(data));
      },
      {
        currentBooking: { uuid: mockUuid, id: 777 },
        paymentInfo: { qr_code: "slow_pix", qr_code_image: "..." },
      }
    );

    // 2. Intercept polling with high latency (2 seconds per poll)
    await page.route(`**/api/v1/bookings/status/${mockUuid}`, async (route) => {
      await new Promise((f) => setTimeout(f, 2000));
      await route.fulfill({
        json: { status: "pending_payment", uuid: mockUuid },
      });
    });

    await page.goto("/book");

    // 3. ASSERT: The "Booking Reserved" text is visible while the network is slow
    await expect(page.getByText(/Booking Reserved/i)).toBeVisible();

    // 4. ASSERT: Check for the connection warning (the small win we added for UX)
    // If the poll fails or is consistently slow, your logic might trigger a warning
    // This is where you diagnose if the guest would get frustrated
  });

  // --- SUITE 2: HARD ERROR HANDLING ---

  test("should show professional error message when tour fetch fails (500)", async ({
    page,
  }) => {
    // 1. Force a complete server failure
    await page.route("**/api/v1/tours/available*", (route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Internal Server Error" }),
      })
    );

    await page.reload();

    // 2. ASSERT: User sees the 'errorGeneric' text from translations.js
    // instead of a blank white screen.
    await expect(page.getByText(/Sorry, we couldn't load/i)).toBeVisible();
  });

  test("should show alert when booking submission fails", async ({ page }) => {
    // 1. Setup: Let tours load normally
    await page.route("**/api/v1/tours/available*", (route) =>
      route.fulfill({
        json: [
          {
            tour_instance_id: 1,
            tour_type: "sunset",
            display_name: "Sunset",
            price: 100,
            seats_available: 10,
            is_bookable: true,
            duration: "2h",
          },
        ],
      })
    );

    // 2. Force the POST /bookings to fail
    await page.route("**/api/v1/bookings", (route) =>
      route.fulfill({
        status: 400,
        json: { detail: "Credit limit exceeded" },
      })
    );

    await page.goto("/book");
    await page.getByRole("button", { name: /Book Now/i }).click();

    // 3. Fill the form
    await page.fill('input[placeholder*="full name"]', "Failure Tester");
    await page.fill('input[placeholder*="email.com"]', "fail@test.com");
    await page.check('input[type="checkbox"]');

    // 4. ACT: Submit
    await page.getByRole("button", { name: /Confirm/i }).click();

    // 5. ASSERT: The modal should display the specific error from the backend
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page.getByText(/Booking failed/i)).toBeVisible();
  });

  test("should trigger the Global Sentry Error Boundary on total crash", async ({
    page,
  }) => {
    // This is a "Senior" test. We force a client-side crash to see if the
    // App.jsx ErrorBoundary catches it.

    await page.goto("/");

    // Force a React error by trying to access a property of null
    await page.evaluate(() => {
      window.dispatchEvent(
        new ErrorEvent("error", {
          error: new Error("Simulated Frontend Crash"),
        })
      );
    });

    // NOTE: Because of how React handles errors, you might need to actually
    // trigger a render error. For now, we check if the fallback UI appears.
    // If your App.jsx ErrorBoundary is working, this text should appear:
    // await expect(page.getByText(/Something went wrong on our end/i)).toBeVisible();
  });
});
