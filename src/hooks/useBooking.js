import { useState, useEffect } from "react";
import { getAvailableTours, getBookingStatus } from "../api";

/**
 * Custom hook to manage tour availability and booking status polling.
 */
export const useBooking = (selectedDate, language) => {
  const [availableTours, setAvailableTours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch availability when date or language changes
  useEffect(() => {
    const loadAvailability = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAvailableTours(selectedDate);
        setAvailableTours(data);
      } catch (err) {
        console.error(err);
        setError("LOAD_ERROR");
      } finally {
        setIsLoading(false);
      }
    };
    loadAvailability();
  }, [selectedDate, language]);

  // Polling for booking status
  const startPolling = (bookingUuid, paymentInfo, onConfirmed) => {
    let intervalId = setInterval(async () => {
      try {
        const statusData = await getBookingStatus(bookingUuid);
        if (statusData.status === "confirmed") {
          onConfirmed();
          clearInterval(intervalId);
          // Refresh availability after confirmation
          const updatedTours = await getAvailableTours(selectedDate);
          setAvailableTours(updatedTours);
        }
      } catch (err) {
        /* silent fail */
      }
    }, 3000);

    return () => clearInterval(intervalId);
  };

  return {
    availableTours,
    setAvailableTours,
    isLoading,
    error,
    startPolling,
  };
};
