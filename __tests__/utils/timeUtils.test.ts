import {
  getPipaHour,
  getPipaToday,
  getMinBookingDate,
  formatFriendlyDate,
} from "../../src/utils/timeUtils";

describe("timeUtils", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const setTime = (isoString: string) => {
    jest.setSystemTime(new Date(isoString));
  };

  test("getPipaHour returns the correct hour in America/Fortaleza", () => {
    // 2023-10-24T22:00:00Z is 19:00 in America/Fortaleza (UTC-3)
    setTime("2023-10-24T22:00:00Z");
    expect(getPipaHour()).toBe(19);

    // 2023-10-24T12:00:00Z is 09:00 in America/Fortaleza
    setTime("2023-10-24T12:00:00Z");
    expect(getPipaHour()).toBe(9);
  });

  test("getPipaToday returns the correct date in America/Fortaleza", () => {
    // 2023-10-24T01:00:00Z is 2023-10-23T22:00:00 in America/Fortaleza
    setTime("2023-10-24T01:00:00Z");
    expect(getPipaToday()).toBe("2023-10-23");

    // 2023-10-24T04:00:00Z is 2023-10-24T01:00:00 in America/Fortaleza
    setTime("2023-10-24T04:00:00Z");
    expect(getPipaToday()).toBe("2023-10-24");
  });

  test("getMinBookingDate follows the 19:00 lock rule", () => {
    // Case 1: Before 19:00 (e.g., 18:59)
    // 2023-10-24T21:59:00Z is 18:59 in Pipa
    setTime("2023-10-24T21:59:00Z");
    expect(getMinBookingDate()).toBe("2023-10-25"); // Tomorrow

    // Case 2: At 19:00
    // 2023-10-24T22:00:00Z is 19:00 in Pipa
    setTime("2023-10-24T22:00:00Z");
    expect(getMinBookingDate()).toBe("2023-10-26"); // Day after tomorrow

    // Case 3: After 19:00 (e.g., 23:00)
    // 2023-10-25T02:00:00Z is 23:00 on Oct 24 in Pipa
    setTime("2023-10-25T02:00:00Z");
    expect(getMinBookingDate()).toBe("2023-10-26"); // Day after tomorrow
  });

  test("formatFriendlyDate localizes correctly", () => {
    const date = "2023-10-24"; // A Tuesday

    expect(formatFriendlyDate(date, "en")).toContain("Tuesday");
    expect(formatFriendlyDate(date, "en")).toContain("October");
    expect(formatFriendlyDate(date, "en")).toContain("24");

    const ptResult = formatFriendlyDate(date, "pt").toLowerCase();
    expect(ptResult).toContain("terça");
    expect(ptResult).toContain("outubro");
  });
});
