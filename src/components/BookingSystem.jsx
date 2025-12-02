// src/components/BookingSystem.jsx

import React, { useState, useEffect } from "react";
import { getAvailableTours, createBooking } from "../../api";

function BookingSystem() {
  const [availableTours, setAvailableTours] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingTourId, setBookingTourId] = useState(null);

  // Form state for guest information
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);

  useEffect(() => {
    const loadAvailability = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Updated function name
        const data = await getAvailableTours(selectedDate);
        setAvailableTours(data);
      } catch (err) {
        console.error("Failed to fetch availability:", err);
        setError(
          "Sorry, we couldn't load tour availability. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadAvailability();
  }, [selectedDate]);

  const handleBookTour = async (tour) => {
    console.log("Initiating booking for tour:", tour);

    // Validate guest information
    if (!guestName || !guestEmail) {
      alert("Please provide your name and email address.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail)) {
      alert("Please provide a valid email address.");
      return;
    }

    setBookingTourId(tour.id);

    try {
      // Updated function call with new signature
      const result = await createBooking({
        tourId: tour.instanceId,
        guestName: guestName,
        guestEmail: guestEmail,
        numPeople: 1, // You can make this dynamic with a quantity selector
        totalPrice: tour.price * 1,
      });

      if (result.success) {
        alert(
          `Successfully booked ${tour.name}!\n\nBooking ID: ${result.booking.uuid}\n\nPlease check your email for payment instructions.`
        );

        // Reset form
        setGuestName("");
        setGuestEmail("");
        setShowBookingForm(false);
        setSelectedTour(null);

        // Refresh availability
        const updatedTours = await getAvailableTours(selectedDate);
        setAvailableTours(updatedTours);
      } else {
        alert(`Booking failed: ${result.message}`);
      }
    } catch (error) {
      console.error("An unexpected error occurred during booking:", error);
      alert("Booking failed due to an unexpected error. Please try again.");
    } finally {
      setBookingTourId(null);
    }
  };

  const openBookingForm = (tour) => {
    setSelectedTour(tour);
    setShowBookingForm(true);
  };

  const closeBookingForm = () => {
    setShowBookingForm(false);
    setSelectedTour(null);
    setGuestName("");
    setGuestEmail("");
  };

  const renderAvailability = () => {
    if (isLoading) {
      return (
        <p className="text-center text-gray-500">Loading availability...</p>
      );
    }

    if (error) {
      return <p className="text-center text-red-500">{error}</p>;
    }

    // Filter for bookable tours using the correct property name
    const bookableTours = availableTours.filter((tour) => tour.isBookable);

    if (bookableTours.length === 0) {
      return (
        <p className="text-center text-gray-600">
          No tours available for this date.
        </p>
      );
    }

    return bookableTours.map((tour) => (
      <div
        key={tour.id}
        className="flex flex-col sm:flex-row justify-between items-center p-4 border-b last:border-b-0"
      >
        <div>
          <h4 className="font-bold text-lg text-gray-800">{tour.name}</h4>
          <p className="text-gray-600">
            {tour.remaining} of {tour.capacity} slots remaining
          </p>
          <p className="text-sm text-gray-500">Duration: {tour.duration}</p>
        </div>
        <div className="mt-4 sm:mt-0 text-right">
          <p className="text-xl font-semibold">R$ {tour.price.toFixed(2)}</p>
          {bookingTourId === tour.id ? (
            <button
              disabled
              className="mt-2 bg-gray-400 text-white font-bold py-2 px-4 rounded-lg shadow-md cursor-not-allowed"
            >
              Booking...
            </button>
          ) : (
            <button
              onClick={() => openBookingForm(tour)}
              className="mt-2 bg-[#FF6B6B] hover:bg-[#FF5252] text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors"
            >
              Book Now
            </button>
          )}
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

        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-8">
          <label htmlFor="booking-date" className="font-semibold text-gray-700">
            Select Date:
          </label>
          <input
            type="date"
            id="booking-date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
          />
        </div>

        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
          {renderAvailability()}
        </div>

        {/* Booking Form Modal */}
        {showBookingForm && selectedTour && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">
                Book {selectedTour.name}
              </h3>

              <div className="mb-4">
                <p className="text-gray-600">Date: {selectedDate}</p>
                <p className="text-gray-600">
                  Price: R$ {selectedTour.price.toFixed(2)}
                </p>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="guest-name"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Your Name *
                </label>
                <input
                  type="text"
                  id="guest-name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="guest-email"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Your Email *
                </label>
                <input
                  type="email"
                  id="guest-email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleBookTour(selectedTour)}
                  disabled={bookingTourId === selectedTour.id}
                  className="flex-1 bg-[#FF6B6B] hover:bg-[#FF5252] text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {bookingTourId === selectedTour.id
                    ? "Booking..."
                    : "Confirm Booking"}
                </button>
                <button
                  onClick={closeBookingForm}
                  disabled={bookingTourId === selectedTour.id}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg shadow-md transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default BookingSystem;
