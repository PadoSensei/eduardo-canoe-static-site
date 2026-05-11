import React, { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import BrandLogo from "../BrandLogo";
import LocationLink from "../common/LocationLink";
import Copy from 'lucide-react/dist/esm/icons/copy';
import Check from 'lucide-react/dist/esm/icons/check';

export function SuccessView({ guestEmail, booking, onClose }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const displayId =
    booking?.display_id || booking?.uuid?.slice(0, 8).toUpperCase() || "------";

  const handleCopy = () => {
    navigator.clipboard.writeText(displayId);
    setCopied(true);
    if (navigator.vibrate) navigator.vibrate(50);
    setTimeout(() => setCopied(false), 2000);
  };

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

      <h3 id="modal-title" className="mb-2 text-2xl font-bold text-gray-800">
        {t("successTitle")}
      </h3>

      <p className="px-4 mb-6 leading-relaxed text-gray-600 text-sm">
        {t("successMessage")}{" "}
        <strong className="block mt-1 font-semibold text-gray-900">
          {guestEmail}
        </strong>
      </p>

      {/* Digital Voucher ID Card */}
      <div className="mb-8 px-4">
        <div className="bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-2xl p-6 relative overflow-hidden group">
          {/* Decorative circles for ticket effect */}
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-r-2 border-dashed border-emerald-200 rounded-full" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-l-2 border-dashed border-emerald-200 rounded-full" />

          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600/60 block mb-1">
            {t("label_booking_id")}
          </span>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl font-mono font-black text-emerald-900 tracking-wider">
              #{displayId}
            </span>
            <button
              onClick={handleCopy}
              className={`p-2 rounded-xl transition-all active:scale-90 ${
                copied
                  ? "bg-emerald-500 text-white"
                  : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
              }`}
              title={t("btn_copy_id")}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
          {copied && (
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-emerald-600 animate-fadeIn">
              {t("btnCopied")}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <LocationLink className="w-full" />
      </div>

      <button
        onClick={onClose}
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 px-6 rounded-lg transition-all"
      >
        {t("btnDone")}
      </button>
    </div>
  );
}
