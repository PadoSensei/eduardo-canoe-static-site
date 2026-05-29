import { test, expect } from "@playwright/test";

const testDate = "2026-04-02";
const [, , testDay] = testDate.split("-");
const dayNumber = testDay.replace(/^0+/, ""); // "2"

test.describe("Admin Dashboard - Lagoon Commander Sprint", () => {
  test.beforeEach(async ({ page }) => {
    // Freeze the clock at 2026-04-02 Noon
    await page.addInitScript(() => {
      const mockDate = new Date("2026-04-02T12:00:00Z");
      const OriginalDate = Date;
      window.Date = class extends OriginalDate {
        constructor(...args) {
          if (args.length > 0) {
            return new OriginalDate(...args);
          }
          return mockDate;
        }
      };
      // For libraries that check Date.now()
      window.Date.now = () => mockDate.getTime();
    });

    // Register ALL route mocks BEFORE navigating so no real fetch fires first
    await page.route("**/api/v1/admin/schedule*", (route) =>
      route.fulfill({
        status: 200,
        json: {
          [testDate]: {
            booked_count: 5,
            capacity: 10,
            status: "available",
            price: 100.0,
            revenue: 500.0,
          },
        },
      })
    );

    await page.route(`**/api/v1/admin/manifest/${testDate}`, (route) =>
      route.fulfill({
        status: 200,
        json: [
          {
            tour_id: 101,
            display_name: "Sunset Tour",
            status: "available",
            capacity: 10,
            booked_count: 5,
            passengers: [
              {
                id: 1,
                name: "John Doe",
                num_people: 2,
                email: "john@example.com",
                uuid: "test-uuid-123",
                payment_transaction_id: "WVI-TRX-999",
                checked_in: false,
                status: "confirmed",
              },
              {
                id: 2,
                name: "Jane Smith",
                num_people: 3,
                email: "jane@example.com",
                uuid: "test-uuid-456",
                payment_transaction_id: "WVI-TRX-888",
                checked_in: true,
                status: "confirmed",
              },
              {
                id: 3,
                name: "Ghost Guest",
                num_people: 3,
                email: "ghost@example.com",
                uuid: "test-uuid-789",
                payment_transaction_id: "WVI-TRX-777",
                checked_in: false,
                status: "pending_payment",
              },
            ],
          },
        ],
      })
    );

    // Mock Activity Log
    await page.route("**/api/v1/admin/activity-log*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    // Navigate after mocks are in place
    await page.goto("/admin?bypass=true");
    await page.waitForLoadState("networkidle");
  });

  test("should display monthly revenue in the header", async ({ page }) => {
    await expect(page.getByText(/Revenue:/i)).toBeVisible();
    // Matcher for R$ 500,00 with flexible spacing/symbol
    await expect(page.getByText(/R\$.*500,00/)).toBeVisible();
  });

  test("should show capacity heatmap detail (X/Y) in calendar cells", async ({
    page,
  }) => {
    // Day cells are divs — find the in-month cell containing our day number
    // and the booked/capacity stat rendered below it
    const dateCell = page
      .locator("div.cursor-pointer:not(.text-gray-300)")
      .filter({
        has: page.locator("span", {
          hasText: new RegExp(`^${dayNumber}$`),
        }),
      })
      .filter({ hasText: "5/10" })
      .first();

    await expect(dateCell).toBeVisible({ timeout: 10000 });
  });

  test("should display Woovi transaction IDs in the passenger list", async ({
    page,
  }) => {
    // Click the correct in-month day cell
    const dayCell = page
      .locator("div.cursor-pointer:not(.text-gray-300)")
      .filter({
        has: page.locator("span", {
          hasText: new RegExp(`^${dayNumber}$`),
        }),
      })
      .first();

    await dayCell.waitFor({ state: "visible", timeout: 10000 });
    await dayCell.click();

    // Wait for manifest panel to open
    await expect(
      page.getByRole("heading", { name: /Daily Schedule/i })
    ).toBeVisible({ timeout: 10000 });

    // Click the Sunset Tour card
    const tourCard = page
      .locator("div.shadow-sm")
      .filter({ hasText: "Sunset Tour" })
      .first();
    await tourCard.waitFor({ state: "visible", timeout: 10000 });
    await tourCard.click();

    // Passenger list should now be visible
    await expect(page.getByText(/Operational Manifest/i)).toBeVisible({
      timeout: 10000,
    });

    await expect(page.getByText("WVI-TRX-999")).toBeVisible();
  });

  test("should handle passenger check-in toggle and headcount logic @smoke", async ({
    page,
  }) => {
    // Mock the PATCH request
    let patchCalled = false;
    await page.route("**/api/v1/admin/bookings/*/check-in", (route) => {
      patchCalled = true;
      route.fulfill({
        status: 200,
        json: { uuid: "test-uuid-123", checked_in: true },
      });
    });

    const dayCell = page
      .locator("div.cursor-pointer:not(.text-gray-300)")
      .filter({
        has: page.locator("span", {
          hasText: new RegExp(`^${dayNumber}$`),
        }),
      })
      .first();

    await dayCell.waitFor({ state: "visible", timeout: 10000 });
    await dayCell.click();

    await expect(
      page.getByRole("heading", { name: /Daily Schedule/i })
    ).toBeVisible({ timeout: 10000 });

    const tourCard = page
      .locator("div.shadow-sm")
      .filter({ hasText: "Sunset Tour" })
      .first();
    await tourCard.waitFor({ state: "visible", timeout: 10000 });
    await tourCard.click();

    await expect(page.getByText(/Operational Manifest/i)).toBeVisible({
      timeout: 10000,
    });

    // Check initial headcount: Jane (3) is checked in, John (2) is not. Total 5.
    const headcountBar = page.locator(".sticky.top-0");
    await expect(headcountBar.getByText("3 / 5")).toBeVisible();
    await expect(headcountBar.getByText("60%")).toBeVisible();

    const johnRow = page
      .getByTestId("passenger-row")
      .filter({ hasText: "John Doe" });

    // Verify Short ID is visible
    await expect(johnRow.getByText("#TEST-UUI")).toBeVisible();

    const checkInBtn = johnRow.getByRole("button", { name: /Check-in/i });
    await expect(checkInBtn).toBeVisible();
    await checkInBtn.click();

    // Verify Optimistic UI: Emerald background and badge
    await expect(johnRow).toHaveClass(/bg-emerald-50/);
    await expect(johnRow.getByText("✓ ON BOARD")).toBeVisible();

    // Verify Headcount updated: 3 + 2 = 5 / 5
    await expect(headcountBar.getByText("5 / 5")).toBeVisible();
    await expect(headcountBar.getByText(/100%/)).toBeVisible();

    // Verify toast
    await expect(
      page.getByText("John Doe + 1 passengers are on board")
    ).toBeVisible();

    // Verify API was called
    expect(patchCalled).toBe(true);
  });

  test("should handle weather cancellation flow with alerts", async ({
    page,
  }) => {
    await page.route("**/weather-cancel", (route) =>
      route.fulfill({ status: 200, json: { message: "Success" } })
    );

    const dayCell = page
      .locator("div.cursor-pointer:not(.text-gray-300)")
      .filter({
        has: page.locator("span", {
          hasText: new RegExp(`^${dayNumber}$`),
        }),
      })
      .first();

    await dayCell.waitFor({ state: "visible", timeout: 10000 });
    await dayCell.click();

    await expect(
      page.getByRole("heading", { name: /Daily Schedule/i })
    ).toBeVisible({ timeout: 10000 });

    const weatherCancelBtn = page.getByRole("button", {
      name: /(Weather Cancel|Cancelar Clima)/i,
    });
    await weatherCancelBtn.waitFor({ state: "visible", timeout: 10000 });
    await weatherCancelBtn.click();

    // Instead of dialog, we expect the custom modal
    await expect(
      page.getByText(
        /(Cancel Tour for Weather\?|Cancelar Passeio por Clima\?)/i
      )
    ).toBeVisible();

    // Click confirm in modal
    const modalConfirmBtn = page
      .locator("div[role='dialog']")
      .getByRole("button", { name: /(Weather Cancel|Cancelar Clima)/i });
    await modalConfirmBtn.click();

    // Instead of success alert, we expect a toast
    await expect(
      page.getByText(
        /(Tour successfully cancelled|Passeio cancelado com sucesso)/i
      )
    ).toBeVisible();
  });
});
