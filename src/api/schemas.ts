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
});

export type Tour = z.infer<typeof TourSchema>;

export const AvailableToursResponseSchema = z.array(TourSchema);
export type AvailableToursResponse = z.infer<
  typeof AvailableToursResponseSchema
>;

export const BookingSessionSchema = z.object({
  currentBooking: z.object({
    uuid: z.string(),
    id: z.number().optional(),
    created_at: z.string(),
    guest_email: z.string().optional(),
  }),
  paymentInfo: z.object({
    qr_code: z.string(),
    qr_code_image: z.string(),
    expires_in: z.number(),
  }),
});

export type BookingSession = z.infer<typeof BookingSessionSchema>;

export const CreateBookingResponseSchema = z.object({
  booking: z.object({
    uuid: z.string(),
    id: z.number().optional(),
    guest_email: z.string().optional(),
    status: z.string().optional(),
    created_at: z.string().optional(),
  }),
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

export const ManifestPassengerSchema = z.object({
  uuid: z.string(),
  name: z.string().nullable().optional(),
  guest_name: z.string().nullable().optional(),
  pax_count: z.number().optional(),
  num_people: z.number().optional(),
  pax: z.number().optional(),
  email: z.string().nullable().optional(),
  guest_email: z.string().nullable().optional(),
  checked_in: z.boolean().default(false),
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

export const DayStatsSchema = z.object({
  booked_count: z.number().default(0),
  capacity: z.number().default(0),
  price: z.number().default(0),
  revenue: z.number().default(0),
  status: z.string().optional(),
});

export const ScheduleResponseSchema = z.record(DayStatsSchema);
export type ScheduleResponse = z.infer<typeof ScheduleResponseSchema>;
