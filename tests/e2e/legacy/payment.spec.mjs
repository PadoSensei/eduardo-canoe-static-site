import { test, expect } from "@playwright/test";

test.describe("Payment Success Flow", () => {
  test("should transition to success view when payment is confirmed", async ({
    page,
  }) => {
    const mockUuid = "123e4567-e89b-12d3-a456-426614174000";

    // Use a date at least 2 days in the future to avoid the 19:00 manifest lock
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2);
    const tourDate = futureDate.toISOString().split("T")[0];

    // Mock tours/available so the booking page doesn't hit Railway on reload
    await page.route("**/api/v1/tours/available**", (route) =>
      route.fulfill({
        status: 200,
        json: [
          {
            tour_instance_id: 1,
            tour_type: "sunset",
            display_name: "Sunset Tour",
            price: 100.0,
            seats_available: 5,
            is_bookable: true,
            capacity: 10,
            tour_date: tourDate,
          },
        ],
      })
    );

    // First call returns pending, second returns confirmed
    let pollCount = 0;
    await page.route(`**/api/v1/bookings/status/${mockUuid}`, async (route) => {
      pollCount++;

      const isConfirmed = pollCount >= 2;
      const status = pollCount < 2 ? "pending_payment" : "confirmed";
      await route.fulfill({
        json: {
          status,
          uuid: mockUuid,
          is_confirmed: isConfirmed,
          tour_id: 1,
          total_price: 100,
          language: "en",
        },
      });
    });

    // Establish domain for localStorage
    await page.goto("/book");
    await page.waitForLoadState("domcontentloaded");

    // Force language to English for deterministic text matching
    await page.evaluate(() => {
      localStorage.setItem("language", "en");
      localStorage.setItem("is_testing", "false"); // Ensure we don't auto-confirm too early
    });

    // Simple stateful mock for polling
    let callCount = 0;
    await page.route(`**/api/v1/bookings/status/${mockUuid}`, async (route) => {
      callCount++;
      // Return pending for the first 2 calls to give Playwright time to see the PaymentView
      const confirmed = callCount > 2;

      // Add a small delay to simulate network and prevent race conditions
      await new Promise((resolve) => setTimeout(resolve, 200));

      await route.fulfill({
        json: {
          status: confirmed ? "confirmed" : "pending_payment",
          uuid: mockUuid,
          is_confirmed: confirmed,
          tour_id: 1,
          total_price: 100,
          language: "en",
        },
      });
    });

    // Inject session — shape must match useBooking's initialSession:
    // currentBooking needs uuid to start the polling effect
    await page.evaluate(
      (data) => {
        window.localStorage.setItem("pending_booking", JSON.stringify(data));
      },
      {
        currentBooking: {
          uuid: mockUuid,
          id: 123,
          tour_name: "Sunset Tour",
          created_at: new Date().toISOString(), // Added for Zod
        },
        paymentInfo: {
          qr_code: "mock_pix_code",
          qr_code_image:
            "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",
          expires_in: 900, // Added for Zod
        },
      }
    );

    // Reload — BookingSystem calls getStoredSession() and boots with our data.
    // Use domcontentloaded NOT networkidle — the polling interval fires every 3s
    // so the network never goes idle, and networkidle would either time out or
    // resolve after the second poll fires, skipping PaymentView entirely.
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    // PaymentView should be visible immediately — paymentInfo is truthy on mount
    // Use a more relaxed locator that doesn't depend on "section" if it's slow to load
    await expect(page.getByText(/Booking Reserved/i)).toBeVisible({
      timeout: 20000,
    });

    // After the second poll (3s interval) useBooking sets isConfirmed=true → SuccessView
    await expect(page.getByText(/Payment Confirmed/i)).toBeVisible({
      timeout: 20000,
    });

    await expect(
      page.getByRole("button", { name: /(Done|Concluído)/i })
    ).toBeVisible();
  });
});
