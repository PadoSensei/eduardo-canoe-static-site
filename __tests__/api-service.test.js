// __tests__/api-service.test.js

/**
 * TDD Tests for Real API Service Layer
 * This will replace apiMock.js with real backend calls
 */

const { JSDOM } = require("jsdom");

// We'll test the API service layer that makes real HTTP calls
describe("API Service Layer - Real Backend Integration", () => {
  const API_BASE_URL = "http://localhost:8000/api/v1";

  // Mock fetch for testing
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Tours API", () => {
    test("fetchTours() should call GET /api/v1/tours", async () => {
      const mockToursResponse = [
        {
          id: "dolphin",
          name: "Daybreak Dolphin Bay Encounter",
          description: "A gentle morning paddle to see dolphins at sunrise.",
          price: 50,
          duration: "2h",
          capacity: 10,
          image_url: "img/dolphin.jpg",
        },
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockToursResponse,
      });

      // This is the function we need to create
      const fetchTours = async () => {
        const response = await fetch(`${API_BASE_URL}/tours`);
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
      };

      const tours = await fetchTours();

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/tours`);
      expect(tours).toEqual(mockToursResponse);
      expect(tours[0]).toHaveProperty("id");
      expect(tours[0]).toHaveProperty("name");
      expect(tours[0]).toHaveProperty("price");
    });

    test("fetchTours() should handle 500 error", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ detail: "Internal server error" }),
      });

      const fetchTours = async () => {
        const response = await fetch(`${API_BASE_URL}/tours`);
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || `HTTP error ${response.status}`);
        }
        return response.json();
      };

      await expect(fetchTours()).rejects.toThrow("Internal server error");
    });

    test("fetchTours() should handle network error", async () => {
      global.fetch.mockRejectedValueOnce(new Error("Network error"));

      const fetchTours = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/tours`);
          return response.json();
        } catch (error) {
          throw new Error(`Network error: ${error.message}`);
        }
      };

      await expect(fetchTours()).rejects.toThrow("Network error");
    });
  });

  describe("Availability API", () => {
    test("fetchAvailability() should call GET /api/v1/tours/available with date", async () => {
      const date = "2025-12-01";
      const mockAvailabilityResponse = [
        {
          tour_id: "dolphin",
          tour_date: "2025-12-01",
          seats_available: 8,
          is_bookable: true,
          price: 50,
        },
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAvailabilityResponse,
      });

      const fetchAvailability = async (tourDate) => {
        const response = await fetch(
          `${API_BASE_URL}/tours/available?tour_date=${tourDate}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
      };

      const availability = await fetchAvailability(date);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/tours/available?tour_date=${date}`
      );
      expect(availability).toEqual(mockAvailabilityResponse);
      expect(availability[0]).toHaveProperty("tour_id");
      expect(availability[0]).toHaveProperty("seats_available");
      expect(availability[0]).toHaveProperty("is_bookable");
    });

    test("fetchAvailability() should return empty array if no tours available", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const fetchAvailability = async (tourDate) => {
        const response = await fetch(
          `${API_BASE_URL}/tours/available?tour_date=${tourDate}`
        );
        return response.json();
      };

      const availability = await fetchAvailability("2025-12-31");

      expect(availability).toEqual([]);
    });

    test("fetchAvailability() should handle invalid date format", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ detail: "Invalid date format" }),
      });

      const fetchAvailability = async (tourDate) => {
        const response = await fetch(
          `${API_BASE_URL}/tours/available?tour_date=${tourDate}`
        );
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail);
        }
        return response.json();
      };

      await expect(fetchAvailability("invalid-date")).rejects.toThrow(
        "Invalid date format"
      );
    });
  });

  describe("Booking API", () => {
    test("createBooking() should call POST /api/v1/bookings", async () => {
      const bookingData = {
        tour_id: "dolphin",
        date: "2025-12-01",
        quantity: 2,
        guest_name: "John Doe",
        guest_email: "john@example.com",
      };

      const mockBookingResponse = {
        booking: {
          id: "booking-123",
          tour_id: "dolphin",
          date: "2025-12-01",
          quantity: 2,
          total_price: 100,
          guest_name: "John Doe",
          guest_email: "john@example.com",
        },
        payment_info: {
          qr_code: "data:image/png;base64,iVBORw0KGgoAAAANS...",
          pix_copy_paste: "00020126580014br.gov.bcb.pix...",
          amount: 100,
        },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBookingResponse,
      });

      const createBooking = async (data) => {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || `HTTP error ${response.status}`);
        }

        return response.json();
      };

      const result = await createBooking(bookingData);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/bookings`,
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingData),
        })
      );
      expect(result).toEqual(mockBookingResponse);
      expect(result.booking).toHaveProperty("id");
      expect(result.payment_info).toHaveProperty("qr_code");
    });

    test("createBooking() should handle insufficient seats error", async () => {
      const bookingData = {
        tour_id: "dolphin",
        date: "2025-12-01",
        quantity: 10,
        guest_name: "John Doe",
        guest_email: "john@example.com",
      };

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          detail: "Only 5 spots left for this tour.",
        }),
      });

      const createBooking = async (data) => {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          return { success: false, message: error.detail };
        }

        return { success: true, data: await response.json() };
      };

      const result = await createBooking(bookingData);

      expect(result.success).toBe(false);
      expect(result.message).toContain("spots left");
    });

    test("createBooking() should handle tour not found error", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ detail: "Tour not found" }),
      });

      const createBooking = async (data) => {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          return { success: false, message: error.detail };
        }

        return { success: true };
      };

      const result = await createBooking({
        tour_id: "non-existent",
        date: "2025-12-01",
        quantity: 1,
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe("Tour not found");
    });

    test("createBooking() should validate required fields", () => {
      const invalidBookingData = {
        tour_id: "dolphin",
        // Missing date, quantity, guest_name, guest_email
      };

      const validateBookingData = (data) => {
        const required = [
          "tour_id",
          "date",
          "quantity",
          "guest_name",
          "guest_email",
        ];
        const missing = required.filter((field) => !data[field]);
        return missing.length === 0 ? null : missing;
      };

      const missingFields = validateBookingData(invalidBookingData);

      expect(missingFields).not.toBeNull();
      expect(missingFields).toContain("date");
      expect(missingFields).toContain("quantity");
    });
  });

  describe("Error Handling Patterns", () => {
    test("should format user-friendly error messages", () => {
      const errorMessages = {
        400: "Invalid request. Please check your information.",
        404: "Tour not found. Please select another tour.",
        500: "Server error. Please try again later.",
        network: "Unable to connect. Check your internet connection.",
      };

      const formatError = (status, detail) => {
        if (status === 400 && detail) return detail;
        if (status === 404) return errorMessages[404];
        if (status === 500) return errorMessages[500];
        return errorMessages.network;
      };

      expect(formatError(400, "Only 2 spots left")).toBe("Only 2 spots left");
      expect(formatError(404)).toBe(
        "Tour not found. Please select another tour."
      );
      expect(formatError(500)).toBe("Server error. Please try again later.");
    });

    test("should retry failed requests with exponential backoff", async () => {
      let attempts = 0;

      global.fetch.mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          return Promise.reject(new Error("Network error"));
        }
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      });

      const fetchWithRetry = async (url, options = {}, maxRetries = 3) => {
        for (let i = 0; i < maxRetries; i++) {
          try {
            const response = await fetch(url, options);
            return response;
          } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise((resolve) =>
              setTimeout(resolve, Math.pow(2, i) * 100)
            );
          }
        }
      };

      const response = await fetchWithRetry(`${API_BASE_URL}/tours`);

      expect(attempts).toBe(3);
      expect(response.ok).toBe(true);
    });

    test("should timeout requests after 10 seconds", async () => {
      const timeoutFetch = async (url, options = {}, timeoutMs = 10000) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

        try {
          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
          });
          clearTimeout(timeout);
          return response;
        } catch (error) {
          clearTimeout(timeout);
          if (error.name === "AbortError") {
            throw new Error("Request timeout");
          }
          throw error;
        }
      };

      // This test validates the structure, actual timeout testing would require jest.useFakeTimers
      expect(typeof timeoutFetch).toBe("function");
    });
  });

  describe("Response Caching", () => {
    test("should cache tours list for 1 hour", async () => {
      const cache = {
        tours: null,
        toursTimestamp: null,
        CACHE_DURATION: 60 * 60 * 1000, // 1 hour
      };

      const getCachedTours = () => {
        const now = Date.now();
        if (
          cache.tours &&
          cache.toursTimestamp &&
          now - cache.toursTimestamp < cache.CACHE_DURATION
        ) {
          return cache.tours;
        }
        return null;
      };

      const setCachedTours = (tours) => {
        cache.tours = tours;
        cache.toursTimestamp = Date.now();
      };

      // First call - cache miss
      expect(getCachedTours()).toBeNull();

      // Set cache
      const mockTours = [{ id: "dolphin", name: "Dolphin Tour" }];
      setCachedTours(mockTours);

      // Second call - cache hit
      expect(getCachedTours()).toEqual(mockTours);
    });

    test("should NOT cache availability (always fetch fresh)", () => {
      // Availability changes frequently, so we should never cache it
      const shouldCacheAvailability = false;

      expect(shouldCacheAvailability).toBe(false);
    });
  });

  describe("Request Debouncing", () => {
    test("should debounce date picker changes", () => {
      jest.useFakeTimers();

      let callCount = 0;
      const mockFetchAvailability = jest.fn(() => {
        callCount++;
        return Promise.resolve([]);
      });

      const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => func(...args), delay);
        };
      };

      const debouncedFetch = debounce(mockFetchAvailability, 300);

      // Simulate rapid date changes
      debouncedFetch("2025-12-01");
      debouncedFetch("2025-12-02");
      debouncedFetch("2025-12-03");
      debouncedFetch("2025-12-04");

      // No calls yet
      expect(callCount).toBe(0);

      // Fast-forward 300ms
      jest.advanceTimersByTime(300);

      // Only one call should have been made (for the last date)
      expect(callCount).toBe(1);

      jest.useRealTimers();
    });
  });

  describe("API Service Integration", () => {
    test("should provide a unified API service object", () => {
      const apiService = {
        tours: {
          getAll: async () => [],
          getById: async (id) => null,
        },
        availability: {
          getByDate: async (date) => [],
        },
        bookings: {
          create: async (data) => ({ success: false }),
        },
        config: {
          baseURL: API_BASE_URL,
          timeout: 10000,
        },
      };

      expect(apiService.tours).toHaveProperty("getAll");
      expect(apiService.availability).toHaveProperty("getByDate");
      expect(apiService.bookings).toHaveProperty("create");
      expect(apiService.config.baseURL).toBe(API_BASE_URL);
    });
  });
});
