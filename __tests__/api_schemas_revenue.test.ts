import { DayStatsSchema, ScheduleResponseSchema } from "@/api/schemas";

describe("API Schemas - Dashboard Revenue", () => {
  describe("DayStatsSchema", () => {
    test("validates a complete day stats object", () => {
      const data = {
        booked_count: 5,
        capacity: 10,
        price: 150,
        revenue: 750,
        status: "available",
      };
      const result = DayStatsSchema.parse(data);
      expect(result).toEqual(data);
    });

    test("provides defaults for missing fields", () => {
      const result = DayStatsSchema.parse({});
      expect(result).toEqual({
        booked_count: 0,
        capacity: 0,
        price: 0,
        revenue: 0,
        status: "available",
      });
    });
  });

  describe("ScheduleResponseSchema", () => {
    test("validates a full month schedule", () => {
      const data = {
        "2024-05-01": {
          booked_count: 2,
          capacity: 10,
          price: 100,
          revenue: 200,
        },
        "2024-05-02": {
          booked_count: 8,
          capacity: 10,
          price: 100,
          revenue: 800,
        },
      };
      const result = ScheduleResponseSchema.parse(data);
      expect(result).toEqual({
        "2024-05-01": {
          booked_count: 2,
          capacity: 10,
          price: 100,
          revenue: 200,
          status: "available",
        },
        "2024-05-02": {
          booked_count: 8,
          capacity: 10,
          price: 100,
          revenue: 800,
          status: "available",
        },
      });
    });
  });
});
