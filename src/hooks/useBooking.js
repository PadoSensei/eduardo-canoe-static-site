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

    console.log("🔍 Booking State:", {
      hasBooking: !!currentBooking,
      hasPayment: !!paymentInfo,
      isConfirmed,
      isExpired,
      isFailed,
      bookingStatus: currentBooking?.status, // ← Check initial status
    });
    const needsPolling =
      currentBooking?.uuid &&
      paymentInfo &&
      !isConfirmed &&
      !isExpired &&
      !isFailed;

    if (needsPolling) {
      // Add immediate first check (don't wait 3 seconds)
      const checkStatus = async () => {
        try {
          console.log("🔄 Polling booking status...", currentBooking.uuid);
          const statusData = await getBookingStatus(currentBooking.uuid);
          console.log("📊 Status response:", statusData);

          setConsecutiveErrors(0);

          if (statusData.status === "confirmed") {
            console.log("✅ CONFIRMED! Transitioning to success view");
            setIsConfirmed(true);
            setPaymentInfo(null);
            localStorage.removeItem("pending_booking");
            clearInterval(intervalId);
            if (setAvailableTours) {
              const updated = await getAvailableTours(selectedDate);
              setAvailableTours(updated);
            }
          } else if (statusData.status === "expired") {
            console.log("⏰ EXPIRED");
            setIsExpired(true);
            localStorage.removeItem("pending_booking");
            clearInterval(intervalId);
          } else if (statusData.status === "failed") {
            console.log("❌ FAILED");
            setIsFailed(true);
            localStorage.removeItem("pending_booking");
            clearInterval(intervalId);
          } else {
            console.log("⏳ Still pending:", statusData.status);
          }
        } catch (err) {
          console.error("❌ Polling error:", err);
          setConsecutiveErrors((prev) => prev + 1);
        }
      };

      // Check immediately, then every 3 seconds
      checkStatus();
      intervalId = setInterval(checkStatus, 3000);
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
