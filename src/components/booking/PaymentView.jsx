import React, { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { bookingTranslations } from "../../data/bookingTranslations";

export function PaymentView({
  paymentInfo,
  onClose,
  hasConnectionIssue,
  isExpired,
}) {
  const [copied, setCopied] = useState(false);
  const { language } = useLanguage();
  const t = bookingTranslations[language] || bookingTranslations["en"];

  const handleCopyPix = async () => {
    if (!paymentInfo) return;
    try {
      await navigator.clipboard.writeText(paymentInfo.qr_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      alert(t.alertCopyFail);
    }
  };

  return (
    <div className="text-center animate-fadeIn">
      {isExpired ? (
        <div className="py-4">
          <div className="mb-4 text-red-500">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-2 text-gray-800">
            {t.expiredTitle}
          </h3>
          <p className="text-gray-600 mb-8">{t.expiredDetail}</p>
        </div>
      ) : (
        <>
          {hasConnectionIssue && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3 text-amber-700 text-sm animate-pulse">
              <svg
                className="w-5 h-5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-left">{t.connectionWarning}</p>
            </div>
          )}

          <div className="mb-4 text-green-600">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h3 className="text-2xl font-bold mb-2 text-gray-800">
            {t.paymentTitle}
          </h3>
          <p className="text-gray-600 mb-6 px-4">{t.paymentInstruction}</p>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 flex justify-center shadow-inner">
            <img
              src={paymentInfo.qr_code_image}
              alt={t.altQrCode}
              className="w-48 h-48 object-contain mix-blend-multiply"
            />
          </div>

          <button
            onClick={handleCopyPix}
            className={`w-full mb-6 font-bold py-3 px-6 rounded-lg shadow-sm border transition-all duration-200 flex items-center justify-center gap-2
              ${
                copied
                  ? "bg-green-100 text-green-700 border-green-200"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
          >
            {copied ? t.btnCopied : t.btnCopy}
          </button>

          <div className="text-left mb-6">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">
              {t.labelPixString}
            </p>
            <p className="text-xs text-gray-500 break-all bg-gray-50 p-3 rounded-lg border border-gray-200 font-mono select-all">
              {paymentInfo.qr_code}
            </p>
          </div>
        </>
      )}

      <button
        onClick={onClose}
        className="w-full bg-[#FF6B6B] hover:bg-[#FF5252] text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors"
      >
        {isExpired ? t.btnRetry : t.btnClose}
      </button>
    </div>
  );
}
