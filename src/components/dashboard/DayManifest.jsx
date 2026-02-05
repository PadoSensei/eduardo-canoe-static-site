// src/components/dashboard/DayManifest.jsx
import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import {
  X,
  ArrowLeft,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  Clock,
  UserPlus,
  Loader2,
  Plus,
  Minus,
} from "lucide-react";
import { adminCreateBooking, fetchDayManifest } from "../../api";

const DayManifest = ({ date, onClose }) => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTour, setSelectedTour] = useState(null);

  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [numPeople, setNumPeople] = useState(1);
  const [specialNotes, setSpecialNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadManifest = useCallback(async () => {
    if (!date) return;
    setLoading(true);
    try {
      const dateString = format(date, "yyyy-MM-dd");
      const data = await fetchDayManifest(dateString);
      setTours(data);
    } catch (err) {
      console.error("Failed to fetch manifest:", err);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    loadManifest();
    setSelectedTour(null);
    setIsAddingGuest(false);
  }, [loadManifest]);

  const handleManualBooking = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let numericPrice = selectedTour.price || 0;
      const payload = {
        tourId: selectedTour.tour_id,
        guestName,
        guestEmail,
        numPeople: parseInt(numPeople, 10),
        special_notes: specialNotes,
        totalPrice: numericPrice * numPeople,
        acceptedTerms: true,
      };
      await adminCreateBooking(payload);
      alert("Booking added successfully!");
      await loadManifest();
      setIsAddingGuest(false);
      setGuestName("");
      setGuestEmail("");
      setNumPeople(1);
      setSpecialNotes("");
      setSelectedTour(null);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelDay = () => {
    if (window.confirm("Cancel all tours for this day? This is permanent.")) {
      // Logic for bulk cancellation would go here
      alert("Bulk cancellation triggered (Feature Pending Backend)");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-white shadow-2xl">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        <p className="mt-2 text-sm text-gray-500">Loading Manifest...</p>
      </div>
    );
  }

  // --- VIEW: ADD GUEST FORM ---
  if (selectedTour && isAddingGuest) {
    return (
      <div className="flex flex-col w-full h-full duration-300 bg-white shadow-2xl animate-in slide-in-from-bottom">
        <div className="flex items-center gap-3 p-4 text-white bg-teal-700 shrink-0">
          <button
            onClick={() => setIsAddingGuest(false)}
            className="p-2 rounded-full hover:bg-teal-600"
            aria-label="Cancel adding guest"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-lg font-bold">Add Manual Guest</h2>
        </div>
        <form
          onSubmit={handleManualBooking}
          className="flex-1 p-6 space-y-4 overflow-y-auto bg-gray-50"
        >
          <div className="p-4 mb-2 border border-teal-100 rounded-xl bg-teal-50">
            <p className="text-xs font-bold text-teal-800 uppercase">
              Adding to:
            </p>
            <p className="text-lg font-bold text-teal-900">
              {selectedTour.display_name}
            </p>
          </div>
          <div>
            <label className="block mb-1 text-sm font-bold text-gray-700">
              Guest Name
            </label>
            <input
              required
              className="w-full p-3 border rounded-xl"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Full Name"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-bold text-gray-700">
              Email (for Ticket)
            </label>
            <input
              type="email"
              required
              className="w-full p-3 border rounded-xl"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-bold text-gray-700">
              Number of Passengers
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setNumPeople(Math.max(1, numPeople - 1))}
                className="p-3 bg-white border rounded-full hover:bg-gray-100"
                aria-label="Decrease passengers"
              >
                <Minus size={20} />
              </button>
              <span className="w-8 text-xl font-bold text-center">
                {numPeople}
              </span>
              <button
                type="button"
                onClick={() => {
                  const remaining =
                    selectedTour.capacity - selectedTour.booked_count;
                  setNumPeople((prev) => Math.min(remaining, prev + 1));
                }}
                aria-label="Increase passengers"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center w-full gap-2 py-4 font-bold text-white transition-colors bg-teal-600 shadow-lg rounded-xl hover:bg-teal-700"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Confirm Manual Booking"
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // --- VIEW: PASSENGER LIST ---
  if (selectedTour) {
    return (
      <div className="flex flex-col w-full h-full duration-300 bg-white shadow-2xl animate-in slide-in-from-right">
        <div className="z-10 flex items-center justify-between p-4 text-white bg-teal-900 shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedTour(null)}
              className="p-2 transition rounded-full hover:bg-teal-800"
              aria-label="back to tour list"
            >
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-lg font-bold truncate">
              {selectedTour.display_name}
            </h2>
          </div>
          <button
            onClick={() => setIsAddingGuest(true)}
            className="flex items-center gap-2 p-2 text-sm font-bold transition rounded-lg bg-white/20 hover:bg-white/30"
          >
            <UserPlus size={18} /> <span>Add Guest</span>
          </button>
        </div>
        <div className="flex-1 p-4 pb-20 overflow-y-auto bg-gray-50">
          <h3 className="mb-4 text-sm font-bold tracking-wider text-gray-500 uppercase">
            Confirmed Passengers
          </h3>
          {selectedTour.passengers.map((p, i) => (
            <div
              key={i}
              className="p-4 mb-3 bg-white border rounded-lg shadow-sm"
            >
              <h4 className="text-lg font-bold">{p.name}</h4>
              <p className="text-sm text-gray-500">{p.pax} Pax</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- VIEW: MAIN LIST ---
  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-white shadow-2xl animate-in slide-in-from-right">
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b shrink-0">
        <h2 className="text-xl font-bold">{format(date, "EEEE, MMM do")}</h2>
        <button
          onClick={onClose}
          className="p-3 text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200"
          aria-label="Close"
        >
          <X size={24} />
        </button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {/* RESTORED: DAY CONTROLS */}
        <div className="p-4 mb-6 bg-white border border-gray-100 shadow-sm rounded-xl">
          <h3 className="mb-3 text-xs font-bold tracking-wider text-gray-400 uppercase">
            Day Controls
          </h3>
          <button
            onClick={handleCancelDay}
            className="w-full py-3 text-sm font-bold text-red-600 border border-red-200 rounded-lg bg-red-50 hover:bg-red-100"
          >
            CANCEL ALL TOURS
          </button>
        </div>
        <div className="space-y-4">
          {tours.map((tour) => (
            <div
              key={tour.tour_id}
              className="p-5 transition bg-white border cursor-pointer rounded-xl hover:shadow-md"
              onClick={() => setSelectedTour(tour)}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold">{tour.display_name}</h4>
                <div className="text-right">
                  <span className="text-xl font-bold text-teal-600">
                    {tour.booked_count}
                  </span>
                  <span className="text-sm text-gray-400">
                    {" "}
                    / {tour.capacity}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DayManifest;
