/**
 * Utility for handling Pipa's "Forward-Only" temporal rules.
 * Anchored to America/Fortaleza (GMT-3).
 */

/**
 * Returns the current hour in Pipa (0-23).
 */
export const getPipaHour = (): number => {
  return parseInt(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Fortaleza",
      hour: "numeric",
      hour12: false,
    }).format(new Date())
  );
};

/**
 * Returns today's date in Pipa as YYYY-MM-DD.
 */
export const getPipaToday = (): string => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Fortaleza",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
};

/**
 * Calculates the minimum allowable booking date based on the "19:00 Lock".
 * - If before 19:00: minDate is Tomorrow.
 * - If after 19:00: minDate is Day After Tomorrow.
 */
export const getMinBookingDate = (): string => {
  const hour = getPipaHour();
  const todayStr = getPipaToday();
  const [year, month, day] = todayStr.split("-").map(Number);

  // We use local Date object for addition, but only for the final YYYY-MM-DD format
  const date = new Date(year, month - 1, day);

  if (hour >= 19) {
    date.setDate(date.getDate() + 2);
  } else {
    date.setDate(date.getDate() + 1);
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/**
 * Formats a YYYY-MM-DD date into a friendly localized string.
 * e.g., "Monday, May 12th" or "Segunda-feira, 12 de maio"
 */
export const formatFriendlyDate = (
  dateString: string,
  lang: string
): string => {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  const locales: Record<string, string> = {
    en: "en-US",
    pt: "pt-BR",
    es: "es-ES",
    fr: "fr-FR",
  };

  return new Intl.DateTimeFormat(locales[lang] || "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
};

/**
 * Checks if a date is today in Pipa.
 */
export const isPipaToday = (dateString: string): boolean => {
  return dateString === getPipaToday();
};

/**
 * Checks if a date is in the past relative to Pipa today.
 */
export const isPipaPast = (dateString: string): boolean => {
  return dateString < getPipaToday();
};
