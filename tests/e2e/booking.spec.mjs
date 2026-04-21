import { test, expect } from "@playwright/test";

test.describe("Booking Flow", () => {
  test("should navigate from home to booking page", async ({ page }) => {
    // 1. GIVEN: I am on the home page
    await page.goto("/");

    // 2. WHEN: I click the primary "Book Now" button in the Hero
    // We use getByRole for accessibility-first testing
    const bookBtn = page
      .getByRole("link", { name: /Book Now|Reservar Agora/i })
      .first();
    await bookBtn.click();

    // 3. THEN: The URL should be /book
    await expect(page).toHaveURL(/\/book/);

    // 4. AND: The booking system should show the loading state or date input
    const title = page.getByText(
      /Check Tour Availability|Verificar Disponibilidade|Consultar Disponibilidade/i
    );
    await expect(title).toBeVisible();
  });
});
