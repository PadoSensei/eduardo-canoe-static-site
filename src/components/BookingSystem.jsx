import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getAvailableTours, createBooking, getBookingStatus } from "../api";
import { useLanguage } from "../context/LanguageContext";
import { bookingTranslations } from "../data/bookingTranslations";
import { PaymentView } from "./booking/PaymentView";
import { SuccessView } from "./booking/SuccessView";
import { BookingForm } from "./booking/BookingForm";

// --- PURE UTILITIES (Stateless) ---
const getTodayLocalDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")}`;
};

const isPastDate = (dateString) => {
  const selectedDate = new Date(dateString + "T00:00:00");
  const today = new Date(getTodayLocalDate() + "T00:00:00");
  return selectedDate < today;
};

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
  const bt = useMemo(
    () => bookingTranslations[language] || bookingTranslations["en"],
    [language]
  );

  // --- 1. STATE INITIALIZATION ---

  // Use "Lazy Initializer" to read localStorage only once on mount
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

  // Transaction State
  const [paymentInfo, setPaymentInfo] = useState(session?.paymentInfo || null);
  const [currentBooking, setCurrentBooking] = useState(
    session?.currentBooking || null
  );
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

  // Resilience State
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const ERROR_THRESHOLD = 5;

  // --- 2. LOGIC HELPERS ---

  const getTourName = useCallback(
    (tourType) => {
      switch (tourType) {
        case "sunrise":
        case "morning":
          return t("card1Title");
        case "full_day":
        case "all_day":
          return t("card2Title");
        case "sunset":
        case "evening":
          return t("card3Title");
        default:
          return "Unknown Tour";
      }
    },
    [t]
  );

  // --- 3. SIDE EFFECTS ---

  // Persistence: Sync state to LocalStorage
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

  // Data Loading: Fetch tours for date
  useEffect(() => {
    let isMounted = true;
    const loadAvailability = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAvailableTours(selectedDate);
        if (isMounted) setAvailableTours(data);
      } catch (err) {
        if (isMounted) setError("LOAD_ERROR");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadAvailability();
    return () => {
      isMounted = false;
    };
  }, [selectedDate, language]);

  // Status Polling Loop
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
            // Refresh list to show updated spots
            const updated = await getAvailableTours(selectedDate);
            setAvailableTours(updated);
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
  ]);

  // --- 4. EVENT HANDLERS ---

  const handleBookTour = async () => {
    if (bookingTourId || !selectedTour) return;

    if (!guestName || !guestEmail) {
      alert(bt.alertMissing);
      return;
    }

    if (isPastDate(selectedDate)) {
      alert(bt.alertPastDate);
      return;
    }

    setBookingTourId(selectedTour.instanceId);
    try {
      const total = selectedTour.price * numPeople;
      const result = await createBooking({
        tourId: selectedTour.instanceId,
        guestName,
        guestEmail,
        numPeople,
        totalPrice: total,
        special_notes: specialNotes,
      });

      if (result.success) {
        setPaymentInfo(result.paymentInfo);
        setCurrentBooking(result.booking);
        setIsConfirmed(false);
      } else {
        alert(`${bt.alertFailed}: ${result.message}`);
      }
    } catch (error) {
      alert(bt.alertError);
    } finally {
      setBookingTourId(null);
    }
  };

  const closeModal = () => {
    localStorage.removeItem("pending_booking");
    setShowBookingModal(false);
    setSelectedTour(null);
    setPaymentInfo(null);
    setCurrentBooking(null);
    setIsConfirmed(false);
    setIsExpired(false);
    setIsFailed(false);
    setConsecutiveErrors(0);
    setGuestName("");
    setGuestEmail("");
    setNumPeople(1);
    setSpecialNotes("");
  };

  const openModal = (tour) => {
    // FRESH check against the current system clock
    if (isPastDate(selectedDate)) {
      alert(bt.alertPastDate);
      return;
    }
    setSelectedTour(tour);
    setNumPeople(1);
    setShowBookingModal(true);
  };

  // --- 5. RENDER HELPERS ---

  const renderTourList = () => {
    if (isLoading)
      return <p className="text-center text-gray-500 py-8">{bt.loading}</p>;
    if (error)
      return <p className="text-center text-red-500 py-8">{bt.errorGeneric}</p>;
    if (availableTours.length === 0)
      return <p className="text-center text-gray-600 py-8">{bt.noTours}</p>;

    const priorityMap = {
      morning: 1,
      sunrise: 1,
      sunset: 2,
      evening: 2,
      full_day: 3,
    };

    return availableTours
      .filter((t) => t.isBookable)
      .sort(
        (a, b) =>
          (priorityMap[a.tourType] || 99) - (priorityMap[b.tourType] || 99)
      )
      .map((tour) => (
        <div
          key={tour.id}
          className="flex flex-col sm:flex-row justify-between items-center p-6 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
        >
          <div className="text-center sm:text-left mb-4 sm:mb-0">
            <h4 className="font-bold text-lg text-gray-800">
              {getTourName(tour.tourType)}
            </h4>
            <div className="text-gray-600 text-sm mt-1 space-y-1">
              <p>
                ⏳ {bt.duration}: {tour.duration || "2h"}
              </p>
              <p>
                🛶 {tour.remaining} {bt.spotsLeft}
              </p>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-xl font-bold text-gray-900 mb-2">
              {bt.pricePrefix} {tour.price.toFixed(2)}
            </p>
            <button
              onClick={() => openModal(tour)}
              className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white font-bold py-2 px-6 rounded-full shadow-md transition-transform hover:-translate-y-0.5"
            >
              {bt.bookBtn}
            </button>
          </div>
        </div>
      ));
  };

  return (
    <section className="py-16 md:py-24 bg-gray-100 min-h-screen">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-2 text-gray-800">
          {bt.title}
        </h2>
        <p className="text-center text-gray-600 mb-12">{bt.subtitle}</p>

        <div className="flex flex-col items-center justify-center mb-8">
          <label
            htmlFor="tour-date-input"
            className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide"
          >
            {bt.selectDateLabel}
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

        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
          {renderTourList()}
        </div>

        {showBookingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
              {isConfirmed ? (
                <SuccessView
                  guestEmail={guestEmail || currentBooking?.guest_email}
                  onClose={closeModal}
                />
              ) : paymentInfo ? (
                <PaymentView
                  paymentInfo={paymentInfo}
                  onClose={closeModal}
                  hasConnectionIssue={consecutiveErrors >= ERROR_THRESHOLD}
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
