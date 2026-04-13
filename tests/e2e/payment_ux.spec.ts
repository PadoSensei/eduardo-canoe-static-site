import { test, expect } from "@playwright/test";

test.describe("Payment UX Interactions", () => {
  const mockUuid = "550e8400-e29b-41d4-a716-446655440000";
  const mockPixKey = "00020126360014BR.GOV.BCB.PIX0114MOCKKEY123";

  test.beforeEach(async ({ page, context }) => {
    // Set language to English and inject a mock booking session
    await page.goto("/book");

    // Inject session into localStorage
    await page.evaluate(
      (data) => {
        window.localStorage.setItem("pending_booking", JSON.stringify(data));
        window.localStorage.setItem("language", "en");
      },
      {
        currentBooking: {
          uuid: mockUuid,
          id: 555,
          created_at: new Date().toISOString(),
        },
        paymentInfo: {
          qr_code: mockPixKey,
          qr_code_image:
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
          expires_in: 600, // 10 minutes
        },
      }
    );

    // Mock initial tours load to keep UI stable
    await page.route("**/api/v1/tours/available**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    // Mock polling endpoint - return pending by default
    await page.route(`**/api/v1/bookings/status/${mockUuid}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: "pending_payment", uuid: mockUuid }),
      });
    });

    // Reload to apply localStorage and start the session
    await page.reload();
  });

  test("should automatically transition to TimeoutView when timer hits zero", async ({
    page,
  }) => {
    // 1. GIVEN: I am on the Payment View
    await expect(page.getByText(/Booking Reserved/i)).toBeVisible();
    await expect(page.getByText(mockPixKey)).toBeVisible();

    // 2. WHEN: Time passes (fast-forward 10 minutes)
    // We use page.clock to fast forward
    await page.clock.install();
    await page.clock.fastForward("10:01");

    // 3. THEN: The PaymentView (QR code) should be replaced by TimeoutView
    // The "Contact Support" button should appear
    await expect(
      page.getByRole("link", { name: /Contact Support/i })
    ).toBeVisible({ timeout: 10000 });

    // AND: The QR code should no longer be visible
    await expect(page.getByText(mockPixKey)).not.toBeVisible();

    // AND: The timeout title should be visible
    await expect(page.getByText(/Payment Timeout/i)).toBeVisible();
  });

  test("should copy Pix key to clipboard and show feedback", async ({
    page,
    context,
    browserName,
  }) => {
    // 1. GIVEN: I grant clipboard permissions (Chromium only support for grantPermissions in Playwright)
    if (browserName === "chromium") {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    }

    // 2. AND: I am on the Payment View
    await expect(page.getByText(/Booking Reserved/i)).toBeVisible();

    // 3. WHEN: I click the "Copy Pix Key" button
    const copyBtn = page.getByRole("button", { name: /Copy/i });
    await copyBtn.click();

    // 4. THEN: I should see the feedback "Copied!"
    await expect(page.getByText(/Copied!/i)).toBeVisible();

    // 5. AND: The clipboard content should match the mock Pix key (Chromium only)
    if (browserName === "chromium") {
      const clipboardText = await page.evaluate(() =>
        navigator.clipboard.readText()
      );
      expect(clipboardText).toBe(mockPixKey);
    }
  });

  test("should handle 401 Unauthorized polling error gracefully", async ({
    page,
  }) => {
    // 1. GIVEN: The status API returns a 401 Unauthorized
    let callCount = 0;
    await page.route(`**/api/v1/bookings/status/${mockUuid}`, async (route) => {
      callCount++;
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Unauthorized" }),
      });
    });

    // 2. WHEN: The polls occur
    // We wait for the component to make 5+ failed calls
    // Note: useBooking makes an initial check + interval every 3s.
    // We don't use page.clock here to let the real interval fire if possible,
    // or we use it correctly.
    // Actually, useBooking's interval might be affected by page.clock if not handled carefully.

    await expect
      .poll(() => callCount, { timeout: 20000 })
      .toBeGreaterThanOrEqual(5);

    // 3. THEN: The UI should show a connection/system error instead of crashing
    // In useBooking, it catches and increments consecutiveErrors on any error.
    // If consecutiveErrors >= 5, hasConnectionIssue becomes true.

    // Let's verify it shows the connection warning after 5 failures
    // Note: Due to consecutive errors, useBooking sets isTimedOut=true OR hasConnectionIssue=true.
    // In PaymentView, if isTimedOut OR hasConnectionIssue is true, it shows the Payment Timeout view.
    await expect(page.getByText(/Payment Timeout/i)).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.getByRole("link", { name: /Contact Support/i })
    ).toBeVisible();

    // AND: verify that a toast with the error message appeared (from api.ts update)
    await expect(page.getByText(/Unauthorized/i).first()).toBeVisible();
  });
});
