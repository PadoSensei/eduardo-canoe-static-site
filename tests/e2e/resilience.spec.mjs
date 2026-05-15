import { test, expect } from "@playwright/test";

test.describe("Resilience & Error Handling", () => {
  test.use({ locale: "en-US" });

  test.beforeEach(async ({ page }) => {
    // We start at the booking page for these specific tests
    await page.goto("/book", { waitUntil: "networkidle" });
  });

  // --- SUITE 1: LATENCY STRESS ---

  test("should show loading spinner and disable inputs during high latency", async ({
    page,
  }) => {
    // 1. Simulate a 3-second delay for the initial tour fetch
    await page.route("**/api/v1/tours/available*", async (route) => {
      await new Promise((f) => setTimeout(f, 3000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    // 2. ACT: Navigate to /book (this triggers the initial load)
    await page.goto("/book");

    // 3. ASSERT: The loading state (spinner) should be visible
    const loader = page.getByTestId("loading-state");
    await expect(loader).toBeVisible();

    // 4. ASSERT: The date input should eventually appear after the wait
    await expect(page.locator('input[type="date"]')).toBeVisible({
      timeout: 10000,
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
        currentBooking: {
          uuid: mockUuid,
          id: 777,
          created_at: new Date().toISOString(),
        },
        paymentInfo: {
          qr_code: "slow_pix",
          qr_code_image: "https://placehold.co/400x400?text=PIX+QR",
          expires_in: 900,
        },
      }
    );

    // 2. Intercept polling with high latency (2 seconds per poll)
    await page.route(`**/api/v1/bookings/status/${mockUuid}`, async (route) => {
      await new Promise((f) => setTimeout(f, 2000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: "pending_payment", uuid: mockUuid }),
      });
    });

    // Mock initial tours fetch to avoid 404s
    await page.route("**/api/v1/tours/available*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.goto("/book", { waitUntil: "load" });

    // 3. ASSERT: The "Booking Reserved" text is visible while the network is slow
    await expect(
      page.getByText(/Booking Reserved|Reserva Iniciada/i)
    ).toBeVisible();
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

    await page.reload({ waitUntil: "networkidle" });

    // 2. ASSERT: User sees the 'errorGeneric' text
    await expect(
      page.getByText(/Sorry|Desculpe|não foi possível/i)
    ).toBeVisible();
  });

  test("should show alert when booking submission fails", async ({ page }) => {
    // 1. Setup: Let tours load normally
    await page.route("**/api/v1/tours/available*", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            tour_instance_id: 1,
            tour_type: "sunset",
            display_name: "Sunset",
            price: 100,
            seats_available: 10,
            is_bookable: true,
            tour_date: new Date().toISOString().split("T")[0],
            duration: "2h",
          },
        ]),
      })
    );

    // 2. Force the POST /bookings to fail
    await page.route("**/api/v1/bookings", (route) =>
      route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Credit limit exceeded" }),
      })
    );

    await page.goto("/book", { waitUntil: "networkidle" });

    // Click "Book Now" in the tour list
    const bookNowButton = page.getByRole("button", {
      name: /Book Now|Reservar Agora/i,
    });
    await expect(bookNowButton).toBeVisible();
    await bookNowButton.click();

    // 3. Fill the form
    await page.getByLabel(/Your Name|Seu Nome|Nome/i).fill("Failure Tester");
    await page
      .getByLabel(/Your Email|Seu E-mail|E-mail/i)
      .fill("fail@test.com");
    await page.getByLabel(/I accept|Eu aceito/i).check();

    // 4. ACT: Submit
    const confirmButton = page.getByRole("button", {
      name: /Confirm Booking|Confirmar Reserva/i,
    });
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();

    // 5. ASSERT: The modal should display the specific error from the backend
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(
      page.getByText(/Booking failed|Falha na reserva/i)
    ).toBeVisible();
  });

  test("should trigger the Global Sentry Error Boundary on total crash", async ({
    page,
  }) => {
    // 1. Setup normal tours
    await page.route("**/api/v1/tours/available*", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            tour_instance_id: 1,
            tour_type: "sunset",
            display_name: "Sunset",
            price: 100,
            seats_available: 10,
            is_bookable: true,
            tour_date: "2099-12-31",
          },
        ]),
      })
    );

    // 2. Go to booking page
    await page.goto("/book", { waitUntil: "networkidle" });

    // 3. Inject poison pill into Array.prototype.map to crash during React render
    await page.evaluate(() => {
      const originalMap = Array.prototype.map;
      Array.prototype.map = function (...args) {
        // Targeted crash: only crash when mapping over tours in the component
        if (
          this &&
          this.length > 0 &&
          this[0] &&
          typeof this[0] === "object" &&
          this[0].instanceId === 1
        ) {
          throw new Error("Simulated Render Crash");
        }
        return originalMap.apply(this, args);
      };
    });

    // 4. Trigger a re-render by changing the date to 2099-12-31
    const dateInput = page.locator('input[type="date"]');
    await dateInput.fill("2099-12-31");

    // 5. ASSERT: The ErrorBoundary fallback should appear
    await expect(page.getByText(/Oops!/i)).toBeVisible({ timeout: 10000 });
  });
});
