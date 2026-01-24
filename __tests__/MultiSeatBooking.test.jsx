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
import { bookingTranslations } from "../src/data/bookingTranslations";

const API_BASE = "http://localhost:8000/api/v1";

// 1. Setup MSW
const server = setupServer(
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
      booking: { uuid: "test-uuid" },
      payment_info: { qr_code: "pix", qr_code_image: "img" },
    })
  )
);

// 2. Mock Language Context
jest.mock("../src/context/LanguageContext", () => {
  const actual = jest.requireActual("../src/context/LanguageContext");
  return {
    ...actual,
    useLanguage: jest.fn(),
  };
});

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
  jest.clearAllMocks();
});
afterAll(() => server.close());

describe("Multi-Seat Booking Flow", () => {
  beforeEach(() => {
    // FORCE real English values so matchers like "R$ 750.00" work
    useLanguage.mockReturnValue({
      language: "en",
      t: (key) => {
        const manualKeys = {
          card1Title: "Sunrise Tour",
          card2Title: "Full Day Tour",
          card3Title: "Sunset Tour",
        };
        return manualKeys[key] || bookingTranslations.en[key] || key;
      },
    });
  });

  test("enforces capacity limit (cannot book more than remaining)", async () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <BookingSystem />
        </LanguageProvider>
      </MemoryRouter>
    );

    // Open Modal
    const bookBtn = await screen.findByRole("button", { name: /book now/i });
    fireEvent.click(bookBtn);

    // Increase guests to 5 (the mock limit)
    const guestsInput = screen.getByLabelText(/Number of Guests/i);
    fireEvent.change(guestsInput, { target: { value: "5" } });

    // ASSERT: Total price should be 5 * 150 = 750.00
    // We use getByText with the actual values now that 't' is fixed
    expect(screen.getByText(/750\.00/)).toBeInTheDocument();

    // Try to exceed limit (input should cap at 5)
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

    fireEvent.click(await screen.findByRole("button", { name: /book now/i }));

    // Fill Form using Accessible Labels
    fireEvent.change(screen.getByLabelText(/Number of Guests/i), {
      target: { value: "2" },
    });
    fireEvent.input(screen.getByLabelText(/Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.input(screen.getByLabelText(/Email/i), {
      target: { value: "john@test.com" },
    });

    // CHECK THE TERMS CHECKBOX
    fireEvent.click(screen.getByRole("checkbox"));

    fireEvent.click(screen.getByRole("button", { name: /Confirm/i }));

    await waitFor(() => {
      expect(capturedPayload.num_people).toBe(2);
      expect(capturedPayload.total_price).toBe(300.0);
    });
  });
});
