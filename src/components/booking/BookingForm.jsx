import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import Plus from "lucide-react/dist/esm/icons/plus";
import Minus from "lucide-react/dist/esm/icons/minus";
import ShieldedButton from "../common/ShieldedButton";
import { formatCurrency } from "../../utils/formatters";

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
  acceptedTerms,
  setAcceptedTerms,
  onConfirm,
  onCancel,
  isSubmitting,
  error,
}) {
  const { t } = useLanguage();

  // Calculation uses a fallback to 0 if the input is temporarily empty
  const currentNum = parseInt(numPeople, 10) || 0;
  const totalPrice = tour.price * currentNum;

  /**
   * Allows users to type freely.
   * Prevents snapping to "1" immediately when they backspace.
   */
  const handlePeopleChange = (e) => {
    const rawValue = e.target.value;

    // Allow empty string so user can clear the field to type a new number
    if (rawValue === "") {
      setNumPeople("");
      return;
    }

    let val = parseInt(rawValue, 10);
    if (isNaN(val)) return;

    // Constrain to available capacity
    if (val > tour.remaining) val = tour.remaining;
    if (val < 0) val = 0; // Allow 0 while typing, we fix it on Blur

    setNumPeople(val);
  };

  /**
   * Helper for the +/- buttons
   */
  const adjustPeople = (amount) => {
    const nextValue = (parseInt(numPeople, 10) || 0) + amount;
    if (nextValue >= 1 && nextValue <= tour.remaining) {
      setNumPeople(nextValue);
    }
  };

  /**
   * Final validation when the user clicks away
   */
  const handleBlur = () => {
    if (!numPeople || numPeople < 1) {
      setNumPeople(1);
    }
  };

  return (
    <>
      <h3 id="modal-title" className="mb-4 text-2xl font-bold text-gray-800">
        {t("bookTitle")} <span className="text-[#FF6B6B]">{tour.name}</span>
      </h3>

      {error && (
        <div
          role="alert"
          className="p-3 mb-4 text-sm font-medium text-red-600 border border-red-200 rounded-lg bg-red-50"
        >
          {error}
        </div>
      )}

      {/* Booking Summary Card */}
      <div className="p-4 mb-6 border border-gray-100 rounded-lg bg-gray-50">
        <p className="flex justify-between text-gray-600">
          <span className="font-semibold">{t("labelDate")}:</span>
          <span>{selectedDate}</span>
        </p>
        <p className="flex justify-between mt-1 text-gray-600">
          <span className="font-semibold">Price per person:</span>
          <span>{formatCurrency(tour.price)}</span>
        </p>
        <div className="flex items-center justify-between pt-3 mt-3 text-lg border-t border-gray-200">
          <span className="font-bold text-gray-800">Total:</span>
          <span className="font-bold text-[#FF6B6B]">
            {formatCurrency(totalPrice)}
          </span>
        </div>
      </div>

      {/* Guest Count Stepper */}
      <div className="mb-8">
        <label
          htmlFor="num-people"
          className="block mb-3 font-semibold text-gray-700"
        >
          Number of Guests (Max {tour.remaining})
        </label>
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => adjustPeople(-1)}
            disabled={currentNum <= 1}
            className="p-3 transition-all bg-white border border-gray-300 rounded-full hover:bg-gray-50 active:scale-90 disabled:opacity-30"
          >
            <Minus size={24} className="text-gray-600" />
          </button>

          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            id="num-people"
            value={numPeople}
            onChange={handlePeopleChange}
            onBlur={handleBlur}
            className="w-16 p-2 text-center font-bold text-3xl bg-white text-slate-900 focus:outline-none border-b-2 border-gray-200 focus:border-orange-500 transition-all"
            required
          />

          <button
            type="button"
            onClick={() => adjustPeople(1)}
            disabled={currentNum >= tour.remaining}
            className="p-3 transition-all bg-white border border-gray-300 rounded-full hover:bg-gray-50 active:scale-90 disabled:opacity-30"
          >
            <Plus size={24} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Name Input */}
      <div className="mb-4">
        <label
          htmlFor="guest-name"
          className="block mb-2 font-semibold text-gray-700"
        >
          {t("labelName")} *
        </label>
        <input
          type="text"
          id="guest-name"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          className="w-full p-3 bg-white text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
          placeholder={t("placeholderName")}
          required
        />
      </div>

      {/* Email Input */}
      <div className="mb-4">
        <label
          htmlFor="guest-email"
          className="block mb-2 font-semibold text-gray-700"
        >
          {t("labelEmail")} *
        </label>
        <input
          type="email"
          id="guest-email"
          value={guestEmail}
          onChange={(e) => setGuestEmail(e.target.value)}
          className="w-full p-3 bg-white text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
          placeholder={t("placeholderEmail")}
          required
        />
      </div>

      {/* Notes Input */}
      <div className="mb-6">
        <label
          htmlFor="special-notes"
          className="block mb-2 font-semibold text-gray-700"
        >
          {t("labelNotes")}
        </label>
        <textarea
          id="special-notes"
          value={specialNotes}
          onChange={(e) => setSpecialNotes(e.target.value)}
          className="w-full p-3 bg-white text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
          placeholder={t("placeholderNotes")}
          rows="3"
        />
      </div>

      {/* LGPD COMPLIANCE CHECKBOX */}
      <div className="flex items-start gap-3 p-3 mb-6 border border-gray-200 rounded-lg bg-gray-50">
        <input
          type="checkbox"
          id="accept-terms"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="mt-1 h-5 w-5 rounded border-gray-300 text-[#FF6B6B] focus:ring-[#FF6B6B] cursor-pointer"
        />
        <label
          htmlFor="accept-terms"
          className="text-sm leading-tight text-gray-600 cursor-pointer"
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
        <ShieldedButton
          onClick={onConfirm}
          disabled={!acceptedTerms || currentNum < 1}
          isLoading={isSubmitting}
          className="flex-1 bg-[#FF6B6B] hover:bg-[#FF5252] text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all 
                     disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          {t("btnConfirm")}
        </ShieldedButton>
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 font-bold text-gray-800 transition-colors bg-gray-300 rounded-lg shadow-md hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed"
        >
          {t("btnCancel")}
        </button>
      </div>
    </>
  );
}
