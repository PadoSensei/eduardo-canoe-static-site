import React, { useState, useEffect } from "react";
import { getAvailableTours, createBooking, getBookingStatus } from "../api";
import { useLanguage } from "../context/LanguageContext";
import { bookingTranslations } from "../data/bookingTranslations";
import { PaymentView } from "./booking/PaymentView";
import { SuccessView } from "./booking/SuccessView";
import { BookingForm } from "./booking/BookingForm";

function BookingSystem() {
  // 1. Get GLOBAL translations (t) and current language
  const { language, t } = useLanguage();

  // 2. Get BOOKING specific translations (bt)
  const bt = bookingTranslations[language] || bookingTranslations["en"];

  // --- Data State ---
  const [availableTours, setAvailableTours] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- UI State ---
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [bookingTourId, setBookingTourId] = useState(null);

  // --- Form State ---
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  // --- Transaction State ---
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // --- HELPER: Map Database Type to Existing Translation Keys ---
  const getTourName = (tourType) => {
    switch (tourType) {
      case "sunrise":
      case "morning": // Handle legacy data
        return t("card1Title"); // "Sunrise Tour" / "Tour Sunrise"

      case "full_day":
      case "all_day": // Handle legacy data
        return t("card2Title"); // "Full Day Tour" / "Tour Dia Completo"

      case "sunset":
      case "evening": // Handle legacy data
        return t("card3Title"); // "Sunset Tour" / "Tour Sunset"

      default:
        return "Unknown Tour"; // Fallback
    }
  };

  // 1. Fetch Availability
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
  }, [selectedDate, language]); // Re-run if language changes

  // 2. Poll Status
  useEffect(() => {
    let intervalId;
    if (currentBooking?.uuid && paymentInfo && !isConfirmed) {
      intervalId = setInterval(async () => {
        try {
          const statusData = await getBookingStatus(currentBooking.uuid);
          if (statusData.status === "confirmed") {
            setIsConfirmed(true);
            setPaymentInfo(null);
            clearInterval(intervalId);
            const updatedTours = await getAvailableTours(selectedDate);
            setAvailableTours(updatedTours);
          }
        } catch (err) {
          /* silent fail */
        }
      }, 3000);
    }
    return () => clearInterval(intervalId);
  }, [currentBooking, paymentInfo, isConfirmed, selectedDate]);

  // --- Handlers ---
  const handleBookTour = async () => {
    if (!guestName || !guestEmail) {
      alert(bt.alertMissing); // Use 'bt' for booking translations
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      alert(bt.alertEmail);
      return;
    }

    setBookingTourId(selectedTour.id);
    try {
      const result = await createBooking({
        tourId: selectedTour.instanceId,
        guestName,
        guestEmail,
        numPeople: 1,
        totalPrice: selectedTour.price * 1,
      });

      if (result.success) {
        setPaymentInfo(result.paymentInfo);
        setCurrentBooking(result.booking);
        setIsConfirmed(false);
        setGuestName("");
        setGuestEmail("");
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
    setShowBookingModal(false);
    setSelectedTour(null);
    setPaymentInfo(null);
    setCurrentBooking(null);
    setIsConfirmed(false);
    setGuestName("");
    setGuestEmail("");
  };

  const openModal = (tour) => {
    setSelectedTour(tour);
    setShowBookingModal(true);
  };

  // --- Render Helpers ---
  const renderList = () => {
    if (isLoading)
      return <p className="text-center text-gray-500 py-8">{bt.loading}</p>;
    if (error)
      return <p className="text-center text-red-500 py-8">{bt.errorGeneric}</p>;

    const priorityMap = {
      sunrise: 1, // First
      morning: 1, // (Legacy)

      sunset: 2, // Second
      evening: 2, // (Legacy)

      full_day: 3, // Third
      all_day: 3, // (Legacy)
    };

    const bookableTours = availableTours
      .filter((t) => t.isBookable)
      .sort((a, b) => {
        const orderA = priorityMap[a.tourType] || 99; // Default to end if unknown
        const orderB = priorityMap[b.tourType] || 99;
        return orderA - orderB;
      });

    if (bookableTours.length === 0)
      return <p className="text-center text-gray-600 py-8">{bt.noTours}</p>;

    return bookableTours.map((tour) => (
      <div
        key={tour.id}
        className="flex flex-col sm:flex-row justify-between items-center p-6 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
      >
        <div className="text-center sm:text-left mb-4 sm:mb-0">
          {/* Use the mapping function here */}
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

        {/* Date Input */}
        <div className="flex flex-col items-center justify-center mb-8">
          <label className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
            {bt.selectDateLabel}
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#FF6B6B] outline-none"
          />
        </div>

        {/* List */}
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
          {renderList()}
        </div>

        {/* Modal */}
        {showBookingModal && selectedTour && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
              {isConfirmed ? (
                <SuccessView guestEmail={guestEmail} onClose={closeModal} />
              ) : paymentInfo ? (
                <PaymentView paymentInfo={paymentInfo} onClose={closeModal} />
              ) : (
                <BookingForm
                  // IMPORTANT: Inject the translated name into the object passed to the form
                  tour={{
                    ...selectedTour,
                    name: getTourName(selectedTour.tourType),
                  }}
                  selectedDate={selectedDate}
                  guestName={guestName}
                  setGuestName={setGuestName}
                  guestEmail={guestEmail}
                  setGuestEmail={setGuestEmail}
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
