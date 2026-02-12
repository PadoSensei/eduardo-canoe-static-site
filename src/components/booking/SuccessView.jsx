import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import BrandLogo from "../BrandLogo";

export function SuccessView({ guestEmail, onClose }) {
  const { t } = useLanguage();

  return (
    <div className="text-center animate-fadeIn">
      {/* Brand Header for Success */}
      <div className="flex flex-col items-center mb-8">
        <BrandLogo className="w-20 h-20 mb-4 shadow-xl" />
        <div className="relative">
          {/* The checkmark now sits as a badge on the brand */}
          <div className="absolute flex items-center justify-center w-12 h-12 bg-green-100 border-2 border-white rounded-full shadow-sm animate-bounce-short -bottom-2 -right-2">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="4"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
      </div>

      <h3 id="modal-title" className="mb-4 text-2xl font-bold text-gray-800">
        {t("successTitle")}
      </h3>

      <p className="px-4 mb-8 leading-relaxed text-gray-600">
        {t("successMessage")}{" "}
        <strong className="block mt-1 font-semibold text-gray-900">
          {guestEmail}
        </strong>
      </p>

      <button
        onClick={onClose}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all hover:shadow-lg transform hover:-translate-y-0.5"
      >
        {t("btnDone")}
      </button>
    </div>
  );
}
