import React from "react";
import * as Sentry from "@sentry/react";
// FIX: Added waitFor to the import
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import BookingSystem from "../../src/components/BookingSystem";
import {
  LanguageProvider,
  useLanguage,
} from "../../src/context/LanguageContext";

const API_BASE = "http://localhost:8080/api/v1";

jest.mock("@sentry/react", () => ({
  ...jest.requireActual("@sentry/react"),
  setUser: jest.fn(),
  captureException: jest.fn(),
}));

jest.mock("../../src/context/LanguageContext", () => ({
  ...jest.requireActual("../../src/context/LanguageContext"),
  useLanguage: jest.fn(),
}));

const server = setupServer(
  http.get(`${API_BASE}/tours/available*`, () =>
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
      booking: { uuid: "test-uuid-sentry", id: 1 },
      payment_info: {
        qr_code: "sentry-pix",
        qr_code_image: "img",
        expires_in: 900,
      },
    })
  ),
  http.get(`${API_BASE}/bookings/status/*`, () =>
    HttpResponse.json({ status: "pending_payment" })
  )
);

beforeAll(() => server.listen());
afterEach(async () => {
  server.resetHandlers();
  // synchronization: ensure microtasks settle
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });
  jest.clearAllMocks();
});
afterAll(() => server.close());

describe("Sentry User Context", () => {
  test("identifies the user in Sentry when booking starts", async () => {
    useLanguage.mockReturnValue({
      t: (key) =>
        ({
          labelName: "Name",
          labelEmail: "Email",
          ctaButton: "Book Now",
          btnConfirm: "Confirm Booking",
        })[key] || key,
    });

    render(
      <MemoryRouter>
        <LanguageProvider>
          <BookingSystem />
        </LanguageProvider>
      </MemoryRouter>
    );

    const bookBtn = await screen.findByRole("button", { name: /Book Now/i });
    fireEvent.click(bookBtn);

    fireEvent.input(screen.getByLabelText(/Name/i), {
      target: { value: "Sentry Tester" },
    });
    fireEvent.input(screen.getByLabelText(/Email/i), {
      target: { value: "tester@sentry.com" },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /Confirm Booking/i }));

    // FIX: waitFor is now imported and correctly used
    await waitFor(() => {
      expect(Sentry.setUser).toHaveBeenCalledWith({
        email: "tester@sentry.com",
        username: "Sentry Tester",
      });
    });
  });
});
