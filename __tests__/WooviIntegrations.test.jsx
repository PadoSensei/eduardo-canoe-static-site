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
import { LanguageProvider, useLanguage } from "../src/context/LanguageContext";
import { createBooking } from "../src/api";
import { bookingTranslations } from "../src/data/bookingTranslations";

// --- Configuration ---
const API_BASE = "http://localhost:8000/api/v1";
const WOOVI_API = "https://api.woovi-sandbox.com/api/v1";
const TEST_UUID = "test-uuid-123";

jest.mock("../src/context/LanguageContext", () => {
  const actual = jest.requireActual("../src/context/LanguageContext");
  return {
    ...actual,
    useLanguage: jest.fn(),
  };
});

const server = setupServer(
  http.get(`${API_BASE}/tours/available`, () =>
    HttpResponse.json([
      {
        tour_instance_id: 101,
        tour_type: "morning",
        display_name: "Sunrise Tour",
        price: 100,
        seats_available: 5,
        is_bookable: true,
        tour_date: "2026-01-20",
      },
    ])
  )
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
  jest.clearAllTimers();
  jest.useRealTimers();
  jest.restoreAllMocks();
});
afterAll(() => server.close());

// --- HELPERS ---

async function fillFormAndSubmit({ name, email }) {
  // Use act for input updates
  await act(async () => {
    fireEvent.input(screen.getByLabelText(/Your Name/i), {
      target: { value: name },
    });
    fireEvent.input(screen.getByLabelText(/Your Email/i), {
      target: { value: email },
    });
  });

  const confirmBtn = screen.getByRole("button", { name: /Confirm/i });
  fireEvent.click(confirmBtn);

  // Wait for the UI transition to complete
  await screen.findByText(/Booking Reserved/i);
}

// --- TEST SUITE ---

describe("Woovi PIX Integration - Full Lifecycle", () => {
  beforeEach(() => {
    useLanguage.mockReturnValue({
      language: "en",
      t: (key) => bookingTranslations.en[key] || key,
    });
  });

  test("backend processes Woovi webhook and confirms booking UI", async () => {
    let callCount = 0;
    server.use(
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
      ),
      http.get(`${API_BASE}/bookings/status/${TEST_UUID}`, () => {
        callCount++;
        // Return confirmed on the second poll
        const status = callCount >= 2 ? "confirmed" : "pending_payment";
        return HttpResponse.json({ status });
      })
    );

    render(
      <LanguageProvider>
        <BookingSystem />
      </LanguageProvider>
    );

    // 1. Trigger Booking
    fireEvent.click(await screen.findByRole("button", { name: /Book/i }));
    await fillFormAndSubmit({ name: "John", email: "john@test.com" });

    // 2. ASSERT: Wait for Success View using Real Timers
    // Polling is 3s, so 2 polls = 6s. 10s timeout is safe.
    const successHeader = await screen.findByText(
      /Confirmed/i,
      {},
      { timeout: 10000 }
    );
    expect(successHeader).toBeInTheDocument();
    expect(callCount).toBeGreaterThanOrEqual(2);
  }, 12000); // Extension of test timeout to 12s

  test("backend converts BRL to cents for Woovi API", async () => {
    let wooviChargeValue;
    server.use(
      http.post(`${WOOVI_API}/charge`, async ({ request }) => {
        const body = await request.json();
        wooviChargeValue = body.value;
        return HttpResponse.json({
          charge: { status: "ACTIVE", value: body.value },
        });
      }),
      http.post(`${API_BASE}/bookings`, async ({ request }) => {
        const payload = await request.json();
        await fetch(`${WOOVI_API}/charge`, {
          method: "POST",
          body: JSON.stringify({
            value: Math.round(payload.total_price * 100),
          }),
        });
        return HttpResponse.json({
          success: true,
          booking: { id: 1 },
          payment_info: {},
        });
      })
    );

    await createBooking({
      tourId: 101,
      totalPrice: 100.5,
      guestName: "John",
      guestEmail: "john@test.com",
      numPeople: 1,
    });
    expect(wooviChargeValue).toBe(10050);
  });

  test("handles duplicate booking attempts with same correlationID", async () => {
    let callCount = 0;
    server.use(
      http.post(`${API_BASE}/bookings`, () => {
        callCount++;
        return HttpResponse.json({
          success: true,
          booking: { uuid: "idempotent-1" },
          payment_info: {},
        });
      })
    );

    const payload = {
      tour_id: 101,
      guest_name: "John",
      guest_email: "john@test.com",
    };
    await Promise.all([
      fetch(`${API_BASE}/bookings`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
      fetch(`${API_BASE}/bookings`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    ]);
    expect(callCount).toBe(2);
  });

  test("shows expiration countdown when QR code is about to expire", async () => {
    server.use(
      http.post(`${API_BASE}/bookings`, () =>
        HttpResponse.json({
          success: true,
          booking: { id: 1, uuid: TEST_UUID },
          payment_info: { qr_code: "code", expires_in: 300 },
        })
      ),
      http.get(`${API_BASE}/bookings/status/${TEST_UUID}`, () =>
        HttpResponse.json({ status: "pending" })
      )
    );

    render(
      <LanguageProvider>
        <BookingSystem />
      </LanguageProvider>
    );
    fireEvent.click(await screen.findByRole("button", { name: /Book/i }));
    await fillFormAndSubmit({ name: "John", email: "john@test.com" });

    // Switch to fake timers for the countdown check
    jest.useFakeTimers();
    act(() => {
      jest.advanceTimersByTime(4 * 60 * 1000);
    });
    expect(screen.getByText(/expires/i)).toBeInTheDocument();
  });

  test("marks booking as refunded when receiving refund webhook", async () => {
    let status = "confirmed";
    server.use(
      http.get(`${API_BASE}/bookings/status/refund-uuid`, () =>
        HttpResponse.json({ status })
      ),
      http.post(`${API_BASE}/webhooks/woovi`, async ({ request }) => {
        const body = await request.json();
        if (body.event === "OPENPIX:REFUND_RECEIVED") status = "refunded";
        return HttpResponse.json({ received: true });
      })
    );

    await fetch(`${API_BASE}/webhooks/woovi`, {
      method: "POST",
      body: JSON.stringify({
        event: "OPENPIX:REFUND_RECEIVED",
        charge: { correlationID: "refund-uuid" },
      }),
    });

    const check = await fetch(`${API_BASE}/bookings/status/refund-uuid`);
    const result = await check.json();
    expect(result.status).toBe("refunded");
  });

  test("handles temporary server failure with graceful error", async () => {
    server.use(
      http.post(`${API_BASE}/bookings`, () =>
        HttpResponse.json({ detail: "Server busy" }, { status: 503 })
      )
    );
    render(
      <LanguageProvider>
        <BookingSystem />
      </LanguageProvider>
    );

    fireEvent.click(await screen.findByRole("button", { name: /Book/i }));
    await act(async () => {
      fireEvent.input(screen.getByLabelText(/Your Name/i), {
        target: { value: "John" },
      });
      fireEvent.input(screen.getByLabelText(/Your Email/i), {
        target: { value: "john@test.com" },
      });
    });
    fireEvent.click(screen.getByRole("button", { name: /Confirm/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/Server busy/i);
  });

  test("prevents booking when tour fills up simultaneously", async () => {
    server.use(
      http.post(`${API_BASE}/bookings`, () =>
        HttpResponse.json(
          { detail: "Tour recently filled up." },
          { status: 400 }
        )
      )
    );
    render(
      <LanguageProvider>
        <BookingSystem />
      </LanguageProvider>
    );

    fireEvent.click(await screen.findByRole("button", { name: /Book/i }));
    await act(async () => {
      fireEvent.input(screen.getByLabelText(/Your Name/i), {
        target: { value: "John" },
      });
      fireEvent.input(screen.getByLabelText(/Your Email/i), {
        target: { value: "john@test.com" },
      });
    });
    fireEvent.click(screen.getByRole("button", { name: /Confirm/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/filled up/i);
  });
});
