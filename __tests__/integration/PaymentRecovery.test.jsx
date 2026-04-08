import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import BookingSystem from "../../src/components/BookingSystem";
import { LanguageProvider } from "../../src/context/LanguageContext";

const API_BASE = "http://localhost:8000/api/v1";

const server = setupServer(
  http.get(`${API_BASE}/tours/available`, () => {
    return HttpResponse.json([]); // List doesn't matter for this test
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  localStorage.clear(); // Ensure isolation
});
afterAll(() => server.close());

describe("Booking Recovery Logic", () => {
  test("automatically restores PaymentView if a pending booking exists in localStorage", async () => {
    // 1. Pre-populate localStorage with a mock booking session
    const mockSession = {
      currentBooking: {
        id: 123,
        uuid: "recovered-uuid",
        created_at: new Date().toISOString(),
      },
      paymentInfo: {
        qr_code: "recovered-pix-key",
        qr_code_image: "img-url",
        expires_in: 600,
      },
    };

    localStorage.setItem("pending_booking", JSON.stringify(mockSession));

    // 2. Render the app (Simulating a page refresh)
    render(
      <MemoryRouter>
        <LanguageProvider>
          <BookingSystem />
        </LanguageProvider>
      </MemoryRouter>
    );

    // 3. ASSERT: The UI should skip the tour list and show the Payment screen immediately
    const paymentHeader = await screen.findByText(/Booking Reserved/i);
    expect(paymentHeader).toBeInTheDocument();

    // 4. ASSERT: The recovered data is displayed
    expect(screen.getByText("recovered-pix-key")).toBeInTheDocument();
  });
});
