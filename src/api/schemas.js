import { z } from "zod";

export const TourSchema = z.object({
  tour_instance_id: z.number(),
  tour_type: z.string(),
  display_name: z.string(),
  price: z.number(),
  seats_available: z.number(),
  is_bookable: z.boolean(),
  capacity: z.number().optional().default(10),
  duration: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  tour_date: z.string(),
  description: z.string().optional().nullable(),
  short_description: z.string().optional().nullable(),
  inclusions: z.array(z.string()).optional().default([]),
  requirements: z.array(z.string()).optional().default([]),
});

export const AvailableToursResponseSchema = z.array(TourSchema);

export const BookingSessionSchema = z.object({
  currentBooking: z.object({
    uuid: z.string(),
    id: z.number().optional(),
    created_at: z.string(), // Critical for timeout logic
    guest_email: z.string().optional(),
  }),
  paymentInfo: z.object({
    qr_code: z.string(),
    qr_code_image: z.string(),
    expires_in: z.number(),
  }),
});

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

export const BookingStatusResponseSchema = z.object({
  status: z.string(),
  is_confirmed: z.boolean(),
  // Add other fields if needed, currently getBookingStatus just returns raw json
});

export const TourTemplateSchema = z.object({
  id: z.number(),
  name: z.string(),
  display_name: z.string(),
  price: z.number(),
  duration: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  short_description: z.string().optional().nullable(),
  inclusions: z.array(z.string()).optional().default([]),
  requirements: z.array(z.string()).optional().default([]),
});

export const TourTemplatesResponseSchema = z.array(TourTemplateSchema);

export const ManifestPassengerSchema = z.object({
  uuid: z.string(),
  name: z.string().optional().nullable(),
  guest_name: z.string().optional().nullable(),
  pax_count: z.number().optional(),
  num_people: z.number().optional(),
  pax: z.number().optional(),
  email: z.string().optional().nullable(),
  guest_email: z.string().optional().nullable(),
  checked_in: z.boolean().optional().default(false),
  payment_transaction_id: z.string().optional().nullable(),
});

export const ManifestTourSchema = z.object({
  tour_id: z.number().optional(),
  id: z.number().optional(),
  display_name: z.string(),
  status: z.string(),
  capacity: z.number(),
  booked_count: z.number(),
  passengers: z.array(ManifestPassengerSchema).optional().default([]),
});

export const ManifestResponseSchema = z.array(ManifestTourSchema);
