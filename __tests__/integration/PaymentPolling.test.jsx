import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import BookingSystem from "../../src/components/BookingSystem";
import {
  LanguageProvider,
  useLanguage,
} from "../../src/context/LanguageContext";

const API_BASE = "http://localhost:8000/api/v1";
const TEST_UUID = "test-uuid-123";

// Mock the language context
jest.mock("../../src/context/LanguageContext", () => {
  const actual = jest.requireActual("../../src/context/LanguageContext");
  return { ...actual, useLanguage: jest.fn() };
});

const server = setupServer(
  http.get(`${API_BASE}/tours/available`, () =>
    HttpResponse.json([
      {
        tour_instance_id: 1,
        tour_type: "morning",
        display_name: "Sunrise Tour",
        price: 100,
        seats_available: 10,
        is_bookable: true,
        tour_date: "2026-01-19",
      },
    ])
  ),
  http.post(`${API_BASE}/bookings`, () =>
    HttpResponse.json({
      success: true,
      booking: { uuid: TEST_UUID, id: 1 },
      payment_info: {
        qr_code: "pix-key",
        qr_code_image: "img",
        expires_in: 900,
      },
    })
  )
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
  jest.clearAllTimers();
  jest.useRealTimers();
});
afterAll(() => server.close());

describe("Payment Polling Integration", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useLanguage.mockReturnValue({
      language: "en",
      t: (key) => {
        // These MUST match the strings used in screen.getByRole/Text calls below
        const manual = {
          ctaButton: "Book Now",
          labelName: "Your Name",
          labelEmail: "Your Email",
          btnConfirm: "Confirm Booking",
          paymentTitle: "Booking Reserved!",
          successTitle: "Payment Confirmed!",
          bookingTitle: "Check Tour Availability",
          selectDateLabel: "Select Date",
        };
        return manual[key] || key;
      },
    });
  });

  const runInitialSetup = async () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <BookingSystem />
        </LanguageProvider>
      </MemoryRouter>
    );

    await act(async () => {
      await jest.advanceTimersByTimeAsync(0);
    });

    // Clicking the button that now has the correct mock text
    fireEvent.click(screen.getByRole("button", { name: /Book Now/i }));

    fireEvent.input(screen.getByLabelText(/Your Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.input(screen.getByLabelText(/Your Email/i), {
      target: { value: "john@test.com" },
    });

    // LGPD Compliance: Enable the button by checking the terms box
    fireEvent.click(screen.getByRole("checkbox"));

    fireEvent.click(screen.getByRole("button", { name: /Confirm Booking/i }));

    await act(async () => {
      await jest.advanceTimersByTimeAsync(0);
    });
  };

  test("should transition to success view after successful polling", async () => {
    server.use(
      http.get(`${API_BASE}/bookings/status/${TEST_UUID}`, () =>
        // Ensure status string matches your BookingStatus Enum (pending_payment)
        HttpResponse.json({ status: "confirmed" })
      )
    );

    await runInitialSetup();

    // Trigger the 3-second polling interval
    await act(async () => {
      await jest.advanceTimersByTimeAsync(3100);
    });

    expect(await screen.findByText(/Payment Confirmed!/i)).toBeInTheDocument();
  });
});
