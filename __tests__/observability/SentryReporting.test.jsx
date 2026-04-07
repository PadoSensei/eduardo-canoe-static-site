import * as Sentry from "@sentry/react";
import { createBooking } from "../../src/api";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

// Mock Sentry
jest.mock("@sentry/react", () => ({
  captureException: jest.fn(),
  withScope: jest.fn((callback) =>
    callback({ setTag: jest.fn(), setExtra: jest.fn(), setLevel: jest.fn() })
  ),
}));

const server = setupServer(
  http.post("http://localhost:8000/api/v1/bookings", () => {
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
    expect(errorPassedToSentry.message).toContain("500");
  });
});
