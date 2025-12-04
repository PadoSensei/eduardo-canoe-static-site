import React, { useState } from "react";

export function PaymentView({ paymentInfo, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopyPix = async () => {
    if (!paymentInfo) return;
    try {
      await navigator.clipboard.writeText(paymentInfo.qr_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Please copy the code manually from the text box below.");
    }
  };

  return (
    <div className="text-center">
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
        Booking Reserved!
      </h3>
      <p className="text-gray-600 mb-6">
        Scan the QR code below to pay via Pix.
      </p>

      <div className="bg-gray-100 p-4 rounded-lg mb-6 flex justify-center">
        <img
          src={paymentInfo.qr_code_image}
          alt="Pix QR Code"
          className="w-48 h-48 object-contain"
        />
      </div>

      <button
        onClick={handleCopyPix}
        className={`w-full mb-4 font-bold py-3 px-6 rounded-lg shadow-sm border transition-all duration-200 flex items-center justify-center gap-2
          ${
            copied
              ? "bg-green-100 text-green-700 border-green-200"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
      >
        {copied ? (
          <>
            <svg
              className="w-5 h-5"
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
            Code Copied!
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            </svg>
            Copy Pix Code
          </>
        )}
      </button>

      <p className="text-sm font-semibold text-gray-700 mb-2">Pix String</p>
      <p className="text-xs text-gray-500 mb-6 break-all bg-gray-50 p-2 rounded border">
        {paymentInfo.qr_code}
      </p>

      <button
        onClick={onClose}
        className="w-full bg-[#FF6B6B] hover:bg-[#FF5252] text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors"
      >
        Close
      </button>
    </div>
  );
}
