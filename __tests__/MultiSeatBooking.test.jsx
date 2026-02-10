import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import BookingSystem from "../src/components/BookingSystem";
import { LanguageProvider, useLanguage } from "../src/context/LanguageContext";

const API_BASE = "http://localhost:8000/api/v1";

// Mock Supabase
jest.mock("../src/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  },
}));

// Setup MSW
const server = setupServer(
  http.options(`${API_BASE}/*`, () => new HttpResponse(null, { status: 204 })),
  http.get(`${API_BASE}/tours/available`, () =>
    HttpResponse.json([
      {
        tour_instance_id: 101,
        tour_type: "morning",
        display_name: "Sunrise Tour",
        price: 150.0,
        seats_available: 5,
        is_bookable: true,
        tour_date: "2026-01-20",
      },
    ])
  ),
  http.post(`${API_BASE}/bookings`, () =>
    HttpResponse.json({
      success: true,
      booking: { uuid: "test-uuid", id: 1 },
      payment_info: { qr_code: "pix", qr_code_image: "img" },
    })
  )
);

// Mock Language Context
jest.mock("../src/context/LanguageContext", () => {
  const actual = jest.requireActual("../src/context/LanguageContext");
  return { ...actual, useLanguage: jest.fn() };
});

// Complete translation mock - includes ALL keys used by BookingSystem
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
      labelName: "Your Name",
      labelEmail: "Your Email",
      labelNotes: "Special Notes",
      placeholderName: "Enter your name",
      placeholderEmail: "Enter your email",
      placeholderNotes: "Any special requests?",
      btnConfirm: "Confirm Booking",
      btnCancel: "Cancel",
      pricePrefix: "R$",
      paymentTitle: "Booking Reserved!",
      successTitle: "Payment Confirmed!",
      labelAcceptTerms: "I accept the",
      linkTerms: "Terms of Service",
      linkAnd: "and",
      linkPrivacy: "Privacy Policy",
      card1Title: "Sunrise Tour",
      duration: "Duration",
      spotsLeft: "spots left",
    }[key] || key),
};

beforeAll(() => server.listen());

afterEach(() => {
  // CRITICAL: No async operations, no setTimeout
  server.resetHandlers();
  localStorage.clear();
  jest.clearAllMocks();
});

afterAll(() => server.close());

describe("Multi-Seat Booking Flow", () => {
  beforeEach(() => {
    useLanguage.mockReturnValue(mockLanguageValue);
  });

  test("enforces capacity limit and calculates total price", async () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <BookingSystem />
        </LanguageProvider>
      </MemoryRouter>
    );

    const bookBtn = await screen.findByRole("button", { name: /Book Now/i });
    fireEvent.click(bookBtn);

    const guestsInput = screen.getByLabelText(/Number of Guests/i);

    // Test Calculation (5 * 150)
    fireEvent.change(guestsInput, { target: { value: "5" } });
    expect(screen.getByText(/750\.00/)).toBeInTheDocument();

    // Test Enforcement (Cap at 5)
    fireEvent.change(guestsInput, { target: { value: "10" } });
    expect(guestsInput.value).toBe("5");
  });

  test("sends correct multi-seat payload to the API", async () => {
    let capturedPayload;
    server.use(
      http.post(`${API_BASE}/bookings`, async ({ request }) => {
        capturedPayload = await request.json();
        return HttpResponse.json({
          success: true,
          booking: { uuid: "1" },
          payment_info: {},
        });
      })
    );

    render(
      <MemoryRouter>
        <LanguageProvider>
          <BookingSystem />
        </LanguageProvider>
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByRole("button", { name: /Book Now/i }));

    fireEvent.change(screen.getByLabelText(/Number of Guests/i), {
      target: { value: "2" },
    });
    fireEvent.input(screen.getByLabelText(/Your Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.input(screen.getByLabelText(/Your Email/i), {
      target: { value: "john@test.com" },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /Confirm Booking/i }));

    await waitFor(() => {
      expect(capturedPayload.num_people).toBe(2);
      expect(capturedPayload.total_price).toBe(300.0);
    });
  });
});
