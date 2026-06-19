import { test, expect } from "@playwright/test";

test.describe("Session Recovery Pillar", () => {
  test.beforeEach(async ({ page }) => {
    // Set language cookie or similar if needed, but here we can just ensure
    // we navigate to the page first or use storageState.
    // However, the error was because page.evaluate was called before page.goto.

    // Mock available tours
    await page.route("**/api/v1/tours/available**", async (route) => {
      const today = new Date().toISOString().split("T")[0];
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            tour_instance_id: 1,
            tour_type: "sunset",
            display_name: "Recovery Test Tour",
            price: 150.0,
            seats_available: 10,
            is_bookable: true,
            capacity: 10,
            duration: "2h",
            tour_date: today,
            short_description: "A tour to test session recovery.",
          },
        ]),
      });
    });

    // Mock booking creation
    await page.route("**/api/v1/bookings", async (route) => {
      if (route.request().method() === "POST") {
        const createdAt = new Date();
        // Set creation time to 2 minutes ago to test persistence
        createdAt.setMinutes(createdAt.getMinutes() - 2);

        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            booking: {
              uuid: "recovery-uuid-123",
              guest_email: "recovery@example.com",
              created_at: createdAt.toISOString(),
            },
            payment_info: {
              qr_code: "RECOVERY_PIX_CODE",
              qr_code_image: "https://placehold.co/400x400?text=RECOVERY",
              expires_in: 900, // 15 minutes
            },
          }),
        });
      }
    });

    // Mock status polling
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
  });

  test("should re-hydrate booking state after page reload and persist timeout", async ({
    page,
  }) => {
    // 1. GIVEN: I start a booking
    await page.goto("/book");

    // Set language to English via UI or localStorage after navigation
    await page.evaluate(() => {
      window.localStorage.setItem("language", "en");
    });
    await page.reload();

    await expect(page.getByText("Recovery Test Tour")).toBeVisible();
    await page
      .getByRole("button", { name: /book now/i })
      .first()
      .click();

    await page.getByTestId("guest-name-input").fill("Recovery User");
    await page.getByTestId("guest-email-input").fill("recovery@example.com");
    await page.getByTestId("terms-checkbox").check();

    await page
      .getByRole("button", { name: /Confirm Booking|Confirmar Reserva/i })
      .click();

    // 2. WHEN: I reach the payment screen
    await expect(
      page.getByText(/Booking Reserved|Reserva Iniciada/i)
    ).toBeVisible();
    await expect(page.getByText("RECOVERY_PIX_CODE")).toBeVisible();

    // 3. AND: I reload the page
    await page.reload();

    // 4. THEN: The app should re-hydrate and show the payment view immediately
    await expect(
      page.getByText(/Booking Reserved|Reserva Iniciada/i)
    ).toBeVisible();
    await expect(page.getByText("RECOVERY_PIX_CODE")).toBeVisible();

    // 5. AND: The timeout calculation should reflect the 2 minutes already passed
    // Original expires_in was 900s (15m).
    // Booking was created 2 mins ago.
    // Total remaining should be approx 13 minutes (780s).
    // The UI shows "⏱️ QR Code expires in: MM:SS" or translated version.
    // In English: "⏱️ QR Code expires in: 13:00" or similar.
    const timerText = await page.getByText(/expires in/i).innerText();

    // Regex to match "12:", "13:", or "11:" to be safe with timing
    // Using a more flexible check as the exact time might vary slightly due to execution time
    expect(timerText).toMatch(/(11|12|13):\d{2}/);
  });

  test("should re-hydrate booking state after navigating away and back", async ({
    page,
  }) => {
    // 1. GIVEN: I start a booking and reach payment screen
    await page.goto("/book");
    await page.evaluate(() => {
      window.localStorage.setItem("language", "en");
    });
    await page.reload();

    await page
      .getByRole("button", { name: /book now/i })
      .first()
      .click();
    await page.getByTestId("guest-name-input").fill("Recovery User");
    await page.getByTestId("guest-email-input").fill("recovery@example.com");
    await page.getByTestId("terms-checkbox").check();
    await page
      .getByRole("button", { name: /Confirm Booking|Confirmar Reserva/i })
      .click();
    await expect(
      page.getByText(/Booking Reserved|Reserva Iniciada/i)
    ).toBeVisible();

    // 2. WHEN: I navigate to Home
    await page.goto("/");

    // 3. THEN: The PaymentView should NOT be visible on Home
    await expect(
      page.getByText(/Booking Reserved|Reserva Iniciada/i)
    ).not.toBeVisible();

    // 4. WHEN: I navigate back to /book
    await page.goto("/book");

    // 5. THEN: The app should re-hydrate and show the payment view
    await expect(
      page.getByText(/Booking Reserved|Reserva Iniciada/i)
    ).toBeVisible();
    await expect(page.getByText("RECOVERY_PIX_CODE")).toBeVisible();
  });
});
