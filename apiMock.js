// apiMock.js

// --- Configuration ---
const API_BASE_URL = "http://localhost:8000/api/v1"; // Your backend base URL
const MOCK_DELAY = 300; // Simulate network latency

// --- Helper for simulating network delay ---
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// --- Mock Data (kept for frontend development if backend is unavailable, but not used for real fetches) ---
// This is currently used by tours-booking.js's initial load if getTours() doesn't exist.
// We will refactor tours-booking.js to *always* use the API calls.
import { tours as mockToursData } from "./mockData.js"; // Renamed to avoid conflict

// --- API Interaction Functions ---

/**
 * Fetches the list of available tours for a specific date from the backend.
 * Assumes the backend endpoint returns tour details along with availability.
 * @param {string} dateString - Date in YYYY-MM-DD format.
 * @returns {Promise<Array<object>>} - A promise that resolves with an array of tour objects, each including availability and details.
 */
export async function getAvailabilityAndDetails(dateString) {
  const url = `${API_BASE_URL}/tours/available?tour_date=${dateString}`;
  try {
    await delay(MOCK_DELAY); // Simulate network latency
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `HTTP error ${response.status}: ${
          errorData.detail || response.statusText
        }`
      );
    }

    const data = await response.json();

    // IMPORTANT: If backend only returns ID and availability, we'll need another call for full details.
    // For now, we assume this endpoint provides everything needed for the listing page.
    // If the backend returns only basic tour_ids and availability counts, we would need to:
    // 1. Fetch tour *templates* separately (if such an endpoint exists, e.g., GET /api/v1/tour-templates)
    // 2. Combine the data from this response with the tour template details.

    // For demonstration, let's ensure essential fields are present,
    // mimicking what a combined response might look like.
    // This part might need adjustment based on the actual backend response structure.
    return data.map((tour) => ({
      id: tour.tour_id, // Assuming backend returns tour_id
      name: tour.name || "Tour Name Unavailable", // Placeholder if not provided by backend
      description: tour.description || "No description available.",
      price: tour.price !== undefined ? tour.price : 0, // Ensure price is present
      image_url: tour.image_url || "img/placeholder_tour.jpg", // Fallback image
      duration: tour.duration || "N/A",
      capacity: tour.capacity,
      date: dateString, // Use the requested date
      booked_count: tour.booked_count,
      available: tour.available,
      remaining: tour.remaining,
    }));
  } catch (error) {
    // In a real app, you might want more sophisticated error handling or fallbacks.
    // For now, we re-throw to be caught by the frontend's try-catch.
    throw error;
  }
}

/**
 * Books a tour by making a POST request to the backend.
 * @param {string} dateString - Date in YYYY-MM-DD format.
 * @param {string} tourId - The ID of the tour to book.
 * @param {number} quantity - The number of people to book.
 * @returns {Promise<{success: boolean, message: string}>} - Result of the booking attempt.
 */
export async function bookTour(dateString, tourId, quantity = 1) {
  const url = `${API_BASE_URL}/bookings`;

  const payload = {
    // The backend expects BookingCreate model. Let's match that structure.
    // Based on tours-booking.js:
    tour_id: tourId,
    date: dateString, // The backend expects date in YYYY-MM-DD
    quantity: quantity,
    // For guest bookings, we might need to pass guest details.
    // This depends on the backend's `BookingCreate` model.
    // For now, let's assume guest details are handled elsewhere or are optional if not logged in.
    // If your backend requires them for anonymous bookings:
    guest_name: "Guest User", // Placeholder, ideally passed from modal or form
    guest_email: "guest@example.com", // Placeholder
  };

  try {
    await delay(MOCK_DELAY); // Simulate network latency
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Attempt to extract a user-friendly message from the backend error
      const message = errorData.detail || `Server error: ${response.status}`;
      return { success: false, message: message };
    }

    const result = await response.json(); // Expecting { booking: {...}, payment_info: {...} }
    // The frontend currently uses `alert` which is fine for now.
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: "Network error or unexpected issue. Please try again.",
    };
  }
}

// --- Utility function (for dev/debug) ---
// NOTE: The real backend would likely have its own way to manage/reset data.
// This is kept here for potential local debugging if the backend isn't reset.
export function resetMockBookings() {
  // This function is specific to the *mock* backend state in apiMock.js.
  // It won't affect the real backend. If you need to reset real data,
  // that would require a separate backend endpoint or database operation.
  console.warn(
    "[API Mock] Resetting mock bookings. This does NOT affect the real backend."
  );
  // If you were to keep mock state for some reason, you'd reset it here.
  // For now, it's less relevant as we're calling a real backend.
}
