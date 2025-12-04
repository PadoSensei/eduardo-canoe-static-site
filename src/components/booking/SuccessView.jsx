import React from "react";

export function SuccessView({ guestEmail, onClose }) {
  return (
    <div className="text-center">
      <div className="mb-4 text-green-500">
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100">
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
        Payment Confirmed!
      </h3>
      <p className="text-gray-600 mb-8">
        Your adventure is booked. We have sent a confirmation email to{" "}
        <strong>{guestEmail}</strong>.
      </p>
      <button
        onClick={onClose}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors"
      >
        Done
      </button>
    </div>
  );
}
