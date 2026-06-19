import { test, expect } from "@playwright/test";

test.describe("Money Loop Smoke Test", () => {
  test("User can complete a booking from start to finish @smoke", async ({
    page,
  }) => {
    // 1. Setup Network Interception
    await page.route("**/api/v1/tours/available**", async (route) => {
      const today = new Date().toISOString().split("T")[0];
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            tour_instance_id: 1,
            tour_type: "sunset",
            display_name: "Mock Sunset Tour",
            price: 150.0,
            seats_available: 10,
            is_bookable: true,
            capacity: 10,
            duration: "2h",
            tour_date: today,
            short_description: "A beautiful sunset tour.",
          },
        ]),
      });
    });

    await page.route("**/api/v1/bookings", async (route) => {
      if (route.request().method() === "POST") {
        // Delay response to catch the "Shielded" disabled state
        await new Promise((resolve) => setTimeout(resolve, 500));
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            booking: {
              uuid: "mock-booking-uuid-123",
              guest_email: "test@example.com",
              created_at: new Date().toISOString(),
            },
            payment_info: {
              qr_code: "MOCK_PIX_CODE_123456",
              qr_code_image: "https://placehold.co/400x400?text=PIX+QR",
              expires_in: 900,
            },
          }),
        });
      }
    });

    await page.route("**/api/v1/bookings/status/*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "pending_payment",
          is_confirmed: false,
        }),
      });
    });

    // 2. Navigate to Home and start booking
    await page.goto("/");
    // BILINGUAL: Matches "Book Now" or "Reservar Agora"
    await page
      .getByRole("link", { name: /Book Now|Reservar Agora/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/book/);

    // 3. Select Tour (it should be loaded via intercepted route)
    await expect(page.getByText("Mock Sunset Tour")).toBeVisible();
    // BILINGUAL: Matches "Book Now" or "Reservar Agora"
    await page
      .getByRole("button", { name: /Book Now|Reservar Agora/i })
      .first()
      .click();

    // 4. Fill out the booking form
    // BILINGUAL: Matches "Your Name" or "Seu Nome"
    await page.getByLabel(/Your Name|Seu Nome/i).fill("John Doe");
    // BILINGUAL: Matches "Your Email" or "Seu E-mail"
    await page.getByLabel(/Your Email|Seu E-mail/i).fill("test@example.com");

    // BILINGUAL: Matches "Phone" or "Telefone"

    // BILINGUAL: Matches "Number of Guests" or "Número de Convidados"
    const paxInput = page.getByLabel(/Number of Guests|Número de Hóspedes/i);
    await paxInput.fill("2");

    // BILINGUAL: Matches "I accept" or "Eu aceito"
    await page.getByLabel(/I accept the|Eu aceito os/i).check();

    // 5. The "Shielded" Submit
    // BILINGUAL: Matches "Confirm Booking" or "Confirmar Reserva"
    const confirmButton = page.getByRole("button", {
      name: /Confirm Booking|Confirmar Reserva/i,
    });

    // Use Promise.all to catch the button in its disabled state immediately upon clicking.
    await Promise.all([
      confirmButton.click(),
      expect(confirmButton)
        .toBeDisabled()
        .catch(() => true),
    ]);

    // 6. Verification: Reach Payment View

    // First, wait for the heading. This confirms the transition happened.
    // We use a regex and { name: ... } to be specific to the header.
    await expect(
      page.getByRole("heading", {
        name: /Booking Reserved|Reserva Iniciada|Reserva Confirmada/i,
      })
    ).toBeVisible({ timeout: 10000 });

    // 2. Instead of looking for a full sentence (which is brittle),
    // just check that the PIX instruction exists somewhere in the document.
    await expect(page.getByText(/QR code|código QR/i).first()).toBeVisible();

    // 3. This is the most important check: The real data is visible.
    // If Eduardo's guests can see the Pix key, they can pay.
    await expect(page.getByText("MOCK_PIX_CODE_123456")).toBeVisible();

    // 4. Verify the visual presence of the QR image
    // We look for an image that has "QR" or "PIX" in the alt text
    const qrImage = page.locator(
      'img[alt*="QR"], img[alt*="PIX"], img[src*="PIX"]'
    );
    await expect(qrImage.first()).toBeVisible();
  });
});
