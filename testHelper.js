// test-utils/testHelpers.js
// Shared test utilities for consistent MSW and React Testing Library patterns

import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

// ============================================================================
// API Configuration
// ============================================================================
export const API_BASE = "http://localhost:8080/api/v1";
export const TEST_UUID = "test-uuid-123";

// ============================================================================
// Default MSW Handlers
// ============================================================================
export const defaultHandlers = [
  // CORS preflight
  http.options(`${API_BASE}/*`, () => new HttpResponse(null, { status: 204 })),

  // Available tours - note the wildcard for query params
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
        capacity: 10,
        duration: "2h",
      },
    ])
  ),

  // Create booking
  http.post(`${API_BASE}/bookings`, () =>
    HttpResponse.json({
      success: true,
      booking: { uuid: TEST_UUID, id: 1 },
      payment_info: {
        qr_code: "pix-key-123",
        qr_code_image: "data:image/png;base64,fake",
        expires_in: 900,
      },
    })
  ),

  // Booking status - default pending
  http.get(`${API_BASE}/bookings/status/:uuid`, () =>
    HttpResponse.json({ status: "pending_payment" })
  ),

  // Admin endpoints
  http.get(`${API_BASE}/admin/schedule`, () =>
    HttpResponse.json({ tours: [], month: 1, year: 2026 })
  ),

  http.get(`${API_BASE}/admin/manifest/:date`, () =>
    HttpResponse.json({ tours: [], date: "2026-01-19" })
  ),

  http.get(`${API_BASE}/tours/specialty/next`, () =>
    HttpResponse.json({ next_date: null })
  ),
];

// ============================================================================
// Server Factory - Each test file gets its own server instance
// ============================================================================
export function createTestServer(customHandlers = []) {
  return setupServer(...defaultHandlers, ...customHandlers);
}

// ============================================================================
// Mock Language Context
// ============================================================================
export const mockTranslations = {
  bookingTitle: "Check Tour Availability",
  bookingSubtitle: "Select a date",
  selectDateLabel: "Select Date",
  ctaButton: "Book Now",
  btnConfirm: "Confirm Booking",
  labelName: "Your Name",
  labelEmail: "Your Email",
  paymentTitle: "Booking Reserved!",
  successTitle: "Payment Confirmed!",
  connectionWarning: "Connection slow.",
  alertPastDate: "past dates",
  labelAcceptTerms: "I accept the",
  linkTerms: "Terms of Service",
  linkAnd: "and",
  linkPrivacy: "Privacy Policy",
};

export const createMockLanguageContext = (overrides = {}) => ({
  language: "en",
  setLanguage: jest.fn(),
  t: (key) => mockTranslations[key] || overrides[key] || key,
  ...overrides,
});

// ============================================================================
// Mock Language Provider Component
// ============================================================================
export const MockLanguageProvider = ({ children, value }) => {
  const contextValue = value || createMockLanguageContext();
  return (
    <MockLanguageContext.Provider value={contextValue}>
      {children}
    </MockLanguageContext.Provider>
  );
};

// Create a mock context for tests
const MockLanguageContext = React.createContext(null);

// ============================================================================
// Render Helpers
// ============================================================================
export function renderWithRouter(ui, { route = "/" } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
}

// ============================================================================
// Async Test Utilities
// ============================================================================

/**
 * Flush all pending promises and timers
 * Helps prevent "act" warnings and ensures state updates complete
 */
export async function flushPromises() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Wait for a condition to be true, with timeout
 */
export async function waitForCondition(conditionFn, timeout = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (conditionFn()) return true;
    await flushPromises();
  }
  throw new Error("Condition not met within timeout");
}

// ============================================================================
// Common Handler Factories
// ============================================================================
export const handlers = {
  // Return confirmed booking status
  confirmedStatus: (uuid = TEST_UUID) =>
    http.get(`${API_BASE}/bookings/status/${uuid}`, () =>
      HttpResponse.json({ status: "confirmed" })
    ),

  // Return pending status
  pendingStatus: (uuid = TEST_UUID) =>
    http.get(`${API_BASE}/bookings/status/${uuid}`, () =>
      HttpResponse.json({ status: "pending_payment" })
    ),

  // Return error status
  errorStatus: (uuid = TEST_UUID, statusCode = 500) =>
    http.get(
      `${API_BASE}/bookings/status/${uuid}`,
      () => new HttpResponse(null, { status: statusCode })
    ),

  // Booking creation failure
  bookingError: (message = "Tour recently filled up.", statusCode = 400) =>
    http.post(`${API_BASE}/bookings`, () =>
      HttpResponse.json({ detail: message }, { status: statusCode })
    ),

  // Tours fetch error
  toursError: (statusCode = 500) =>
    http.get(
      `${API_BASE}/tours/available`,
      () => new HttpResponse(null, { status: statusCode })
    ),

  // Dynamic status based on call count
  statusAfterPolls: (uuid = TEST_UUID, confirmAfter = 2) => {
    let callCount = 0;
    return http.get(`${API_BASE}/bookings/status/${uuid}`, () => {
      callCount++;
      return HttpResponse.json({
        status: callCount >= confirmAfter ? "confirmed" : "pending_payment",
      });
    });
  },
};
