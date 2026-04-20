import { z } from "zod";

export const TourSchema = z.object({
  tour_instance_id: z.number(),
  tour_type: z.string(),
  display_name: z.string(),
  price: z.number(),
  seats_available: z.number(),
  is_bookable: z.boolean(),
  capacity: z.number().default(10),
  duration: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  tour_date: z.string(),
  description: z.string().nullable().optional(),
  short_description: z.string().nullable().optional(),
  inclusions: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  /** Tour instance lifecycle (e.g. available, cancelled). */
  status: z.string().default("available"),
});

export type Tour = z.infer<typeof TourSchema>;

export const AvailableToursResponseSchema = z.array(TourSchema);
export type AvailableToursResponse = z.infer<
  typeof AvailableToursResponseSchema
>;

/** Client-side shape after mapping `Tour` from GET /tours/available (camelCase + composite id). */
export const TourUISchema = z.object({
  id: z.string(),
  instanceId: z.number(),
  tourType: z.string(),
  name: z.string(),
  price: z.number(),
  remaining: z.number(),
  isBookable: z.boolean(),
  capacity: z.number(),
  duration: z.string(),
  imageUrl: z.string(),
  tourDate: z.string(),
  description: z.string().nullable(),
  shortDescription: z.string().nullable(),
  inclusions: z.array(z.string()),
  requirements: z.array(z.string()),
});

export type TourUI = z.infer<typeof TourUISchema>;

export const BookingSchema = z.object({
  uuid: z.string(),
  id: z.number().optional(),
  display_id: z.string().optional(), // 8-character professional code
  guest_email: z.string().optional(),
  status: z.string().optional(),
  created_at: z.string().optional(),
  checked_in: z.boolean().default(false),
});

export type Booking = z.infer<typeof BookingSchema>;

export const BookingSessionSchema = z.object({
  currentBooking: BookingSchema.extend({
    created_at: z.string(), // Required for session
  }),
  paymentInfo: z.object({
    qr_code: z.string(),
    qr_code_image: z.string(),
    expires_in: z.number(),
  }),
});

export type BookingSession = z.infer<typeof BookingSessionSchema>;

export const CreateBookingResponseSchema = z.object({
  booking: BookingSchema,
  payment_info: z.object({
    qr_code: z.string(),
    qr_code_image: z.string(),
    expires_in: z.number(),
  }),
});

export type CreateBookingResponse = z.infer<typeof CreateBookingResponseSchema>;

export const BookingStatusResponseSchema = z.object({
  status: z.string(),
  is_confirmed: z.boolean().default(false),
});

export type BookingStatusResponse = z.infer<typeof BookingStatusResponseSchema>;

export const TourTemplateSchema = z.object({
  id: z.number(),
  name: z.string(),
  display_name: z.string(),
  price: z.number(),
  duration: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  short_description: z.string().nullable().optional(),
  inclusions: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
});

export type TourTemplate = z.infer<typeof TourTemplateSchema>;

export const TourTemplatesResponseSchema = z.array(TourTemplateSchema);
export type TourTemplatesResponse = z.infer<typeof TourTemplatesResponseSchema>;

/** Client-side shape after mapping `TourTemplate` from GET /tour-templates. */
export const TourTemplateUISchema = z.object({
  id: z.number(),
  tourType: z.string(),
  name: z.string(),
  price: z.number(),
  duration: z.string().nullable(),
  imageUrl: z.string().nullable(),
  description: z.string().nullable(),
  shortDescription: z.string().nullable(),
  inclusions: z.array(z.string()),
  requirements: z.array(z.string()),
});

export type TourTemplateUI = z.infer<typeof TourTemplateUISchema>;

export const ManifestPassengerSchema = z.object({
  id: z.number(),
  uuid: z.string(),
  display_id: z.string().optional(),
  name: z.string().nullable().optional(),
  guest_name: z.string().nullable().optional(),
  pax_count: z.number().optional(),
  num_people: z.number().optional(),
  pax: z.number().optional(),
  email: z.string().nullable().optional(),
  guest_email: z.string().nullable().optional(),
  checked_in: z.boolean().default(false),
  total_price: z.number().optional(),
  payment_transaction_id: z.string().nullable().optional(),
});

export type ManifestPassenger = z.infer<typeof ManifestPassengerSchema>;

export const ManifestTourSchema = z.object({
  tour_id: z.number().optional(),
  id: z.number().optional(),
  display_name: z.string(),
  status: z.string(),
  capacity: z.number(),
  booked_count: z.number(),
  passengers: z.array(ManifestPassengerSchema).default([]),
});

export type ManifestTour = z.infer<typeof ManifestTourSchema>;

export const ManifestResponseSchema = z.array(ManifestTourSchema);
export type ManifestResponse = z.infer<typeof ManifestResponseSchema>;

/** JSON from PATCH /admin/bookings/{id}/check-in (backend `Booking` model). */
export const AdminBookingCheckInResponseSchema = z.object({
  id: z.number(),
  tour_id: z.number(),
  guest_name: z.string(),
  guest_email: z.string(),
  num_people: z.number(),
  total_price: z.number(),
  special_notes: z.string().nullable(),
  accepted_terms: z.boolean(),
  language: z.string(),
  uuid: z.string(),
  status: z.string(),
  booking_date: z.string(),
  confirmation_sent: z.boolean(),
  checked_in: z.boolean(),
  terms_accepted_at: z.string().nullable(),
  privacy_policy_version: z.string().nullable(),
  payment_transaction_id: z.string().nullable(),
  paid_at: z.string().nullable(),
  cancelled_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type AdminBookingCheckInResponse = z.infer<
  typeof AdminBookingCheckInResponseSchema
>;

export const DayStatsSchema = z.object({
  booked_count: z.number().default(0),
  capacity: z.number().default(0),
  price: z.number().default(0),
  revenue: z.number().default(0),
  /** Aggregated day status from admin schedule (e.g. available, cancelled). */
  status: z.string().default("available"),
});

export const ScheduleResponseSchema = z.record(DayStatsSchema);
export type ScheduleResponse = z.infer<typeof ScheduleResponseSchema>;

export const EmailSettingSchema = z.object({
  slug: z.string(),
  display_name: z.string(),
  description: z.string(),
  is_enabled: z.boolean(),
  scheduled_time: z.string().nullable(), // HH:mm:ss or null
});

export type EmailSetting = z.infer<typeof EmailSettingSchema>;

export const EmailSettingsResponseSchema = z.array(EmailSettingSchema);
export type EmailSettingsResponse = z.infer<typeof EmailSettingsResponseSchema>;

export const ActivityLogSchema = z.object({
  id: z.number(),
  timestamp: z.string(), // ISO string
  event_type: z.string(), // slug
  display_id: z.string(), // 8-char string
  guest_name: z.string(),
  description: z.string(),
});

export type ActivityLog = z.infer<typeof ActivityLogSchema>;

export const ActivityLogResponseSchema = z.array(ActivityLogSchema);
export type ActivityLogResponse = z.infer<typeof ActivityLogResponseSchema>;

export const EmailPreviewResponseSchema = z.object({
  html: z.string(),
});

export type EmailPreviewResponse = z.infer<typeof EmailPreviewResponseSchema>;
