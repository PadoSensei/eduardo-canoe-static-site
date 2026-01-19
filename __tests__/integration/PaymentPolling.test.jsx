import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import BookingSystem from "../../src/components/BookingSystem";
import { LanguageProvider } from "../../src/context/LanguageContext";

// --- Constants & Mock Data ---
const API_BASE = "http://localhost:8000/api/v1";
const TEST_UUID = "test-uuid-123";

// Note: Date matches the debug logs to avoid "Past Date" validation logic
const MOCK_TOURS = [
  {
    tour_instance_id: 1,
    tour_type: "morning",
    display_name: "Sunrise Tour",
    price: 100,
    seats_available: 10,
    is_bookable: true,
    tour_date: "2026-01-16",
  },
];

const MOCK_BOOKING_SUCCESS = {
  booking: { id: 123, uuid: TEST_UUID },
  payment_info: { qr_code: "pix-key", qr_code_image: "img-url" },
};

// --- MSW Server Setup ---
const server = setupServer(
  http.get(`${API_BASE}/tours/available`, () => HttpResponse.json(MOCK_TOURS)),
  http.post(`${API_BASE}/bookings`, () =>
    HttpResponse.json(MOCK_BOOKING_SUCCESS)
  )
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  jest.useRealTimers(); // Reset clock after every test
});
afterAll(() => server.close());

// --- HELPERS ---

const renderBookingSystem = () =>
  render(
    <LanguageProvider>
      <BookingSystem />
    </LanguageProvider>
  );

/**
 * Reaches the Payment screen while timers are REAL.
 * This prevents the initial MSW fetches from deadlocking.
 */
const reachPaymentStage = async () => {
  // 1. Wait for loading to finish
  const bookBtn = await screen.findByRole("button", { name: /Book Now/i });
  fireEvent.click(bookBtn);

  // 2. Fill form using placeholders from your code
  fireEvent.change(screen.getByPlaceholderText(/full name/i), {
    target: { value: "John Doe" },
  });
  fireEvent.change(screen.getByPlaceholderText(/email/i), {
    target: { value: "john@test.com" },
  });

  // 3. Confirm
  const confirmBtn = screen.getByRole("button", { name: /Confirm Booking/i });
  fireEvent.click(confirmBtn);

  // 4. Wait for transition to payment screen
  await screen.findByText(/Booking Reserved/i);
};

// --- TEST SUITE ---

describe("Payment Polling Integration", () => {
  test("should transition to success view after successful polling", async () => {
    let pollCount = 0;
    server.use(
      http.get(`${API_BASE}/bookings/status/${TEST_UUID}`, () => {
        pollCount++;
        const status = pollCount < 2 ? "pending_payment" : "confirmed";
        return HttpResponse.json({ status });
      })
    );

    renderBookingSystem();
    await reachPaymentStage();

    // --- Switch to Fake Timers for the Polling Loop ---
    jest.useFakeTimers();

    // Trigger Poll 1: Pending
    // Using advanceTimersByTimeAsync (Jest 29.5+) is the cleanest fix for MSW v2
    await act(async () => {
      await jest.advanceTimersByTimeAsync(3000);
    });
    expect(screen.getByText(/Booking Reserved/i)).toBeInTheDocument();

    // Trigger Poll 2: Confirmed
    await act(async () => {
      await jest.advanceTimersByTimeAsync(3000);
    });

    // Switch back to real timers so the findBy queries work
    jest.useRealTimers();

    // Verify Success UI (Matches "Payment Confirmed!" in translations)
    expect(await screen.findByText(/Confirmed/i)).toBeInTheDocument();
    expect(pollCount).toBe(2);
  });

  test("should show expired message and stop polling when status is expired", async () => {
    let pollCount = 0;
    server.use(
      http.get(`${API_BASE}/bookings/status/${TEST_UUID}`, () => {
        pollCount++;
        return HttpResponse.json({ status: "expired" });
      })
    );

    renderBookingSystem();
    await reachPaymentStage();

    jest.useFakeTimers();

    // Trigger the Poll
    await act(async () => {
      await jest.advanceTimersByTimeAsync(3000);
    });

    jest.useRealTimers();

    // Verify "Payment Expired" text appears
    expect(await screen.findByText(/Expired/i)).toBeInTheDocument();

    // Ensure it stopped polling (pollCount should stay 1)
    jest.useFakeTimers();
    await act(async () => {
      await jest.advanceTimersByTimeAsync(3000);
    });
    expect(pollCount).toBe(1);
  });

  test("should handle API errors gracefully without stopping the loop", async () => {
    let errorCount = 0;
    server.use(
      http.get(`${API_BASE}/bookings/status/${TEST_UUID}`, () => {
        errorCount++;
        return new HttpResponse(null, { status: 500 });
      })
    );

    renderBookingSystem();
    await reachPaymentStage();

    jest.useFakeTimers();

    // Advance 1 interval
    await act(async () => {
      await jest.advanceTimersByTimeAsync(3000);
    });

    jest.useRealTimers();

    // Still in payment view
    expect(screen.getByText(/Booking Reserved/i)).toBeInTheDocument();
    expect(errorCount).toBe(1);
  });
});
