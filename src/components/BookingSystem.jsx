import React, { useState, useEffect, useRef } from "react";
import { getAvailableTours, createBooking, getBookingStatus } from "../api";
import { useLanguage } from "../context/LanguageContext";
import { bookingTranslations } from "../data/bookingTranslations";
import { PaymentView } from "./booking/PaymentView";
import { SuccessView } from "./booking/SuccessView";
import { BookingForm } from "./booking/BookingForm";

const getTodayLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isPastDate = (dateString) => {
  const selectedDate = new Date(dateString + "T00:00:00");
  const today = new Date(getTodayLocalDate() + "T00:00:00");
  return selectedDate < today;
};

function BookingSystem() {
  const { language, t } = useLanguage();
  const bt = bookingTranslations[language] || bookingTranslations["en"];

  const [availableTours, setAvailableTours] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getTodayLocalDate());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [bookingTourId, setBookingTourId] = useState(null);

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [numPeople, setNumPeople] = useState(1);
  const [specialNotes, setSpecialNotes] = useState("");

  const [paymentInfo, setPaymentInfo] = useState(null);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const ERROR_THRESHOLD = 5;

  const intervalRef = useRef(null);
  const setupTimeoutRef = useRef(null);

  const getTourName = (tourType) => {
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
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    if (isPastDate(newDate)) {
      alert(bt.alertPastDate || "Cannot book tours for past dates.");
      setSelectedDate(getTodayLocalDate());
      return;
    }
    setSelectedDate(newDate);
  };

  useEffect(() => {
    const loadAvailability = async () => {
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
    };
    loadAvailability();
  }, [selectedDate, language]);

  // Payment polling effect
  useEffect(() => {
    // Clear any existing setup timeout
    if (setupTimeoutRef.current) {
      clearTimeout(setupTimeoutRef.current);
      setupTimeoutRef.current = null;
    }

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only poll if we have payment info and haven't finished
    if (!currentBooking?.uuid || !paymentInfo || isConfirmed || isExpired) {
      return;
    }

    // Delay interval creation by one tick
    // This allows tests to switch to fake timers before the interval is created
    setupTimeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(async () => {
        try {
          const statusData = await getBookingStatus(currentBooking.uuid);
          setConsecutiveErrors(0);

          if (statusData.status === "confirmed") {
            setIsConfirmed(true);
            setPaymentInfo(null);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            const updatedTours = await getAvailableTours(selectedDate);
            setAvailableTours(updatedTours);
          } else if (statusData.status === "expired") {
            setIsExpired(true);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }
        } catch (err) {
          console.warn("Polling failed. Retrying...");
          setConsecutiveErrors((prev) => prev + 1);
        }
      }, 3000);
    }, 0);

    return () => {
      if (setupTimeoutRef.current) {
        clearTimeout(setupTimeoutRef.current);
        setupTimeoutRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [currentBooking, paymentInfo, isConfirmed, isExpired, selectedDate]);

  const handleBookTour = async () => {
    if (!guestName || !guestEmail) {
      alert(bt.alertMissing);
      return;
    }
    setBookingTourId(selectedTour.id);
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
        setIsExpired(false);
        setConsecutiveErrors(0);
        setGuestName("");
        setGuestEmail("");
        setNumPeople(1);
        setSpecialNotes("");
      } else {
        alert(`${bt.alertFailed}: ${result.message}`);
      }
    } catch (error) {
      alert(bt.alertError || "An error occurred.");
    } finally {
      setBookingTourId(null);
    }
  };

  const closeModal = () => {
    if (setupTimeoutRef.current) {
      clearTimeout(setupTimeoutRef.current);
      setupTimeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setShowBookingModal(false);
    setSelectedTour(null);
    setPaymentInfo(null);
    setCurrentBooking(null);
    setIsConfirmed(false);
    setIsExpired(false);
    setConsecutiveErrors(0);
    setGuestName("");
    setGuestEmail("");
    setSpecialNotes("");
    setNumPeople(1);
  };

  const openModal = (tour) => {
    if (isPastDate(selectedDate)) return;
    setSelectedTour(tour);
    setNumPeople(1);
    setShowBookingModal(true);
  };

  const renderList = () => {
    if (isLoading)
      return <p className="text-center text-gray-500 py-8">{bt.loading}</p>;
    if (error)
      return <p className="text-center text-red-500 py-8">{bt.errorGeneric}</p>;

    const priorityMap = {
      morning: 1,
      sunrise: 1,
      sunset: 2,
      evening: 2,
      full_day: 3,
    };
    const bookableTours = availableTours
      .filter((t) => t.isBookable)
      .sort(
        (a, b) =>
          (priorityMap[a.tourType] || 99) - (priorityMap[b.tourType] || 99)
      );

    if (bookableTours.length === 0)
      return <p className="text-center text-gray-600 py-8">{bt.noTours}</p>;

    return bookableTours.map((tour) => (
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
          <label className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
            {bt.selectDateLabel}
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            min={getTodayLocalDate()}
            className="p-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#FF6B6B] outline-none"
          />
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
          {renderList()}
        </div>

        {showBookingModal && selectedTour && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
              {isConfirmed ? (
                <SuccessView guestEmail={guestEmail} onClose={closeModal} />
              ) : paymentInfo ? (
                <PaymentView
                  paymentInfo={paymentInfo}
                  onClose={closeModal}
                  hasConnectionIssue={consecutiveErrors >= ERROR_THRESHOLD}
                  isExpired={isExpired}
                />
              ) : (
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
                  isSubmitting={bookingTourId === selectedTour.id}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default BookingSystem;
