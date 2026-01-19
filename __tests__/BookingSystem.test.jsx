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
import { bookingTranslations } from "../src/data/bookingTranslations";

// --- Configuration ---
const API_BASE = "http://localhost:8000/api/v1";
const TEST_UUID = "test-uuid-123";

// 1. Mock Language Context (Simplified for reliability)
const mockUseLanguage = jest.fn();
jest.mock("../src/context/LanguageContext", () => ({
  useLanguage: () => mockUseLanguage(),
  LanguageProvider: ({ children }) => <div>{children}</div>,
}));

import { LanguageProvider } from "../src/context/LanguageContext";

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
  render(<LanguageProvider>{ui}</LanguageProvider>);

/**
 * Common interaction helper. Works with Fake Timers.
 */
const reachPaymentStage = async () => {
  // Clear initial loading
  await act(async () => {
    await jest.advanceTimersByTimeAsync(0);
  });

  const bookBtn = await screen.findByRole("button", { name: /Book Now/i });
  fireEvent.click(bookBtn);

  fireEvent.input(screen.getByLabelText(/Your Name/i), {
    target: { value: "John Doe" },
  });
  fireEvent.input(screen.getByLabelText(/Your Email/i), {
    target: { value: "john@test.com" },
  });

  fireEvent.click(screen.getByRole("button", { name: /Confirm Booking/i }));

  // Resolve the 'createBooking' fetch
  await act(async () => {
    await jest.advanceTimersByTimeAsync(0);
  });

  await screen.findByText(/Booking Reserved/i);
};

describe("BookingSystem Integration & Resilience", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Ensure translation function returns real English strings
    mockUseLanguage.mockReturnValue({
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

  test("polls for status and switches to Success View", async () => {
    let callCount = 0;
    server.use(
      http.get(`${API_BASE}/bookings/status/${TEST_UUID}`, () => {
        callCount++;
        return HttpResponse.json({
          status: callCount < 2 ? "pending" : "confirmed",
        });
      })
    );

    renderWithProviders(<BookingSystem />);
    await reachPaymentStage();

    // Advance 2 intervals
    await act(async () => {
      await jest.advanceTimersByTimeAsync(3000);
    });
    await act(async () => {
      await jest.advanceTimersByTimeAsync(3000);
    });

    expect(await screen.findByText(/Confirmed/i)).toBeInTheDocument();
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

    // Advance 5 intervals
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        await jest.advanceTimersByTimeAsync(3000);
      });
    }

    // Use findBy for the re-render tick
    const warning = await screen.findByText(/Connection slow/i);
    expect(warning).toBeInTheDocument();
  });

  test("prevents double-booking by disabling multiple clicks", async () => {
    renderWithProviders(<BookingSystem />);
    // Load tours
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

    const confirmBtn = screen.getByRole("button", { name: /Confirm Booking/i });
    fireEvent.click(confirmBtn);
    fireEvent.click(confirmBtn);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(0);
    });
    expect(await screen.findByText(/Booking Reserved/i)).toBeInTheDocument();
  });

  test("displays specific error message when tour fills up during checkout", async () => {
    const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
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

    fireEvent.click(screen.getByRole("button", { name: /Book Now/i }));
    fireEvent.input(screen.getByLabelText(/Your Name/i), {
      target: { value: "John" },
    });
    fireEvent.input(screen.getByLabelText(/Your Email/i), {
      target: { value: "john@test.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Confirm Booking/i }));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(
        expect.stringContaining("Tour recently filled up")
      );
    });
    alertMock.mockRestore();
  });

  test("prevents booking a date that becomes 'yesterday' while the page is open", async () => {
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    // Set time to Jan 19 near midnight
    const nearMidnight = new Date("2026-01-19T23:59:59");
    jest.setSystemTime(nearMidnight);

    renderWithProviders(<BookingSystem />);

    // Resolve load
    await act(async () => {
      await jest.advanceTimersByTimeAsync(0);
    });

    // Tick into Jan 20
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Click 'Book Now' for the Jan 19 tour
    const bookBtn = await screen.findByRole("button", { name: /Book Now/i });
    fireEvent.click(bookBtn);

    expect(alertSpy).toHaveBeenCalledWith(
      expect.stringContaining("past dates")
    );
    alertSpy.mockRestore();
  });
});
