import { test, expect } from "@playwright/test";

test.describe("Admin Notification Settings", () => {
  test.beforeEach(async ({ page }) => {
    // Mock settings fetch
    await page.route("**/api/v1/admin/settings/emails", (route) =>
      route.fulfill({
        status: 200,
        json: [
          {
            slug: "guest_confirmation",
            display_name: "Guest Confirmation",
            description: "Sent when a guest completes a booking.",
            is_enabled: true,
            scheduled_time: null,
          },
          {
            slug: "admin_daily_manifest",
            display_name: "Daily Manifest",
            description: "Daily summary of all tours and passengers.",
            is_enabled: true,
            scheduled_time: "08:00:00",
          },
          {
            slug: "admin_monthly_summary",
            display_name: "Monthly Summary",
            description: "Financial performance summary.",
            is_enabled: true,
            scheduled_time: "09:00:00",
          },
        ],
      })
    );

    // Mock settings update
    await page.route("**/api/v1/admin/settings/emails/*", (route) => {
      const body = route.request().postDataJSON();
      route.fulfill({
        status: 200,
        json: {
          slug: route.request().url().split("/").pop(),
          display_name: "Updated Setting",
          description: "Updated description",
          is_enabled: body.is_enabled ?? true,
          scheduled_time: body.scheduled_time ?? "10:00:00",
        },
      });
    });

    await page.goto("/admin/settings?bypass=true");
  });

  test("should display settings grouped correctly", async ({ page }) => {
    await expect(page.getByText("Customer Notifications")).toBeVisible();
    await expect(page.getByText("Internal Operations")).toBeVisible();

    await expect(page.getByText("Guest Confirmation")).toBeVisible();
    await expect(page.getByText("Daily Manifest")).toBeVisible();
    await expect(page.getByText("Monthly Summary")).toBeVisible();
  });

  test("should toggle a setting and show optimistic feedback", async ({ page }) => {
    const monthlySummaryCard = page.locator("div.bg-white").filter({ hasText: "Monthly Summary" });
    const toggle = monthlySummaryCard.locator("button");

    // Initial state: Enabled (emerald background)
    await expect(toggle).toHaveClass(/bg-emerald-500/);

    // Click to toggle off
    await toggle.click();

    // Optimistic UI check
    await expect(toggle).toHaveClass(/bg-gray-200/);
    await expect(page.getByText("Monthly Summary desativado")).toBeVisible();
  });

  test("should update scheduled time", async ({ page }) => {
    const dailyManifestCard = page.locator("div.bg-white").filter({ hasText: "Daily Manifest" });
    const timeInput = dailyManifestCard.locator("input[type='time']");

    await expect(timeInput).toHaveValue("08:00");

    await timeInput.fill("10:30");
    await timeInput.blur();

    await expect(page.getByText("Horário de entrega atualizado")).toBeVisible();
  });

  test("should rollback UI on failure", async ({ page }) => {
    // Override update mock to fail
    await page.route("**/api/v1/admin/settings/emails/guest_confirmation", (route) =>
      route.fulfill({ status: 500, json: { detail: "Internal Server Error" } })
    );

    const guestConfCard = page.locator("div.bg-white").filter({ hasText: "Guest Confirmation" });
    const toggle = guestConfCard.locator("button");

    await expect(toggle).toHaveClass(/bg-emerald-500/);
    await toggle.click();

    // Check optimistic state
    await expect(toggle).toHaveClass(/bg-gray-200/);

    // Wait for rollback
    await expect(toggle).toHaveClass(/bg-emerald-500/, { timeout: 5000 });
    await expect(page.getByText(/Erro crítico: Falha ao salvar alteração/i)).toBeVisible();
  });
});
