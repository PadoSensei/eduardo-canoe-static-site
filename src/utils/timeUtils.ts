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
