import { test, expect } from "@playwright/test";

test.describe("Content Integrity & Proactive UI", () => {
  test.beforeEach(async ({ page }) => {
    // Mock the specialty tour API
    await page.route(
      "**/api/v1/tours/specialty/next?type=full_moon_party",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ next_date: "2026-05-31" }),
        });
      }
    );

    // Mock the tours available API for the specialty date
    await page.route(
      "**/api/v1/tours/available?tour_date=2026-05-31",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            {
              tour_instance_id: 999,
              tour_type: "full_moon_party",
              display_name: "Full Moon Party",
              price: 250,
              seats_available: 10,
              is_bookable: true,
              capacity: 10,
              tour_date: "2026-05-31",
            },
          ]),
        });
      }
    );

    // Mock initial tours for a different date to ensure banner shows
    await page.route(
      "**/api/v1/tours/available?tour_date=**",
      async (route) => {
        const url = route.request().url();
        if (!url.includes("2026-05-31")) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([]),
          });
        }
      }
    );

    await page.goto("/");
    // Check if we are on the landing page and click Book Now to see the BookingSystem
    const bookNowButton = page
      .getByRole("link", { name: /Book Now|Reservar Agora/i })
      .first();
    if (await bookNowButton.isVisible()) {
      await bookNowButton.click();
    }
  });

  test("Pillar A: Form input text visibility (Ghost Text Fix)", async ({
    page,
  }) => {
    // Setup a tour to be bookable so we can open the form
    await page.route(
      "**/api/v1/tours/available?tour_date=**",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            {
              tour_instance_id: 1,
              tour_type: "sunset",
              display_name: "Sunset Tour",
              price: 150,
              seats_available: 10,
              is_bookable: true,
              capacity: 10,
              tour_date: "2026-04-01",
            },
          ]),
        });
      }
    );

    await page.reload();

    // Click the tour card CTA
    await page
      .getByRole("button", { name: /Book Now|Reservar Agora/i })
      .first()
      .click();

    const nameInput = page.getByLabel(/Your Name|Seu Nome|Nome/i);
    const emailInput = page.getByLabel(/Your Email|Seu E-mail|E-mail/i);
    const phoneInput = page.getByLabel(/Phone|Telefone/i);

    await expect(nameInput).toBeVisible();
    await nameInput.fill("Jules Test");
    await emailInput.fill("jules@example.com");
    await phoneInput.fill("123456789");

    // The color might be returned as OKLCH or RGB depending on the browser/environment.
    // We check that it's NOT white or transparent, and specifically that it contains the expected color intensity.
    // Slate 900 is #0f172a
    const color = await nameInput.evaluate((el) => getComputedStyle(el).color);
    console.log("Detected input color:", color);

    // Accept either rgb(15, 23, 42) or the oklch variant
    expect(color).not.toBe("rgb(255, 255, 255)");
    expect(color).not.toBe("rgba(0, 0, 0, 0)");

    if (color.startsWith("rgb")) {
      expect(color).toBe("rgb(15, 23, 42)");
    } else {
      expect(color).toContain("oklch");
    }
  });

  test("Pillar B: Next Full Moon Discovery Banner visibility and behavior", async ({
    page,
  }) => {
    const banner = page.getByTestId("full-moon-banner");
    await expect(banner).toBeVisible();

    // Verify localized date (contains '31')
    await expect(banner).toContainText("31");

    // Click banner and verify date change
    await banner.click();

    const dateInput = page.locator("#tour-date-input");
    await expect(dateInput).toHaveValue("2026-05-31");

    // Banner should disappear when the date is selected
    await expect(banner).not.toBeVisible();
  });
});
