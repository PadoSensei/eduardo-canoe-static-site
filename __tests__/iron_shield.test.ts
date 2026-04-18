import { getAvailableTours } from "@/api";
import { translations } from "@/data/translations";

// Mock dependencies
jest.mock("@/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
    },
  },
}));

describe("API - Iron Shield Resilience (April 18th Case)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    // Silence console logs/errors during tests
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should calculate remaining seats from seats_booked when seats_available is missing", async () => {
    const mockApiResponse = [
      {
        tour_instance_id: 101,
        tour_type: "sunrise",
        display_name: "Sunrise Tour",
        price: 150,
        // seats_available is missing!
        seats_booked: 3,
        capacity: 10,
        is_bookable: true,
        tour_date: "2024-04-18",
        status: "available",
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    const tours = await getAvailableTours("2024-04-18");

    expect(tours).not.toBeNull();
    expect(tours![0].remaining).toBe(7); // 10 - 3
    expect(tours![0].name).toBe("Sunrise Tour");
  });

  it("should prioritize seats_available if both are present", async () => {
    const mockApiResponse = [
      {
        tour_instance_id: 102,
        tour_type: "sunset",
        display_name: "Sunset Tour",
        price: 180,
        seats_available: 5,
        seats_booked: 5,
        capacity: 10,
        is_bookable: true,
        tour_date: "2024-04-18",
        status: "available",
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    const tours = await getAvailableTours("2024-04-18");

    expect(tours![0].remaining).toBe(5);
  });

  it("should fallback to capacity if both seats_available and seats_booked are missing", async () => {
    const mockApiResponse = [
      {
        tour_instance_id: 103,
        tour_type: "full-day",
        display_name: "Full Day",
        price: 300,
        capacity: 12,
        is_bookable: true,
        tour_date: "2024-04-18",
        status: "available",
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    const tours = await getAvailableTours("2024-04-18");

    expect(tours![0].remaining).toBe(12);
  });
});
