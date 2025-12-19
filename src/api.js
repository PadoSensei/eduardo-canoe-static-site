// api.js - Backend API client for tour booking application

// 1. Read the base domain from the .env file (VITE_API_URL)
// 2. Fallback to localhost if the variable is missing
// 3. Append /api/v1 since your backend logic expects this structure
const DOMAIN = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_BASE_URL = `${DOMAIN}/api/v1`;

/**
 * Fetches available tours for a specific date from the backend.
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Array>} Array of available tour objects
 */
export async function getAvailableTours(date) {
  const url = `${API_BASE_URL}/tours/available?tour_date=${date}`;

  try {
    console.log(`Fetching tours from: ${url}`);
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        errorData.detail || response.statusText || "Unknown error";
      throw new Error(`HTTP error ${response.status}: ${message}`);
    }

    const data = await response.json();
    console.log("API response:", data);

    // Map backend response to frontend format
    return data.map((tour) => ({
      id: `${tour.tour_type}-${tour.tour_date}`,
      instanceId: tour.tour_instance_id,
      tourType: tour.tour_type,
      name: tour.display_name,
      description: tour.description || "",
      price: tour.price,
      remaining: tour.seats_available,
      isBookable: tour.is_bookable,
      capacity: tour.capacity,
      duration: tour.duration || "2h",
      imageUrl: tour.image_url || "",
      tourDate: tour.tour_date,
    }));
  } catch (error) {
    console.error("Error fetching available tours:", error);
    throw error;
  }
}

/**
 * Creates a booking for a tour.
 * @param {object} bookingData - Booking information
 * @param {number} bookingData.tourId - Tour instance ID
 * @param {string} bookingData.guestName - Guest's name
 * @param {string} bookingData.guestEmail - Guest's email
 * @param {number} bookingData.numPeople - Number of people
 * @param {number} bookingData.totalPrice - Total price for the booking
 * @returns {Promise<object>} Booking response with booking details and payment info
 */
export async function createBooking(bookingData) {
  const url = `${API_BASE_URL}/bookings`;

  const payload = {
    tour_id: bookingData.tourId,
    guest_name: bookingData.guestName,
    guest_email: bookingData.guestEmail,
    num_people: bookingData.numPeople,
    total_price: bookingData.totalPrice,
  };

  console.log("Creating booking:", payload);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.detail || `Server error: ${response.status}`;
      throw new Error(message);
    }

    const result = await response.json();
    console.log("Booking created:", result);

    return {
      success: true,
      booking: result.booking,
      paymentInfo: result.payment_info,
    };
  } catch (error) {
    console.error("Error creating booking:", error);
    return {
      success: false,
      message: error.message || "Failed to create booking. Please try again.",
    };
  }
}

/**
 * Checks the status of a booking by UUID.
 * @param {string} bookingUuid - The UUID of the booking
 * @returns {Promise<object>} Booking details
 */
export async function getBookingStatus(bookingUuid) {
  const url = `${API_BASE_URL}/bookings/status/${bookingUuid}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.detail || response.statusText;
      throw new Error(`HTTP error ${response.status}: ${message}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error checking booking status:", error);
    throw error;
  }
}

/**
 * Fetches a specific tour template by name.
 * @param {string} templateName - Name of the tour template (e.g., "morning", "evening")
 * @returns {Promise<object>} Tour template details
 */
export async function getTourTemplate(templateName) {
  const url = `${API_BASE_URL}/tour-templates/${templateName}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.detail || response.statusText;
      throw new Error(`HTTP error ${response.status}: ${message}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching tour template:", error);
    throw error;
  }
}

/**
 * Fetches a specific tour instance by ID.
 * @param {number} instanceId - The tour instance ID
 * @returns {Promise<object>} Tour instance details
 */
export async function getTourInstance(instanceId) {
  const url = `${API_BASE_URL}/tours/instances/${instanceId}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.detail || response.statusText;
      throw new Error(`HTTP error ${response.status}: ${message}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching tour instance:", error);
    throw error;
  }
}

// --- DASHBOARD / ADMIN ENDPOINTS ---

// 1. Fetch Calendar Data (Get all tour instances for a specific month)
export const fetchMonthlySchedule = async (year, month) => {
  // In a real app, pass year/month as query params
  // GET /api/tours/schedule?year=2025&month=1
  const response = await fetch(
    `${API_BASE_URL}/tours/schedule?year=${year}&month=${month}`
  );
  if (!response.ok) throw new Error("Failed to fetch schedule");
  return await response.json();
};

// 2. Fetch Details for a Specific Date (The Manifest)
// This needs to return tours AND the bookings inside them
export const fetchDayManifest = async (dateString) => {
  // GET /api/tours/manifest?date=2025-01-20
  const response = await fetch(
    `${API_BASE_URL}/tours/manifest?date=${dateString}`
  );
  if (!response.ok) throw new Error("Failed to fetch manifest");
  return await response.json();
};

// 3. Toggle Tour Status (Cancel/Uncancel)
export const toggleTourStatus = async (tourId, newStatus) => {
  // PATCH /api/tours/{id} body: { status: 'cancelled' | 'available' }
  const response = await fetch(`${API_BASE_URL}/tours/${tourId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: newStatus }),
  });
  if (!response.ok) throw new Error("Failed to update tour status");
  return await response.json();
};
