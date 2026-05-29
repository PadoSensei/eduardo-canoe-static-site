import React from "react";
import Check from "lucide-react/dist/esm/icons/check";
import MessageSquare from "lucide-react/dist/esm/icons/message-square";
import Clock from "lucide-react/dist/esm/icons/clock";
import { formatCurrency } from "../../../utils/formatters";

/**
 * PassengerRow Component
 * Renders a single guest booking with check-in capability.
 */
const PassengerRow = ({ passenger, isCheckedIn, onCheckIn }) => {
  const shortId = (
    passenger.display_id || passenger.uuid?.slice(0, 8)
  ).toUpperCase();
  const paxCount = passenger.num_people || 0;

  const isPending = passenger.status === "pending_payment";

  return (
    <div
      data-testid="passenger-row"
      className={`p-4 mb-3 border rounded-xl shadow-sm flex items-center justify-between transition-all duration-300 ${
        isCheckedIn
          ? "bg-emerald-50 border-emerald-200 shadow-inner"
          : isPending
            ? "bg-amber-50/30 border-amber-100 opacity-50"
            : "bg-white border-gray-100"
      }`}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h4
            className={`text-lg font-bold leading-tight ${
              isCheckedIn ? "text-emerald-900" : "text-teal-950"
            }`}
          >
            {passenger.name || passenger.guest_name}
          </h4>
          {isCheckedIn && (
            <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-black rounded-full animate-in zoom-in-50 duration-300">
              ✓ ON BOARD
            </span>
          )}
          {isPending && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-400 border border-amber-500 text-slate-950 text-[10px] font-black rounded-full shadow-sm">
              <Clock size={10} />
              AWAITING PAYMENT
            </span>
          )}
          {passenger.special_notes && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 border border-amber-200 text-amber-600 text-[10px] font-black rounded-full">
              <MessageSquare size={10} />
              NOTES
            </div>
          )}
        </div>
        <p className="text-xs font-medium text-gray-500">
          <span className={isCheckedIn ? "text-emerald-700" : "text-teal-600"}>
            {paxCount} Pax
          </span>{" "}
          • {passenger.email || passenger.guest_email}
          {passenger.total_price && (
            <span className="ml-2 font-bold text-emerald-600">
              • {formatCurrency(passenger.total_price)}
            </span>
          )}
        </p>

        {/* Notes Block - Rugged UI Integration */}
        {passenger.special_notes && (
          <div className="mt-2 p-2 bg-amber-50 border-l-4 border-amber-500 rounded-r-md max-h-32 overflow-y-auto">
            <div className="flex items-start gap-1.5">
              <MessageSquare className="text-amber-500 mt-0.5" size={14} />
              <p className="text-sm text-slate-950 font-medium leading-snug">
                {passenger.special_notes}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 mt-2">
          {/* Short ID */}
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-black text-slate-400 tracking-tighter block mb-0.5">
              Booking ID
            </span>
            <code className="text-[10px] font-mono font-bold text-slate-500">
              #{shortId}
            </code>
          </div>

          {/* Transaction ID Display */}
          {passenger.payment_transaction_id && (
            <div className="flex flex-col border-l pl-3 border-gray-200">
              <span className="text-[9px] uppercase font-black text-slate-400 tracking-tighter block mb-0.5">
                Reference
              </span>
              <code className="text-[10px] font-mono text-teal-600">
                {passenger.payment_transaction_id}
              </code>
            </div>
          )}
        </div>
      </div>

      {/* Check-in Toggle Button */}
      <button
        onClick={() => onCheckIn(passenger.id || passenger.uuid)}
        aria-label={isCheckedIn ? "Check-out" : "Check-in"}
        className={`p-3 rounded-full border-2 transition-all transform active:scale-90 ${
          isCheckedIn
            ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200"
            : "bg-white border-gray-200 text-gray-300 hover:border-teal-400 hover:text-teal-500"
        }`}
      >
        <Check size={20} strokeWidth={3} />
      </button>
    </div>
  );
};

export default PassengerRow;
