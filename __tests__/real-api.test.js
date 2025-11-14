// __tests__/real-api.test.js

/**
 * Updated Integration Tests matching current implementation
 */

const fs = require("fs");
const path = require("path");

let apiService = require("../apiService.js");

describe("Real API Integration (Updated to match current implementation)", () => {
  const API_BASE_URL = "http://localhost:8000/api/v1";

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ✅ apiService existence + exports
  describe("apiService structure", () => {
    test("apiService module should exist", () => {
      expect(apiService).toBeDefined();
    });

    test("apiService should export fetchTours", () => {
      expect(typeof apiService.fetchTours).toBe("function");
    });

    test("apiService should export fetchAvailability", () => {
      expect(typeof apiService.fetchAvailability).toBe("function");
    });

    test("apiService should export createBooking", () => {
      expect(typeof apiService.createBooking).toBe("function");
    });
  });

  // ✅ fetchTours tests
  describe("fetchTours", () => {
    test("fetchTours() should GET /tours", async () => {
      const mockTours = [
        { id: "dolphin", name: "Daybreak Dolphin Bay Encounter", price: 50 },
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTours,
      });

      const result = await apiService.fetchTours();
      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/tours`);
      expect(result).toEqual(mockTours);
    });

    test("fetchTours() should throw on non-OK response", async () => {
      jest.resetModules(); // ✅ ensures cached tours aren't returned
      const apiService = require("../apiService.js");

      const errorPayload = { detail: "Server error" };

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => errorPayload,
      });

      await expect(apiService.fetchTours()).rejects.toThrow(
        "500 - Server error"
      );
    });
  });

  // ✅ fetchAvailability tests
  describe("fetchAvailability", () => {
    test("fetchAvailability(date) should GET availability for date", async () => {
      const date = "2025-12-01";
      const mockAvailability = [
        { tour_id: "dolphin", seats_available: 8, is_bookable: true },
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAvailability,
      });

      const result = await apiService.fetchAvailability(date);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/tours/available?tour_date=${date}`
      );
      expect(result).toEqual(mockAvailability);
    });

    test("fetchAvailability() should return empty array if no availability", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const result = await apiService.fetchAvailability("2025-12-31");
      expect(result).toEqual([]);
    });
  });

  // ✅ createBooking tests
  describe("createBooking", () => {
    test("createBooking() should POST booking data", async () => {
      const bookingData = {
        tour_id: "dolphin",
        date: "2025-12-01",
        quantity: 2,
        guest_name: "Test User",
        guest_email: "test@example.com",
      };

      const mockResponse = {
        booking: {
          id: "booking-123",
          ...bookingData,
          total_price: 100,
        },
        payment_info: { qr_code: "base64", pix_copy_paste: "pixcode" },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiService.createBooking(bookingData);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/bookings`,
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingData),
        })
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
    });

    test("createBooking() should return error when API returns 400", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          detail: "Only 5 spots left for this tour.",
        }),
      });

      const result = await apiService.createBooking({
        tour_id: "dolphin",
        date: "2025-12-01",
        quantity: 10,
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain("5 spots");
    });
  });

  // ✅ booking.js import correctness
  describe("booking.js imports", () => {
    const bookingJsPath = path.join(__dirname, "../booking.js");
    const content = fs.readFileSync(bookingJsPath, "utf-8");

    test("booking.js should import apiService.js", () => {
      expect(content.includes('from "./apiService.js"')).toBe(true);
    });

    test("booking.js should NOT import apiMock.js", () => {
      expect(content.includes('from "./apiMock.js"')).toBe(false);
    });
  });

  // ✅ tours-booking.js imports
  describe("tours-booking.js imports", () => {
    const file = path.join(__dirname, "../tours-booking.js");
    const content = fs.readFileSync(file, "utf-8");

    test("tours-booking.js should import apiService.js", () => {
      expect(content.includes('from "./apiService.js"')).toBe(true);
    });

    test("tours-booking.js should use fetchAvailabilityAndDetails", () => {
      expect(content.includes("fetchAvailabilityAndDetails")).toBe(true);
    });
  });

  // ✅ caching tests
  describe("Caching behavior", () => {
    test("fetchTours should cache tours list", async () => {
      apiService.clearCache();

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => [{ id: "dolphin" }],
      });

      await apiService.fetchTours();
      expect(global.fetch).toHaveBeenCalledTimes(1);

      await apiService.fetchTours();
      expect(global.fetch).toHaveBeenCalledTimes(1);

      apiService.clearCache();
      await apiService.fetchTours();
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    test("availability should NOT be cached", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      await apiService.fetchAvailability("2025-12-01");
      expect(global.fetch).toHaveBeenCalledTimes(1);

      await apiService.fetchAvailability("2025-12-01");
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
