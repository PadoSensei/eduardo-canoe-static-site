// api.js - Backend API client for tour booking application
import * as Sentry from "@sentry/react";

const DOMAIN = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_BASE_URL = `${DOMAIN}/api/v1`;

/**
 * Helper to capture API errors with context
 */
const captureApiError = (error, context) => {
  Sentry.withScope((scope) => {
    scope.setLevel("error");
    scope.setTag("api_endpoint", context.endpoint);
    if (context.status) scope.setExtra("status_code", context.status);
    scope.setExtra("payload", context.payload);
    Sentry.captureException(error);
  });
};

/**
 * Fetches available tours for a specific date from the backend.
 */
export async function getAvailableTours(date) {
  const url = `${API_BASE_URL}/tours/available?tour_date=${date}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        errorData.detail || response.statusText || "Unknown error";
      const err = new Error(`HTTP error ${response.status}: ${message}`);

      captureApiError(err, {
        endpoint: "getAvailableTours",
        status: response.status,
        payload: { date },
      });
      throw err;
    }

    const data = await response.json();
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
    if (!(error instanceof Error && error.message.includes("HTTP error"))) {
      captureApiError(error, {
        endpoint: "getAvailableTours",
        payload: { date },
      });
    }
    throw error;
  }
}

/**
 * Creates a booking for a tour.
 */
export async function createBooking(bookingData) {
  const url = `${API_BASE_URL}/bookings`;

  const payload = {
    tour_id: bookingData.tourId,
    guest_name: bookingData.guestName,
    guest_email: bookingData.guestEmail,
    num_people: bookingData.numPeople,
    total_price: bookingData.totalPrice,
    special_notes: bookingData.special_notes,
    accepted_terms: bookingData.acceptedTerms,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.detail || `Server error: ${response.status}`;
      const err = new Error(message);

      captureApiError(err, {
        endpoint: "createBooking",
        status: response.status,
        payload,
      });
      throw err;
    }

    const result = await response.json();

    if (result.success === false) {
      captureApiError(new Error("Booking indicated failure in body"), {
        endpoint: "createBooking",
        payload: result,
      });
      return {
        success: false,
        message: result.message || "Booking failed. Please try again.",
      };
    }

    return {
      success: true,
      booking: result.booking,
      paymentInfo: result.payment_info,
    };
  } catch (error) {
    console.error("Error creating booking:", error);
    // If it's a network/timeout error (not a 4xx/5xx already captured)
    if (!error.message.includes("Server error")) {
      captureApiError(error, { endpoint: "createBooking", payload });
    }
    return {
      success: false,
      message: error.message || "Failed to create booking. Please try again.",
    };
  }
}

/**
 * Checks the status of a booking by UUID.
 */
export async function getBookingStatus(bookingUuid) {
  const url = `${API_BASE_URL}/bookings/status/${bookingUuid}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.detail || response.statusText;
      const err = new Error(`HTTP error ${response.status}: ${message}`);

      captureApiError(err, {
        endpoint: "getBookingStatus",
        status: response.status,
        payload: { bookingUuid },
      });
      throw err;
    }

    return await response.json();
  } catch (error) {
    console.error("Error checking booking status:", error);
    if (!error.message.includes("HTTP error")) {
      captureApiError(error, {
        endpoint: "getBookingStatus",
        payload: { bookingUuid },
      });
    }
    throw error;
  }
}

/**
 * Fetches a specific tour template by name.
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
    captureApiError(error, {
      endpoint: "getTourTemplate",
      payload: { templateName },
    });
    throw error;
  }
}

/**
 * Fetches a specific tour instance by ID.
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
    captureApiError(error, {
      endpoint: "getTourInstance",
      payload: { instanceId },
    });
    throw error;
  }
}

// --- DASHBOARD / ADMIN ENDPOINTS ---

export const fetchMonthlySchedule = async (year, month) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/tours/schedule?year=${year}&month=${month}`
    );
    if (!response.ok) throw new Error("Failed to fetch schedule");
    return await response.json();
  } catch (error) {
    captureApiError(error, {
      endpoint: "fetchMonthlySchedule",
      payload: { year, month },
    });
    throw error;
  }
};

export const fetchDayManifest = async (dateString) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/tours/manifest?date=${dateString}`
    );
    if (!response.ok) throw new Error("Failed to fetch manifest");
    return await response.json();
  } catch (error) {
    captureApiError(error, {
      endpoint: "fetchDayManifest",
      payload: { dateString },
    });
    throw error;
  }
};

export const toggleTourStatus = async (tourId, newStatus) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tours/${tourId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!response.ok) throw new Error("Failed to update tour status");
    return await response.json();
  } catch (error) {
    captureApiError(error, {
      endpoint: "toggleTourStatus",
      payload: { tourId, newStatus },
    });
    throw error;
  }
};
