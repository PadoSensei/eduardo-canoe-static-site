import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import { bookingTranslations } from "../../data/bookingTranslations";

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
  // 1. Get Language Context
  const { language } = useLanguage();
  // 2. Load Translations
  const t = bookingTranslations[language] || bookingTranslations["en"];

  return (
    <>
      <h3 className="text-2xl font-bold mb-4 text-gray-800">
        {t.bookTitle} <span className="text-[#FF6B6B]">{tour.name}</span>
      </h3>

      <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
        <p className="text-gray-600 flex justify-between">
          <span className="font-semibold">{t.labelDate}:</span>
          <span>{selectedDate}</span>
        </p>
        <p className="text-gray-600 flex justify-between mt-1">
          <span className="font-semibold">{t.labelPrice}:</span>
          <span className="font-bold text-gray-800">
            {t.pricePrefix} {tour.price.toFixed(2)}
          </span>
        </p>
      </div>

      <div className="mb-4">
        <label
          htmlFor="guest-name"
          className="block text-gray-700 font-semibold mb-2"
        >
          {t.labelName} *
        </label>
        <input
          type="text"
          id="guest-name"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
          placeholder={t.placeholderName}
          required
        />
      </div>

      <div className="mb-6">
        <label
          htmlFor="guest-email"
          className="block text-gray-700 font-semibold mb-2"
        >
          {t.labelEmail} *
        </label>
        <input
          type="email"
          id="guest-email"
          value={guestEmail}
          onChange={(e) => setGuestEmail(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
          placeholder={t.placeholderEmail}
          required
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={onConfirm}
          disabled={isSubmitting}
          className="flex-1 bg-[#FF6B6B] hover:bg-[#FF5252] text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center"
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
              {t.btnSubmitting}
            </>
          ) : (
            t.btnConfirm
          )}
        </button>
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg shadow-md transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
        >
          {t.btnCancel}
        </button>
      </div>
    </>
  );
}
