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
  CloudRain,
} from "lucide-react";
import {
  adminCreateBooking,
  fetchDayManifest,
  cancelTourForWeather,
} from "../../api";

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
      alert("Bulk cancellation triggered (Feature Pending Backend)");
    }
  };

  const handleWeatherCancellation = async (tour) => {
    try {
      setIsSubmitting(true);
      await cancelTourForWeather(
        tour.tour_id,
        tour.display_name,
        format(date, "yyyy-MM-dd")
      );
      alert(
        "Success: Tour cancelled, guests notified, and refund manifest sent to your email."
      );
      await loadManifest();
    } catch (err) {
      alert("Failed to cancel: " + err.message);
    } finally {
      setIsSubmitting(false);
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
              Email
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
              Passengers
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setNumPeople(Math.max(1, numPeople - 1))}
                className="p-3 bg-white border rounded-full"
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
                className="p-3 bg-white border rounded-full"
                aria-label="Increase passengers"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 font-bold text-white bg-teal-600 rounded-xl"
          >
            Confirm Manual Booking
          </button>
        </form>
      </div>
    );
  }

  if (selectedTour) {
    return (
      <div className="flex flex-col w-full h-full bg-white shadow-2xl animate-in slide-in-from-right">
        <div className="flex items-center justify-between p-4 text-white bg-teal-900 shadow-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedTour(null)}
              className="p-2 rounded-full hover:bg-teal-800"
              aria-label="back to tour list"
            >
              <ArrowLeft size={24} />
            </button>
            <h2 className="font-bold truncate">{selectedTour.display_name}</h2>
          </div>
          <button
            onClick={() => setIsAddingGuest(true)}
            className="p-2 rounded-lg bg-white/20"
            aria-label="Add Guest"
          >
            <UserPlus size={18} />
          </button>
        </div>
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          <h3 className="mb-4 text-sm font-bold tracking-wider text-gray-500 uppercase">
            Confirmed Passengers
          </h3>
          {selectedTour.passengers.map((p, i) => (
            <div
              key={i}
              className="p-4 mb-3 bg-white border rounded-lg shadow-sm"
            >
              <h4 className="text-lg font-bold">{p.name}</h4>
              <p className="text-sm text-gray-500">
                {p.pax} Pax • {p.status}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
          {tours.map((tour) => {
            const isCancelled =
              tour.status === "cancelled" ||
              tour.status === "cancelled_weather";
            return (
              <div
                key={tour.tour_id}
                className={`p-5 bg-white border rounded-xl shadow-sm ${
                  isCancelled
                    ? "opacity-60 grayscale"
                    : "hover:shadow-md cursor-pointer"
                }`}
                onClick={() => !isCancelled && setSelectedTour(tour)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-teal-900">
                      {tour.display_name}
                    </h4>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">
                      {tour.status}
                    </span>
                  </div>
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
                {!isCancelled && (
                  <button
                    disabled={isSubmitting}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm("Notify guests?"))
                        handleWeatherCancellation(tour);
                    }}
                    className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-[10px] font-black uppercase hover:bg-red-100"
                  >
                    <CloudRain size={14} /> Weather Cancel
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DayManifest;
