// __tests__/integration/ResilienceRecovery.test.jsx
import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import BookingSystem from "../../src/components/BookingSystem";
import {
  LanguageProvider,
  useLanguage,
} from "../../src/context/LanguageContext";
import { toast } from "sonner";

const API_BASE = "http://localhost:8080/api/v1";
const TEST_UUID = "test-uuid-resilience";

// Mock the language context
jest.mock("../../src/context/LanguageContext", () => {
  const actual = jest.requireActual("../../src/context/LanguageContext");
  return {
    ...actual,
    useLanguage: jest.fn(),
  };
});

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

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
        tour_date: "2026-01-19",
      },
    ])
  ),
  http.get(`${API_BASE}/bookings/status/:uuid`, () =>
    HttpResponse.json({ status: "pending_payment" })
  )
);

beforeAll(() => server.listen());

afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
  jest.clearAllMocks();
  jest.useRealTimers();
});

afterAll(() => {
  server.close();
});

const renderWithProviders = (ui) =>
  render(
    <MemoryRouter>
      <LanguageProvider>{ui}</LanguageProvider>
    </MemoryRouter>
  );

const mockLanguageValue = {
  language: "en",
  setLanguage: jest.fn(),
  t: (key) =>
    ({
      bookingTitle: "Check Tour Availability",
      paymentTitle: "Booking Reserved!",
      payment_timeout_title: "Payment Timeout",
      error_contract_violation:
        "A system update is required. Please refresh the page.",
      btn_contact_support: "Contact Support",
      booking_session_expired:
        "Your booking session has expired due to inactivity.",
    })[key] || key,
};

describe("Resilience & Recovery Integration Tests", () => {
  const BASE_TIME = new Date("2026-01-01T12:00:00Z");

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(BASE_TIME);
    useLanguage.mockReturnValue(mockLanguageValue);
  });

  test("test_should_restore_polling_on_refresh: restores polling from localStorage", async () => {
    const pendingBooking = {
      currentBooking: {
        uuid: TEST_UUID,
        id: 123,
        created_at: BASE_TIME.toISOString(),
      },
      paymentInfo: {
        qr_code: "pix-123",
        qr_code_image: "img-url",
        expires_in: 900,
      },
    };
    localStorage.setItem("pending_booking", JSON.stringify(pendingBooking));

    let pollCount = 0;
    server.use(
      http.get(`${API_BASE}/bookings/status/${TEST_UUID}`, () => {
        pollCount++;
        return HttpResponse.json({ status: "pending_payment" });
      })
    );

    renderWithProviders(<BookingSystem />);

    // Should immediately show the payment view
    expect(await screen.findByText(/Booking Reserved!/i)).toBeInTheDocument();

    // Advance time to trigger polling
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    expect(pollCount).toBeGreaterThan(0);
  });

  test("test_should_stop_polling_after_expiry: stops and shows timeout UI", async () => {
    // Set created_at to 16 minutes ago relative to BASE_TIME (expires_in is 15m)
    const sixteenMinutesAgo = new Date(
      BASE_TIME.getTime() - 16 * 60 * 1000
    ).toISOString();
    const pendingBooking = {
      currentBooking: {
        uuid: TEST_UUID,
        id: 123,
        created_at: sixteenMinutesAgo,
      },
      paymentInfo: {
        qr_code: "pix-123",
        qr_code_image: "img-url",
        expires_in: 900,
      },
    };
    localStorage.setItem("pending_booking", JSON.stringify(pendingBooking));

    renderWithProviders(<BookingSystem />);

    // Should show the timeout UI instead of the active payment UI
    expect(await screen.findByText(/Payment Timeout/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact Support/i)).toBeInTheDocument();

    // Ensure it's a mailto link with correct subject
    const supportBtn = screen.getByRole("link", { name: /Contact Support/i });
    expect(supportBtn).toHaveAttribute(
      "href",
      expect.stringContaining("mailto:contato@pipacanoahavaiana.com.br")
    );
    expect(supportBtn).toHaveAttribute(
      "href",
      expect.stringContaining("Suporte%20de%20Pagamento")
    );
    expect(supportBtn).toHaveAttribute(
      "href",
      expect.stringContaining("%23test-uuid-resilience")
    );
  });

  test("test_should_handle_zod_schema_mismatch: clears bad data and shows toast", async () => {
    const corruptData = {
      currentBooking: { uuid: TEST_UUID }, // Missing created_at
      paymentInfo: { qr_code: "123", qr_code_image: "img", expires_in: 3600 },
    };
    localStorage.setItem("pending_booking", JSON.stringify(corruptData));

    renderWithProviders(<BookingSystem />);

    // Should show error toast
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("system update")
    );
    // Should have cleared localStorage
    expect(localStorage.getItem("pending_booking")).toBeNull();
    // Should be on tour selection (not payment modal)
    expect(screen.queryByText(/Booking Reserved!/i)).not.toBeInTheDocument();
  });

  test("test_should_handle_backend_expiry: clears state on 404 status", async () => {
    const pendingBooking = {
      currentBooking: {
        uuid: TEST_UUID,
        id: 123,
        created_at: BASE_TIME.toISOString(),
      },
      paymentInfo: {
        qr_code: "pix-123",
        qr_code_image: "img",
        expires_in: 900,
      },
    };
    localStorage.setItem("pending_booking", JSON.stringify(pendingBooking));

    server.use(
      http.get(`${API_BASE}/bookings/status/${TEST_UUID}`, () => {
        return new HttpResponse(
          JSON.stringify({ detail: "Booking not found" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      })
    );

    renderWithProviders(<BookingSystem />);

    // Initially shows payment view
    expect(await screen.findByText(/Booking Reserved!/i)).toBeInTheDocument();

    // Trigger polling by advancing timers
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    // Use real timers for a moment to allow MSW and effects to settle
    jest.useRealTimers();

    // Should have cleared localStorage and closed modal
    await waitFor(
      () => {
        expect(localStorage.getItem("pending_booking")).toBeNull();
        expect(
          screen.queryByText(/Booking Reserved!/i)
        ).not.toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringMatching(/expired|expirou/i)
    );
    expect(mockNavigate).toHaveBeenCalledWith("/tours");
  });
});
