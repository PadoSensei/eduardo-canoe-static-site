import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import {
  getAvailableTours,
  getBookingStatus,
  getTourTemplates,
} from "../src/api";

const API_BASE = "http://localhost:8080/api/v1";

const server = setupServer(
  http.get(`${API_BASE}/tours/specialty/next`, () =>
    HttpResponse.json({ next_date: null })
  ),);

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("API Hardening (URL Cleaning & Smart Errors)", () => {
  describe("URL Cleaning", () => {
    test("removes trailing slash from catalog endpoints", async () => {
      let capturedUrl;
      server.use(
        http.get(`${API_BASE}/tour-templates`, (req) => {
          capturedUrl = req.request.url;
          return HttpResponse.json([]);
        })
      );

      // We use getTourTemplates which internally calls "/tour-templates/"
      await getTourTemplates();

      // MSW req.request.url will be the full URL.
      // We expect it NOT to end with a slash.
      expect(capturedUrl).toBe(`${API_BASE}/tour-templates`);
    });

    test("removes trailing slash before query parameters", async () => {
      let capturedUrl;
      server.use(
        http.get(`${API_BASE}/tours/available`, (req) => {
          capturedUrl = req.request.url;
          return HttpResponse.json([]);
        })
      );

      await getAvailableTours("2026-04-16");

      const url = new URL(capturedUrl);
      expect(url.pathname).toBe("/api/v1/tours/available");
      expect(url.search).toBe("?tour_date=2026-04-16");
    });
  });

  describe("Smart Error Handling", () => {
    test("triggers BOOKING_EXPIRED only for booking status 404", async () => {
      server.use(
        http.get(`${API_BASE}/bookings/status/some-uuid`, () =>
          HttpResponse.json({ detail: "Not Found" }, { status: 404 })
        )
      );

      await expect(getBookingStatus("some-uuid")).rejects.toThrow(
        "BOOKING_EXPIRED"
      );
    });

    test("returns NetworkError for catalog 404s", async () => {
      server.use(
        http.get(`${API_BASE}/tours/available`, () =>
          HttpResponse.json({ detail: "Not Found" }, { status: 404 })
        )
      );

      await expect(getAvailableTours("2026-04-16")).rejects.toThrow(
        "NetworkError"
      );
    });

    test("returns NetworkError for template 404s", async () => {
      server.use(
        http.get(`${API_BASE}/tour-templates`, () =>
          HttpResponse.json({ detail: "Not Found" }, { status: 404 })
        )
      );

      await expect(getTourTemplates()).rejects.toThrow("NetworkError");
    });

    test("triggers BOOKING_EXPIRED for booking 400 with 'expired' message", async () => {
      server.use(
        http.get(`${API_BASE}/bookings/status/some-uuid`, () =>
          HttpResponse.json({ detail: "Booking has expired" }, { status: 400 })
        )
      );

      await expect(getBookingStatus("some-uuid")).rejects.toThrow(
        "BOOKING_EXPIRED"
      );
    });
  });
});
