import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import BookingSystem from "../../src/components/BookingSystem";
import { LanguageProvider } from "../../src/context/LanguageContext";
import { BrowserRouter } from "react-router-dom";

const API_BASE = "http://localhost:8080/api/v1";

describe("Full Booking Compliance Flow", () => {
  let capturedPayload;

  const server = setupServer(
    http.get(`${API_BASE}/tours/available`, () =>
      HttpResponse.json([
        {
          tour_instance_id: 101,
          tour_type: "morning",
          display_name: "Sunrise",
          price: 100,
          seats_available: 5,
          is_bookable: true,
          tour_date: "2026-01-20",
        },
      ])
    ),
    http.post(`${API_BASE}/bookings`, async ({ request }) => {
      capturedPayload = await request.json();
      return HttpResponse.json({
        success: true,
        booking: { uuid: "123" },
        payment_info: {},
      });
    }),
    // Handle the polling that starts automatically after booking
    http.get(`${API_BASE}/bookings/status/123`, () =>
      HttpResponse.json({ status: "pending_payment" })
    )
  );

  beforeAll(() => server.listen());
  afterEach(async () => {
    server.resetHandlers();
    localStorage.clear();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  afterAll(() => server.close());

  test("User can only complete booking after checking the LGPD box", async () => {
    render(
      <BrowserRouter>
        <LanguageProvider>
          <BookingSystem />
        </LanguageProvider>
      </BrowserRouter>
    );

    // 1. Open Modal — PT default is "Reservar Agora"
    fireEvent.click(
      await screen.findByRole("button", { name: /Reservar Agora|Book Now/i })
    );

    // 2. Fill inputs
    fireEvent.input(screen.getByLabelText(/Seu Nome|Your Name/i), {
      target: { value: "LGPD Tester" },
    });
    fireEvent.input(screen.getByLabelText(/Seu E-mail|Your Email/i), {
      target: { value: "test@lgpd.com" },
    });

    // 3. Verify Button is locked — PT default is "Confirmar Reserva"
    const confirmBtn = screen.getByRole("button", {
      name: /Confirmar Reserva|Confirm Booking/i,
    });
    expect(confirmBtn).toBeDisabled();

    // 4. Accept terms
    fireEvent.click(screen.getByRole("checkbox"));
    expect(confirmBtn).not.toBeDisabled();

    // 5. Submit
    fireEvent.click(confirmBtn);

    // 6. Verify payload includes the correct boolean field name for the backend
    await waitFor(() => {
      expect(capturedPayload).toHaveProperty("accepted_terms", true);
    });
  });
});
