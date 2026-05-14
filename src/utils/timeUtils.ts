// src/utils/timeUtils.ts

/**
 * Returns the current date/time adjusted to Pipa (America/Fortaleza)
 */
export const getPipaTime = (): Date => {
  const now = new Date();
  // Using Intl to get the exact string and converting back to a Date object
  const pipaString = now.toLocaleString("en-US", {
    timeZone: "America/Fortaleza",
  });
  return new Date(pipaString);
};

/**
 * Calculates the first valid booking date (YYYY-MM-DD)
 */
export const calculateBookingHorizon = (): string => {
  const pipaNow = getPipaTime();
  const currentHour = pipaNow.getHours();

  // Rule: Today is always closed. Tomorrow closes at 19:00.
  const daysToAdd = currentHour >= 19 ? 2 : 1;

  const horizonDate = new Date(pipaNow);
  horizonDate.setDate(pipaNow.getDate() + daysToAdd);

  const year = horizonDate.getFullYear();
  const month = String(horizonDate.getMonth() + 1).padStart(2, "0");
  const day = String(horizonDate.getDate()).padStart(2, "0");

  const result = `${year}-${month}-${day}`;
  return result;
};

/**
 * Normalizes any date input (string or Date) into a YYYY-MM-DD string
 * for reliable strict equality checks.
 */
export const formatDateForComparison = (date: string | Date | null | undefined): string => {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date.split("T")[0] + "T12:00:00") : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
