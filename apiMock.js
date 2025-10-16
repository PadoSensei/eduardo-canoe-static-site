// apiMock.js
import { tours } from "./mockData.js";

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Simulated in-memory database
let mockBookings = {}; // { "YYYY-MM-DD": { tour_id: bookedCount } }

// Get all tours
export async function getTours() {
  await delay(300);
  return tours;
}

// Get availability for a specific date
export async function getAvailability(date) {
  await delay(500);

  if (!mockBookings[date]) mockBookings[date] = {};
  const dayBookings = mockBookings[date];

  // ✅ FIX: Check if a timeSlot has ANY bookings (not just fully booked)
  const hasAnyBooking = (tour) => (dayBookings[tour.id] || 0) > 0;

  // Collect all timeSlots that have at least one booking
  const bookedTimeSlots = tours.reduce((acc, tour) => {
    if (hasAnyBooking(tour)) acc.push(tour.timeSlot);
    return acc;
  }, []);

  return tours.map((tour) => {
    let available = true;
    const bookedCount = dayBookings[tour.id] || 0;
    const remaining = tour.capacity - bookedCount;

    // Conflict logic based on timeSlot
    switch (tour.timeSlot) {
      case "morning":
      case "evening":
        // Morning/evening unavailable if all-day has any bookings
        if (bookedTimeSlots.includes("allDay")) available = false;
        break;
      case "allDay":
        // All-day unavailable if morning OR evening has any bookings
        if (
          bookedTimeSlots.includes("morning") ||
          bookedTimeSlots.includes("evening")
        )
          available = false;
        break;
    }

    // Also mark unavailable if this specific tour is fully booked
    if (remaining <= 0) available = false;

    return {
      tour_id: tour.id,
      date,
      capacity: tour.capacity,
      booked_count: bookedCount,
      available,
      remaining,
    };
  });
}

// Book a tour
export async function bookTour(date, tourId, quantity = 1) {
  await delay(300);

  if (!mockBookings[date]) mockBookings[date] = {};
  if (!mockBookings[date][tourId]) mockBookings[date][tourId] = 0;

  const tour = tours.find((t) => t.id === tourId);
  if (!tour) return { success: false, message: "Tour not found" };

  // Get availability for this date
  const availability = await getAvailability(date);
  const tourAvailability = availability.find((a) => a.tour_id === tourId);

  if (!tourAvailability.available) {
    return {
      success: false,
      message:
        "This tour is unavailable due to conflicts or it is fully booked.",
    };
  }

  if (tourAvailability.remaining < quantity) {
    return {
      success: false,
      message: `Only ${tourAvailability.remaining} spot(s) left for this tour.`,
    };
  }

  // Book the tour
  mockBookings[date][tourId] += quantity;
  return { success: true };
}

// For dev/debug: reset everything
export function resetMockBookings() {
  mockBookings = {};
}
