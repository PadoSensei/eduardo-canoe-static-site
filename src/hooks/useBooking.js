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
  const [timeLeft, setTimeLeft] = useState(() => {
    const baseExpires =
      paymentInfo?.expires_in || initialSession?.paymentInfo?.expires_in || 900;
    const createdAtStr =
      currentBooking?.created_at || initialSession?.currentBooking?.created_at;

    if (createdAtStr) {
      // Ensure we parse as UTC to avoid local timezone drift
      const createdAt = new Date(createdAtStr).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - createdAt) / 1000);
      const remaining = baseExpires - elapsed;
      return Math.max(0, remaining);
    }
    return baseExpires;
  });

  const [isTimedOut, setIsTimedOut] = useState(() => timeLeft <= 0);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const consecutiveErrorsRef = useRef(0);

  const isMounted = useRef(true);
  const intervalRef = useRef(null);
  const countdownRef = useRef(null);

  // Countdown Timer logic: Drift-safe calculation relative to server timestamp
  useEffect(() => {
    const shouldRunTimer =
      paymentInfo &&
      !isConfirmed &&
      !isExpired &&
      !isFailed &&
      !isReaped &&
      !isTimedOut &&
      currentBooking?.created_at;

    if (shouldRunTimer) {
      const baseExpires = paymentInfo.expires_in || 900;
      const createdAt = new Date(currentBooking.created_at).getTime();

      countdownRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - createdAt) / 1000);
        const next = Math.max(0, baseExpires - elapsed);

        setTimeLeft(next);

        if (next <= 0) {
          setIsTimedOut(true);
          if (countdownRef.current) clearInterval(countdownRef.current);
        }
      }, 1000);
    } else {
      if (countdownRef.current) clearInterval(countdownRef.current);
    }

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [
    paymentInfo,
    currentBooking?.created_at,
    isConfirmed,
    isExpired,
    isFailed,
    isReaped,
    isTimedOut,
  ]);

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
        consecutiveErrorsRef.current >= 5
      ) {
        if (consecutiveErrorsRef.current >= 5 && intervalRef.current) {
          clearTimeout(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }

      // Guard 2: Final timeout check before API call
      if (timeLeft <= 0) {
        setIsTimedOut(true);
        if (intervalRef.current) clearTimeout(intervalRef.current);
        intervalRef.current = null;
        return;
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

        if (statusData.is_confirmed || statusData.status === "confirmed") {
          console.log("✅ Payment Verified! Switching to Success View...");
          setIsConfirmed(true);
          setPaymentInfo(null);
          localStorage.removeItem("pending_booking");

          // Stop polling immediately upon confirmation
          if (intervalRef.current) clearTimeout(intervalRef.current);
          intervalRef.current = null;

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
          if (intervalRef.current) clearTimeout(intervalRef.current);
          intervalRef.current = null;
        } else {
          // Schedule next check if still pending and not timed out
          if (isMounted.current && !controller.signal.aborted && !isTimedOut) {
            intervalRef.current = setTimeout(checkStatus, 3000);
          }
        }
      } catch (err) {
        // Silent exit for intended cancellations (SIGABRT fix)
        if (err.name === "AbortError") return;

        if (err.message === "BOOKING_EXPIRED") {
          setIsReaped(true);
          localStorage.removeItem("pending_booking");
          if (intervalRef.current) clearTimeout(intervalRef.current);
          intervalRef.current = null;
          return;
        }

        if (isMounted.current) {
          consecutiveErrorsRef.current += 1;
          setConsecutiveErrors(consecutiveErrorsRef.current);

          if (consecutiveErrorsRef.current >= 5) {
            if (intervalRef.current) clearTimeout(intervalRef.current);
            intervalRef.current = null;
          } else {
            // Retry after delay on failure
            intervalRef.current = setTimeout(checkStatus, 3000);
          }
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
      checkStatus(); // Initial check kicks off the recursive chain
    }

    // Cleanup: This is the most critical block for passing tests
    return () => {
      isMounted.current = false;
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
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
    timeLeft,
  ]);

  const clearBooking = useCallback(() => {
    localStorage.removeItem("pending_booking");
    if (intervalRef.current) clearTimeout(intervalRef.current);
    intervalRef.current = null;
    setPaymentInfo(null);
    setCurrentBooking(null);
    setIsConfirmed(false);
    setIsExpired(false);
    setIsFailed(false);
    setIsReaped(false);
    setIsTimedOut(false);
    setTimeLeft(900);
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
    timeLeft,
    setTimeLeft,
    isTimedOut,
    setIsTimedOut,
    consecutiveErrors,
    hasConnectionIssue: consecutiveErrors >= 5,
    clearBooking,
  };
}
