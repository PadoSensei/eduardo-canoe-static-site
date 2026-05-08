import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { getAvailableTours, createBooking, getBookingStatus } from "../src/api";

const API_BASE = "http://localhost:8080/api/v1";

const server = setupServer(
  http.get(`${API_BASE}/tours/available`, () =>
    HttpResponse.json([
      {
        tour_instance_id: 1,
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
      booking: { uuid: "test-uuid", id: 1 },
      payment_info: {
        qr_code: "pix-key",
        qr_code_image: "img",
        expires_in: 900,
      },
    })
  ),
  http.get(`${API_BASE}/bookings/status/:uuid`, () =>
    HttpResponse.json({ status: "pending_payment" })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("API Module", () => {
  describe("getAvailableTours", () => {
    test("fetches tours for a given date", async () => {
      const result = await getAvailableTours("2026-01-19");

      expect(result).toEqual([
        expect.objectContaining({
          id: "morning-2026-01-19",
          instanceId: 1,
          tourType: "morning",
          name: "Sunrise Tour",
          price: 100,
          remaining: 5,
          isBookable: true,
        }),
      ]);
    });

    test("transforms API response to frontend format", async () => {
      const result = await getAvailableTours("2026-01-19");

      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("instanceId");
      expect(result[0]).toHaveProperty("tourType");
      expect(result[0]).toHaveProperty("name");
      expect(result[0]).toHaveProperty("price");
      expect(result[0]).toHaveProperty("remaining");
      expect(result[0]).toHaveProperty("isBookable");
      expect(result[0]).toHaveProperty("tourDate");
    });

    test("returns null on abort", async () => {
      const controller = new AbortController();
      controller.abort();

      const result = await getAvailableTours("2026-01-19", {
        signal: controller.signal,
      });

      expect(result).toBeNull();
    });

    test("throws on HTTP error", async () => {
      server.use(
        http.get(`${API_BASE}/tours/available`, () =>
          HttpResponse.json({ detail: "Server error" }, { status: 500 })
        )
      );

      await expect(getAvailableTours("2026-01-19")).rejects.toThrow();
    });
  });

  describe("createBooking", () => {
    test("returns success response with booking and payment info", async () => {
      const result = await createBooking({
        tourId: 1,
        guestName: "John",
        guestEmail: "john@test.com",
        numPeople: 1,
        totalPrice: 100,
        acceptedTerms: true,
      });

      expect(result).toEqual({
        success: true,
        booking: { uuid: "test-uuid", id: 1, checked_in: false },
        paymentInfo: {
          qr_code: "pix-key",
          qr_code_image: "img",
          expires_in: 900,
        },
      });
    });

    test("returns error message on failure", async () => {
      server.use(
        http.post(`${API_BASE}/bookings`, () =>
          HttpResponse.json({ detail: "Tour is fully booked" }, { status: 400 })
        )
      );

      const result = await createBooking({
        tourId: 1,
        guestName: "John",
        guestEmail: "john@test.com",
        numPeople: 1,
        totalPrice: 100,
        acceptedTerms: true,
      });

      expect(result).toEqual({
        success: false,
        message: "Tour is fully booked",
      });
    });

    test("handles total network failure gracefully", async () => {
      server.use(
        http.post(`${API_BASE}/bookings`, () => {
          return HttpResponse.error();
        })
      );

      const result = await createBooking({
        tourId: 1,
        guestName: "John",
        guestEmail: "john@test.com",
        numPeople: 1,
        totalPrice: 100,
        acceptedTerms: true,
      });

      expect(result).toEqual({
        success: false,
        message: expect.stringMatching(/unexpected error|network|fetch/i),
      });
    });
  });

  describe("getBookingStatus", () => {
    test("fetches status for given booking UUID", async () => {
      const result = await getBookingStatus("test-uuid-123");
      expect(result).toEqual({
        status: "pending_payment",
        is_confirmed: false,
      });
    });

    test("returns confirmed status", async () => {
      server.use(
        http.get(`${API_BASE}/bookings/status/:uuid`, () =>
          HttpResponse.json({ status: "confirmed", is_confirmed: true })
        )
      );

      const result = await getBookingStatus("any-uuid");
      expect(result).toEqual({ status: "confirmed", is_confirmed: true });
    });
  });
});
