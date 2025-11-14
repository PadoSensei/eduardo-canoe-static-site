// __tests__/apiMock.test.js

// Import the functions to be tested
import { getAvailabilityAndDetails, bookTour } from "../apiMock.js"; // Adjust path if needed

// Mock the fetch API globally for these tests
// This is how we simulate responses from the *actual* backend
global.fetch = jest.fn();

// Clear mocks before each test to ensure isolation
beforeEach(() => {
  fetch.mockClear();
  // If resetMockBookings is called and affects global state in apiMock.js that is tested, clear it here too.
});

describe("API Client Functions (Integration Tests)", () => {
  const API_BASE_URL = "http://localhost:8000/api/v1";

  // Test Case 1: getAvailabilityAndDetails - Successful Fetch
  test("getAvailabilityAndDetails should fetch and map tour data correctly", async () => {
    const mockBackendResponse = [
      // This IS the data your REAL backend should return
      {
        tour_id: "dolphin", // Backend uses tour_id
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
      // ... other tours ...
    ];

    // Mock the fetch call to return a successful response with mock backend data
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBackendResponse,
    });

    const date = "2025-12-01";
    const result = await getAvailabilityAndDetails(date);

    // Assertions
    expect(fetch).toHaveBeenCalledTimes(1);
    // Check if fetch was called with the correct URL
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/tours/available?tour_date=${date}`
    );

    // Assert that the data was mapped correctly by apiMock.js
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "dolphin", // Frontend expects 'id' which apiMock.js maps from backend's 'tour_id'
          name: "Daybreak Dolphin Bay Encounter",
          remaining: 8,
          available: true,
        }),
      ])
    );
  });

  // Test Case 2: getAvailabilityAndDetails - Fetch Error Handling (e.g., 404, 500)
  test("getAvailabilityAndDetails should handle fetch errors gracefully", async () => {
    // Mock fetch to return an error response (e.g., 404 Not Found)
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
      json: async () => ({ detail: "No tours found for the given date" }), // Mock error JSON
    });

    const date = "2025-12-01";
    // Expect the function to throw an error containing the backend's message
    await expect(getAvailabilityAndDetails(date)).rejects.toThrow(
      "No tours found for the given date"
    );
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  // Test Case 3: bookTour - Successful Booking
  test("bookTour should make a POST request and return success on successful booking", async () => {
    // Mock the fetch call for POST to the bookings endpoint
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        // Mock successful backend response structure
        booking: {
          id: "bk-123",
          tour_id: "dolphin",
          quantity: 2,
          status: "PENDING_PAYMENT",
        },
        payment_info: { qr_code_data: "...", expiry_time: "..." },
      }),
    });

    const date = "2025-12-01";
    const tourId = "dolphin";
    const quantity = 2;

    const result = await bookTour(date, tourId, quantity);

    // Assertions
    expect(fetch).toHaveBeenCalledTimes(1);
    // Check call details: URL, method, headers, and payload body
    expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Body should match the structure expected by the backend's BookingCreate model
      body: JSON.stringify({
        tour_id: tourId,
        date: date,
        quantity: quantity,
        // Ensure these placeholders match your actual backend requirements for anonymous bookings
        guest_name: "Guest User",
        guest_email: "guest@example.com",
      }),
    });
    // Check the return value from the function
    expect(result).toEqual({ success: true });
  });

  // Test Case 4: bookTour - Booking Failure (e.g., validation error, not enough seats)
  test("bookTour should return failure message on API booking failure", async () => {
    // Mock fetch to return an error response from the backend (e.g., 400 Bad Request)
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ detail: "Only 1 spot left for this tour." }), // Backend error message
    });

    const date = "2025-12-01";
    const tourId = "dolphin";
    const quantity = 2; // Trying to book more than available

    const result = await bookTour(date, tourId, quantity);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: false,
      message: "Only 1 spot left for this tour.", // Message from the backend error
    });
  });
});

// --- Tests for Frontend Rendering Logic ---
// These tests verify that the frontend components behave correctly based on
// the data returned by the API client functions (which are mocked in these tests).
// We are testing the frontend's logic for display, interaction, and error handling.

// ... (Keep your existing tests for Tours Page Rendering, Modal Functionality, Booking Flow, Data Validation) ...
// These tests are crucial for TDD because they verify the frontend's reaction to API responses.

// For example, the tests for 'should call bookTour and close modal on successful booking confirmation'
// and 'should display error and reset UI on booking failure' are integration tests
// that verify how the frontend reacts to the success/failure responses from bookTour.
