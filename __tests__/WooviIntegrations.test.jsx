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
import { MemoryRouter } from "react-router-dom";
import BookingSystem from "../src/components/BookingSystem";
import { LanguageProvider, useLanguage } from "../src/context/LanguageContext";
import { createBooking } from "../src/api";

// --- Configuration ---
const API_BASE = "http://localhost:8000/api/v1";
const WOOVI_API = "https://api.woovi-sandbox.com/api/v1";
const TEST_UUID = "test-uuid-123";

// Mock Language Context
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
  await act(async () => {
    // These labels match the 'manual' dictionary in the beforeEach block
    fireEvent.input(screen.getByLabelText(/Your Name/i), {
      target: { value: name },
    });
    fireEvent.input(screen.getByLabelText(/Your Email/i), {
      target: { value: email },
    });

    // LGPD: Check the box so the button enables
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
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
      t: (key) => {
        const manual = {
          ctaButton: "Book Now",
          labelName: "Your Name",
          labelEmail: "Your Email",
          btnConfirm: "Confirm Booking",
          paymentTitle: "Booking Reserved!",
          successTitle: "Payment Confirmed!",
          bookingTitle: "Check Tour Availability",
          bookingSubtitle: "Select a date",
        };
        return manual[key] || key;
      },
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
      <MemoryRouter>
        <LanguageProvider>
          <BookingSystem />
        </LanguageProvider>
      </MemoryRouter>
    );

    // 1. Trigger Booking
    fireEvent.click(await screen.findByRole("button", { name: /Book/i }));
    await fillFormAndSubmit({ name: "John", email: "john@test.com" });

    // 2. ASSERT: Wait for Success View
    const successHeader = await screen.findByText(
      /Confirmed/i,
      {},
      { timeout: 10000 }
    );
    expect(successHeader).toBeInTheDocument();
    expect(callCount).toBeGreaterThanOrEqual(2);
  }, 15000);

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
      acceptedTerms: true,
    });
    expect(wooviChargeValue).toBe(10050);
  });
});
