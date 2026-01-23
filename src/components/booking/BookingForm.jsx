import React from "react";
import { Link } from "react-router-dom"; // Required for legal links
import { useLanguage } from "../../context/LanguageContext";

export function BookingForm({
  tour,
  selectedDate,
  guestName,
  setGuestName,
  guestEmail,
  setGuestEmail,
  numPeople,
  setNumPeople,
  specialNotes,
  setSpecialNotes,
  acceptedTerms, // NEW PROP
  setAcceptedTerms, // NEW PROP
  onConfirm,
  onCancel,
  isSubmitting,
  error,
}) {
  const { t } = useLanguage();

  const totalPrice = tour.price * numPeople;

  const handlePeopleChange = (e) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) val = 1;
    if (val > tour.remaining) val = tour.remaining;
    setNumPeople(val);
  };

  return (
    <>
      <h3 id="modal-title" className="text-2xl font-bold mb-4 text-gray-800">
        {t("bookTitle")} <span className="text-[#FF6B6B]">{tour.name}</span>
      </h3>

      {error && (
        <div
          role="alert"
          className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium"
        >
          {error}
        </div>
      )}

      {/* Booking Summary Card */}
      <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
        <p className="text-gray-600 flex justify-between">
          <span className="font-semibold">{t("labelDate")}:</span>
          <span>{selectedDate}</span>
        </p>
        <p className="text-gray-600 flex justify-between mt-1">
          <span className="font-semibold">Price per person:</span>
          <span>
            {t("pricePrefix")} {tour.price.toFixed(2)}
          </span>
        </p>
        <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center text-lg">
          <span className="font-bold text-gray-800">Total:</span>
          <span className="font-bold text-[#FF6B6B]">
            {t("pricePrefix")} {totalPrice.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Guest Count */}
      <div className="mb-4">
        <label
          htmlFor="num-people"
          className="block text-gray-700 font-semibold mb-2"
        >
          Number of Guests (Max {tour.remaining})
        </label>
        <input
          type="number"
          id="num-people"
          min="1"
          max={tour.remaining}
          value={numPeople}
          onChange={handlePeopleChange}
          className="w-24 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] text-center font-bold text-lg"
          required
        />
      </div>

      {/* Name Input */}
      <div className="mb-4">
        <label
          htmlFor="guest-name"
          className="block text-gray-700 font-semibold mb-2"
        >
          {t("labelName")} *
        </label>
        <input
          type="text"
          id="guest-name"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
          placeholder={t("placeholderName")}
          required
        />
      </div>

      {/* Email Input */}
      <div className="mb-6">
        <label
          htmlFor="guest-email"
          className="block text-gray-700 font-semibold mb-2"
        >
          {t("labelEmail")} *
        </label>
        <input
          type="email"
          id="guest-email"
          value={guestEmail}
          onChange={(e) => setGuestEmail(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
          placeholder={t("placeholderEmail")}
          required
        />
      </div>

      {/* Notes Input */}
      <div className="mb-6">
        <label
          htmlFor="special-notes"
          className="block text-gray-700 font-semibold mb-2"
        >
          {t("labelNotes")}
        </label>
        <textarea
          id="special-notes"
          value={specialNotes}
          onChange={(e) => setSpecialNotes(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
          placeholder={t("placeholderNotes")}
          rows="3"
        />
      </div>

      {/* NEW: LGPD COMPLIANCE CHECKBOX */}
      <div className="mb-6 flex items-start gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
        <input
          type="checkbox"
          id="accept-terms"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="mt-1 h-5 w-5 rounded border-gray-300 text-[#FF6B6B] focus:ring-[#FF6B6B] cursor-pointer"
        />
        <label
          htmlFor="accept-terms"
          className="text-sm text-gray-600 leading-tight cursor-pointer"
        >
          {t("labelAcceptTerms")}
          <Link
            to="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FF6B6B] underline font-medium mx-1 hover:text-[#FF5252]"
          >
            {t("linkTerms")}
          </Link>
          {t("linkAnd")}
          <Link
            to="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FF6B6B] underline font-medium mx-1 hover:text-[#FF5252]"
          >
            {t("linkPrivacy")}
          </Link>
          .
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={onConfirm}
          // HARDENING: Submission is blocked if terms aren't accepted
          disabled={isSubmitting || !acceptedTerms}
          className="flex-1 bg-[#FF6B6B] hover:bg-[#FF5252] text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all 
                     disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed flex justify-center items-center"
        >
          {isSubmitting ? t("btnSubmitting") : t("btnConfirm")}
        </button>
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg shadow-md transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
        >
          {t("btnCancel")}
        </button>
      </div>
    </>
  );
}
