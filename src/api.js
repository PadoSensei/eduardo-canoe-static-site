// src/api.js
import * as Sentry from "@sentry/react";
import { toast } from "sonner";
import { supabase } from "./supabaseClient";
import {
  AvailableToursResponseSchema,
  CreateBookingResponseSchema,
  TourTemplatesResponseSchema,
} from "./api/schemas";

const DOMAIN = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_BASE_URL = `${DOMAIN}/api/v1`;

/**
 * Centralized request wrapper to handle headers, error reporting,
 * and global toasts for system failures.
 */
async function request(endpoint, options = {}) {
  const {
    method = "GET",
    body,
    includeAuth = false,
    signal,
    schema,
  } = options;

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  const headers = { "Content-Type": "application/json" };
  if (includeAuth) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let message = errorData.detail || "An unexpected error occurred.";

      // FE-4: Handle Expired Booking from Backend Reaper
      if (
        response.status === 404 ||
        (response.status === 400 &&
          message.toLowerCase().includes("expired"))
      ) {
        localStorage.removeItem("pending_booking");
        message = "BOOKING_EXPIRED";
      }

      // FE-2: Error Passthrough logic
      if (response.status === 400 || response.status === 503) {
        toast.error(message);
      } else if (response.status >= 500) {
        // Localized 500 message will be handled by the caller or a translation hook
        // but we trigger a generic toast here.
        // Since we don't have access to useLanguage hook here, we use a key
        // that the toaster can ideally translate if we were using i18next,
        // but here we'll just trigger it and let translations happen in components if possible.
        // Actually, the requirements say "trigger a Toast.error with that message".
        // For 500: "We're experiencing heavy traffic. Please try again in a moment."
        toast.error("error_system_overloaded");
      }

      const error = new Error(message);
      error.status = response.status;
      throw error;
    }

    const data = await response.json();

    // Shield: Validate if schema is provided
    if (schema) {
      return schema.parse(data);
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") throw error;

    captureApiError(error, { endpoint, status: error.status || 500 });
    throw error;
  }
}

const captureApiError = (error, context) => {
  if (error.name === "AbortError") return;
  if (!Sentry.withScope) return;

  try {
    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("api_endpoint", context.endpoint);
      if (context.status) scope.setExtra("status", context.status);
      Sentry.captureException(error);
    });
  } catch {
    // Fail silently in tests if Sentry is gone
  }
};

export async function getAvailableTours(date, options = {}) {
  try {
    const validatedData = await request(`/tours/available?tour_date=${date}`, {
      signal: options.signal,
      schema: AvailableToursResponseSchema,
    });

    return validatedData.map((tour) => ({
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
      description: tour.description,
      shortDescription: tour.short_description,
      inclusions: tour.inclusions,
      requirements: tour.requirements,
    }));
  } catch (error) {
    if (error.name === "AbortError") return null;
    throw error;
  }
}

export async function createBooking(bookingData, options = {}) {
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
    const validatedResult = await request("/bookings", {
      method: "POST",
      body: payload,
      signal: options.signal,
      schema: CreateBookingResponseSchema,
    });

    return {
      success: true,
      booking: validatedResult.booking,
      paymentInfo: validatedResult.payment_info,
    };
  } catch (error) {
    if (error.name === "AbortError") return null;
    return { success: false, message: error.message };
  }
}

export async function getBookingStatus(bookingUuid, options = {}) {
  try {
    return await request(`/bookings/status/${bookingUuid}`, {
      signal: options.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") return null;
    throw error;
  }
}

export async function getTourTemplates(options = {}) {
  try {
    const data = await request("/tour-templates/", {
      signal: options.signal,
      schema: TourTemplatesResponseSchema,
    });

    return data.map((template) => ({
      id: template.id,
      tourType: template.name,
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
    throw error;
  }
}

export async function fetchMonthlySchedule(year, month, options = {}) {
  try {
    return await request(`/admin/schedule?year=${year}&month=${month}`, {
      includeAuth: true,
      signal: options.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") return null;
    throw error;
  }
}

export async function fetchDayManifest(dateString, options = {}) {
  try {
    return await request(`/admin/manifest/${dateString}`, {
      includeAuth: true,
      signal: options.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") return null;
    throw error;
  }
}

export async function adminCreateBooking(bookingData, options = {}) {
  try {
    return await request("/admin/bookings", {
      method: "POST",
      body: bookingData,
      includeAuth: true,
      signal: options.signal,
    });
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
    return await request(`/admin/tours/${tourId}/weather-cancel`, {
      method: "POST",
      body: { tour_name: tourName, tour_date: tourDate },
      includeAuth: true,
      signal: options.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") return null;
    throw error;
  }
}
