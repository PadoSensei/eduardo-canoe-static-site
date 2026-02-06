import React, { useState, useEffect, useCallback } from "react";
import * as Sentry from "@sentry/react";
import { getAvailableTours, createBooking } from "../api";
import { useLanguage } from "../context/LanguageContext";
import { PaymentView } from "./booking/PaymentView";
import { SuccessView } from "./booking/SuccessView";
import { BookingForm } from "./booking/BookingForm";
import { getTodayLocalDate, isPastDate } from "../utils/dateUtils";
import { useBooking } from "../hooks/useBooking";

const getStoredSession = () => {
  try {
    const saved = localStorage.getItem("pending_booking");
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
};

function BookingSystem() {
  const { language, t } = useLanguage();

  // --- 1. STATE INITIALIZATION ---
  const [session] = useState(() => getStoredSession());

  // Data State
  const [availableTours, setAvailableTours] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getTodayLocalDate());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI / Modal State
  const [showBookingModal, setShowBookingModal] = useState(!!session);
  const [selectedTour, setSelectedTour] = useState(null);
  const [bookingTourId, setBookingTourId] = useState(null);

  // Form State
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [numPeople, setNumPeople] = useState(1);
  const [specialNotes, setSpecialNotes] = useState("");
  const [formError, setFormError] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Booking Logic Hook (Handles polling and persistence)
  const {
    currentBooking,
    setCurrentBooking,
    paymentInfo,
    setPaymentInfo,
    isConfirmed,
    setIsConfirmed,
    isExpired,
    isFailed,
    hasConnectionIssue,
    clearBooking,
  } = useBooking(session, selectedDate, setAvailableTours);

  // --- 2. LOGIC HELPERS ---

  const getTourName = useCallback(
    (tourType) => {
      // Logic moved here directly from the deleted file
      const mapping = {
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

  // --- 3. SIDE EFFECTS ---

  // Extract the loading logic into a reusable function
  const loadAvailability = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAvailableTours(selectedDate);
      setAvailableTours(data);
    } catch (err) {
      setError("LOAD_ERROR");
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  // Close modal on Escape key
  useEffect(() => {
    if (!showBookingModal) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showBookingModal]);

  // Data Loading: Fetch tours for date
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      await loadAvailability();
    };
    if (isMounted) load();
    return () => {
      isMounted = false;
    };
  }, [selectedDate, language, loadAvailability]);

  // --- 4. EVENT HANDLERS ---

  const handleBookTour = async () => {
    if (bookingTourId || !selectedTour) return;
    setFormError(null);

    // LGPD Consent Check
    if (!acceptedTerms) {
      setFormError(t("errorTerms"));
      return;
    }

    // Validation
    if (!guestName || !guestEmail) {
      setFormError(t("alertMissing"));
      return;
    }

    if (isPastDate(selectedDate)) {
      setFormError(t("alertPastDate"));
      return;
    }

    // --- SENIOR OBSERVABILITY ---
    // Identify the user in Sentry so we can debug their specific session if it fails
    Sentry.setUser({ email: guestEmail, username: guestName });

    setBookingTourId(selectedTour.instanceId);
    try {
      const total = selectedTour.price * numPeople;
      const result = await createBooking({
        tourId: selectedTour.instanceId,
        guestName,
        guestEmail,
        numPeople,
        totalPrice: total,
        specialNotes: specialNotes,
        acceptedTerms: acceptedTerms,
      });

      if (result.success) {
        setPaymentInfo(result.paymentInfo);
        setCurrentBooking(result.booking);
        setIsConfirmed(false);
      } else {
        setFormError(`${t("alertFailed")}: ${result.message}`);
      }
    } catch (error) {
      setFormError(t("alertError"));
      Sentry.captureException(error);
    } finally {
      setBookingTourId(null);
    }
  };

  const closeModal = async () => {
    clearBooking();
    setShowBookingModal(false);
    setSelectedTour(null);
    setGuestName("");
    setGuestEmail("");
    setNumPeople(1);
    setSpecialNotes("");
    setAcceptedTerms(false);
    setFormError(null);
    Sentry.setUser(null); // Clear Sentry context on close
    await loadAvailability();
  };

  const openModal = (tour) => {
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
      return <p className="py-8 text-center text-gray-500">{t("loading")}</p>;
    if (error)
      return (
        <p className="py-8 text-center text-red-500">{t("errorGeneric")}</p>
      );
    if (availableTours.length === 0)
      return <p className="py-8 text-center text-gray-600">{t("noTours")}</p>;

    return availableTours
      .filter((t) => t.isBookable)
      .map((tour) => (
        <div
          key={tour.id}
          className="flex flex-col items-center justify-between p-6 transition-colors border-b sm:flex-row last:border-b-0 hover:bg-gray-50"
        >
          <div className="mb-4 text-center sm:text-left sm:mb-0">
            <h4 className="text-lg font-bold text-gray-800">
              {getTourName(tour.tourType)}
            </h4>
            <div className="mt-1 space-y-1 text-sm text-gray-600">
              <p>
                ⏳ {t("duration")}: {tour.duration || "2h"}
              </p>
              <p>
                🛶 {tour.remaining} {t("spotsLeft")}
              </p>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <p className="mb-2 text-xl font-bold text-gray-900">
              {t("pricePrefix")} {tour.price.toFixed(2)}
            </p>
            <button
              onClick={() => openModal(tour)}
              className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white font-bold py-2 px-6 rounded-full shadow-md transition-transform hover:-translate-y-0.5"
            >
              {t("ctaButton")}
            </button>
          </div>
        </div>
      ));
  };

  return (
    <section className="min-h-screen py-16 bg-gray-100 md:py-24">
      <div className="container px-6 mx-auto">
        <h2 className="mb-2 text-3xl font-bold text-center text-gray-800 md:text-4xl">
          {t("bookingTitle")}
        </h2>
        <p className="mb-12 text-center text-gray-600">
          {t("bookingSubtitle")}
        </p>

        <div className="flex flex-col items-center justify-center mb-8">
          {formError && !showBookingModal && (
            <div
              role="alert"
              className="w-full max-w-3xl p-4 mb-4 text-red-700 bg-red-100 border-l-4 border-red-500 rounded shadow-sm"
            >
              {formError}
            </div>
          )}
          <label
            htmlFor="tour-date-input"
            className="mb-2 text-sm font-semibold tracking-wide text-gray-500 uppercase"
          >
            {t("selectDateLabel")}
          </label>
          <input
            id="tour-date-input"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={getTodayLocalDate()}
            className="p-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#FF6B6B] outline-none"
          />
        </div>

        <div className="max-w-3xl mx-auto overflow-hidden bg-white shadow-xl rounded-xl">
          {renderTourList()}
        </div>

        {showBookingModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
            role="presentation"
            onClick={closeModal}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              onClick={(e) => e.stopPropagation()}
            >
              {isConfirmed ? (
                <SuccessView
                  guestEmail={guestEmail || currentBooking?.guest_email}
                  onClose={closeModal}
                />
              ) : paymentInfo ? (
                <PaymentView
                  paymentInfo={paymentInfo}
                  onClose={closeModal}
                  hasConnectionIssue={hasConnectionIssue}
                  isExpired={isExpired}
                  isFailed={isFailed}
                />
              ) : selectedTour ? (
                <BookingForm
                  tour={{
                    ...selectedTour,
                    name: getTourName(selectedTour.tourType),
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
