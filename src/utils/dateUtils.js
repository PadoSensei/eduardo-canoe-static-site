/**
 * Returns today's date in YYYY-MM-DD format based on local time.
 */
export const getTodayLocalDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")}`;
};

/**
 * Checks if a given date string (YYYY-MM-DD) is in the past.
 */
export const isPastDate = (dateString) => {
  const selectedDate = new Date(dateString + "T00:00:00");
  const today = new Date(getTodayLocalDate() + "T00:00:00");
  return selectedDate < today;
};
