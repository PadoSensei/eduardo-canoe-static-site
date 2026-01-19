/**
 * Gets the current date in YYYY-MM-DD format in the user's local timezone.
 * This ensures consistency across date comparisons.
 * @returns {string} - Date in YYYY-MM-DD format
 */
export const getTodayLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Checks if a date string (YYYY-MM-DD) is in the past.
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {boolean} - True if date is before today
 */
export const isPastDate = (dateString) => {
  const selectedDate = new Date(dateString + "T00:00:00"); // Normalize to midnight
  const today = new Date(getTodayLocalDate() + "T00:00:00");
  return selectedDate < today;
};
