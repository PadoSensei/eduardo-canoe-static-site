// src/hooks/useBooking.js
import { useState, useEffect, useCallback, useRef } from "react";
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

  const isMounted = useRef(true);
  const intervalRef = useRef(null);

  // Persistence: Save pending bookings to localStorage
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

  // Polling Lifecycle
  useEffect(() => {
    isMounted.current = true;
    const controller = new AbortController();

    const checkStatus = async () => {
      // Guard 1: Immediate exit if unmounted or aborted before starting
      if (
        !currentBooking?.uuid ||
        controller.signal.aborted ||
        !isMounted.current
      )
        return;

      try {
        const statusData = await getBookingStatus(currentBooking.uuid, {
          signal: controller.signal,
        });

        // Guard 2: Exit if the component unmounted while waiting for the network
        if (!isMounted.current || controller.signal.aborted || !statusData)
          return;

        setConsecutiveErrors(0);

        if (statusData.status === "confirmed") {
          setIsConfirmed(true);
          setPaymentInfo(null);
          localStorage.removeItem("pending_booking");

          // Stop polling immediately upon confirmation
          if (intervalRef.current) clearInterval(intervalRef.current);

          // Refresh the parent's tour list so seats update immediately
          if (setAvailableTours) {
            const updated = await getAvailableTours(selectedDate, {
              signal: controller.signal,
            });
            // Guard 3: Final check before updating parent state
            if (isMounted.current && !controller.signal.aborted && updated) {
              setAvailableTours(updated);
            }
          }
        } else if (
          statusData.status === "expired" ||
          statusData.status === "failed"
        ) {
          statusData.status === "expired"
            ? setIsExpired(true)
            : setIsFailed(true);
          localStorage.removeItem("pending_booking");
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch (err) {
        // Silent exit for intended cancellations (SIGABRT fix)
        if (err.name === "AbortError") return;

        if (isMounted.current) {
          setConsecutiveErrors((prev) => prev + 1);
        }
      }
    };

    // Derive polling necessity
    const shouldPoll =
      currentBooking?.uuid &&
      paymentInfo &&
      !isConfirmed &&
      !isExpired &&
      !isFailed;

    if (shouldPoll) {
      checkStatus(); // Initial check
      intervalRef.current = setInterval(checkStatus, 3000);
    }

    // Cleanup: This is the most critical block for passing tests
    return () => {
      isMounted.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      controller.abort(); // Force-close any open network sockets
    };
    // Dependency Note: We only re-run if the UUID changes or completion states reset
  }, [currentBooking?.uuid, isConfirmed, isExpired, isFailed, selectedDate]);

  const clearBooking = useCallback(() => {
    localStorage.removeItem("pending_booking");
    if (intervalRef.current) clearInterval(intervalRef.current);
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
    hasConnectionIssue: consecutiveErrors >= 5,
    clearBooking,
  };
}
