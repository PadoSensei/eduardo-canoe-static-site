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

/**
 * IRON SHIELD: Centralized request wrapper.
 * Handles URL sanitization, Auth-gate bypassing, and Forensic Error Mapping.
 */
async function request<T>(
  endpoint: string,
  options: RequestOptions<T> = {}
): Promise<T> {
  const { method = "GET", body, includeAuth = false, signal, schema } = options;

  let url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  // URL Hardening: Remove double-slashes and trailing slashes before query params
  url = url.replace(/([^:])\/\/+/g, "$1/");
  url = url.replace(/\/(\?|$)/, "$1");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (includeAuth) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    } else if (
      !config.isProduction &&
      (config.isTest || import.meta.env.VITE_SKIP_AUTH === "true")
    ) {
      headers["Authorization"] = "Bearer bypass-token";
    } else {
      throw new Error("NOT_AUTHENTICATED");
    }
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!response.ok) {
    const rawResponseBody = await response.text().catch(() => "N/A");
    const errorData = (() => {
      try {
        return JSON.parse(rawResponseBody);
      } catch {
        return {};
      }
    })();

    /**
     * SENIOR FIX: Transparency Logic
     * If there is no 'detail' from the backend, show the raw response in dev/test
     * so we can see the "is not iterable" error directly in the test output.
     */
    let message =
      errorData.detail ||
      (config.isProduction ? "An unexpected error occurred." : rawResponseBody);

    const isBookingEndpoint =
      endpoint.includes("/bookings") && !endpoint.includes("/admin");

    // Semantic Mapping: Convert raw statuses to developer-friendly error codes
    if (
      isBookingEndpoint &&
      (response.status === 404 ||
        (response.status === 400 && message.toLowerCase().includes("expired")))
    ) {
      message = "BOOKING_EXPIRED";
    } else if (response.status === 404 && !isBookingEndpoint) {
      message = "NetworkError";
    }

    // UX Guard: Only show toasts if not in a test environment to avoid DOM pollution
    if (!config.isTest) {
      toast.error(message);
    }

    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  const data: unknown = await response.json();
  return schema ? schema.parse(data) : (data as T);
}

/**
 * --- PUBLIC LOGISTICS & DISCOVERY ---
 */

export async function getTourTemplates(
  options: { signal?: AbortSignal } = {}
): Promise<TourTemplateUI[]> {
  const data = await request<any[]>("/tour-templates", {
    ...options,
    schema: TourTemplatesResponseSchema,
  });

  return data.map((template) => ({
    id: template.id,
    tourType: template.name,
    name: template.display_name,
    price: template.price,
    duration: template.duration ?? "2h",
    imageUrl: template.image_url ?? "",
    description: template.description ?? null,
    shortDescription: template.short_description ?? null,
    inclusions: template.inclusions || [],
    requirements: template.requirements || [],
    startTime: template.default_start_time,
    meetingTime: template.default_meeting_time,
    isSpecialEvent: template.is_specialty,
  }));
}

export const fetchLogisticsMetadata = getTourTemplates;

export async function getAvailableTours(
  date: string,
  options: { signal?: AbortSignal } = {}
): Promise<TourUI[]> {
  const validatedData = await request(`/tours/available?tour_date=${date}`, {
    ...options,
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
    inclusions: tour.inclusions || [],
    requirements: tour.requirements || [],
    startTime: tour.start_time,
    meetingTime: tour.meeting_time,
    isSpecialEvent: tour.is_special_event,
  }));
}

export async function getNextSpecialtyTour(
  options: { signal?: AbortSignal } = {}
): Promise<{ next_date: string | null } | null> {
  const data = await request<{ next_date: string | null }>(
    "/tours/specialty/next",
    options
  );
  if (data?.next_date) {
    data.next_date = data.next_date.split("T")[0];
  }
  return data;
}

/**
 * --- GUEST BOOKING FLOW ---
 */

export async function createBooking(
  bookingData: any,
  options: { signal?: AbortSignal } = {}
): Promise<any> {
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
    return { success: false, message: (error as Error).message };
  }
}

export async function getBookingStatus(
  uuid: string,
  options: { signal?: AbortSignal } = {}
): Promise<BookingStatusResponse> {
  return await request<BookingStatusResponse>(`/bookings/status/${uuid}`, {
    ...options,
    schema: BookingStatusResponseSchema,
  });
}

/**
 * --- ADMIN COMMAND CENTER ---
 */

export async function fetchDayManifest(
  dateString: string,
  options: { signal?: AbortSignal } = {}
): Promise<ManifestResponse> {
  return await request<ManifestResponse>(`/admin/manifest/${dateString}`, {
    ...options,
    includeAuth: true,
    schema: ManifestResponseSchema,
  });
}

export async function patchTourLogistics(
  tourId: number,
  data: any
): Promise<any> {
  return await request(`/admin/tours/${tourId}/logistics`, {
    method: "PATCH",
    body: data,
    includeAuth: true,
  });
}

export async function cancelBooking(
  bookingId: number,
  reason: string = "Admin manual cancellation"
): Promise<any> {
  return await request(`/admin/bookings/${bookingId}/cancel`, {
    method: "POST",
    body: { reason },
    includeAuth: true,
  });
}

export async function patchCheckIn(
  bookingId: number,
  status: boolean
): Promise<any> {
  return await request(`/admin/bookings/${bookingId}/check-in`, {
    method: "PATCH",
    body: { checked_in: status },
    includeAuth: true,
    schema: AdminBookingCheckInResponseSchema,
  });
}

export async function fetchMonthlySchedule(
  year: number,
  month: number
): Promise<ScheduleResponse> {
  return await request<ScheduleResponse>(
    `/admin/schedule?year=${year}&month=${month}`,
    {
      includeAuth: true,
      schema: ScheduleResponseSchema,
    }
  );
}

export async function getActivityLog(
  options: { category?: string; search?: string } = {}
): Promise<ActivityLog[]> {
  const params = new URLSearchParams();
  if (options.category && options.category !== "all")
    params.append("category", options.category);
  if (options.search) params.append("search", options.search);

  return await request<ActivityLog[]>(
    `/admin/activity-log?${params.toString()}`,
    {
      includeAuth: true,
      schema: ActivityLogResponseSchema,
    }
  );
}

export async function getEmailSettings(): Promise<EmailSetting[]> {
  return await request<EmailSetting[]>("/admin/settings/emails", {
    includeAuth: true,
    schema: EmailSettingsResponseSchema,
  });
}

export async function updateEmailSetting(
  slug: string,
  data: any
): Promise<EmailSetting> {
  return await request<EmailSetting>(`/admin/settings/emails/${slug}`, {
    method: "PATCH",
    body: data,
    includeAuth: true,
    schema: EmailSettingSchema,
  });
}

export async function getEmailPreview(
  slug: string
): Promise<EmailPreviewResponse> {
  return await request<EmailPreviewResponse>(`/admin/emails/preview/${slug}`, {
    includeAuth: true,
    schema: EmailPreviewResponseSchema,
  });
}

export async function cancelTourForWeather(
  tourId: number,
  tourName: string,
  tourDate: string
): Promise<any> {
  return await request(`/admin/tours/${tourId}/weather-cancel`, {
    method: "POST",
    body: { tour_name: tourName, tour_date: tourDate },
    includeAuth: true,
  });
}

/**
 * FORENSIC UTILITIES
 */
const captureApiError = (
  error: Error,
  context: { endpoint: string; status: number }
) => {
  if (error.name === "AbortError" || config.isTest) return;
  try {
    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("api_endpoint", context.endpoint);
      scope.setExtra("status", context.status);
      Sentry.captureException(error);
    });
  } catch {}
};
