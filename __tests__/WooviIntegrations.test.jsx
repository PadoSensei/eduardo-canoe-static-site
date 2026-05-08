import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import BookingSystem from "../src/components/BookingSystem";
import { LanguageProvider, useLanguage } from "../src/context/LanguageContext";

const API_BASE = "http://localhost:8080/api/v1";

// Mock Sentry
jest.mock("@sentry/react", () => ({
  init: jest.fn(),
  setUser: jest.fn(),
  captureException: jest.fn(),
  withScope: jest.fn((cb) =>
    cb({ setLevel: jest.fn(), setTag: jest.fn(), setExtra: jest.fn() })
  ),
}));

// Mock Supabase
jest.mock("@/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { access_token: "fake-token" } },
        error: null,
      }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  },
}));

// Mock Language Context
jest.mock("../src/context/LanguageContext", () => {
  const actual = jest.requireActual("../src/context/LanguageContext");
  return { ...actual, useLanguage: jest.fn() };
});

// Complete translation mock
const mockLanguageValue = {
  language: "en",
  setLanguage: jest.fn(),
  t: (key) =>
    ({
      bookingTitle: "Check Tour Availability",
      bookingSubtitle: "Select a date to see available adventures",
      selectDateLabel: "Select Date",
      ctaButton: "Book Now",
      bookTitle: "Book",
      labelDate: "Date",
      labelName: "Name",
      labelEmail: "Email",
      labelNotes: "Special Notes",
      placeholderName: "Enter your name",
      placeholderEmail: "Enter your email",
      btnConfirm: "Confirm Booking",
      btnCancel: "Cancel",
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

const server = setupServer(
  http.options(`${API_BASE}/*`, () => new HttpResponse(null, { status: 204 })),

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
  ),

  http.post(`${API_BASE}/bookings`, () =>
    HttpResponse.json({
      success: true,
      booking: { uuid: "integration-uuid", id: 1 },
      payment_info: {
        qr_code: "pix-key",
        qr_code_image: "img",
        expires_in: 900,
      },
    })
  ),

  http.get(`${API_BASE}/bookings/status/integration-uuid`, () =>
    HttpResponse.json({ status: "confirmed" })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));

afterEach(() => {
  // No async cleanup to prevent timeout issues
  server.resetHandlers();
  cleanup();
  localStorage.clear();
  jest.clearAllMocks();
});

afterAll(() => {
  server.close();
});

describe("Woovi PIX Integration - Full Lifecycle", () => {
  beforeEach(() => {
    useLanguage.mockReturnValue(mockLanguageValue);
  });

  test("processes booking and confirms UI", async () => {
    const { unmount } = render(
      <MemoryRouter>
        <LanguageProvider>
          <BookingSystem />
        </LanguageProvider>
      </MemoryRouter>
    );

    // 1. Wait for tours to load and click Book Now
    const bookBtn = await screen.findByRole("button", { name: /Book Now/i });
    fireEvent.click(bookBtn);

    // 2. Fill the form
    fireEvent.input(screen.getByLabelText(/Name/i), {
      target: { value: "Woovi Tester" },
    });
    fireEvent.input(screen.getByLabelText(/Email/i), {
      target: { value: "test@woovi.com" },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /Confirm Booking/i }));

    // 3. Verify Payment Stage
    await screen.findByText(/Booking Reserved/i);

    // 4. Verify Confirmation (MSW returns confirmed status)
    const confirmedText = await screen.findByText(
      /Confirmed/i,
      {},
      { timeout: 10000 }
    );
    expect(confirmedText).toBeInTheDocument();

    // 5. Clean unmount
    unmount();
  });
});
