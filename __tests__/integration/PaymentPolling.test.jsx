// __tests__/integration/PaymentPolling.test.jsx
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

const API_BASE = "http://localhost:8080/api/v1";
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
  jest.useRealTimers();
  server.resetHandlers();
  localStorage.clear();
  jest.clearAllMocks();
});

afterAll(() => server.close());

// Complete translation mock
const mockLanguageValue = {
  language: "en",
  setLanguage: jest.fn(),
  t: (key) =>
    ({
      bookingTitle: "Check Tour Availability",
      bookingSubtitle: "Select a date",
      selectDateLabel: "Select Date",
      ctaButton: "Book Now",
      bookTitle: "Book",
      labelDate: "Date",
      btnConfirm: "Confirm Booking",
      btnCancel: "Cancel",
      labelName: "Your Name",
      labelEmail: "Your Email",
      labelNotes: "Special Notes",
      paymentTitle: "Booking Reserved!",
      successTitle: "Payment Confirmed!",
      labelAcceptTerms: "I accept the",
      linkTerms: "Terms of Service",
      linkAnd: "and",
      linkPrivacy: "Privacy Policy",
      card1Title: "Sunrise Tour",
      duration: "Duration",
      spotsLeft: "spots left",
    })[key] || key,
};

describe("Payment Polling Integration", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useLanguage.mockReturnValue(mockLanguageValue);
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

    fireEvent.click(screen.getByRole("button", { name: /Book Now/i }));
    fireEvent.input(screen.getByLabelText(/Your Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.input(screen.getByLabelText(/Your Email/i), {
      target: { value: "john@test.com" },
    });

    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /Confirm Booking/i }));

    await act(async () => {
      await jest.advanceTimersByTimeAsync(0);
    });
  };

  test("should transition to success view after successful polling", async () => {
    server.use(
      http.get(`${API_BASE}/bookings/status/${TEST_UUID}`, () =>
        HttpResponse.json({ status: "confirmed" })
      )
    );

    await runInitialSetup();

    await act(async () => {
      await jest.advanceTimersByTimeAsync(3100);
    });

    expect(await screen.findByText(/Payment Confirmed!/i)).toBeInTheDocument();
  });

  test("should poll multiple times before confirmation", async () => {
    let pollCount = 0;

    // Confirms on 5th poll to ensure we actually test multiple polls
    server.use(
      http.get(`${API_BASE}/bookings/status/${TEST_UUID}`, () => {
        pollCount++;
        return HttpResponse.json({
          status: pollCount >= 5 ? "confirmed" : "pending_payment",
        });
      })
    );

    await runInitialSetup();

    // Keep advancing until confirmed
    for (let i = 0; i < 10; i++) {
      if (screen.queryByText(/Payment Confirmed!/i)) break;
      await act(async () => {
        await jest.advanceTimersByTimeAsync(3100);
      });
    }

    // Should eventually confirm
    expect(screen.getByText(/Payment Confirmed!/i)).toBeInTheDocument();

    // Should have polled at least 5 times
    expect(pollCount).toBeGreaterThanOrEqual(5);
  });
});
