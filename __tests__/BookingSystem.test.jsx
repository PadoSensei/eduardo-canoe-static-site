// __tests__/BookingSystem.test.jsx
import React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import BookingSystem from "../src/components/BookingSystem";
import { LanguageProvider, useLanguage } from "../src/context/LanguageContext";

const API_BASE = "http://localhost:8080/api/v1";
const TEST_UUID = "test-uuid-123";

// Mock the language context
jest.mock("../src/context/LanguageContext", () => {
  const actual = jest.requireActual("../src/context/LanguageContext");
  return {
    ...actual,
    useLanguage: jest.fn(),
  };
});

const server = setupServer(
  http.get(`${API_BASE}/tours/specialty/next`, () =>
    HttpResponse.json({ next_date: null })
  ),
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
  http.post(`${API_BASE}/bookings`, () =>
    HttpResponse.json({
      success: true,
      booking: {
        uuid: TEST_UUID,
        id: 1,
        created_at: new Date().toISOString(),
      },
      payment_info: {
        qr_code: "pix-key-123",
        qr_code_image: "img",
        expires_in: 900,
      },
    })
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
      bookingSubtitle: "Select a date to see available adventures",
      selectDateLabel: "Select Date",
      ctaButton: "Book Now",
      bookTitle: "Book",
      labelDate: "Date",
      labelName: "Your Name",
      labelEmail: "Your Email",
      labelPhone: "Phone Number",
      labelNotes: "Special Notes",
      placeholderName: "Enter your name",
      placeholderEmail: "Enter your email",
      placeholderPhone: "Enter your phone",
      placeholderNotes: "Any special requests?",
      btnConfirm: "Confirm Booking",
      btnCancel: "Cancel",
      paymentTitle: "Booking Reserved!",
      payment_timeout_title: "Payment Timeout",
      successTitle: "Payment Confirmed!",
      connectionWarning: "Connection slow.",
      alertPastDate: "past dates",
      labelAcceptTerms: "I accept the",
      linkTerms: "Terms of Service",
      linkAnd: "and",
      linkPrivacy: "Privacy Policy",
      card1Title: "Sunrise Tour",
      duration: "Duration",
      spotsLeft: "spots left",
    })[key] || key,
};

describe("BookingSystem Integration & Resilience", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-01-01T12:00:00Z"));
    useLanguage.mockReturnValue(mockLanguageValue);
  });

  const reachPaymentStage = async () => {
    // Wait for tours load
    await screen.findByText(/Sunrise Tour/i);

    // Open and fill form
    fireEvent.click(screen.getByRole("button", { name: /Book Now/i }));
    fireEvent.input(screen.getByLabelText(/Your Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.input(screen.getByLabelText(/Your Email/i), {
      target: { value: "john@test.com" },
    });
    fireEvent.input(screen.getByLabelText(/Phone Number/i), {
      target: { value: "123456789" },
    });
    fireEvent.click(screen.getByRole("checkbox"));

    // Submit
    fireEvent.click(screen.getByRole("button", { name: /Confirm Booking/i }));

    // Wait for payment modal.
    // We stay in fake timers but must advance enough to let all microtasks/promises resolve.
    // In many cases, findBy* will work if we wrap it in act and use advanceTimersByTime(0).
    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    // If findByText hangs with fake timers, we use waitFor with custom interval
    await waitFor(
      () => {
        expect(screen.getByText(/Booking Reserved!/i)).toBeInTheDocument();
      },
      { interval: 50 }
    );
  };

  test("polls for status and switches to Success View", async () => {
    let callCount = 0;
    server.use(
      http.get(`${API_BASE}/bookings/status/:uuid`, () => {
        callCount++;
        return HttpResponse.json({
          status: callCount < 2 ? "pending_payment" : "confirmed",
        });
      })
    );

    renderWithProviders(<BookingSystem />);
    await reachPaymentStage();

    // Polling 1
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });
    // Polling 2
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(screen.getByText(/Payment Confirmed!/i)).toBeInTheDocument();
    });
  });

  test("shows connection warning after 5 failed status checks", async () => {
    server.use(
      http.get(`${API_BASE}/bookings/status/:uuid`, () =>
        HttpResponse.json({ detail: "Server Error" }, { status: 500 })
      )
    );

    renderWithProviders(<BookingSystem />);
    await reachPaymentStage();

    // Advance 5 cycles
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        jest.advanceTimersByTime(3000);
      });
    }

    await waitFor(() => {
      expect(screen.getByText(/Payment Timeout/i)).toBeInTheDocument();
    });
  });

  test("prevents double-booking by disabling button during submission", async () => {
    renderWithProviders(<BookingSystem />);
    await screen.findByText(/Sunrise Tour/i);

    fireEvent.click(screen.getByRole("button", { name: /Book Now/i }));
    fireEvent.input(screen.getByLabelText(/Your Name/i), {
      target: { value: "John" },
    });
    fireEvent.input(screen.getByLabelText(/Your Email/i), {
      target: { value: "john@test.com" },
    });
    fireEvent.input(screen.getByLabelText(/Phone Number/i), {
      target: { value: "123456789" },
    });
    fireEvent.click(screen.getByRole("checkbox"));

    const confirmBtn = screen.getByRole("button", { name: /Confirm Booking/i });
    fireEvent.click(confirmBtn);
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText(/Booking Reserved!/i)).toBeInTheDocument();
    });
  });

  test("displays error message when tour fills up during checkout", async () => {
    server.use(
      http.post(`${API_BASE}/bookings`, () =>
        HttpResponse.json(
          { detail: "Tour recently filled up." },
          { status: 400 }
        )
      )
    );

    renderWithProviders(<BookingSystem />);
    await screen.findByText(/Sunrise Tour/i);

    fireEvent.click(screen.getByRole("button", { name: /Book Now/i }));
    fireEvent.input(screen.getByLabelText(/Your Name/i), {
      target: { value: "John" },
    });
    fireEvent.input(screen.getByLabelText(/Your Email/i), {
      target: { value: "john@test.com" },
    });
    fireEvent.input(screen.getByLabelText(/Phone Number/i), {
      target: { value: "123456789" },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /Confirm Booking/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        /Tour recently filled up/i
      );
    });
  });
});
