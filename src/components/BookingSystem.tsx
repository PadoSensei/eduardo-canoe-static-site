import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as Sentry from "@sentry/react";
import { toast } from "sonner";
import { getAvailableTours, createBooking, getNextSpecialtyTour } from "../api";
import { useLanguage } from "../context/LanguageContext";
import { BookingSessionSchema } from "../api/schemas";
import { handleSessionExpired } from "../utils/sessionUtils";
import { PaymentView } from "./booking/PaymentView";
import { SuccessView } from "./booking/SuccessView";
import { BookingForm } from "./booking/BookingForm";
import { NextFullMoonBanner } from "./booking/NextFullMoonBanner";
import EmptyState from "./common/EmptyState";

// 🟢 PERFORMANCE: Direct path import to keep Speed Index low
import CalendarOff from "lucide-react/dist/esm/icons/calendar-off";

// 🟢 TEMPORAL INTEGRITY: Using the Shoreline Clock (Pipa time)
import { isPastDate } from "../utils/dateUtils";
import { calculateBookingHorizon } from "../utils/timeUtils";

import { formatCurrency } from "../utils/formatters";
import { useBooking } from "../hooks/useBooking";
import type { TourUI } from "@/api/schemas";

function isAbortError(err: unknown): boolean {
  return err instanceof Error && err.name === "AbortError";
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Unknown error";
}

const getStoredSession = (t: (key: string) => string) => {
  try {
    const saved = localStorage.getItem("pending_booking");
    if (!saved) return null;

    const parsed = JSON.parse(saved);
    const result = BookingSessionSchema.safeParse(parsed);

    if (!result.success) {
      console.error("Contract violation in localStorage:", result.error);
      localStorage.removeItem("pending_booking");
      toast.error(t("error_contract_violation"));
      return null;
    }

    return result.data;
  } catch {
    localStorage.removeItem("pending_booking");
    return null;
  }
};

function BookingSystem() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  // Ref to track component mount status for async safety
  const isMounted = useRef(true);

  // --- 1. STATE INITIALIZATION ---
  const [session] = useState(() => getStoredSession(t));
  const [availableTours, setAvailableTours] = useState<TourUI[]>([]);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState(calculateBookingHorizon());
  const [nextFullMoonDate, setNextFullMoonDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showBookingModal, setShowBookingModal] = useState(!!session);
  const [selectedTour, setSelectedTour] = useState<TourUI | null>(null);
  const [bookingTourId, setBookingTourId] = useState<number | null>(null);

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [numPeople, setNumPeople] = useState(1);
  const [specialNotes, setSpecialNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // --- 2. LOGIC HELPERS ---

  const getTourName = useCallback(
    (tourType: string) => {
      const mapping: Record<string, string> = {
        sunrise: "card1Title",
        morning: "card1Title",
        full_day: "card2Title",
        all_day: "card2Title",
        sunset: "card3Title",
        evening: "card3Title",
      };
      const key = mapping[tourType];
      return key ? t(key) : "Unknown Tour";
    },
    [t]
  );

  // --- 3. ASYNC DATA LOADING ---

  const loadNextFullMoon = useCallback(async (signal?: AbortSignal) => {
    try {
      const result = await getNextSpecialtyTour("full_moon_party", { signal });
      if (isMounted.current && result) {
        // 🛡️ IRON SHIELD: Extract next_date string if result is wrapped in an object
        // Although getNextSpecialtyTour now sanitizes, we harden the state update here.
        const dateValue =
          typeof result === "object" && result !== null
            ? (result as any).next_date || (result as any).nextDate
            : result;

        setNextFullMoonDate(dateValue || null);
      }
    } catch (err) {
      console.error("Failed to load next full moon:", err);
    }
  }, []);

  const loadAvailability = useCallback(
    async (signal?: AbortSignal) => {
      if (!isMounted.current) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAvailableTours(selectedDate, { signal });
        if (isMounted.current && (!signal || !signal.aborted)) {
          setAvailableTours(data || []);
        }
      } catch (err: unknown) {
        if (isAbortError(err)) return;
        if (isMounted.current) {
          if (getErrorMessage(err) === "NetworkError") {
            setAvailableTours([]);
          } else {
            setError("LOAD_ERROR");
          }
        }
      } finally {
        if (isMounted.current && (!signal || !signal.aborted))
          setIsLoading(false);
      }
    },
    [selectedDate]
  );

  const {
    currentBooking,
    setCurrentBooking,
    paymentInfo,
    setPaymentInfo,
    isConfirmed,
    setIsConfirmed,
    isExpired,
    isFailed,
    isReaped,
    timeLeft,
    isTimedOut,
    hasConnectionIssue,
    clearBooking,
  } = useBooking(session, selectedDate, setAvailableTours);

  // Lifecycle Management
  useEffect(() => {
    isMounted.current = true;
    const controller = new AbortController();

    loadAvailability(controller.signal);

    return () => {
      isMounted.current = false;
      controller.abort();
    };
  }, [selectedDate, language, loadAvailability]);

  // Discovery Lifecycle (Next Full Moon)
  useEffect(() => {
    const controller = new AbortController();
    loadNextFullMoon(controller.signal);
    return () => controller.abort();
  }, [loadNextFullMoon]);

  const closeModal = useCallback(async () => {
    if (clearBooking) clearBooking();
    setShowBookingModal(false);
    setSelectedTour(null);
    setGuestName("");
    setGuestEmail("");
    setNumPeople(1);
    setSpecialNotes("");
    setAcceptedTerms(false);
    setFormError(null);
    Sentry.setUser(null);
    await loadAvailability();
  }, [clearBooking, loadAvailability]);

  // Modal Escape Key Listener
  useEffect(() => {
    if (!showBookingModal) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showBookingModal, closeModal]);

  // Handle Backend Expiry (Reaped)
  useEffect(() => {
    if (isReaped) {
      handleSessionExpired(navigate);
      closeModal();
    }
  }, [isReaped, closeModal, navigate]);

  // --- 4. EVENT HANDLERS ---

  const handleBookTour = async () => {
    if (isCreatingBooking || bookingTourId || !selectedTour) return;
    setFormError(null);

    if (!acceptedTerms) {
      setFormError(t("errorTerms"));
      return;
    }

    if (!guestName || !guestEmail) {
      setFormError(t("alertMissing"));
      return;
    }

    Sentry.setUser({ email: guestEmail, username: guestName });

    const controller = new AbortController();
    setBookingTourId(selectedTour.instanceId);
    setIsCreatingBooking(true);

    try {
      const total = selectedTour.price * numPeople;
      const result = await createBooking(
        {
          tourId: selectedTour.instanceId,
          guestName,
          guestEmail,
          numPeople,
          totalPrice: total,
          specialNotes,
          acceptedTerms,
        },
        { signal: controller.signal }
      );

      if (isMounted.current && !controller.signal.aborted) {
        if (result && result.success) {
          setPaymentInfo(result.paymentInfo);
          setCurrentBooking(result.booking);
          setIsConfirmed(false);
        } else {
          if (result?.message === "BOOKING_EXPIRED") {
            handleSessionExpired(navigate);
            closeModal();
          } else {
            setFormError(`${t("alertFailed")}: ${result?.message}`);
          }
        }
      }
    } catch (error: unknown) {
      if (isAbortError(error)) return;
      if (isMounted.current) {
        if (getErrorMessage(error) === "BOOKING_EXPIRED") {
          handleSessionExpired(navigate);
          closeModal();
        } else {
          setFormError(t("alertError"));
          Sentry.captureException(
            error instanceof Error ? error : new Error(String(error))
          );
        }
      }
    } finally {
      if (isMounted.current) {
        setBookingTourId(null);
        setIsCreatingBooking(false);
      }
    }
  };

  const openModal = (tour: TourUI) => {
    if (isPastDate(selectedDate)) {
      setFormError(t("alertPastDate"));
      return;
    }
    setFormError(null);
    setSelectedTour(tour);
    setNumPeople(1);
    setShowBookingModal(true);
  };

  // --- 5. RENDER HELPERS ---

  const renderTourList = () => {
    if (isLoading)
      return (
        <div
          className="flex flex-col items-center gap-4 py-16"
          data-testid="loading-state"
        >
          <div className="w-10 h-10 border-4 border-[#FF6B6B] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
            {t("loading")}
          </p>
        </div>
      );

    if (error)
      return (
        <p className="py-12 font-medium text-center text-red-500">
          {t("errorGeneric")}
        </p>
      );

    if (availableTours.length === 0) {
      const horizon = calculateBookingHorizon();
      const isBeforeHorizon = selectedDate < horizon;

      return (
        <EmptyState
          message={
            isBeforeHorizon
              ? t("closed_notice")
              : t("tours_none_available_date")
          }
          icon={CalendarOff}
          actionLabel={isBeforeHorizon ? t("view_next_available") : undefined}
          onAction={
            isBeforeHorizon ? () => setSelectedDate(horizon) : undefined
          }
        />
      );
    }

    return availableTours.map((tour) => (
      <div
        key={tour.id}
        onClick={() => tour.isBookable && openModal(tour)}
        className={`flex flex-col items-center gap-6 p-5 transition-all border-b group last:border-b-0 sm:flex-row ${
          tour.isBookable
            ? "cursor-pointer hover:bg-gray-50/80"
            : "cursor-not-allowed opacity-75 grayscale-[0.5] pointer-events-none select-none"
        }`}
      >
        {/* 1. IMAGE THUMBNAIL - Fixed Aspect Ratio */}
        <div className="w-full h-40 overflow-hidden border border-gray-100 shadow-sm sm:w-48 sm:h-32 shrink-0 rounded-2xl">
          <img
            src={tour.imageUrl || "/img/sunset_pic.webp"}
            alt={tour.name}
            loading="lazy"
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
          />
        </div>

        {/* 2. TOUR INFO - Better Typography */}
        <div className="flex-grow space-y-2 text-center sm:text-left">
          <div className="flex flex-col gap-2 mb-1 sm:flex-row sm:items-center">
            <h4 className="text-2xl font-bold text-teal-950 font-lora">
              {tour.name || getTourName(tour.tourType)}
            </h4>
            {!tour.isBookable && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-tight">
                {t("tour_closed_badge")}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 font-medium text-gray-500 sm:justify-start">
            <span className="flex items-center gap-1.5 text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-600">
              <span className="text-orange-500">⏳</span>{" "}
              {tour.duration || "2h"}
            </span>

            <span className="text-[10px] bg-teal-50 text-teal-700 px-2.5 py-1 rounded-md font-black uppercase tracking-widest border border-teal-100">
              {t("navTours")}
            </span>
          </div>
        </div>

        {/* 3. PRICE & CTA - Clear Visual Hierarchy */}
        <div className="flex flex-row items-center justify-between w-full gap-6 sm:flex-col sm:w-auto sm:items-end sm:justify-center">
          <div className="text-left sm:text-right">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter block mb-[-4px]">
              Total
            </span>
            <p className="text-3xl font-black text-teal-950">
              {formatCurrency(tour.price)}
            </p>
          </div>

          {tour.isBookable ? (
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent double trigger since card is clickable
                openModal(tour);
              }}
              className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white font-black py-3 px-10 rounded-2xl shadow-lg shadow-orange-200 transition-all active:scale-95 group-hover:shadow-orange-300"
            >
              {t("ctaButton")}
            </button>
          ) : (
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                {t("tour_manifest_finalized")}
              </span>
              <button
                disabled
                className="bg-slate-200 text-slate-400 font-black py-3 px-10 rounded-2xl cursor-not-allowed whitespace-nowrap"
              >
                {t("tour_closed_badge")}
              </button>
            </div>
          )}
        </div>
      </div>
    ));
  };

  return (
    <section className="min-h-screen py-16 bg-gray-100 md:py-24">
      <div className="container px-6 mx-auto">
        <h2 className="mb-2 text-3xl font-bold text-center text-gray-800 md:text-4xl font-lora">
          {t("bookingTitle")}
        </h2>
        <p className="mb-12 font-medium text-center text-gray-600">
          {t("bookingSubtitle")}
        </p>

        <div className="flex flex-col items-center justify-center mb-10">
          {formError && !showBookingModal && (
            <div
              role="alert"
              className="w-full max-w-3xl p-4 mb-6 text-red-700 bg-red-100 border-l-4 border-red-500 rounded shadow-sm"
            >
              {formError}
            </div>
          )}

          <div className="flex flex-col items-center w-full max-w-3xl gap-2">
            <label
              htmlFor="tour-date-input"
              className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase"
            >
              {t("selectDateLabel")}
            </label>

            {/* 🟢 PROACTIVE DISCOVERY: Shortcut for high-demand dates */}
            <NextFullMoonBanner
              nextDate={nextFullMoonDate}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />

            <div className="relative group">
              <input
                id="tour-date-input"
                type="date"
                value={selectedDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSelectedDate(e.target.value)
                }
                min={calculateBookingHorizon()}
                className="p-3 bg-white px-6 rounded-xl border border-gray-200 shadow-sm focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none font-bold text-gray-700"
              />
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto overflow-hidden bg-white border border-white shadow-xl rounded-3xl">
          {renderTourList()}
        </div>

        {showBookingModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            role="presentation"
            onClick={closeModal}
          >
            <div
              className={`bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto relative transition-all ${
                isCreatingBooking ? "opacity-90 scale-[0.98]" : ""
              }`}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              onClick={(e) => e.stopPropagation()}
            >
              {/* SUBMIT LOCK OVERLAY */}
              {isCreatingBooking && (
                <div className="absolute inset-0 z-[60] bg-white/40 backdrop-blur-[1px] flex flex-col items-center justify-center rounded-3xl pointer-events-auto">
                  <div className="flex flex-col items-center p-6 bg-white shadow-xl rounded-2xl border border-gray-100 animate-fadeIn">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-widest">
                      {t("btnSubmitting")}
                    </p>
                  </div>
                </div>
              )}

              {isConfirmed ? (
                <SuccessView
                  guestEmail={guestEmail || currentBooking?.guest_email}
                  booking={currentBooking}
                  selectedDate={selectedDate}
                  onClose={closeModal}
                  tourName={
                    selectedTour?.name ||
                    (currentBooking?.tour_name as string) ||
                    getTourName(
                      selectedTour?.tourType || currentBooking?.tour_type || ""
                    )
                  }
                />
              ) : paymentInfo ? (
                <PaymentView
                  paymentInfo={paymentInfo}
                  currentBooking={currentBooking}
                  onClose={closeModal}
                  hasConnectionIssue={hasConnectionIssue}
                  isExpired={isExpired}
                  isFailed={isFailed}
                  isTimedOut={isTimedOut}
                  timeLeft={timeLeft}
                />
              ) : selectedTour ? (
                <BookingForm
                  tour={{
                    ...selectedTour,
                    name:
                      selectedTour.name || getTourName(selectedTour.tourType),
                    shortDescription:
                      t(
                        selectedTour.descriptionKey ||
                          `tour_${selectedTour.tourType}_short`
                      ) || selectedTour.shortDescription,
                  }}
                  selectedDate={selectedDate}
                  guestName={guestName}
                  setGuestName={setGuestName}
                  guestEmail={guestEmail}
                  setGuestEmail={setGuestEmail}
                  numPeople={numPeople}
                  setNumPeople={setNumPeople}
                  specialNotes={specialNotes}
                  setSpecialNotes={setSpecialNotes}
                  onConfirm={handleBookTour}
                  onCancel={closeModal}
                  isSubmitting={!!bookingTourId}
                  error={formError}
                  acceptedTerms={acceptedTerms}
                  setAcceptedTerms={setAcceptedTerms}
                />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default BookingSystem;
