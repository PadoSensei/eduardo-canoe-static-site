import { format } from "date-fns";

// --- DETERMINISTIC UTILS ---

// A simple pseudo-random number generator that returns 0-1 based on a seed
// This replaces Math.random() so our data is consistent for testing
const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Get a random integer between min and max using a seed
const getSeededInt = (min, max, seed) => {
  return Math.floor(seededRandom(seed) * (max - min + 1) + min);
};

// Get a random item from an array using a seed
const getSeededItem = (arr, seed) => {
  const index = Math.floor(seededRandom(seed) * arr.length);
  return arr[index];
};

const NAMES = [
  "Alice Smith",
  "Bob Jones",
  "Charlie Day",
  "Diana Prince",
  "Evan Wright",
  "Fiona Gallagher",
  "George Michael",
  "Hannah Montana",
  "Ian Malcolm",
  "Julia Stiles",
  "Kevin Hart",
  "Laura Croft",
];

const NOTES = [
  "Vegetarian meal request",
  "Needs XL lifejacket",
  "",
  "",
  "Bringing a dog",
  "Celebrating anniversary",
  "",
  "Elderly passenger - needs assistance",
  "",
  "",
  "Allergic to peanuts",
];

// --- GENERATOR ---

export const generateBookingsForTour = (tourId, capacity, seedInput) => {
  // Convert string seeds to numbers if necessary
  let seed =
    typeof seedInput === "string"
      ? seedInput.split("").reduce((a, b) => a + b.charCodeAt(0), 0)
      : seedInput;

  // 1. Determine Status & Density
  // We use the seed to decide if it's cancelled or how full it is
  const cancelChance = seededRandom(seed++);
  const isCancelled = cancelChance > 0.95; // 5% chance of cancellation

  // Density factor (0.1 to 0.9)
  const density = (seed % 10) / 10 || 0.5;

  // Determine base number of booking groups (not pax)
  const maxGroups = Math.floor(capacity / 2); // Roughly assume 2 pax per group
  const groupCount = isCancelled ? 0 : Math.floor(maxGroups * density);

  const bookings = [];
  let currentBookedCount = 0;

  for (let i = 0; i < groupCount; i++) {
    // Increment seed for every decision so data varies per passenger

    // Determine Party Size (1-4)
    const partySize = getSeededInt(1, 4, seed++);

    // Stop if we exceed capacity
    if (currentBookedCount + partySize > capacity) break;

    // Determine Attributes
    const nameIndex = getSeededInt(0, NAMES.length - 1, seed++);
    const note = getSeededItem(NOTES, seed++);
    const isPaid = seededRandom(seed++) > 0.3;

    bookings.push({
      id: `b-${tourId}-${i}`,
      guestName: NAMES[nameIndex] + (i > NAMES.length ? ` ${i}` : ""),
      email: `guest${i}@example.com`,
      phone: `+55 84 9999-${getSeededInt(1000, 9999, seed++)}`,
      partySize: partySize,
      paymentStatus: isPaid ? "paid" : "pending",
      notes: note,
    });

    currentBookedCount += partySize;
  }

  return {
    isCancelled,
    bookedCount: currentBookedCount,
    bookings,
  };
};

// Main function to get the full day object
export const getDayDetails = (date) => {
  const dateStr = format(date, "yyyy-MM-dd");

  // Create a numeric hash from the date string to use as a master seed
  const dayHash = dateStr.split("").reduce((a, b) => a + b.charCodeAt(0), 0);

  const templates = [
    { id: 1, name: "Morning Mangrove", time: "09:00", capacity: 15 },
    { id: 2, name: "Sunset Adventure", time: "16:00", capacity: 20 },
    { id: 3, name: "Full Moon Experience", time: "20:00", capacity: 12 },
  ];

  const tours = templates.map((tpl) => {
    // We combine dayHash + tpl.id so each tour on the same day is different
    const tourSeed = dayHash + tpl.id * 100;

    const { bookings, isCancelled, bookedCount } = generateBookingsForTour(
      dateStr,
      tpl.capacity,
      tourSeed
    );

    return {
      ...tpl,
      uniqueId: `${dateStr}-${tpl.id}`,
      status: isCancelled
        ? "cancelled"
        : bookedCount >= tpl.capacity
        ? "sold_out"
        : "available",
      booked: bookedCount,
      bookings: bookings,
    };
  });

  return tours;
};
