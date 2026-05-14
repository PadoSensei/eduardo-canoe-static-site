import { formatDateForComparison } from "../../src/utils/timeUtils";

describe("timeUtils - formatDateForComparison", () => {
  test("formats string YYYY-MM-DD correctly", () => {
    expect(formatDateForComparison("2026-05-31")).toBe("2026-05-31");
  });

  test("formats ISO string correctly by stripping time", () => {
    expect(formatDateForComparison("2026-05-31T20:00:00Z")).toBe("2026-05-31");
  });

  test("formats Date object correctly", () => {
    const date = new Date(2026, 4, 31); // May 31st (month is 0-indexed)
    expect(formatDateForComparison(date)).toBe("2026-05-31");
  });

  test("returns empty string for null/undefined", () => {
    expect(formatDateForComparison(null)).toBe("");
    expect(formatDateForComparison(undefined)).toBe("");
  });

  test("handles object wrapping correctly", () => {
    expect(formatDateForComparison({ next_date: "2026-05-31" })).toBe(
      "2026-05-31"
    );
    expect(formatDateForComparison({ nextDate: "2026-05-31" })).toBe(
      "2026-05-31"
    );
  });
});
