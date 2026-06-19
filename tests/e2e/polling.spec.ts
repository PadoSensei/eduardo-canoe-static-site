import { test, expect } from "@playwright/test";

test.describe("Slow Webhook Persistence Pillar", () => {
  test.beforeEach(async ({ page }) => {
    // Set language to English
    await page.goto("/book");
    await page.evaluate(() => {
      window.localStorage.setItem("language", "en");
    });
    await page.reload();

    // Mock available tours
    await page.route("**/api/v1/tours/available**", async (route) => {
      const today = new Date().toISOString().split("T")[0];
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            tour_instance_id: 1,
            tour_type: "sunrise",
            display_name: "Polling Test Tour",
            price: 150.0,
            seats_available: 10,
            is_bookable: true,
            capacity: 10,
            duration: "2h",
            tour_date: today,
            short_description: "A tour to test slow polling.",
          },
        ]),
      });
    });

    // Mock booking creation
    await page.route("**/api/v1/bookings", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            booking: {
              uuid: "polling-uuid-123",
              guest_email: "polling@example.com",
              created_at: new Date().toISOString(),
            },
            payment_info: {
              qr_code: "POLLING_PIX_CODE",
              qr_code_image: "https://placehold.co/400x400?text=POLLING",
              expires_in: 900,
            },
          }),
        });
      }
    });
  });

  test("should transition to success view after slow polling confirmation", async ({
    page,
  }) => {
    let pollCount = 0;

    // Mock status polling with counter
    await page.route(
      "**/api/v1/bookings/status/polling-uuid-123",
      async (route) => {
        pollCount++;
        if (pollCount <= 3) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              status: "pending_payment",
              is_confirmed: false,
            }),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              status: "confirmed",
              is_confirmed: true,
            }),
          });
        }
      }
    );

    // 1. GIVEN: I start a booking
    await page
      .getByRole("button", { name: /book now/i })
      .first()
      .click();
    await page.getByTestId("guest-name-input").fill("Polling User");
    await page
      .getByTestId("guest-email-input")
      .fill("polling@example.com");
    await page.getByTestId("terms-checkbox").check();
    await page
      .getByRole("button", { name: /Confirm Booking|Confirmar Reserva/i })
      .click();

    // 2. WHEN: I am on the payment screen
    await expect(
      page.getByText(/Booking Reserved|Reserva Iniciada/i)
    ).toBeVisible();

    // 3. THEN: The UI should show the waiting state (implied by the payment view being active)
    // We should see the QR code and instruction
    await expect(page.getByText(/Scan the QR code below/i)).toBeVisible();

    // 4. AND: It should eventually transition to Success View
    // Polling happens every 3 seconds. 4th call happens around 9-12 seconds.
    // Increased timeout for this assertion to account for polling intervals
    await expect(
      page.getByText(/Payment Confirmed!|Pagamento Confirmado!/i)
    ).toBeVisible({ timeout: 20000 });

    // Verify success message contains the email
    await expect(page.getByText("polling@example.com")).toBeVisible();

    // Verify pollCount is at least 4
    expect(pollCount).toBeGreaterThanOrEqual(4);
  });
});
