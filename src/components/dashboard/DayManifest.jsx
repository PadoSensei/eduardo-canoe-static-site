import React, { useState, useEffect, useCallback, useRef } from "react";
import { format } from "date-fns";
import {
  X,
  ArrowLeft,
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

  // 1. Ref to prevent state updates after unmount (Fixes SIGABRT)
  const isMounted = useRef(true);

  const loadManifest = useCallback(
    async (signal) => {
      if (!date || !isMounted.current) return;
      setLoading(true);
      try {
        const dateString = format(date, "yyyy-MM-dd");
        const data = await fetchDayManifest(dateString, { signal });

        if (isMounted.current && !signal?.aborted) {
          setTours(data || []);
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Failed to fetch manifest:", err);
      } finally {
        if (isMounted.current && !signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [date]
  );

  useEffect(() => {
    isMounted.current = true;
    const controller = new AbortController();

    loadManifest(controller.signal);
    setSelectedTour(null);
    setIsAddingGuest(false);

    return () => {
      isMounted.current = false;
      controller.abort(); // Cancel all pending requests
    };
  }, [loadManifest]);

  const handleManualBooking = async (e) => {
    e.preventDefault();
    const controller = new AbortController();
    setIsSubmitting(true);

    try {
      const numericPrice = selectedTour.price || 0;
      const payload = {
        tour_id: selectedTour.tour_id, // Match backend schema naming
        guest_name: guestName,
        guest_email: guestEmail,
        num_people: parseInt(numPeople, 10),
        special_notes: specialNotes,
        total_price: numericPrice * numPeople,
        accepted_terms: true,
      };

      await adminCreateBooking(payload, { signal: controller.signal });

      if (isMounted.current) {
        alert("Booking added successfully!");
        await loadManifest(controller.signal);
        setIsAddingGuest(false);
        setGuestName("");
        setGuestEmail("");
        setNumPeople(1);
        setSpecialNotes("");
        setSelectedTour(null);
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      alert("Error: " + err.message);
    } finally {
      if (isMounted.current) setIsSubmitting(false);
    }
  };

  const handleWeatherCancellation = async (tour) => {
    const controller = new AbortController();
    try {
      setIsSubmitting(true);
      await cancelTourForWeather(
        tour.tour_id,
        tour.display_name,
        format(date, "yyyy-MM-dd"),
        { signal: controller.signal }
      );

      if (isMounted.current) {
        alert("Success: Tour cancelled and guests notified.");
        await loadManifest(controller.signal);
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      alert("Failed to cancel: " + err.message);
    } finally {
      if (isMounted.current) setIsSubmitting(false);
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

  // --- VIEW: ADDING MANUAL GUEST ---
  if (selectedTour && isAddingGuest) {
    return (
      <div className="flex flex-col w-full h-full bg-white shadow-2xl animate-in slide-in-from-bottom">
        <div className="flex items-center gap-3 p-4 text-white bg-teal-700 shrink-0">
          <button
            onClick={() => setIsAddingGuest(false)}
            className="p-2 rounded-full hover:bg-teal-600"
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
              >
                <Minus size={20} />
              </button>
              <span className="w-8 text-xl font-bold text-center">
                {numPeople}
              </span>
              <button
                type="button"
                onClick={() =>
                  setNumPeople(
                    Math.min(
                      selectedTour.capacity - selectedTour.booked_count,
                      numPeople + 1
                    )
                  )
                }
                className="p-3 bg-white border rounded-full"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 font-bold text-white bg-teal-600 rounded-xl disabled:bg-gray-400"
          >
            {isSubmitting ? (
              <Loader2 className="mx-auto animate-spin" />
            ) : (
              "Confirm Manual Booking"
            )}
          </button>
        </form>
      </div>
    );
  }

  // --- VIEW: PASSENGER LIST ---
  if (selectedTour) {
    return (
      <div className="flex flex-col w-full h-full bg-white shadow-2xl animate-in slide-in-from-right">
        <div className="flex items-center justify-between p-4 text-white bg-teal-900 shadow-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedTour(null)}
              className="p-2 rounded-full hover:bg-teal-800"
            >
              <ArrowLeft size={24} />
            </button>
            <h2 className="font-bold truncate">{selectedTour.display_name}</h2>
          </div>
          <button
            onClick={() => setIsAddingGuest(true)}
            className="p-2 rounded-lg bg-white/20"
          >
            <UserPlus size={18} />
          </button>
        </div>
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          <h3 className="mb-4 text-sm font-bold tracking-wider text-gray-400 uppercase">
            Confirmed Passengers
          </h3>
          {selectedTour.passengers?.length > 0 ? (
            selectedTour.passengers.map((p, i) => (
              <div
                key={i}
                className="p-4 mb-3 bg-white border rounded-lg shadow-sm"
              >
                <h4 className="text-lg font-bold">{p.name}</h4>
                <p className="text-sm text-gray-500">
                  {p.pax} Pax • {p.email}
                </p>
              </div>
            ))
          ) : (
            <p className="py-10 text-center text-gray-400">
              No passengers yet.
            </p>
          )}
        </div>
      </div>
    );
  }

  // --- VIEW: DAY OVERVIEW ---
  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-white shadow-2xl animate-in slide-in-from-right">
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b shrink-0">
        <h2 className="text-xl font-bold">{format(date, "EEEE, MMM do")}</h2>
        <button
          onClick={onClose}
          className="p-3 text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200"
        >
          <X size={24} />
        </button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        <div className="p-4 mb-6 bg-white border border-gray-100 shadow-sm rounded-xl">
          <h3 className="mb-3 text-xs font-bold tracking-wider text-gray-400 uppercase">
            Day Controls
          </h3>
          <button className="w-full py-3 text-sm font-bold text-red-600 border border-red-200 rounded-lg opacity-50 cursor-not-allowed bg-red-50 hover:bg-red-100">
            CANCEL ALL TOURS (ADMIN ONLY)
          </button>
        </div>
        <div className="space-y-4">
          {tours.map((tour) => {
            const isCancelled = tour.status?.includes("cancelled");
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
                      if (
                        window.confirm("Notify guests of weather cancellation?")
                      )
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
