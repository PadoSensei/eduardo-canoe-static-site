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
  console.log(
    `[API Mock] Fetching availability and details for: ${dateString}`
  );
  const url = `${API_BASE_URL}/tours/available?tour_date=${dateString}`;
  try {
    // The fetch logic itself is correct.
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

    // =================================================================
    // THE FIX IS HERE: This block now correctly maps the REAL API response
    // to the data structure our React component expects.
    // =================================================================
    return data.map((tourFromApi) => ({
      // Create a unique ID for React's `key` prop.
      id: `${tourFromApi.tour_date}-${tourFromApi.tour_type}`,

      // Frontend expects `name`, backend sends `display_name`.
      name: tourFromApi.display_name,

      // Frontend expects `price`, backend sends `price`. (Match)
      price: tourFromApi.price,

      // Frontend expects `remaining`, backend sends `seats_available`.
      remaining: tourFromApi.seats_available,

      // Frontend expects `capacity`, backend sends `capacity`. (Match)
      capacity: tourFromApi.capacity,

      // Frontend expects `duration`, backend sends `duration`. (Match)
      // duration: tourFromApi.duration || "N/A", // Add a fallback for safety

      // Pass the booking status through directly.
      is_bookable: tourFromApi.is_bookable,

      // We don't need these other fields in the component, so we don't map them.
      // description, image_url, booked_count, etc.
    }));
  } catch (error) {
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
