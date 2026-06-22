import { test, expect } from "@playwright/test";

test("Verify Success View and Digital Voucher", async ({ page }) => {
  const today = new Date().toISOString().split("T")[0];

  // 1. Mock API Responses
  await page.route("**/api/v1/tours/available**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          tour_instance_id: 101,
          tour_type: "sunset",
          display_name: "Passeio ao pôr do sol",
          price: 150.0,
          seats_available: 8,
          is_bookable: true,
          capacity: 10,
          duration: "2h",
          tour_date: today,
          description_key: "tour_sunset_short",
        },
      ]),
    });
  });

  await page.route("**/api/v1/bookings", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          booking: {
            uuid: "mock-voucher-12345",
            display_id: "ABC12345",
            tour_name: "Passeio ao pôr do sol",
            guest_email: "jules@example.com",
            created_at: new Date().toISOString(),
          },
          payment_info: {
            qr_code: "MOCK_PIX_CODE",
            qr_code_image: "https://placehold.co/400x400?text=PIX",
            expires_in: 900,
          },
        }),
      });
    }
  });

  // Go to home page
  await page.goto("/?bypass=true");

  // Force language and testing flag
  await page.evaluate(() => {
    localStorage.setItem("language", "pt");
    localStorage.setItem("is_testing", "true");
  });
  await page.reload();

  // Click Reservar Agora
  await page
    .getByRole("link", { name: /Reservar Agora/i })
    .first()
    .click();

  // Now on /book
  await expect(page).toHaveURL(/\/book/);

  // Select a date - usually there's a date picker or first available date
  // Let's wait for the content to load
  await page.waitForSelector('input[type="date"]');

  // Set date to today or a near future date
  await page.fill('input[type="date"]', today);

  // Wait for tours to appear (it's reactive)
  await page.waitForSelector(
    'button:has-text("Reservar"), button:has-text("Book")'
  );

  // Click first available tour
  await page
    .getByRole("button", { name: /Reservar Agora|Book Now/i })
    .first()
    .click();

  // Fill form
  await page.getByLabel(/Your Name|Seu Nome|Nome/i).fill("Jules Test");
  await page
    .getByLabel(/Your Email|Seu E-mail|E-mail/i)
    .fill("jules@example.com");

  // Accept terms
  await page.getByLabel(/I accept|Eu aceito/i).check();

  // Submit booking
  await page
    .getByRole("button", { name: /Confirm Booking|Confirmar Reserva/i })
    .click();

  // Now we should be on SuccessView
  // Wait for the Reservation ID to appear - use a more robust locator
  // Since we mocked display_id: "ABC12345", it will show #ABC12345
  const voucherId = page.getByText("#ABC12345");
  await expect(voucherId).toBeVisible({ timeout: 15000 });

  // Verify elements
  await expect(page.getByRole("button", { name: /Copiar ID/i })).toBeVisible();
});
