import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  X,
  ArrowLeft,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { getDayDetails } from "../../utils/mockData";

const DayManifest = ({ date, onClose }) => {
  const [tours, setTours] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);

  useEffect(() => {
    if (date) {
      setTours(getDayDetails(date));
      setSelectedTour(null);
    }
  }, [date]);

  // --- ACTIONS ---
  const handleCancelDay = () => {
    if (window.confirm("Cancel all tours for this day?")) {
      setTours(tours.map((t) => ({ ...t, status: "cancelled" })));
    }
  };

  const toggleTourStatus = (tourId) => {
    setTours(
      tours.map((t) => {
        if (t.uniqueId === tourId) {
          return {
            ...t,
            status: t.status === "cancelled" ? "available" : "cancelled",
          };
        }
        return t;
      })
    );
  };

  // --- VIEW: PASSENGER LIST (Drill-down) ---
  if (selectedTour) {
    const isCancelled = selectedTour.status === "cancelled";

    return (
      <div className="bg-white h-full w-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Mobile-Friendly Header */}
        <div className="bg-teal-900 text-white p-4 flex items-center justify-between shadow-md z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedTour(null)}
              className="hover:bg-teal-800 p-2 rounded-full transition"
              aria-label="Back to tour list"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="overflow-hidden">
              <h2 className="font-bold text-lg truncate">
                {selectedTour.name}
              </h2>
              <div className="text-teal-200 text-xs flex items-center gap-2">
                <Clock size={12} /> {selectedTour.time}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xl font-bold">
              {selectedTour.booked}{" "}
              <span className="text-xs font-normal text-teal-300">
                / {selectedTour.capacity}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 pb-20 md:pb-4">
          {isCancelled && (
            <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm">
              <p className="font-bold flex items-center gap-2">
                <AlertCircle size={18} /> Tour Cancelled
              </p>
              <p className="text-xs mt-1">Guests have been notified.</p>
            </div>
          )}

          <div className="space-y-3">
            {/* Header for Test Visibility */}
            <h3 className="font-bold text-gray-500 text-sm uppercase tracking-wider mb-2">
              Passenger Manifest
            </h3>

            {selectedTour.bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white border rounded-lg p-4 shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">
                      {booking.guestName}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-medium">
                        {booking.partySize} Pax
                      </span>
                      {booking.paymentStatus === "paid" ? (
                        <span className="flex items-center gap-1 text-green-600 font-bold text-xs">
                          <CheckCircle size={12} /> PAID
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-yellow-600 font-bold text-xs">
                          <Clock size={12} /> PENDING
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <a
                      href={`tel:${booking.phone}`}
                      className="p-2 text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100"
                    >
                      <Phone size={20} />
                    </a>
                    <a
                      href={`mailto:${booking.email}`}
                      className="p-2 text-teal-600 bg-teal-50 rounded-full hover:bg-teal-100"
                    >
                      <Mail size={20} />
                    </a>
                  </div>
                </div>

                {booking.special_notes &&
                  booking.special_notes.trim() !== "" && (
                    <div className="mt-3 bg-yellow-50 text-yellow-800 text-sm p-3 rounded border border-yellow-200 flex gap-2 items-start shadow-sm">
                      <AlertCircle
                        size={16}
                        className="mt-0.5 shrink-0 text-yellow-600"
                      />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-700 opacity-70">
                          Note from Guest:
                        </span>
                        <span className="leading-tight">
                          {booking.special_notes}
                        </span>
                      </div>
                    </div>
                  )}
              </div>
            ))}
            {selectedTour.bookings.length === 0 && (
              <p className="text-center text-gray-400 mt-10">
                No bookings yet.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW: TOUR LIST (Default) ---
  return (
    <div className="bg-white h-full w-full shadow-2xl flex flex-col animate-in slide-in-from-bottom md:slide-in-from-right duration-300">
      {/* Header */}
      <div className="bg-white border-b p-4 flex justify-between items-center z-10 shrink-0 sticky top-0">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {format(date, "EEEE")}
          </h2>
          <p className="text-sm text-gray-500">{format(date, "MMMM do")}</p>
        </div>
        <button
          onClick={onClose}
          className="bg-gray-100 hover:bg-gray-200 p-3 rounded-full text-gray-600 transition"
          aria-label="Close"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 pb-20 md:pb-4">
        {/* Controls */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Day Controls
          </h3>
          <button
            onClick={handleCancelDay}
            className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-lg border border-red-200 text-sm active:bg-red-100 hover:bg-red-100 transition-colors"
          >
            CANCEL ALL TOURS
          </button>
        </div>

        {/* List */}
        <div className="space-y-4">
          {tours.map((tour) => {
            const isCancelled = tour.status === "cancelled";
            const percent = Math.round((tour.booked / tour.capacity) * 100);

            return (
              <div
                key={tour.uniqueId}
                className={`relative bg-white border rounded-xl transition ${
                  isCancelled
                    ? "opacity-70 bg-gray-50"
                    : "shadow-sm hover:shadow-md"
                }`}
              >
                {/* Clickable Area for Drill-down */}
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => setSelectedTour(tour)}
                >
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="font-bold text-lg text-gray-800">
                        {tour.name}
                      </h4>
                      <span className="text-sm text-gray-500">{tour.time}</span>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xl font-bold ${
                          isCancelled ? "text-gray-400" : "text-teal-600"
                        }`}
                      >
                        {tour.booked}
                      </span>
                      <span className="text-gray-400 text-sm">
                        /{tour.capacity}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {!isCancelled && (
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-full rounded-full ${
                          percent > 90 ? "bg-red-500" : "bg-teal-500"
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  )}

                  {isCancelled && (
                    <div className="text-xs font-bold text-red-500 uppercase tracking-wide">
                      Cancelled
                    </div>
                  )}
                </div>

                {/* Action Footer */}
                <div className="border-t p-2 flex justify-end bg-gray-50 rounded-b-xl">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTourStatus(tour.uniqueId);
                    }}
                    className={`text-xs font-bold px-4 py-2 rounded border uppercase transition-colors ${
                      isCancelled
                        ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                        : "bg-white text-red-500 border-red-200 hover:bg-red-50"
                    }`}
                  >
                    {isCancelled ? "Re-open" : "Cancel"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DayManifest;
