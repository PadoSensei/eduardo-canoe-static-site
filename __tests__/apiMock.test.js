// __tests__/apiMock.test.js

// Import the functions to be tested
import { getAvailabilityAndDetails, bookTour } from "../apiMock.js"; // Adjust path if needed

// Mock the fetch API globally for these tests
global.fetch = jest.fn();

// Clear mocks before each test to ensure isolation
beforeEach(() => {
  fetch.mockClear();
  // You might also want to reset any internal mock state if your apiMock.js uses it
  // e.g., if resetMockBookings() affected global variables accessible by the mocks
});

describe("API Mock Functions", () => {
  const API_BASE_URL = "http://localhost:8000/api/v1";

  // Test Case 1: getAvailabilityAndDetails - Successful Fetch
  test("getAvailabilityAndDetails should fetch tour data and availability", async () => {
    const mockResponseData = [
      {
        tour_id: "dolphin",
        name: "Daybreak Dolphin Bay Encounter",
        description: "A gentle morning paddle to see dolphins at sunrise.",
        price: 50,
        image_url: "img/Vibe_Beach.jpg",
        duration: "2h",
        capacity: 10,
        date: "2025-12-01",
        booked_count: 2,
        available: true,
        remaining: 8,
      },
    ];

    // Mock the fetch call to return a successful response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponseData,
    });

    const date = "2025-12-01";
    const result = await getAvailabilityAndDetails(date);

    // Assertions
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/tours/available?tour_date=${date}`
    );
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "dolphin",
          name: "Daybreak Dolphin Bay Encounter",
          remaining: 8,
          available: true,
        }),
      ])
    );
  });

  // Test Case 2: getAvailabilityAndDetails - Fetch Error Handling
  test("getAvailabilityAndDetails should handle fetch errors", async () => {
    // Mock fetch to return an error response
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: async () => ({ detail: "Something went wrong on the server" }),
    });

    const date = "2025-12-01";
    // Expect the function to throw an error caught by the caller
    await expect(getAvailabilityAndDetails(date)).rejects.toThrow(
      "HTTP error 500: Something went wrong on the server"
    );
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/tours/available?tour_date=${date}`
    );
  });

  // Test Case 3: bookTour - Successful Booking
  test("bookTour should successfully book a tour", async () => {
    // Mock the fetch call for POST to the bookings endpoint
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        booking: { id: "abc-123" },
        payment_info: { qrCode: "..." },
      }),
    });

    const date = "2025-12-01";
    const tourId = "dolphin";
    const quantity = 2;

    const result = await bookTour(date, tourId, quantity);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tour_id: tourId,
        date: date,
        quantity: quantity,
        guest_name: "Guest User", // Ensure this matches your apiMock.js payload
        guest_email: "guest@example.com", // Ensure this matches
      }),
    });
    expect(result).toEqual({ success: true });
  });

  // Test Case 4: bookTour - Booking Failure (e.g., tour unavailable)
  test("bookTour should return failure if booking fails", async () => {
    // Mock fetch to return an error response from the backend
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ detail: "Only 1 spot left for this tour." }),
    });

    const date = "2025-12-01";
    const tourId = "dolphin";
    const quantity = 2; // Trying to book more than available

    const result = await bookTour(date, tourId, quantity);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: false,
      message: "Only 1 spot left for this tour.",
    });
  });
});
