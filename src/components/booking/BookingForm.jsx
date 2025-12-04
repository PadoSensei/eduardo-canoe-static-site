import React from "react";

export function BookingForm({
  tour,
  selectedDate,
  guestName,
  setGuestName,
  guestEmail,
  setGuestEmail,
  onConfirm,
  onCancel,
  isSubmitting,
}) {
  return (
    <>
      <h3 className="text-2xl font-bold mb-4 text-gray-800">
        Book {tour.name}
      </h3>

      <div className="mb-4">
        <p className="text-gray-600">Date: {selectedDate}</p>
        <p className="text-gray-600">Price: R$ {tour.price.toFixed(2)}</p>
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
          onClick={onConfirm}
          disabled={isSubmitting}
          className="flex-1 bg-[#FF6B6B] hover:bg-[#FF5252] text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Booking..." : "Confirm Booking"}
        </button>
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg shadow-md transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </>
  );
}
