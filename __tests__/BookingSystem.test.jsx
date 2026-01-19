import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import BookingSystem from "../src/components/BookingSystem";
import { LanguageProvider } from "../src/context/LanguageContext";

const API_BASE = "http://localhost:8000/api/v1";

const server = setupServer(
  http.get(`${API_BASE}/tours/available`, () => {
    return HttpResponse.json([
      {
        tour_instance_id: 101,
        tour_type: "morning",
        display_name: "Sunrise Tour",
        price: 100,
        seats_available: 5,
        is_bookable: true,
        tour_date: "2026-01-16",
      },
    ]);
  }),
  http.post(`${API_BASE}/bookings`, () => {
    return HttpResponse.json({
      success: true,
      booking: { uuid: "test-uuid-123", id: 1 },
      payment_info: { qr_code: "pix-key-123", qr_code_image: "img.png" },
    });
  })
);

beforeAll(() => {
  server.listen();
  jest.useFakeTimers();
});
afterEach(() => {
  server.resetHandlers();
  jest.clearAllTimers();
});
afterAll(() => {
  server.close();
  jest.useRealTimers();
});

const renderWithProviders = (ui) =>
  render(<LanguageProvider>{ui}</LanguageProvider>);

const reachPaymentStage = async () => {
  const bookBtn = await screen.findByRole("button", { name: /Book Now/i });
  fireEvent.click(bookBtn);

  // Use labels or placeholders that exist in your BookingForm.jsx
  fireEvent.change(screen.getByPlaceholderText(/full name/i), {
    target: { value: "John Doe" },
  });
  fireEvent.change(screen.getByPlaceholderText(/email/i), {
    target: { value: "john@test.com" },
  });

  const confirmBtn = screen.getByRole("button", { name: /Confirm Booking/i });
  fireEvent.click(confirmBtn);

  // Wait for the Payment View to appear
  await screen.findByText(/Booking Reserved/i);
};

describe("BookingSystem Integration & Resilience", () => {
  test("polls for status and switches to Success View", async () => {
    let callCount = 0;
    server.use(
      http.get(`${API_BASE}/bookings/status/test-uuid-123`, () => {
        callCount++;
        const status = callCount < 2 ? "pending_payment" : "confirmed";
        return HttpResponse.json({ status });
      })
    );

    renderWithProviders(<BookingSystem />);
    await reachPaymentStage();

    // Trigger Poll 1: returns pending
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    // Trigger Poll 2: returns confirmed
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    // SuccessView logic: Check for "Thank you" or "confirmed" (check your SuccessView.jsx)
    await waitFor(
      () => {
        expect(screen.getByText(/Confirmation/i)).toBeInTheDocument();
      },
      { timeout: 4000 }
    );
  });

  test("shows connection warning after 5 failed status checks", async () => {
    server.use(
      http.get(`${API_BASE}/bookings/status/test-uuid-123`, () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    renderWithProviders(<BookingSystem />);
    await reachPaymentStage();

    // Advance 5 intervals
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        jest.advanceTimersByTime(3000);
      });
    }

    // Matches the updated text in BookingSystem.jsx
    const warning = await screen.findByText(/Connection slow/i);
    expect(warning).toBeInTheDocument();
  });
});
