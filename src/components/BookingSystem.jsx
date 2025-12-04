// src/components/BookingSystem.jsx
import React, { useState, useEffect } from "react";
import { getAvailableTours, createBooking, getBookingStatus } from "../../api";
import { PaymentView } from "./booking/PaymentView";
import { SuccessView } from "./booking/SuccessView";
import { BookingForm } from "./booking/BookingForm";

function BookingSystem() {
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
  const [bookingTourId, setBookingTourId] = useState(null); // Used for loading state

  // --- Form State ---
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  // --- Transaction State ---
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

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
        setError("Sorry, we couldn't load tour availability.");
      } finally {
        setIsLoading(false);
      }
    };
    loadAvailability();
  }, [selectedDate]);

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
            // Refresh data
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
    // Validation
    if (!guestName || !guestEmail) {
      alert("Please provide name and email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      alert("Invalid email.");
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
        alert(`Booking failed: ${result.message}`);
      }
    } catch (error) {
      alert("Booking failed unexpectedly.");
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
      return <p className="text-center text-gray-500">Loading...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    const bookableTours = availableTours.filter((t) => t.isBookable);
    if (bookableTours.length === 0)
      return <p className="text-center text-gray-600">No tours available.</p>;

    return bookableTours.map((tour) => (
      <div
        key={tour.id}
        className="flex flex-col sm:flex-row justify-between items-center p-4 border-b last:border-b-0"
      >
        <div>
          <h4 className="font-bold text-lg text-gray-800">{tour.name}</h4>
          <p className="text-gray-600">
            {tour.remaining} of {tour.capacity} slots
          </p>
        </div>
        <div className="text-right mt-4 sm:mt-0">
          <p className="text-xl font-semibold">R$ {tour.price.toFixed(2)}</p>
          <button
            onClick={() => openModal(tour)}
            className="mt-2 bg-[#FF6B6B] hover:bg-[#FF5252] text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>
    ));
  };

  return (
    <section className="py-16 md:py-24 bg-gray-100">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
          Check Tour Availability
        </h2>

        {/* Date Input */}
        <div className="flex justify-center mb-8">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-3 rounded-lg border border-gray-300"
          />
        </div>

        {/* List */}
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
          {renderList()}
        </div>

        {/* Modal */}
        {showBookingModal && selectedTour && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
              {isConfirmed ? (
                <SuccessView guestEmail={guestEmail} onClose={closeModal} />
              ) : paymentInfo ? (
                <PaymentView paymentInfo={paymentInfo} onClose={closeModal} />
              ) : (
                <BookingForm
                  tour={selectedTour}
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
