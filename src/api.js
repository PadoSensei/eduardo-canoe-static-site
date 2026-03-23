// src/api.js
import * as Sentry from "@sentry/react";
import { supabase } from "./supabaseClient";

const DOMAIN = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_BASE_URL = `${DOMAIN}/api/v1`;

const getHeaders = async (includeAuth = false) => {
  const headers = { "Content-Type": "application/json" };
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

const captureApiError = (error, context) => {
  if (error.name === "AbortError") return;
  if (!Sentry.withScope) return;

  // Safety: Sentry might be partially unmounted in tests
  try {
    const Sentry = require("@sentry/react");
    if (Sentry && Sentry.withScope) {
      Sentry.withScope((scope) => {
        scope.setLevel("error");
        scope.setTag("api_endpoint", context.endpoint);
        Sentry.captureException(error);
      });
    }
  } catch (e) {
    // Fail silently in tests if Sentry is gone
  }
};

export async function getAvailableTours(date, options = {}) {
  const url = `${API_BASE_URL}/tours/available?tour_date=${date}`;
  try {
    const response = await fetch(url, { signal: options.signal });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `HTTP error ${response.status}: ${errorData.detail || "Error"}`
      );
    }
    const data = await response.json();
    return data.map((tour) => ({
      id: `${tour.tour_type}-${tour.tour_date}`,
      instanceId: tour.tour_instance_id,
      tourType: tour.tour_type,
      name: tour.display_name,
      price: tour.price,
      remaining: tour.seats_available,
      isBookable: tour.is_bookable,
      capacity: tour.capacity,
      duration: tour.duration || "2h",
      imageUrl: tour.image_url || "",
      tourDate: tour.tour_date,
      name: tour.display_name,
      description: tour.description, // Full blurb
      shortDescription: tour.short_description,
      inclusions: tour.inclusions || [], // Array of strings
      requirements: tour.requirements || [], // Array of strings
    }));
  } catch (error) {
    if (error.name === "AbortError") return null;
    captureApiError(error, {
      endpoint: "getAvailableTours",
      status: 500,
      payload: { date },
    });
    throw error;
  }
}

// FIX: Ensure this is a named export function
export async function createBooking(bookingData, options = {}) {
  const url = `${API_BASE_URL}/bookings`;
  const payload = {
    tour_id: bookingData.tourId,
    guest_name: bookingData.guestName,
    guest_email: bookingData.guestEmail,
    num_people: bookingData.numPeople,
    total_price: bookingData.totalPrice,
    special_notes: bookingData.specialNotes,
    accepted_terms: bookingData.acceptedTerms,
    language: bookingData.language || "en",
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: await getHeaders(false),
      body: JSON.stringify(payload),
      signal: options.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Server error: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      booking: result.booking,
      paymentInfo: result.payment_info,
    };
  } catch (error) {
    if (error.name === "AbortError") return null;
    captureApiError(error, { endpoint: "createBooking", payload });
    return { success: false, message: error.message };
  }
}

export async function getBookingStatus(bookingUuid, options = {}) {
  const url = `${API_BASE_URL}/bookings/status/${bookingUuid}`;
  try {
    const response = await fetch(url, { signal: options.signal });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") return null;
    throw error;
  }
}

export async function getTourTemplates(options = {}) {
  const url = `${API_BASE_URL}/tour-templates/`;
  try {
    const response = await fetch(url, { signal: options.signal });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `HTTP error ${response.status}: ${errorData.detail || "Error"}`
      );
    }
    const data = await response.json();

    // We map the backend Template model to the frontend Tour object
    return data.map((template) => ({
      id: template.id,
      tourType: template.name, // e.g. "sunset", "full_moon"
      name: template.display_name,
      price: template.price,
      duration: template.duration,
      imageUrl: template.image_url,
      description: template.description,
      shortDescription: template.short_description,
      inclusions: template.inclusions || [],
      requirements: template.requirements || [],
    }));
  } catch (error) {
    if (error.name === "AbortError") return null;
    captureApiError(error, { endpoint: "getTourTemplates" });
    throw error;
  }
}

export async function fetchMonthlySchedule(year, month, options = {}) {
  try {
    const headers = await getHeaders(true);
    const response = await fetch(
      `${API_BASE_URL}/admin/schedule?year=${year}&month=${month}`,
      { headers, signal: options.signal }
    );
    if (!response.ok) throw new Error("Unauthorized Access");
    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") return null;
    captureApiError(error, {
      endpoint: "fetchMonthlySchedule",
      payload: { year, month },
    });
    throw error;
  }
}

export async function fetchDayManifest(dateString, options = {}) {
  try {
    const headers = await getHeaders(true);
    const response = await fetch(
      `${API_BASE_URL}/admin/manifest/${dateString}`,
      {
        headers,
        signal: options.signal,
      }
    );
    if (!response.ok) throw new Error("Unauthorized");
    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") return null;
    captureApiError(error, {
      endpoint: "fetchDayManifest",
      payload: { dateString },
    });
    throw error;
  }
}

export async function adminCreateBooking(bookingData, options = {}) {
  try {
    const headers = await getHeaders(true);
    const response = await fetch(`${API_BASE_URL}/admin/bookings`, {
      method: "POST",
      headers,
      body: JSON.stringify(bookingData),
      signal: options.signal,
    });
    if (!response.ok) throw new Error("Manual booking failed");
    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") return null;
    throw error;
  }
}

export async function cancelTourForWeather(
  tourId,
  tourName,
  tourDate,
  options = {}
) {
  try {
    const headers = await getHeaders(true);
    const response = await fetch(
      `${API_BASE_URL}/admin/tours/${tourId}/weather-cancel`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ tour_name: tourName, tour_date: tourDate }),
        signal: options.signal,
      }
    );
    if (!response.ok) throw new Error("Cancellation failed");
    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") return null;
    throw error;
  }
}
