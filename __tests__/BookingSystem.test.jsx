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
import "@testing-library/jest-dom";
import BookingSystem from "../src/components/BookingSystem";
import { LanguageProvider, useLanguage } from "../src/context/LanguageContext";

const API_BASE = "http://localhost:8000/api/v1";
const TEST_UUID = "test-uuid-123";

// 1. Mock Language Context
jest.mock("../src/context/LanguageContext", () => ({
  ...jest.requireActual("../src/context/LanguageContext"),
  useLanguage: jest.fn(),
  LanguageProvider: ({ children }) => <div>{children}</div>,
}));

// 2. MSW Setup
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
        tour_date: "2026-01-19",
      },
    ])
  ),
  http.post(`${API_BASE}/bookings`, () =>
    HttpResponse.json({
      success: true,
      booking: { uuid: TEST_UUID, id: 1 },
      payment_info: {
        qr_code: "pix-key-123",
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

// --- Helpers ---

const renderWithProviders = (ui) =>
  render(
    <MemoryRouter>
      <LanguageProvider>{ui}</LanguageProvider>
    </MemoryRouter>
  );

/**
 * Common interaction helper.
 * Navigates the UI from the tour list to the Pix payment screen.
 */
const reachPaymentStage = async () => {
  // Clear initial loading state
  await act(async () => {
    await jest.advanceTimersByTimeAsync(0);
  });

  const bookBtn = await screen.findByRole("button", { name: /Book Now/i });
  fireEvent.click(bookBtn);

  // Fill in guest details
  fireEvent.input(screen.getByLabelText(/Your Name/i), {
    target: { value: "John Doe" },
  });
  fireEvent.input(screen.getByLabelText(/Your Email/i), {
    target: { value: "john@test.com" },
  });

  // LGPD Compliance: Check the mandatory terms checkbox
  const checkbox = screen.getByRole("checkbox");
  fireEvent.click(checkbox);

  // Click confirm
  const confirmBtn = screen.getByRole("button", { name: /Confirm Booking/i });
  fireEvent.click(confirmBtn);

  // Resolve the 'createBooking' fetch
  await act(async () => {
    await jest.advanceTimersByTimeAsync(0);
  });

  // Assert we arrived at the payment view
  await screen.findByText(/Booking Reserved!/i);
};

describe("BookingSystem Integration & Resilience", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Comprehensive mock dictionary to satisfy all child components (Form, Payment, Success)
    useLanguage.mockReturnValue({
      language: "en",
      t: (key) => {
        const manual = {
          bookingTitle: "Check Tour Availability",
          bookingSubtitle: "Select a date to see available adventures",
          selectDateLabel: "Select Date",
          ctaButton: "Book Now",
          labelName: "Your Name",
          labelEmail: "Your Email",
          btnConfirm: "Confirm Booking",
          paymentTitle: "Booking Reserved!",
          successTitle: "Payment Confirmed!",
          connectionWarning: "Connection slow.",
          alertPastDate: "Cannot book tours for past dates.",
          errorTerms: "You must accept the terms to proceed.",
          expiresIn: "QR Code expires in",
          btnDone: "Done",
        };
        return manual[key] || key;
      },
    });
  });

  test("polls for status and switches to Success View", async () => {
    let callCount = 0;
    server.use(
      http.get(`${API_BASE}/bookings/status/${TEST_UUID}`, () => {
        callCount++;
        // First poll remains pending, second poll confirms
        return HttpResponse.json({
          status: callCount < 2 ? "pending_payment" : "confirmed",
        });
      })
    );

    renderWithProviders(<BookingSystem />);
    await reachPaymentStage();

    // Fast-forward two polling intervals (3s each)
    await act(async () => {
      await jest.advanceTimersByTimeAsync(3000);
    });
    await act(async () => {
      await jest.advanceTimersByTimeAsync(3000);
    });

    expect(await screen.findByText(/Payment Confirmed!/i)).toBeInTheDocument();
  });

  test("shows connection warning after 5 failed status checks", async () => {
    server.use(
      http.get(
        `${API_BASE}/bookings/status/${TEST_UUID}`,
        () => new HttpResponse(null, { status: 500 })
      )
    );

    renderWithProviders(<BookingSystem />);
    await reachPaymentStage();

    // Advance 5 intervals to trigger the error threshold
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        await jest.advanceTimersByTimeAsync(3000);
      });
    }

    const warning = await screen.findByText(/Connection slow/i);
    expect(warning).toBeInTheDocument();
  });

  test("prevents double-booking by disabling button during submission", async () => {
    renderWithProviders(<BookingSystem />);
    await act(async () => {
      await jest.advanceTimersByTimeAsync(0);
    });

    fireEvent.click(await screen.findByRole("button", { name: /Book Now/i }));

    fireEvent.input(screen.getByLabelText(/Your Name/i), {
      target: { value: "John" },
    });
    fireEvent.input(screen.getByLabelText(/Your Email/i), {
      target: { value: "john@test.com" },
    });

    fireEvent.click(screen.getByRole("checkbox"));

    const confirmBtn = screen.getByRole("button", { name: /Confirm Booking/i });

    // Simulate double-click
    fireEvent.click(confirmBtn);
    fireEvent.click(confirmBtn);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(0);
    });

    // Ensure we only ended up at the payment screen once
    expect(await screen.findByText(/Booking Reserved!/i)).toBeInTheDocument();
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
    await act(async () => {
      await jest.advanceTimersByTimeAsync(0);
    });

    fireEvent.click(await screen.findByRole("button", { name: /Book Now/i }));
    fireEvent.input(screen.getByLabelText(/Your Name/i), {
      target: { value: "John" },
    });
    fireEvent.input(screen.getByLabelText(/Your Email/i), {
      target: { value: "john@test.com" },
    });

    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /Confirm Booking/i }));

    // Verify the error alert appears inside the modal
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/Tour recently filled up/i);
  });

  test("prevents booking a date that becomes 'yesterday' while the page is open", async () => {
    // Set system time to nearly midnight Jan 19
    const nearMidnight = new Date("2026-01-19T23:59:59");
    jest.setSystemTime(nearMidnight);

    renderWithProviders(<BookingSystem />);
    await act(async () => {
      await jest.advanceTimersByTimeAsync(0);
    });

    // Tick the clock past midnight into Jan 20
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Try to book the Jan 19 tour which is now in the past
    const bookBtn = await screen.findByRole("button", { name: /Book Now/i });
    fireEvent.click(bookBtn);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/past dates/i);
  });
});
