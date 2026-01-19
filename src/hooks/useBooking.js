import { useState, useEffect, useCallback } from "react";
import { getBookingStatus, getAvailableTours } from "../api";

export function useBooking(initialSession, selectedDate, setAvailableTours) {
  const [currentBooking, setCurrentBooking] = useState(
    initialSession?.currentBooking || null
  );
  const [paymentInfo, setPaymentInfo] = useState(
    initialSession?.paymentInfo || null
  );
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);

  const ERROR_THRESHOLD = 5;

  // Persistence
  useEffect(() => {
    if (
      currentBooking &&
      paymentInfo &&
      !isConfirmed &&
      !isExpired &&
      !isFailed
    ) {
      localStorage.setItem(
        "pending_booking",
        JSON.stringify({ currentBooking, paymentInfo })
      );
    }
  }, [currentBooking, paymentInfo, isConfirmed, isExpired, isFailed]);

  // Polling
  useEffect(() => {
    let intervalId;
    const needsPolling =
      currentBooking?.uuid &&
      paymentInfo &&
      !isConfirmed &&
      !isExpired &&
      !isFailed;

    if (needsPolling) {
      intervalId = setInterval(async () => {
        try {
          const statusData = await getBookingStatus(currentBooking.uuid);
          setConsecutiveErrors(0);

          if (statusData.status === "confirmed") {
            setIsConfirmed(true);
            setPaymentInfo(null);
            localStorage.removeItem("pending_booking");
            clearInterval(intervalId);
            if (setAvailableTours) {
              const updated = await getAvailableTours(selectedDate);
              setAvailableTours(updated);
            }
          } else if (statusData.status === "expired") {
            setIsExpired(true);
            localStorage.removeItem("pending_booking");
            clearInterval(intervalId);
          } else if (statusData.status === "failed") {
            setIsFailed(true);
            localStorage.removeItem("pending_booking");
            clearInterval(intervalId);
          }
        } catch (err) {
          setConsecutiveErrors((prev) => prev + 1);
        }
      }, 3000);
    }
    return () => clearInterval(intervalId);
  }, [
    currentBooking,
    paymentInfo,
    isConfirmed,
    isExpired,
    isFailed,
    selectedDate,
    setAvailableTours,
  ]);

  const clearBooking = useCallback(() => {
    localStorage.removeItem("pending_booking");
    setPaymentInfo(null);
    setCurrentBooking(null);
    setIsConfirmed(false);
    setIsExpired(false);
    setIsFailed(false);
    setConsecutiveErrors(0);
  }, []);

  return {
    currentBooking,
    setCurrentBooking,
    paymentInfo,
    setPaymentInfo,
    isConfirmed,
    setIsConfirmed,
    isExpired,
    setIsExpired,
    isFailed,
    setIsFailed,
    consecutiveErrors,
    hasConnectionIssue: consecutiveErrors >= ERROR_THRESHOLD,
    clearBooking,
  };
}
