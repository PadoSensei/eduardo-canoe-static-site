import React from "react";
import { Check } from "lucide-react";

/**
 * PassengerRow Component
 * Renders a single guest booking with check-in capability.
 */
const PassengerRow = ({ passenger, isCheckedIn, onCheckIn }) => {
  return (
    <div
      data-testid="passenger-row"
      className={`p-4 mb-3 bg-white border rounded-xl shadow-sm flex items-center justify-between transition-all duration-300 ${
        isCheckedIn ? "opacity-40 grayscale" : "opacity-100"
      }`}
    >
      <div className="space-y-1">
        <h4 className="text-lg font-bold leading-tight text-teal-950">
          {passenger.name}
        </h4>
        <p className="text-xs text-gray-500">
          {passenger.pax} Pax • {passenger.email}
        </p>

        {/* Transaction ID Display */}
        {passenger.payment_transaction_id && (
          <div className="mt-2">
            <span className="text-[9px] uppercase font-black text-gray-400 tracking-tighter block mb-1">
              Transaction Reference
            </span>
            <code className="text-[10px] font-mono text-teal-600 bg-teal-50 px-2 py-1 rounded border border-teal-100/50">
              {passenger.payment_transaction_id}
            </code>
          </div>
        )}
      </div>

      {/* Check-in Toggle Button */}
      <button
        onClick={() => onCheckIn(passenger.uuid)}
        aria-label="Check-in"
        className={`p-3 rounded-full border-2 transition-all transform active:scale-90 ${
          isCheckedIn
            ? "bg-teal-600 border-teal-600 text-white"
            : "border-gray-100 text-gray-300 hover:border-teal-200 hover:text-teal-500"
        }`}
      >
        <Check size={20} strokeWidth={3} />
      </button>
    </div>
  );
};

export default PassengerRow;
