import { test, expect } from "@playwright/test";

test("Verify Success View and Digital Voucher", async ({ page }) => {
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
  const today = new Date().toISOString().split("T")[0];
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
  await page.fill("#guest-name", "Jules Test");
  await page.fill("#guest-email", "jules@example.com");

  // Accept terms
  await page.check("#accept-terms");

  // Submit booking
  await page
    .getByRole("button", { name: /Confirmar Reserva|Confirm Booking/i })
    .click();

  // Now we should be on SuccessView
  // Wait for the Reservation ID to appear - use a more robust locator
  const voucherId = page.getByText(/#[A-Z0-9]{8}/);
  await expect(voucherId).toBeVisible({ timeout: 15000 });

  // Verify elements
  await expect(page.getByRole("button", { name: /Copiar ID/i })).toBeVisible();
});
