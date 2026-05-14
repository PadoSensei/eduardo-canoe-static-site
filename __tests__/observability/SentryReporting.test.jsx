import * as Sentry from "@sentry/react";
import { createBooking } from "../../src/api";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

const API_BASE = "http://localhost:8080/api/v1";

// Mock Sentry
jest.mock("@sentry/react", () => ({
  captureException: jest.fn(),
  withScope: jest.fn((callback) =>
    callback({ setTag: jest.fn(), setExtra: jest.fn(), setLevel: jest.fn() })
  ),
}));

const server = setupServer(
  http.get(`${API_BASE}/tours/specialty/next`, () =>
    HttpResponse.json({ next_date: null })
  ),
  http.post(`${API_BASE}/bookings`, () => {
    return new HttpResponse(null, { status: 500 });
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());

describe("Sentry Observability", () => {
  test("api.js captures and reports 500 errors to Sentry", async () => {
    try {
      await createBooking({
        tourId: 1,
        guestName: "Test",
        guestEmail: "t@t.com",
        acceptedTerms: true,
      });
    } catch {
      // We expect the error to be thrown AND reported
    }

    expect(Sentry.captureException).toHaveBeenCalled();
    const errorPassedToSentry = Sentry.captureException.mock.calls[0][0];
    // The original error message is preserved in the Error object, but a toast is shown with the key
    expect(errorPassedToSentry.message).toContain("unexpected error");
  });
});
