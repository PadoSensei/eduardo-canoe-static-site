import { test, expect } from "@playwright/test";

test.describe("Penny Test Readiness - Empty State & Log Simulation", () => {
  test.beforeEach(async ({ page }) => {
    // Set language to English
    await page.goto("/");
    await page.evaluate(() => {
      window.localStorage.setItem("language", "en");
    });
    await page.reload();
  });

  test("Tours Page should show EmptyState on 404 (NetworkError)", async ({
    page,
  }) => {
    // Mock 404 for tour-templates
    await page.route("**/api/v1/tour-templates", async (route) => {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Not Found" }),
      });
    });

    await page.goto("/tours");

    // Should show EmptyState message
    await expect(page.getByText(/No tours currently available/i)).toBeVisible();
    // Should NOT show generic error
    await expect(
      page.getByText(/Sorry, we couldn't load tour availability/i)
    ).not.toBeVisible();
  });

  test("Booking Page should show EmptyState on 404 (NetworkError)", async ({
    page,
  }) => {
    // Mock 404 for available tours
    await page.route("**/api/v1/tours/available**", async (route) => {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Not Found" }),
      });
    });

    await page.goto("/book");

    // Should show EmptyState message for specific date
    await expect(
      page.getByText(/No tours available for this date/i)
    ).toBeVisible();
    // Should NOT show generic error
    await expect(
      page.getByText(/Sorry, we couldn't load tour availability/i)
    ).not.toBeVisible();
  });

  test("Should handle 500 error with Red Error Alert", async ({ page }) => {
    // Mock 500 for available tours
    await page.route("**/api/v1/tours/available**", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Internal Server Error" }),
      });
    });

    await page.goto("/book");

    // Should show generic error alert (red text)
    await expect(
      page.getByText(/Sorry, we couldn't load tour availability/i)
    ).toBeVisible();
    // Should NOT show EmptyState message
    await expect(
      page.getByText(/No tours available for this date/i)
    ).not.toBeVisible();
  });

  test("Should verify logs include status and duration", async ({ page }) => {
    const logs: string[] = [];
    page.on("console", (msg) => {
      if (msg.text().includes("🛰️ API Call")) {
        logs.push(msg.text());
      }
    });

    await page.route("**/api/v1/tour-templates", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.goto("/tours");

    // Wait for logs to be populated (pre-fetch and post-fetch)
    await expect.poll(() => logs.length).toBeGreaterThanOrEqual(2);

    // The second log should be the one with the status and duration
    const logWithStatus = logs.find((l) => l.includes("[200 OK]"));
    expect(logWithStatus).toBeDefined();
    expect(logWithStatus).toMatch(/\[200 OK\]/);
    expect(logWithStatus).toMatch(/\(\d+ms\)/);
  });
});
