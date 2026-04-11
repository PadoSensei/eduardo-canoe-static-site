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
  const [isReaped, setIsReaped] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(() => {
    if (initialSession?.currentBooking?.created_at) {
      const createdAt = new Date(
        initialSession.currentBooking.created_at
      ).getTime();
      const now = new Date().getTime();
      return now - createdAt > 10 * 60 * 1000;
    }
    return false;
  });
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const consecutiveErrorsRef = useRef(0);

  const isMounted = useRef(true);
  const intervalRef = useRef(null);

  // Persistence: Save pending bookings to localStorage
  useEffect(() => {
    if (
      currentBooking &&
      paymentInfo &&
      !isConfirmed &&
      !isExpired &&
      !isFailed &&
      !isTimedOut
    ) {
      localStorage.setItem(
        "pending_booking",
        JSON.stringify({ currentBooking, paymentInfo })
      );
    }
  }, [
    currentBooking,
    paymentInfo,
    isConfirmed,
    isExpired,
    isFailed,
    isTimedOut,
  ]);

  // Polling Lifecycle
  useEffect(() => {
    isMounted.current = true;
    const controller = new AbortController();

    const checkStatus = async () => {
      // Guard 1: Immediate exit if unmounted or aborted before starting
      if (
        !currentBooking?.uuid ||
        controller.signal.aborted ||
        !isMounted.current ||
        isTimedOut ||
        consecutiveErrors >= 5
      )
        return;

      // Check for 10-minute timeout
      if (currentBooking.created_at) {
        const createdAt = new Date(currentBooking.created_at).getTime();
        const now = new Date().getTime();
        const tenMinutes = 10 * 60 * 1000;

        if (now - createdAt > tenMinutes) {
          setIsTimedOut(true);
          if (intervalRef.current) clearInterval(intervalRef.current);
          return;
        }
      }

      try {
        const statusData = await getBookingStatus(currentBooking.uuid, {
          signal: controller.signal,
        });

        // Guard 2: Exit if the component unmounted while waiting for the network
        if (!isMounted.current || controller.signal.aborted || !statusData)
          return;

        consecutiveErrorsRef.current = 0;
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

        if (err.message === "BOOKING_EXPIRED") {
          setIsReaped(true);
          localStorage.removeItem("pending_booking");
          if (intervalRef.current) clearInterval(intervalRef.current);
          return;
        }

        if (isMounted.current) {
          consecutiveErrorsRef.current += 1;
          setConsecutiveErrors(consecutiveErrorsRef.current);
        }
      }
    };

    // Derive polling necessity
    const shouldPoll =
      currentBooking?.uuid &&
      paymentInfo &&
      !isConfirmed &&
      !isExpired &&
      !isFailed &&
      !isReaped &&
      !isTimedOut &&
      consecutiveErrorsRef.current < 5;

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
    // Dependency Note: We re-run if the UUID changes, completion states reset, or timeout/error thresholds are hit
  }, [
    currentBooking?.uuid,
    currentBooking?.created_at,
    isConfirmed,
    isExpired,
    isFailed,
    isReaped,
    isTimedOut,
    selectedDate,
    paymentInfo,
    setAvailableTours,
  ]);

  const clearBooking = useCallback(() => {
    localStorage.removeItem("pending_booking");
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPaymentInfo(null);
    setCurrentBooking(null);
    setIsConfirmed(false);
    setIsExpired(false);
    setIsFailed(false);
    setIsReaped(false);
    setIsTimedOut(false);
    consecutiveErrorsRef.current = 0;
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
    isReaped,
    setIsReaped,
    isTimedOut,
    setIsTimedOut,
    consecutiveErrors,
    hasConnectionIssue: consecutiveErrors >= 5,
    clearBooking,
  };
}
