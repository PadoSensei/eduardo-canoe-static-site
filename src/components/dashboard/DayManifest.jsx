import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { format } from "date-fns";
import { X, ArrowLeft, UserPlus, Users, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  fetchDayManifest,
  cancelTourForWeather,
  patchCheckIn,
} from "../../api";

// Import sub-components for modular architecture
import PassengerRow from "./manifest/PassengerRow";
import TourCard from "./manifest/TourCard";
import ManualBookingForm from "./manifest/ManualBookingForm";
import WeatherCancelModal from "./WeatherCancelModal";
import { DayManifestTourCardSkeleton } from "../common/Skeletons";
import { useLanguage } from "../../context/LanguageContext";

const DayManifest = ({ date, onClose, onActionSuccess }) => {
  const { t } = useLanguage();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTour, setSelectedTour] = useState(null);
  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tourToCancel, setTourToCancel] = useState(null);

  // Local UI state for check-ins (visual only for Eduardo's use at the lagoon)
  const [checkedIn, setCheckedIn] = useState({});

  const isMounted = useRef(true);

  // Optimistic UI for Check-In
  const toggleCheckIn = async (bookingId) => {
    const passenger = selectedTour.passengers.find(
      (p) => (p.id || p.uuid) === bookingId
    );
    if (!passenger) return;

    const newStatus = !checkedIn[bookingId];
    const paxCount =
      passenger.pax_count ?? (passenger.pax || passenger.num_people || 0);

    // 1. Update UI immediately
    setCheckedIn((prev) => ({ ...prev, [bookingId]: newStatus }));

    // 2. Trigger toast on check-in
    if (newStatus) {
      const extraPax = paxCount - 1;
      const toastMsg =
        extraPax > 0
          ? `${passenger.name || passenger.guest_name} + ${extraPax} passengers are on board`
          : `${passenger.name || passenger.guest_name} is on board`;
      toast.success(toastMsg, { icon: "🛶" });
    }

    // 3. Persist to Backend
    try {
      await patchCheckIn(bookingId, newStatus);
    } catch (err) {
      console.error("Failed to update check-in status:", err);
      toast.error("Failed to update check-in. Please try again.");
      // Rollback on failure
      setCheckedIn((prev) => ({ ...prev, [bookingId]: !newStatus }));
    }
  };

  const headcount = useMemo(() => {
    if (!selectedTour?.passengers) return { boarded: 0, total: 0 };

    return selectedTour.passengers.reduce(
      (acc, p) => {
        const count = p.pax_count ?? (p.pax || p.num_people || 0);
        acc.total += count;
        if (checkedIn[p.id || p.uuid]) {
          acc.boarded += count;
        }
        return acc;
      },
      { boarded: 0, total: 0 }
    );
  }, [selectedTour, checkedIn]);

  const loadManifest = useCallback(
    async (signal) => {
      if (!date || !isMounted.current) return;
      setLoading(true);
      try {
        const dateString = format(date, "yyyy-MM-dd");
        const data = await fetchDayManifest(dateString, { signal });

        if (isMounted.current && !signal?.aborted) {
          setTours(data || []);

          // Initialize local checkedIn state from backend data
          const initialCheckedIn = {};
          data.forEach((tour) => {
            tour.passengers?.forEach((p) => {
              if (p.checked_in) initialCheckedIn[p.id || p.uuid] = true;
            });
          });
          setCheckedIn(initialCheckedIn);
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
        toast.success(t("admin_cancel_success_toast"));
        setTourToCancel(null);
        if (onActionSuccess) onActionSuccess(); // Refresh the Dashboard Calendar stats
        await loadManifest(controller.signal);
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      toast.error(
        t("admin_cancel_error_toast").replace("{{error}}", err.message)
      );
    } finally {
      if (isMounted.current) setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col w-full h-full bg-white shadow-2xl">
        <div className="p-4 border-b">
          <div className="h-8 bg-gray-100 rounded w-1/3 animate-pulse" />
        </div>
        <div className="flex-1 p-5 space-y-4 overflow-y-auto bg-gray-50/30">
          <DayManifestTourCardSkeleton />
          <DayManifestTourCardSkeleton />
          <DayManifestTourCardSkeleton />
        </div>
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
      <div className="flex flex-col w-full h-full duration-300 bg-white shadow-2xl animate-in slide-in-from-right relative">
        {/* Sticky Headcount Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 bg-emerald-600 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Users size={20} className="text-emerald-50" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200 leading-none mb-1">
                Boarding Status
              </p>
              <h3 className="text-lg font-black leading-none">
                {headcount.boarded}{" "}
                <span className="text-emerald-300">/ {headcount.total}</span>
              </h3>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase text-emerald-200">
              Total Boarded
            </span>
            <span className="text-xl font-black">
              {Math.round((headcount.boarded / (headcount.total || 1)) * 100)}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 text-white bg-teal-900 shadow-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedTour(null)}
              className="p-2 min-w-[44px] min-h-[44px] transition-colors rounded-full hover:bg-teal-800 active:scale-95"
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
            className="p-2 min-w-[44px] min-h-[44px] transition-all rounded-lg bg-white/10 hover:bg-white/20 active:scale-95"
            aria-label={t("aria_add_guest")}
          >
            <UserPlus size={20} />
          </button>
        </div>

        <div className="flex-1 p-4 pb-24 overflow-y-auto bg-gray-50/50">
          {selectedTour.status === "cancelled" && (
            <div
              className="mb-4 flex gap-3 rounded-xl border-2 border-red-300 bg-red-50 p-4 text-red-900 shadow-sm"
              role="alert"
            >
              <AlertTriangle
                className="h-8 w-8 shrink-0 text-red-600"
                aria-hidden
              />
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-red-800">
                  This tour has been cancelled
                </p>
                <p className="mt-1 text-sm font-medium leading-snug text-red-900/90">
                  Passengers below may still need outreach or refunds. Do not
                  board guests for this departure.
                </p>
              </div>
            </div>
          )}
          <h3 className="mb-4 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
            Confirmed Bookings
          </h3>

          {selectedTour.passengers?.length > 0 ? (
            selectedTour.passengers.map((p) => (
              <PassengerRow
                key={p.id}
                passenger={p}
                isCheckedIn={!!checkedIn[p.id]}
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
              onCancel={() => setTourToCancel(tour)}
              onSelect={setSelectedTour}
            />
          ))
        ) : (
          <p className="py-10 italic text-center text-gray-400">
            No tours scheduled for this date.
          </p>
        )}
      </div>

      <WeatherCancelModal
        isOpen={!!tourToCancel}
        tour={tourToCancel}
        onClose={() => setTourToCancel(null)}
        onConfirm={() => handleWeatherCancellation(tourToCancel)}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default DayManifest;
