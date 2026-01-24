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
const TEST_UUID = "test-uuid-123";

// 1. Mock Context
jest.mock("../../src/context/LanguageContext", () => {
  const actual = jest.requireActual("../../src/context/LanguageContext");
  return { ...actual, useLanguage: jest.fn() };
});

// 2. Setup MSW
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
    jest.useFakeTimers(); // USE FAKE TIMERS FROM THE START
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

  const runInitialSetup = async () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <BookingSystem />
        </LanguageProvider>
      </MemoryRouter>
    );

    // Resolve initial fetch
    await act(async () => {
      await jest.advanceTimersByTimeAsync(0);
    });

    fireEvent.click(screen.getByRole("button", { name: /Book Now/i }));

    fireEvent.input(screen.getByLabelText(/Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.input(screen.getByLabelText(/Email/i), {
      target: { value: "john@test.com" },
    });

    // CHECK THE TERMS CHECKBOX
    fireEvent.click(screen.getByRole("checkbox"));

    fireEvent.click(screen.getByRole("button", { name: /Confirm/i }));

    // Resolve booking creation fetch
    await act(async () => {
      await jest.advanceTimersByTimeAsync(0);
    });
  };

  test("should transition to success view after successful polling", async () => {
    let pollCount = 0;
    server.use(
      http.get(`${API_BASE}/bookings/status/${TEST_UUID}`, () => {
        pollCount++;
        return HttpResponse.json({
          status: pollCount < 2 ? "pending" : "confirmed",
        });
      })
    );

    await runInitialSetup();
    expect(screen.getByText(/Booking Reserved/i)).toBeInTheDocument();

    // Advance 3.1s for Poll 1
    await act(async () => {
      await jest.advanceTimersByTimeAsync(3100);
    });
    expect(screen.getByText(/Booking Reserved/i)).toBeInTheDocument();

    // Advance 3.1s for Poll 2 (Confirmed)
    await act(async () => {
      await jest.advanceTimersByTimeAsync(3100);
    });

    expect(screen.getByText(/Confirmed/i)).toBeInTheDocument();
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

    await runInitialSetup();

    // Trigger Poll
    await act(async () => {
      await jest.advanceTimersByTimeAsync(3100);
    });

    // Matches the <h3> or <p> containing the word Expired
    expect(screen.getAllByText(/Expired/i)[0]).toBeInTheDocument();

    // Ensure no more polls happen
    await act(async () => {
      await jest.advanceTimersByTimeAsync(3100);
    });
    expect(pollCount).toBe(1);
  });

  test("should handle API errors gracefully without stopping the loop", async () => {
    let callCount = 0;
    server.use(
      http.get(`${API_BASE}/bookings/status/${TEST_UUID}`, () => {
        callCount++;
        return new HttpResponse(null, { status: 500 });
      })
    );

    await runInitialSetup();

    // Advance 1 interval
    await act(async () => {
      await jest.advanceTimersByTimeAsync(3100);
    });

    expect(screen.getByText(/Booking Reserved/i)).toBeInTheDocument();
    expect(callCount).toBe(1);
  });
});
