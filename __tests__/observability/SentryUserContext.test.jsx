import React from "react";
import * as Sentry from "@sentry/react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import BookingSystem from "../../src/components/BookingSystem";
import {
  LanguageProvider,
  useLanguage,
} from "../../src/context/LanguageContext";

const API_BASE = "http://localhost:8000/api/v1";

// 1. Mock Sentry
jest.mock("@sentry/react", () => ({
  ...jest.requireActual("@sentry/react"),
  setUser: jest.fn(),
  captureException: jest.fn(),
}));

// 2. Mock Language Context
jest.mock("../../src/context/LanguageContext", () => ({
  ...jest.requireActual("../../src/context/LanguageContext"),
  useLanguage: jest.fn(),
}));

// 3. Setup MSW to provide a tour list
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
  ),
  // Mock the booking POST to succeed
  http.post(`${API_BASE}/bookings`, () =>
    HttpResponse.json({ success: true, booking: { id: 1 }, payment_info: {} })
  )
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
});
afterAll(() => server.close());

describe("Sentry User Context", () => {
  test("identifies the user in Sentry when booking starts", async () => {
    // Provide specific strings needed for selectors
    useLanguage.mockReturnValue({
      t: (key) =>
        ({
          labelName: "Name",
          labelEmail: "Email",
          ctaButton: "Book Now",
          btnConfirm: "Confirm Booking",
        }[key] || key),
    });

    render(
      <MemoryRouter>
        <LanguageProvider>
          <BookingSystem />
        </LanguageProvider>
      </MemoryRouter>
    );

    // Wait for loading to finish and click "Book Now"
    const bookBtn = await screen.findByRole("button", { name: /Book Now/i });
    fireEvent.click(bookBtn);

    // Fill details using the labels we just mapped above
    fireEvent.input(screen.getByLabelText(/Name/i), {
      target: { value: "Sentry Tester" },
    });
    fireEvent.input(screen.getByLabelText(/Email/i), {
      target: { value: "tester@sentry.com" },
    });

    // Click checkbox (LGPD requirement)
    fireEvent.click(screen.getByRole("checkbox"));

    // Click Confirm
    fireEvent.click(screen.getByRole("button", { name: /Confirm Booking/i }));

    // ASSERT: Sentry should have been told who this user is
    // This matches the Sentry.setUser({ email: guestEmail, username: guestName }) in BookingSystem.jsx
    expect(Sentry.setUser).toHaveBeenCalledWith({
      email: "tester@sentry.com",
      username: "Sentry Tester",
    });
  });
});
