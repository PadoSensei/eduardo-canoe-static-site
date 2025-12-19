import {
  generateBookingsForTour,
  getDayDetails,
} from "../../src/utils/mockData";
import { format } from "date-fns";

describe("Mock Data Generator", () => {
  test("generateBookingsForTour returns consistent data for the same seed", () => {
    // If we pass the same inputs, we must get the exact same "random" passengers
    const seed = 12345;
    const tourId = "tour-1";
    const capacity = 10;

    const run1 = generateBookingsForTour(tourId, capacity, seed);
    const run2 = generateBookingsForTour(tourId, capacity, seed);

    expect(run1.bookedCount).toBe(run2.bookedCount);
    expect(run1.bookings[0].guestName).toBe(run2.bookings[0].guestName);
  });

  test("getDayDetails returns 3 specific tour templates", () => {
    const today = new Date();
    const tours = getDayDetails(today);

    expect(tours).toHaveLength(3);
    expect(tours[0].name).toBe("Morning Mangrove");
    expect(tours[1].name).toBe("Sunset Adventure");
    expect(tours[2].name).toBe("Full Moon Experience");
  });

  test("getDayDetails handles capacity constraints", () => {
    const today = new Date();
    const tours = getDayDetails(today);

    tours.forEach((tour) => {
      expect(tour.booked).toBeLessThanOrEqual(tour.capacity);
      expect(tour.bookings.length).toBeLessThanOrEqual(tour.booked);
    });
  });

  test("Data remains consistent across function calls for same date", () => {
    const date = new Date("2025-12-25");
    const call1 = getDayDetails(date);
    const call2 = getDayDetails(date);

    expect(call1[0].uniqueId).toBe(call2[0].uniqueId);
    expect(call1[0].status).toBe(call2[0].status);
  });
});
