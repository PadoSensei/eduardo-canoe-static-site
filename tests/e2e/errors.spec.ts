import { test, expect } from "@playwright/test";

test.describe("Overbook/API Error Handling Pillar", () => {
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
            display_name: "Error Test Tour",
            price: 150.0,
            seats_available: 2, // Low availability for the test
            is_bookable: true,
            capacity: 10,
            duration: "2h",
            tour_date: today,
            short_description: "A tour to test error handling.",
          },
        ]),
      });
    });
  });

  test("should handle overbooking error from API", async ({ page }) => {
    // Mock the POST /api/v1/bookings call to return a 400 Bad Request with the specific body
    await page.route("**/api/v1/bookings", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({
            detail: "Tour is now full",
            type: "InventoryError",
          }),
        });
      }
    });

    // 1. GIVEN: I start a booking for the tour
    await page
      .getByRole("button", { name: /book now/i })
      .first()
      .click();
    await page.getByLabel(/Your Name|Seu Nome|Nome/i).fill("Error User");
    await page
      .getByLabel(/Your Email|Seu E-mail|E-mail/i)
      .fill("error@example.com");
    await page.getByLabel(/I accept|Eu aceito/i).check();

    // 2. WHEN: I confirm the booking
    await page
      .getByRole("button", { name: /Confirm Booking|Confirmar Reserva/i })
      .click();

    // 3. THEN: I should remain on the booking form (not redirected to payment)
    await expect(page.getByRole("heading", { name: /Book/i })).toBeVisible();
    await expect(
      page.getByText(/Booking Reserved|Reserva Iniciada/i)
    ).not.toBeVisible();

    // 4. AND: A Sonner Toast or inline error appears with the specific message
    // Note: The app displays the error message from result.message in the modal.
    // In createBooking, if request fails, it returns { success: false, message: (error as Error).message }
    // The request wrapper in api.ts sets message = errorData.detail || "An unexpected error occurred."

    // Check for the error message in the toast (using first() because it might appear in multiple places)
    await expect(page.getByText(/Tour is now full/i).first()).toBeVisible();
  });
});
