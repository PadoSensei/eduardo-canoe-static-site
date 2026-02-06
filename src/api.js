// api.js - Backend API client for tour booking application
import * as Sentry from "@sentry/react";
import { supabase } from "./supabaseClient"; // Import for auth session

const DOMAIN = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_BASE_URL = `${DOMAIN}/api/v1`;

/**
 * Helper to get the current session token and prepare headers.
 * This ensures that Eduardo's "ID Card" is sent to the backend.
 */
const getHeaders = async (includeAuth = false) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (includeAuth) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }
  }

  return headers;
};

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

// --- PUBLIC ENDPOINTS (No Auth Required) ---

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
      headers: await getHeaders(false), // Explicitly no auth for guests
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
    return {
      success: true,
      booking: result.booking,
      paymentInfo: result.payment_info,
    };
  } catch (error) {
    if (!error.message.includes("Server error")) {
      captureApiError(error, { endpoint: "createBooking", payload });
    }
    return { success: false, message: error.message };
  }
}

export async function getBookingStatus(bookingUuid) {
  const url = `${API_BASE_URL}/bookings/status/${bookingUuid}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const err = new Error(`HTTP error ${response.status}`);
      captureApiError(err, {
        endpoint: "getBookingStatus",
        status: response.status,
        payload: { bookingUuid },
      });
      throw err;
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

// --- ADMIN ENDPOINTS (Auth Required) ---

export const fetchMonthlySchedule = async (year, month) => {
  try {
    const headers = await getHeaders(true); // Include JWT
    const response = await fetch(
      `${API_BASE_URL}/admin/schedule?year=${year}&month=${month}`,
      { headers }
    );
    if (!response.ok) throw new Error("Unauthorized Access");
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
    // 🔍 DEBUG: Check auth before calling
    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log("🔍 Manifest Auth Check:", {
      hasSession: !!session,
      hasToken: !!session?.access_token,
      userEmail: session?.user?.email,
      tokenPreview: session?.access_token?.substring(0, 30) + "...",
    });

    const headers = await getHeaders(true);
    console.log("🔍 Headers being sent:", headers);

    const response = await fetch(
      `${API_BASE_URL}/admin/manifest/${dateString}`,
      { headers }
    );

    console.log("🔍 Response status:", response.status);

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      console.error("Backend Error Details:", {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        body: body,
      });
      throw new Error(
        `Server returned ${response.status}: ${body.detail || "Unauthorized"}`
      );
    }
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
    const headers = await getHeaders(true); // Include JWT
    const response = await fetch(`${API_BASE_URL}/admin/tours/${tourId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status: newStatus }),
    });
    if (!response.ok) throw new Error("Unauthorized Access");
    return await response.json();
  } catch (error) {
    captureApiError(error, {
      endpoint: "toggleTourStatus",
      payload: { tourId, newStatus },
    });
    throw error;
  }
};

export const adminCreateBooking = async (bookingData) => {
  const headers = await getHeaders(true); // Sends Edu's Admin Token
  const payload = {
    tour_id: bookingData.tourId,
    guest_name: bookingData.guestName,
    guest_email: bookingData.guestEmail,
    num_people: bookingData.numPeople,
    total_price: bookingData.totalPrice,
    special_notes: bookingData.special_notes,
    accepted_terms: bookingData.acceptedTerms, // This must be true
  };

  const response = await fetch(`${API_BASE_URL}/admin/bookings`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    // This will now show you EXACTLY which field is failing in the alert
    console.error("Validation Error Details:", error.detail);
    throw new Error(
      JSON.stringify(error.detail) || "Failed to create manual booking"
    );
  }
  return await response.json();
};

export const cancelTourForWeather = async (tourId, tourName, tourDate) => {
  const headers = await getHeaders(true); // Gets Edu's Admin Token
  const response = await fetch(
    `${API_BASE_URL}/admin/tours/${tourId}/weather-cancel`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ tour_name: tourName, tour_date: tourDate }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Cancellation failed");
  }
  return await response.json();
};
