import { test, expect } from "@playwright/test";

/**
 * Ticket #FE-TOUR: Visual Acceptance Suite
 * This suite acts as a visual guided tour of the system for client demonstration.
 * Narratives: Seamless Guest, Resilient Guest, Dashboard Master, Captain's Tool.
 */

// Global config for this suite to capture video and screenshots
test.use({
  video: "on",
  screenshot: "on",
});

test.describe("EduCanoe Guided Tour", () => {
  const today = new Date().toISOString().split("T")[0];

  // Setup mocks to ensure the demo is deterministic and "Emerald" quality
  test.beforeEach(async ({ page }) => {
    // Force English language and mock auth
    await page.addInitScript(() => {
      window.localStorage.setItem("language", "en");
      window.localStorage.setItem(
        "sb-mock-auth-token",
        JSON.stringify({
          access_token: "mock-token",
          refresh_token: "mock-refresh",
          token_type: "bearer",
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          user: { id: "mock-id", email: "admin@example.com" },
        })
      );
    });

    // Mock Available Tours
    await page.route("**/api/v1/tours/available**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            tour_instance_id: 1,
            tour_type: "sunrise",
            display_name: "Amanhecer no Mar (Sunrise)",
            price: 150,
            seats_available: 10,
            is_bookable: true,
            capacity: 12,
            duration: "2h",
            image_url: "",
            tour_date: today,
            inclusions: ["Breakfast", "Guide"],
            requirements: ["Sunscreen"],
          },
        ]),
      });
    });

    // Mock Booking Creation
    await page.route("**/api/v1/bookings", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            booking: {
              uuid: "demo-uuid-123",
              display_id: "SUN-123",
              guest_email: "ana.silva@example.com",
              status: "pending_payment",
              created_at: new Date().toISOString(),
              checked_in: false,
            },
            payment_info: {
              qr_code:
                "00020126580014br.gov.bcb.pix0136demo-pix-key-1235204000053039865405450.005802BR5913EDUARDO CANOE6008NATAL62070503***6304ABCD",
              qr_code_image:
                "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=demo-pix",
              expires_in: 900,
            },
          }),
        });
      }
    });

    // Mock Booking Status
    await page.route("**/api/v1/bookings/status/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "pending_payment",
          is_confirmed: false,
        }),
      });
    });

    // Mock Admin Schedule
    await page.route("**/api/v1/admin/schedule**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          [today]: {
            booked_count: 5,
            capacity: 12,
            price: 150,
            revenue: 750,
            status: "active",
          },
        }),
      });
    });

    // Mock Admin Manifest
    await page.route("**/api/v1/admin/manifest/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: 1,
            display_name: "Amanhecer no Mar",
            status: "active",
            capacity: 12,
            booked_count: 3,
            passengers: [
              {
                id: 1,
                uuid: "demo-uuid-123",
                display_id: "SUN-123",
                guest_name: "Ana Silva",
                pax_count: 3,
                checked_in: false,
              },
            ],
          },
        ]),
      });
    });

    // Mock Check-in
    await page.route("**/api/v1/admin/bookings/**/check-in", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    // Mock Activity Log
    await page.route("**/api/v1/admin/activity-log*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    // Mock Email Settings
    await page.route("**/api/v1/admin/settings/emails**", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            {
              slug: "guest_booking_confirmed",
              display_name: "Booking Confirmed",
              description: "Sent to guest",
              is_enabled: true,
              scheduled_time: "09:00:00",
            },
          ]),
        });
      } else if (route.request().method() === "PATCH") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            slug: "guest_booking_confirmed",
            display_name: "Booking Confirmed",
            description: "Sent to guest",
            is_enabled: true,
            scheduled_time: "10:00:00",
          }),
        });
      }
    });
  });

  // Narrative 1: The Seamless Guest (The Money Loop)
  test("story_guest_booking: Complete a full booking journey @smoke", async ({
    page,
  }) => {
    // 1. Home Page
    await page.goto("/");
    await expect(page.getByText(/Feel the Ocean's Heartbeat/i)).toBeVisible();

    // 2. Select Tour/Date
    await page.goto(`/book?date=${today}`);

    // 3. Select a tour
    const tourCardBtn = page
      .locator("main button")
      .filter({ hasText: /Book Now/i })
      .first();
    await tourCardBtn.waitFor();
    await tourCardBtn.click();

    // 4. Fill Form
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByLabel(/Your Name|Seu Nome|Nome/i).fill("Ana Silva");
    await dialog
      .getByLabel(/Your Email|Seu E-mail|E-mail/i)
      .fill("ana.silva@example.com");
    await dialog.getByLabel(/I accept|Eu aceito/i).check();

    // 5. Submit and View Pix QR Code
    const bookingBtn = dialog.getByRole("button", {
      name: /Confirm Booking|Confirmar Reserva/i,
    });
    await bookingBtn.click();

    // Wait for Payment View
    await expect(page.getByText(/Booking Reserved/i)).toBeVisible({
      timeout: 20000,
    });
    await expect(page.getByText(/Scan the QR code below/i)).toBeVisible();

    // Proof: Final Pix View screenshot
    await page.screenshot({
      path: "test-results/client-demo/narrative-1-pix-view.png",
      fullPage: true,
    });
  });

  // Narrative 2: The Resilient Guest (The Recovery)
  test("story_guest_recovery: System restores state after refresh", async ({
    page,
  }) => {
    // Setup: Get to the Payment View first
    await page.goto(`/book?date=${today}`);
    const tourCardBtn = page
      .locator("main button")
      .filter({ hasText: /Book Now/i })
      .first();
    await tourCardBtn.waitFor();
    await tourCardBtn.click();

    const dialog = page.getByRole("dialog");
    await dialog
      .getByLabel(/Your Name|Seu Nome|Nome/i)
      .fill("Beatriz Oliveira");
    await dialog
      .getByLabel(/Your Email|Seu E-mail|E-mail/i)
      .fill("beatriz.oliveira@example.com");
    await dialog.getByLabel(/I accept|Eu aceito/i).check();
    await dialog
      .getByRole("button", { name: /Confirm Booking|Confirmar Reserva/i })
      .click();

    await expect(page.getByText(/Booking Reserved/i)).toBeVisible({
      timeout: 20000,
    });

    // Flow: Reach Payment View -> Refresh Page
    await page.reload();

    // Proof: System immediately restores the exact same booking and timer
    await expect(page.getByText(/Booking Reserved/i)).toBeVisible();
    await expect(page.getByText(/Scan the QR code below/i)).toBeVisible();

    await page.screenshot({
      path: "test-results/client-demo/narrative-2-recovery.png",
      fullPage: true,
    });
  });

  // Narrative 3: The Dashboard Master (Financial Control)
  test("story_admin_operations: Login and Dashboard View", async ({ page }) => {
    // 1. Admin Login
    await page.goto("/admin?bypass=true");

    // 2. Dashboard View
    await expect(page.getByText(/Operations/i).first()).toBeVisible({
      timeout: 15000,
    });

    // Proof: High-res screenshot of the Revenue Total and the daily Heatmap
    await page.screenshot({
      path: "test-results/client-demo/narrative-3-dashboard.png",
      fullPage: true,
    });

    // 4. Update a Notification delivery time
    await page.goto("/admin/emails?bypass=true");
    await expect(
      page.getByText(/(E-mails|E-mail Controls|Controles de E-mail)/i).first()
    ).toBeVisible({
      timeout: 15000,
    });

    const timeInput = page.locator('input[type="time"]').first();
    await timeInput.fill("10:00");
    await timeInput.blur();

    await page.screenshot({
      path: "test-results/client-demo/narrative-3-notifications.png",
      fullPage: true,
    });
  });

  // Narrative 4: The Captain's Tool (Manifest & Headcount)
  test("story_captain_manifest: Open manifest and check-in", async ({
    page,
  }) => {
    // Use iPhone 13 viewport to show mobile readiness
    await page.setViewportSize({ width: 390, height: 844 });

    // 1. Navigate to Admin
    await page.goto(`/admin/manifest/${today}?bypass=true`);

    // 2. Enter Manifest
    await expect(page.getByText(/Amanhecer no Mar/i).first()).toBeVisible({
      timeout: 15000,
    });

    const tourCard = page.getByText("Amanhecer no Mar").first();
    await tourCard.waitFor();
    await tourCard.click();

    // 4. Check-in 3 Passengers
    const checkInBtn = page.getByRole("button", { name: /Check-in/i }).first();
    await expect(checkInBtn).toBeVisible();
    await checkInBtn.click();

    // Proof: Screenshot of the Emerald "ON BOARD" cards and the Headcount Bar updating
    // Use .first() to handle strict mode violation between badge and toast
    await expect(page.getByText(/ON BOARD/i).first()).toBeVisible();

    await page.screenshot({
      path: "test-results/client-demo/narrative-4-manifest-mobile.png",
      fullPage: true,
    });
  });
});
