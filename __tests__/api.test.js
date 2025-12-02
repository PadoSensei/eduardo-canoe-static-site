// __tests__/api.test.js

import { getAvailableTours, createBooking } from "../api.js";

// Mock the fetch API globally
global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
});

describe("Tour API Client", () => {
  const API_BASE_URL = "http://localhost:8000/api/v1";

  describe("getAvailableTours", () => {
    test("should fetch and map tour data correctly", async () => {
      const mockApiResponse = [
        {
          tour_instance_id: 101,
          tour_type: "morning",
          tour_date: "2025-12-01",
          display_name: "Morning Dolphin Tour",
          description: "A gentle morning paddle",
          price: 50,
          seats_available: 8,
          is_bookable: true,
          capacity: 10,
          duration: "2h",
          image_url: "img/tour.jpg",
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const date = "2025-12-01";
      const result = await getAvailableTours(date);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/tours/available?tour_date=${date}`
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: "morning-2025-12-01",
        instanceId: 101,
        tourType: "morning",
        name: "Morning Dolphin Tour",
        remaining: 8,
        isBookable: true,
        capacity: 10,
      });
    });

    test("should handle fetch errors", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: async () => ({ detail: "Database error" }),
      });

      const date = "2025-12-01";

      await expect(getAvailableTours(date)).rejects.toThrow(
        "HTTP error 500: Database error"
      );

      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("createBooking", () => {
    test("should successfully create a booking", async () => {
      const mockResponse = {
        booking: {
          id: 123,
          uuid: "abc-123-def",
          status: "pending_payment",
        },
        payment_info: {
          qr_code: "data:image/png;base64,...",
        },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const bookingData = {
        tourId: 101,
        guestName: "John Doe",
        guestEmail: "john@example.com",
        numPeople: 2,
        totalPrice: 100.0,
      };

      const result = await createBooking(bookingData);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/bookings`,
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );

      expect(result.success).toBe(true);
      expect(result.booking).toBeDefined();
      expect(result.paymentInfo).toBeDefined();
    });

    test("should handle booking failure", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ detail: "Not enough seats available" }),
      });

      const bookingData = {
        tourId: 101,
        guestName: "John Doe",
        guestEmail: "john@example.com",
        numPeople: 20,
        totalPrice: 1000.0,
      };

      const result = await createBooking(bookingData);

      expect(result.success).toBe(false);
      expect(result.message).toContain("Not enough seats available");
    });
  });
});
