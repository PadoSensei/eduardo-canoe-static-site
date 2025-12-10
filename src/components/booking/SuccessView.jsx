import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import { bookingTranslations } from "../../data/bookingTranslations";

export function SuccessView({ guestEmail, onClose }) {
  const { language } = useLanguage();
  const t = bookingTranslations[language] || bookingTranslations["en"];

  return (
    <div className="text-center animate-fadeIn">
      <div className="mb-6 text-green-500">
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 shadow-sm animate-bounce-short">
          <svg
            className="h-12 w-12 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      <h3 className="text-2xl font-bold mb-4 text-gray-800">
        {t.successTitle}
      </h3>

      <p className="text-gray-600 mb-8 px-4 leading-relaxed">
        {t.successMessage}{" "}
        <strong className="text-gray-900 font-semibold block mt-1">
          {guestEmail}
        </strong>
      </p>

      <button
        onClick={onClose}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all hover:shadow-lg transform hover:-translate-y-0.5"
      >
        {t.btnDone}
      </button>
    </div>
  );
}
