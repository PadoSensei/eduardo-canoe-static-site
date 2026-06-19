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
  TourUISchema,
  TourTemplateUISchema,
  ManifestResponseSchema,
  AdminBookingCheckInResponseSchema,
  BookingStatusResponseSchema,
  ScheduleResponseSchema,
  EmailSettingsResponseSchema,
  EmailSettingSchema,
  ActivityLogResponseSchema,
  EmailPreviewResponseSchema,
  type EmailSetting,
  type ActivityLog,
  type EmailPreviewResponse,
  type CreateBookingResponse,
  type ManifestResponse,
  type AdminBookingCheckInResponse,
  type BookingStatusResponse,
  type ScheduleResponse,
  type TourUI,
  type TourTemplateUI,
} from "@/api/schemas";

export type { TourUI, TourTemplateUI } from "@/api/schemas";

const API_BASE_URL = config.apiBaseUrl;

interface RequestOptions<T> {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  includeAuth?: boolean;
  signal?: AbortSignal;
  schema?: z.ZodType<T, z.ZodTypeDef, unknown>;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions<T> = {}
): Promise<T> {
  const { method = "GET", body, includeAuth = false, signal, schema } = options;

  let url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  url = url.replace(/([^:])\/\/+/g, "$1/");
  url = url.replace(/\/(\?|$)/, "$1");

  console.log(
    `%c 🛰️ API Call: ${url} | Origin: ${window.location.origin}`,
    "color: #94a3b8; font-size: 10px;"
  );

  const startTime = performance.now();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (includeAuth) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const isDev = !config.isProduction;

    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
      if (isDev) {
        console.log(`🔑 Sending Request as: ${session.user?.email}`);
      }
    } else {
      const shouldBypass =
        !config.isProduction &&
        (config.isTest ||
          import.meta.env.VITE_SKIP_AUTH === "true" ||
          new URLSearchParams(window.location.search).get("bypass") === "true");

      if (shouldBypass) {
        headers["Authorization"] = "Bearer bypass-token";
        if (isDev) {
          console.log("🔑 API Request: [Bypass Mode]");
        }
      } else {
        if (isDev) {
          console.log("🔑 API Request: [Unauthenticated]");
        }
        throw new Error("NOT_AUTHENTICATED");
      }
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

    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    const statusText = `[${response.status} ${response.statusText || (response.status === 200 ? "OK" : "")}]`;

    console.log(
      `%c ${statusText.trim()} 🛰️ API Call: ${url} (${duration}ms) | Origin: ${window.location.origin}`,
      "color: #3b82f6; font-weight: bold;"
    );

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

      const path = endpoint.toLowerCase();
      const isBookingEndpoint =
        path.includes("/bookings") && !path.includes("/admin");

      if (
        isBookingEndpoint &&
        response.status === 400 &&
        message.toLowerCase().includes("expired")
      ) {
        localStorage.removeItem("pending_booking");
        message = "BOOKING_EXPIRED";
      } else if (response.status === 404) {
        message = "NetworkError";
      }

      if (
        !config.isTest &&
        (response.status === 400 ||
          response.status === 401 ||
          response.status === 503)
      ) {
        toast.error(message);
      } else if (!config.isTest && response.status >= 500) {
        if (config.isProduction) {
          const refId =
            errorData.sentry_id || errorData.transaction_id || "N/A";
          const lang =
            (localStorage.getItem("language") as keyof typeof translations) ||
            "pt";
          const t = translations[lang] || translations["en"];
          toast.error(t.error_internal_server_with_id.replace("{{id}}", refId));
        } else {
          toast.error(message);
        }
      }

      const error = new Error(message) as Error & { status?: number };
      error.status = response.status;
      throw error;
    }

    const data: unknown = await response.json();

    if (schema) {
      try {
        return schema.parse(data);
      } catch (err) {
        if (!config.isProduction) {
          if (err instanceof z.ZodError) {
            console.error("❌ [Zod Contract Violation]:", err.format());
          }
          console.error("📦 Raw Data received:", data);
        }
        return data as T;
      }
    }

    return data as T;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    const status = (error as { status?: number }).status || 500;
    captureApiError(error as Error, { endpoint, status });
    throw error;
  }
}

// ==============================================================================
// PUBLIC DISCOVERY ENDPOINTS
// ==============================================================================

export async function fetchLogisticsMetadata(
  options: { signal?: AbortSignal } = {}
): Promise<any[]> {
  try {
    const data = await request<any[]>("/tours/templates", {
      signal: options.signal,
    });
    return data.map((t) => ({
      id: t.id,
      name: t.name,
      display_name: t.display_name,
      default_start_time: t.default_start_time,
      default_meeting_time: t.default_meeting_time,
    }));
  } catch {
    return [];
  }
}

export async function getTourTemplates(
  options: { signal?: AbortSignal } = {}
): Promise<TourTemplateUI[] | null> {
  try {
    return await request<TourTemplateUI[]>("/tours/templates", {
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") return null;
    throw error;
  }
}

export async function getNextSpecialtyTour(
  options: { signal?: AbortSignal } = {}
): Promise<{ next_date: string | null } | null> {
  try {
    const data = await request<{ next_date: string | null }>(
      "/tours/specialty/next",
      { signal: options.signal }
    );
    if (data?.next_date) data.next_date = data.next_date.split("T")[0];
    return data;
  } catch {
    return null;
  }
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
      description: tour.description ?? null,
      shortDescription: tour.short_description ?? null,
      descriptionKey: tour.description_key ?? null,
      inclusions: tour.inclusions,
      requirements: tour.requirements,
      startTime: tour.start_time,
      meetingTime: tour.meeting_time,
      isSpecialEvent: tour.is_special_event,
      start_time: tour.start_time,
      meeting_time: tour.meeting_time,
      is_special_event: tour.is_special_event,
    }));
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") return null;
    throw error;
  }
}

// ==============================================================================
// BOOKING FLOW
// ==============================================================================

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

export async function adminCreateBooking(
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
    const validatedResult = await request("/admin/bookings", {
      method: "POST",
      body: payload,
      includeAuth: true,
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
      { signal: options.signal, schema: BookingStatusResponseSchema }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") return null;
    throw error;
  }
}

// ==============================================================================
// ADMIN ENDPOINTS
// ==============================================================================

export async function getActivityLog(
  options: {
    category?: string;
    search?: string;
    signal?: AbortSignal;
  } = {}
): Promise<ActivityLog[] | null> {
  const params = new URLSearchParams();
  if (options.category && options.category !== "all")
    params.append("category", options.category);
  if (options.search) params.append("search", options.search);

  const queryString = params.toString();
  return await request<ActivityLog[]>(
    `/admin/activity-log${queryString ? `?${queryString}` : ""}`,
    {
      includeAuth: true,
      signal: options.signal,
      schema: ActivityLogResponseSchema,
    }
  );
}

export async function patchTourLogistics(
  tourId: number,
  data: any
): Promise<unknown> {
  return await request(`/admin/tours/${tourId}/logistics`, {
    method: "PATCH",
    body: data,
    includeAuth: true,
  });
}

export async function getEmailSettings(): Promise<EmailSetting[] | null> {
  return await request<EmailSetting[]>("/admin/settings/emails", {
    includeAuth: true,
    schema: EmailSettingsResponseSchema,
  });
}

export async function updateEmailSetting(
  slug: string,
  data: any
): Promise<EmailSetting | null> {
  return await request<EmailSetting>(`/admin/settings/emails/${slug}`, {
    method: "PATCH",
    body: data,
    includeAuth: true,
    schema: EmailSettingSchema,
  });
}

export async function getEmailPreview(
  slug: string,
  options: { signal?: AbortSignal } = {}
): Promise<EmailPreviewResponse | null> {
  try {
    return await request<EmailPreviewResponse>(
      `/admin/settings/emails/${slug}/preview`,
      {
        includeAuth: true,
        signal: options.signal,
        schema: EmailPreviewResponseSchema,
      }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") return null;
    throw error;
  }
}

export async function fetchMonthlySchedule(
  year: number,
  month: number
): Promise<ScheduleResponse | null> {
  return await request<ScheduleResponse>(
    `/admin/schedule?year=${year}&month=${month}`,
    { includeAuth: true, schema: ScheduleResponseSchema }
  );
}

export async function fetchDayManifest(
  dateString: string
): Promise<ManifestResponse | null> {
  return await request<ManifestResponse>(`/admin/manifest/${dateString}`, {
    includeAuth: true,
    schema: ManifestResponseSchema,
  });
}

export async function patchCheckIn(
  bookingId: number,
  status: boolean
): Promise<AdminBookingCheckInResponse | null> {
  return await request<AdminBookingCheckInResponse>(
    `/admin/bookings/${bookingId}/check-in`,
    {
      method: "PATCH",
      body: { checked_in: status },
      includeAuth: true,
      schema: AdminBookingCheckInResponseSchema,
    }
  );
}

export async function cancelBooking(
  bookingId: number,
  reason: string = "Admin manual cancellation"
): Promise<unknown> {
  return await request(`/admin/bookings/${bookingId}/cancel`, {
    method: "POST",
    body: { reason },
    includeAuth: true,
  });
}

export async function cancelTourForWeather(
  tourId: number,
  tourName: string,
  tourDate: string
): Promise<unknown> {
  return await request(`/admin/tours/${tourId}/weather-cancel`, {
    method: "POST",
    body: { tour_name: tourName, tour_date: tourDate },
    includeAuth: true,
  });
}

// ==============================================================================
// UTILS
// ==============================================================================

const captureApiError = (
  error: Error,
  context: { endpoint: string; status: number }
) => {
  if (error.name === "AbortError" || config.isTest) return;
  try {
    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("api_endpoint", context.endpoint);
      if (context.status) scope.setExtra("status", context.status);
      Sentry.captureException(error);
    });
  } catch {}
};

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
