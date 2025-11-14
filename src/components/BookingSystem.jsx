// src/components/BookingSystem.jsx

import React, { useState, useEffect } from "react";
// --- CHANGE 1: We now import the specific function from your API file. ---
// Make sure this path is correct relative to the current file.
import { getAvailabilityAndDetails } from "../../apiMock.js";

function BookingSystem() {
  // --- No changes needed for state management. This structure is solid. ---
  const [availableTours, setAvailableTours] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- CHANGE 2: The data fetching logic is updated to use your async function. ---
  useEffect(() => {
    // We create a separate async function inside the effect.
    // This is the standard pattern for using async/await within useEffect.
    const loadAvailability = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Call your API function and wait for the result.
        const data = await getAvailabilityAndDetails(selectedDate);
        setAvailableTours(data); // Store the fetched tours in our state.
      } catch (err) {
        // If the API function throws an error, we catch it here.
        console.error("Failed to fetch availability:", err);
        setError(
          "Sorry, we couldn't load tour availability. Please try again later."
        );
      } finally {
        // This runs whether the fetch succeeded or failed.
        setIsLoading(false);
      }
    };

    loadAvailability(); // Call the async function.
  }, [selectedDate]); // The dependency array is unchanged. This effect still re-runs when the date changes.

  // --- CHANGE 3: The rendering logic is updated to match your API data structure. ---
  const renderAvailability = () => {
    if (isLoading) {
      return (
        <p className="text-center text-gray-500">Loading availability...</p>
      );
    }
    if (error) {
      return <p className="text-center text-red-500">{error}</p>;
    }

    // --- THIS FILTER IS NOW CORRECT ---
    // It filters based on the `is_bookable` property we are passing from the API.
    const trulyAvailableTours = availableTours.filter(
      (tour) => tour.is_bookable
    );

    if (trulyAvailableTours.length === 0) {
      return (
        <p className="text-center text-gray-600">
          No tours available for this date.
        </p>
      );
    }

    // --- THIS RENDER LOGIC IS NOW CORRECT ---
    // It uses the exact property names from our mapping: name, remaining, capacity, etc.
    return trulyAvailableTours.map((tour) => (
      <div
        key={tour.id}
        className="flex flex-col sm:flex-row justify-between items-center p-4 border-b last:border-b-0"
      >
        <div>
          <h4 className="font-bold text-lg text-gray-800">{tour.name}</h4>

          {/* This will now display correctly, e.g., "6 of 10 slots remaining" */}
          <p className="text-gray-600">
            {tour.remaining} of {tour.capacity} slots remaining
          </p>

          {/* This will now display the duration from your database */}
          {/* <p className="text-gray-600">Duration: {tour.duration}</p> */}
        </div>
        <div className="mt-4 sm:mt-0 text-right">
          <p className="text-xl font-semibold">R$ {tour.price.toFixed(2)}</p>
          <button
            onClick={() => alert(`Booking ${tour.name}!`)}
            className="mt-2 bg-[#FF6B6B] hover:bg-[#FF5252] text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>
    ));
  };

  // --- No changes needed for the main JSX structure. ---
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
            className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
          />
        </div>

        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
          {renderAvailability()}
        </div>
      </div>
    </section>
  );
}

export default BookingSystem;
