// Simulate Supabase "tours" table with timeSlot for conflict logic
export const tours = [
  {
    id: "dolphin",
    name: "Daybreak Dolphin Bay Encounter",
    timeSlot: "morning",
    duration: "2h",
    price: 50,
    capacity: 10,
    description: "A gentle morning paddle to see dolphins at sunrise.",
    image_url: "img/Vibe_Beach.jpg",
  },
  {
    id: "coastal",
    name: "Coastal Exploration",
    timeSlot: "allDay",
    duration: "6h",
    price: 100,
    capacity: 10,
    description:
      "Explore the coastline, beaches, and reefs throughout the day.",
    image_url: "img/Vibe_Forest.jpg",
  },
  {
    id: "sunset",
    name: "Sunset Lagoon Paddle",
    timeSlot: "evening",
    duration: "2h",
    price: 50,
    capacity: 10,
    description: "End your day with a calm sunset paddle through the lagoon.",
    image_url: "img/Vibe_Beach.jpg",
  },
];
