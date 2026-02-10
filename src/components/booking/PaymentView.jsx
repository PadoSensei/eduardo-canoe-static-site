import React, { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";

export function PaymentView({
  paymentInfo,
  onClose,
  hasConnectionIssue,
  isExpired,
  isFailed,
}) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  // Default to 15 mins if metadata is missing
  const [timeLeft, setTimeLeft] = useState(paymentInfo?.expires_in || 900);

  // Countdown timer logic
  useEffect(() => {
    if (isExpired || isFailed || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isExpired, isFailed]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopyPix = async () => {
    if (!paymentInfo) return;
    try {
      await navigator.clipboard.writeText(paymentInfo.qr_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      alert(t("alertCopyFail"));
    }
  };

  return (
    <div className="text-center animate-fadeIn">
      {isFailed ? (
        /* --- STATE: BANK REJECTION --- */
        <div className="py-4">
          <div className="mb-4 text-red-600">
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
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3
            id="modal-title"
            className="mb-2 text-2xl font-bold text-gray-800"
          >
            {t("failedTitle")}
          </h3>
          <p className="mb-8 text-gray-600">{t("failedDetail")}</p>
        </div>
      ) : isExpired ? (
        /* --- STATE: EXPIRED --- */
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
          <h3
            id="modal-title"
            className="mb-2 text-2xl font-bold text-gray-800"
          >
            {t("expiredTitle")}
          </h3>
          <p className="mb-8 text-gray-600">{t("expiredDetail")}</p>
        </div>
      ) : (
        /* --- STATE: ACTIVE PAYMENT --- */
        <>
          {hasConnectionIssue && (
            <div className="flex items-center gap-3 p-3 mb-4 text-sm border rounded-lg bg-amber-50 border-amber-200 text-amber-700 animate-pulse">
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
              <p className="text-sm text-yellow-600">
                {t("connectionWarning")}
              </p>
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

          <h3
            id="modal-title"
            className="mb-1 text-2xl font-bold text-gray-800"
          >
            {t("paymentTitle")}
          </h3>

          <div className="mb-4">
            <p
              className={`text-sm font-medium ${
                timeLeft < 60 ? "text-red-500 animate-pulse" : "text-gray-500"
              }`}
            >
              ⏱️ {t("expiresIn")}: {formatTime(timeLeft)}
            </p>
          </div>

          <p className="px-4 mb-6 text-gray-600">{t("paymentInstruction")}</p>

          <div className="flex justify-center p-4 mb-6 border border-gray-200 shadow-inner bg-gray-50 rounded-xl">
            <img
              src={paymentInfo.qr_code_image}
              alt={t("altQrCode")}
              className="object-contain w-48 h-48 mix-blend-multiply"
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
            {copied ? t("btnCopied") : t("btnCopy")}
          </button>

          <div className="mb-6 text-left">
            <p className="mb-1 ml-1 text-xs font-bold tracking-wide text-gray-500 uppercase">
              {t("labelPixString")}
            </p>
            <p className="p-3 font-mono text-xs text-gray-500 break-all border border-gray-200 rounded-lg select-all bg-gray-50">
              {paymentInfo.qr_code}
            </p>
          </div>
        </>
      )}

      <button
        onClick={onClose}
        className="w-full bg-[#FF6B6B] hover:bg-[#FF5252] text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors"
      >
        {isExpired || isFailed ? t("btnRetry") : t("btnClose")}
      </button>
    </div>
  );
}
