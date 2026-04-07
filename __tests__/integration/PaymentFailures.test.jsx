import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import BookingSystem from "../../src/components/BookingSystem";
import {
  LanguageProvider,
  useLanguage,
} from "../../src/context/LanguageContext";

const API_BASE = "http://localhost:8000/api/v1";
const TEST_UUID = "failed-uuid-123";

// Mock Context
jest.mock("../../src/context/LanguageContext", () => {
  const actual = jest.requireActual("../../src/context/LanguageContext");
  return { ...actual, useLanguage: jest.fn() };
});

// Setup MSW - Use function call syntax, not template literals
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

beforeAll(() => server.listen());

afterEach(() => {
  // CRITICAL: Restore real timers FIRST to prevent timeout
  jest.useRealTimers();
  server.resetHandlers();
  localStorage.clear();
  jest.clearAllMocks();
});

afterAll(() => {
  server.close();
});

// Complete translation mock
const mockLanguageValue = {
  language: "en",
  setLanguage: jest.fn(),
  t: (key) =>
    ({
      ctaButton: "Book Now",
      labelName: "Name",
      labelEmail: "Email",
      labelNotes: "Special Notes",
      btnConfirm: "Confirm Booking",
      btnCancel: "Cancel",
      failedTitle: "Payment Rejected",
      btnRetry: "Try Again",
      bookingTitle: "Check Tour Availability",
      bookingSubtitle: "Select a date",
      selectDateLabel: "Select Date",
      bookTitle: "Book",
      labelDate: "Date",
      labelAcceptTerms: "I accept the",
      linkTerms: "Terms of Service",
      linkAnd: "and",
      linkPrivacy: "Privacy Policy",
      paymentTitle: "Booking Reserved!",
      card1Title: "Sunrise Tour",
      duration: "Duration",
      spotsLeft: "spots left",
    })[key] || key,
};

describe("Payment Failure Logic", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useLanguage.mockReturnValue(mockLanguageValue);
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

    // Click the mandatory terms checkbox
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /Confirm Booking/i }));

    // STEP 3: Resolve the booking creation
    await act(async () => {
      await jest.advanceTimersByTimeAsync(0);
    });

    // STEP 4: Advance to trigger first poll
    await act(async () => {
      await jest.advanceTimersByTimeAsync(3100);
    });

    // STEP 5: Verify failure UI
    expect(
      screen.getByRole("heading", { name: /Rejected/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Try Again/i })
    ).toBeInTheDocument();

    // STEP 6: Verify polling stopped
    await act(async () => {
      await jest.advanceTimersByTimeAsync(3100);
    });
    expect(pollCount).toBe(1);
  });
});
