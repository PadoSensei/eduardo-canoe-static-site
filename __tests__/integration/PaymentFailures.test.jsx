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
import { bookingTranslations } from "../../src/data/bookingTranslations";

const API_BASE = "http://localhost:8000/api/v1";
const TEST_UUID = "failed-uuid-123";

// 1. Setup Mocks
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
        tour_date: "2026-01-20",
      },
    ])
  ),
  http.post(`${API_BASE}/bookings`, () =>
    HttpResponse.json({
      success: true,
      booking: { id: 123, uuid: TEST_UUID },
      payment_info: {
        qr_code: "pix-key",
        qr_code_image: "img",
        expires_in: 900,
      },
    })
  )
);

beforeAll(() => {
  server.listen();
  // Use fake timers globally for this file to keep everything in sync
  jest.useFakeTimers();
});

afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
  jest.clearAllMocks();
});

afterAll(() => {
  server.close();
  jest.useRealTimers();
});

describe("Payment Failure Logic", () => {
  beforeEach(() => {
    // Force English and return actual strings
    useLanguage.mockReturnValue({
      language: "en",
      t: (key) => {
        const manual = {
          card1Title: "Sunrise Tour",
          card2Title: "Full Day Tour",
          card3Title: "Sunset Tour",
        };
        return manual[key] || bookingTranslations.en[key] || key;
      },
    });
  });

  test("displays bank rejection message and stops polling when status is failed", async () => {
    let pollCount = 0;
    server.use(
      http.get(`${API_BASE}/bookings/status/${TEST_UUID}`, () => {
        pollCount++;
        return HttpResponse.json({ status: "failed" });
      })
    );

    render(
      <MemoryRouter>
        <LanguageProvider>
          <BookingSystem />
        </LanguageProvider>
      </MemoryRouter>
    );

    // STEP 1: Resolve the initial tour fetch
    await act(async () => {
      await jest.advanceTimersByTimeAsync(0);
    });

    // STEP 2: Fill Form & Submit
    const bookBtn = screen.getByRole("button", { name: /Book Now/i });
    fireEvent.click(bookBtn);

    fireEvent.input(screen.getByLabelText(/Name/i), {
      target: { value: "John" },
    });
    fireEvent.input(screen.getByLabelText(/Email/i), {
      target: { value: "john@test.com" },
    });

    // Check the terms checkbox to enable the submit button
    fireEvent.click(screen.getByRole("checkbox"));

    fireEvent.click(screen.getByRole("button", { name: /Confirm/i }));

    // STEP 3: Resolve the booking creation fetch
    await act(async () => {
      await jest.advanceTimersByTimeAsync(0);
    });

    // Verify we reached the payment screen
    expect(screen.getByText(/Booking Reserved/i)).toBeInTheDocument();

    // STEP 4: Advance 3.1 seconds to trigger the first poll
    await act(async () => {
      await jest.advanceTimersByTimeAsync(3100);
    });

    // STEP 5: ASSERT - The UI should now show the failure state
    // We target the heading specifically to resolve the 'multiple elements' error
    expect(
      screen.getByRole("heading", { name: /Rejected/i })
    ).toBeInTheDocument();

    // Also verify the button has changed to 'Try Again' (bt.btnRetry)
    expect(
      screen.getByRole("button", { name: /Try Again/i })
    ).toBeInTheDocument();

    // STEP 6: ASSERT - Polling stopped (advance again and check count)
    await act(async () => {
      await jest.advanceTimersByTimeAsync(3100);
    });

    expect(pollCount).toBe(1);
  });
});
