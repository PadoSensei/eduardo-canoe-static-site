// src/api.ts
import * as Sentry from "@sentry/react";
import { toast } from "sonner";
import { supabase } from "@/supabaseClient";
import { z } from "zod";
import config from "@/core/config";
import { translations } from "@/data/translations";
import {
  AvailableToursResponseSchema,
  CreateBookingResponseSchema,
  TourTemplatesResponseSchema,
  ManifestResponseSchema,
  BookingStatusResponseSchema,
  ScheduleResponseSchema,
  EmailSettingsResponseSchema,
  EmailSettingSchema,
  type EmailSetting,
  type CreateBookingResponse,
  type ManifestResponse,
  type BookingStatusResponse,
  type ScheduleResponse,
} from "@/api/schemas";

const API_BASE_URL = config.apiBaseUrl;

interface RequestOptions<T> {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  includeAuth?: boolean;
  signal?: AbortSignal;
  schema?: z.ZodType<T, z.ZodTypeDef, unknown>;
}

/**
 * Centralized request wrapper to handle headers, error reporting,
 * and global toasts for system failures.
 */
async function request<T>(
  endpoint: string,
  options: RequestOptions<T> = {}
): Promise<T> {
  const { method = "GET", body, includeAuth = false, signal, schema } = options;

  let url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  // URL Validation: Remove double-slashes and trailing slashes (including before query params)
  url = url.replace(/([^:])\/\/+/g, "$1/");
  url = url.replace(/\/(\?|$)/, "$1");

  console.log(
    `%c 🛰️ API Call: ${url} | Origin: ${window.location.origin}`,
    "color: #3b82f6; font-weight: bold;"
  );

  const headers: Record<string, string> = {
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

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal,
      credentials: "omit",
    });

    if (!response.ok) {
      const rawResponseBody = await response.text().catch(() => "N/A");
      if (!config.isProduction) {
        console.error(`[API Error] ${url}:`, rawResponseBody);
      }

      const errorData = (() => {
        try {
          return JSON.parse(rawResponseBody);
        } catch {
          return {};
        }
      })();
      let message = errorData.detail || "An unexpected error occurred.";

      // FE-4: Handle Expired Booking from Backend Reaper
      const isBookingEndpoint =
        endpoint.includes("/bookings") && !endpoint.includes("/admin");

      if (
        isBookingEndpoint &&
        (response.status === 404 ||
          (response.status === 400 &&
            message.toLowerCase().includes("expired")))
      ) {
        localStorage.removeItem("pending_booking");
        message = "BOOKING_EXPIRED";
      } else if (response.status === 404) {
        // Standardize catalog/other 404s as NetworkError for UI resilience
        message = "NetworkError";
      }

      // FE-2: Error Passthrough logic
      if (
        response.status === 400 ||
        response.status === 401 ||
        response.status === 503
      ) {
        toast.error(message);
      } else if (response.status >= 500) {
        if (config.isProduction) {
          const refId =
            errorData.sentry_id || errorData.transaction_id || "N/A";
          const lang =
            (localStorage.getItem("language") as keyof typeof translations) ||
            "pt";
          const t = translations[lang] || translations["en"];
          const translatedMessage = t.error_internal_server_with_id.replace(
            "{{id}}",
            refId
          );
          toast.error(translatedMessage);
        } else {
          toast.error(message);
        }
      }

      const error = new Error(message) as Error & { status?: number };
      error.status = response.status;
      throw error;
    }

    const data: unknown = await response.json();

    // Shield: Validate if schema is provided
    if (schema) {
      return schema.parse(data);
    }

    return data as T;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") throw error;

    const status = (error as { status?: number }).status || 500;
    captureApiError(error as Error, { endpoint, status });
    throw error;
  }
}

export async function getEmailSettings(
  options: { signal?: AbortSignal } = {}
): Promise<EmailSetting[] | null> {
  try {
    return await request<EmailSetting[]>("/admin/settings/emails", {
      includeAuth: true,
      signal: options.signal,
      schema: EmailSettingsResponseSchema,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") return null;
    throw error;
  }
}

export async function updateEmailSetting(
  slug: string,
  data: Partial<
    Pick<EmailSetting, "is_enabled" | "scheduled_time" | "scheduled_time">
  >,
  options: { signal?: AbortSignal } = {}
): Promise<EmailSetting | null> {
  try {
    return await request<EmailSetting>(`/admin/settings/emails/${slug}`, {
      method: "PATCH",
      body: data,
      includeAuth: true,
      signal: options.signal,
      schema: EmailSettingSchema,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") return null;
    throw error;
  }
}

const captureApiError = (
  error: Error,
  context: { endpoint: string; status: number }
) => {
  if (error.name === "AbortError") return;

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

export interface TourUI {
  id: string;
  instanceId: number;
  tourType: string;
  name: string;
  price: number;
  remaining: number;
  isBookable: boolean;
  capacity: number;
  duration: string;
  imageUrl: string;
  tourDate: string;
  description: string | null;
  shortDescription: string | null;
  inclusions: string[];
  requirements: string[];
}

export async function getAvailableTours(
  date: string,
  options: { signal?: AbortSignal } = {}
): Promise<TourUI[] | null> {
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
      description: tour.description || null,
      shortDescription: tour.short_description || null,
      inclusions: tour.inclusions,
      requirements: tour.requirements,
    }));
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") return null;
    throw error;
  }
}

export interface BookingData {
  tourId: number;
  guestName: string;
  guestEmail: string;
  numPeople: number;
  totalPrice: number;
  specialNotes?: string;
  acceptedTerms: boolean;
  language?: string;
}

export interface CreateBookingResult {
  success: boolean;
  booking?: CreateBookingResponse["booking"];
  paymentInfo?: CreateBookingResponse["payment_info"];
  message?: string;
}

export async function createBooking(
  bookingData: BookingData,
  options: { signal?: AbortSignal } = {}
): Promise<CreateBookingResult | null> {
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
    if (error instanceof Error && error.name === "AbortError") return null;
    return { success: false, message: (error as Error).message };
  }
}

export async function getBookingStatus(
  bookingUuid: string,
  options: { signal?: AbortSignal } = {}
): Promise<BookingStatusResponse | null> {
  try {
    return await request<BookingStatusResponse>(
      `/bookings/status/${bookingUuid}`,
      {
        signal: options.signal,
        schema: BookingStatusResponseSchema,
      }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") return null;
    throw error;
  }
}

export interface TourTemplateUI {
  id: number;
  tourType: string;
  name: string;
  price: number;
  duration: string | null;
  imageUrl: string | null;
  description: string | null;
  shortDescription: string | null;
  inclusions: string[];
  requirements: string[];
}

export async function getTourTemplates(
  options: { signal?: AbortSignal } = {}
): Promise<TourTemplateUI[] | null> {
  try {
    const data = await request("/tour-templates", {
      signal: options.signal,
      schema: TourTemplatesResponseSchema,
    });

    return data.map((template) => ({
      id: template.id,
      tourType: template.name,
      name: template.display_name,
      price: template.price,
      duration: template.duration || null,
      imageUrl: template.image_url || null,
      description: template.description || null,
      shortDescription: template.short_description || null,
      inclusions: template.inclusions || [],
      requirements: template.requirements || [],
    }));
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") return null;
    throw error;
  }
}

export async function fetchMonthlySchedule(
  year: number,
  month: number,
  options: { signal?: AbortSignal } = {}
): Promise<ScheduleResponse | null> {
  try {
    return await request<ScheduleResponse>(
      `/admin/schedule?year=${year}&month=${month}`,
      {
        includeAuth: true,
        signal: options.signal,
        schema: ScheduleResponseSchema,
      }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") return null;
    throw error;
  }
}

export async function fetchDayManifest(
  dateString: string,
  options: { signal?: AbortSignal } = {}
): Promise<ManifestResponse | null> {
  try {
    return await request<ManifestResponse>(`/admin/manifest/${dateString}`, {
      includeAuth: true,
      signal: options.signal,
      schema: ManifestResponseSchema,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") return null;
    throw error;
  }
}

export async function patchCheckIn(
  bookingUuid: string,
  status: boolean,
  options: { signal?: AbortSignal } = {}
): Promise<unknown> {
  try {
    return await request(`/admin/bookings/${bookingUuid}/check-in`, {
      method: "PATCH",
      body: { checked_in: status },
      includeAuth: true,
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") return null;
    throw error;
  }
}

export async function adminCreateBooking(
  bookingData: unknown,
  options: { signal?: AbortSignal } = {}
): Promise<unknown> {
  try {
    return await request("/admin/bookings", {
      method: "POST",
      body: bookingData,
      includeAuth: true,
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") return null;
    throw error;
  }
}

export async function cancelTourForWeather(
  tourId: number,
  tourName: string,
  tourDate: string,
  options: { signal?: AbortSignal } = {}
): Promise<unknown> {
  try {
    return await request(`/admin/tours/${tourId}/weather-cancel`, {
      method: "POST",
      body: { tour_name: tourName, tour_date: tourDate },
      includeAuth: true,
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") return null;
    throw error;
  }
}
