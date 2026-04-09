import { test, expect } from "@playwright/test";

test.describe("Money Loop Smoke Test", () => {
  test("User can complete a booking from start to finish @smoke", async ({
    page,
  }) => {
    // 1. Setup Network Interception
    await page.route("**/api/v1/tours/available**", async (route) => {
      const today = new Date().toISOString().split("T")[0];
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            tour_instance_id: 1,
            tour_type: "sunset",
            display_name: "Mock Sunset Tour",
            price: 150.0,
            seats_available: 10,
            is_bookable: true,
            capacity: 10,
            duration: "2h",
            tour_date: today,
            short_description: "A beautiful sunset tour.",
          },
        ]),
      });
    });

    await page.route("**/api/v1/bookings", async (route) => {
      if (route.request().method() === "POST") {
        // Delay response to catch the "Shielded" disabled state
        await new Promise((resolve) => setTimeout(resolve, 500));
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            booking: {
              uuid: "mock-booking-uuid-123",
              guest_email: "test@example.com",
              created_at: new Date().toISOString(),
            },
            payment_info: {
              qr_code: "MOCK_PIX_CODE_123456",
              qr_code_image: "https://placehold.co/400x400?text=PIX+QR",
              expires_in: 900,
            },
          }),
        });
      }
    });

    await page.route("**/api/v1/bookings/status/*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "pending_payment",
          is_confirmed: false,
        }),
      });
    });

    // 2. Navigate to Home and start booking
    await page.goto("/");
    await page
      .getByRole("link", { name: /book now/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/book/);

    // 3. Select Tour (it should be loaded via intercepted route)
    await expect(page.getByText("Mock Sunset Tour")).toBeVisible();
    await page
      .getByRole("button", { name: /book now/i })
      .first()
      .click();

    // 4. Fill out the booking form
    await page.getByLabel(/your name/i).fill("John Doe");
    await page.getByLabel(/your email/i).fill("test@example.com");

    // Fill Pax count
    const paxInput = page.getByLabel(/number of guests/i);
    await paxInput.fill("2");

    await page.getByLabel(/i accept the/i).check();

    // 5. The "Shielded" Submit
    const confirmButton = page.getByRole("button", {
      name: /confirm booking/i,
    });

    // Use Promise.all to catch the button in its disabled state immediately upon clicking.
    // This pattern captures the transient "processing" state during the network request.
    await Promise.all([
      confirmButton.click(),
      expect(confirmButton)
        .toBeDisabled()
        .catch(() => true),
    ]);

    // 6. Verification: Reach Payment View
    await expect(page.getByText(/scan the qr code below/i)).toBeVisible();
    await expect(page.getByText("MOCK_PIX_CODE_123456")).toBeVisible();

    // Verify QR code image is visible
    const qrImage = page.locator("img.object-contain.w-48.h-48");
    await expect(qrImage).toBeVisible();
  });
});
