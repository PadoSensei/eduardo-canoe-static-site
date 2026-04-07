import React, { useState, useEffect, useCallback, useRef } from "react";
import { format } from "date-fns";
import { X, ArrowLeft, UserPlus, Loader2 } from "lucide-react";
import { fetchDayManifest, cancelTourForWeather } from "../../api";

// Import sub-components for modular architecture
import PassengerRow from "./manifest/PassengerRow";
import TourCard from "./manifest/TourCard";
import ManualBookingForm from "./manifest/ManualBookingForm";

const DayManifest = ({ date, onClose, onActionSuccess }) => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTour, setSelectedTour] = useState(null);
  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Local UI state for check-ins (visual only for Eduardo's use at the lagoon)
  const [checkedIn, setCheckedIn] = useState({});

  const isMounted = useRef(true);

  const toggleCheckIn = (uuid) => {
    setCheckedIn((prev) => ({ ...prev, [uuid]: !prev[uuid] }));
  };

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

  // Sync selectedTour with updated data from tours list
  useEffect(() => {
    if (selectedTour) {
      const updated = tours.find(
        (t) => (t.tour_id || t.id) === (selectedTour.tour_id || selectedTour.id)
      );
      if (updated && updated !== selectedTour) {
        setSelectedTour(updated);
      }
    }
  }, [tours, selectedTour]);

  // Initial Load and Cleanup
  useEffect(() => {
    isMounted.current = true;
    const controller = new AbortController();

    loadManifest(controller.signal);
    setSelectedTour(null);
    setIsAddingGuest(false);

    return () => {
      isMounted.current = false;
      controller.abort();
    };
  }, [date, loadManifest]); // Only re-run when the date from the calendar changes

  const handleWeatherCancellation = async (tour) => {
    if (
      !window.confirm(
        `Notify all guests of weather cancellation for ${tour.display_name}?`
      )
    )
      return;

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
        if (onActionSuccess) onActionSuccess(); // Refresh the Dashboard Calendar stats
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
        <p className="mt-2 text-sm font-medium text-gray-500">
          Loading Manifest...
        </p>
      </div>
    );
  }

  // --- VIEW 1: ADDING MANUAL GUEST ---
  if (selectedTour && isAddingGuest) {
    return (
      <ManualBookingForm
        selectedTour={selectedTour}
        dateString={format(date, "yyyy-MM-dd")}
        onCancel={() => setIsAddingGuest(false)}
        onSuccess={() => {
          setIsAddingGuest(false);
          if (onActionSuccess) onActionSuccess(); // Sync Grandparent Calendar
          loadManifest(); // Sync Local List
        }}
      />
    );
  }

  // --- VIEW 2: PASSENGER LIST ---
  if (selectedTour) {
    return (
      <div className="flex flex-col w-full h-full duration-300 bg-white shadow-2xl animate-in slide-in-from-right">
        <div className="flex items-center justify-between p-4 text-white bg-teal-900 shadow-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedTour(null)}
              className="p-2 transition-colors rounded-full hover:bg-teal-800"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h2 className="font-bold truncate max-w-[180px] leading-none">
                {selectedTour.display_name}
              </h2>
              <p className="text-[10px] text-teal-400 font-bold uppercase mt-1">
                Passenger List
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddingGuest(true)}
            className="p-2 transition-all rounded-lg bg-white/10 hover:bg-white/20 active:scale-95"
            aria-label="Add passenger manually"
          >
            <UserPlus size={20} />
          </button>
        </div>

        <div className="flex-1 p-4 pb-24 overflow-y-auto bg-gray-50/50">
          <h3 className="mb-4 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
            Confirmed Bookings
          </h3>

          {selectedTour.passengers?.length > 0 ? (
            selectedTour.passengers.map((p) => (
              <PassengerRow
                key={p.uuid}
                passenger={p}
                isCheckedIn={!!checkedIn[p.uuid]}
                onCheckIn={toggleCheckIn}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <p className="italic">No passengers registered yet.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- VIEW 3: DAY OVERVIEW (LIST OF TOURS) ---
  return (
    <div className="flex flex-col w-full h-full overflow-hidden duration-300 bg-white shadow-2xl animate-in slide-in-from-right">
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b shadow-sm shrink-0">
        <div>
          <h2 className="text-xl font-bold font-lora text-teal-950">
            {format(date, "EEEE")}
          </h2>
          <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">
            {format(date, "MMM do, yyyy")}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 transition-colors rounded-full hover:bg-gray-100"
          aria-label="Close manifest"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 p-5 space-y-4 overflow-y-auto bg-gray-50/30">
        <h3 className="mb-2 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
          Daily Schedule
        </h3>

        {tours.length > 0 ? (
          tours.map((tour) => (
            <TourCard
              key={tour.tour_id || tour.id}
              tour={tour}
              isSubmitting={isSubmitting}
              onCancel={handleWeatherCancellation}
              onSelect={setSelectedTour}
            />
          ))
        ) : (
          <p className="py-10 italic text-center text-gray-400">
            No tours scheduled for this date.
          </p>
        )}
      </div>
    </div>
  );
};

export default DayManifest;
