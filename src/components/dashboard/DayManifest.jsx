import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { format } from "date-fns";
import X from "lucide-react/dist/esm/icons/x";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import UserPlus from "lucide-react/dist/esm/icons/user-plus";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Users from "lucide-react/dist/esm/icons/users";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import ChevronUp from "lucide-react/dist/esm/icons/chevron-up";
import { toast } from "sonner";
import * as Sentry from "@sentry/react";
import {
  fetchDayManifest,
  cancelTourForWeather,
  patchCheckIn,
  cancelBooking,
} from "../../api";

// --- BUSINESS LOGIC CONSTANTS ---
// Ledger Integrity: active hold statuses that occupy a seat in the manifest/calendar
const ACTIVE_STATUSES = [
  "confirmed",
  "paid",
  "completed",
  "pending_payment",
  "review_required",
];
// Forensic Audit: terminal statuses that no longer occupy inventory
const INACTIVE_STATUSES = [
  "cancelled",
  "cancelled_weather",
  "expired",
  "failed",
];

// Import sub-components for modular architecture
import PassengerRow from "./manifest/PassengerRow";
import TourCard from "./manifest/TourCard";
import ManualBookingForm from "./manifest/ManualBookingForm";
import WeatherCancelModal from "./WeatherCancelModal";
import LogisticsModal from "./LogisticsModal";
import { useLanguage } from "../../context/LanguageContext";
import { patchTourLogistics } from "../../api";

const DayManifest = ({ date, onClose, onActionSuccess }) => {
  const { t } = useLanguage();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTour, setSelectedTour] = useState(null);
  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tourToCancel, setTourToCancel] = useState(null);
  const [tourForLogistics, setTourForLogistics] = useState(null);
  const [showInactive, setShowInactive] = useState(false);

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
    const paxCount = passenger.num_people || 0;

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
      // API currently only supports numeric ID for check-in endpoint
      // Mock data in tests might only have UUID, so we handle both
      if (typeof bookingId === "number") {
        await patchCheckIn(bookingId, newStatus);
      }
    } catch (err) {
      console.error("Failed to update check-in status:", err);
      toast.error("Failed to update check-in. Please try again.");
      // Rollback on failure
      setCheckedIn((prev) => ({ ...prev, [bookingId]: !newStatus }));
    }
  };

  // Atomic Passenger Cancellation
  const handleCancelBooking = async (passenger) => {
    const paxCount = passenger.num_people || 0;
    const confirmMessage = t("admin_cancel_passenger_confirm").replace(
      "{{count}}",
      paxCount
    );

    if (!window.confirm(confirmMessage)) return;

    try {
      setIsSubmitting(true);
      const bookingId = passenger.id || passenger.uuid;

      // Ensure we have a numeric ID for the admin endpoint if possible
      // though the request wrapper handles the URL construction.
      await cancelBooking(bookingId);

      toast.success("Booking cancelled successfully", { icon: "🚫" });

      // Refresh data to reflect cancellation (moves to inactiveList)
      if (onActionSuccess) onActionSuccess();
      await loadManifest();
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      toast.error(`Cancellation failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const headcount = useMemo(() => {
    if (!selectedTour?.passengers) return { boarded: 0, total: 0 };

    return selectedTour.passengers.reduce(
      (acc, p) => {
        // Iron Shield: Only count active inventory holds (confirmed or fresh pending)
        if (!ACTIVE_STATUSES.includes(p.status)) return acc;

        if (p.num_people === undefined || p.num_people === null) {
          Sentry.captureMessage(
            "Malformed Passenger Data: Missing num_people",
            {
              extra: { passengerId: p.id || p.uuid, status: p.status },
              level: "warning",
            }
          );
        }

        const count = p.num_people || 0; // Pruned fallbacks
        const id = p.id || p.uuid;
        acc.total += count;
        if (checkedIn[id]) {
          acc.boarded += count;
        }
        return acc;
      },
      { boarded: 0, total: 0 }
    );
  }, [selectedTour, checkedIn]);

  // Partition passengers into Operational and Forensic groups
  const { primaryList, inactiveList } = useMemo(() => {
    if (!selectedTour?.passengers) return { primaryList: [], inactiveList: [] };

    return selectedTour.passengers.reduce(
      (acc, p) => {
        if (INACTIVE_STATUSES.includes(p.status)) {
          acc.inactiveList.push(p);
        } else {
          acc.primaryList.push(p);
        }
        return acc;
      },
      { primaryList: [], inactiveList: [] }
    );
  }, [selectedTour]);

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

  const handleUpdateLogistics = async (logisticsData) => {
    if (!tourForLogistics) return;

    try {
      setIsSubmitting(true);
      const tourId = tourForLogistics.tour_id || tourForLogistics.id;
      const updatedTour = await patchTourLogistics(tourId, logisticsData);

      toast.success("Logistics updated successfully", { icon: "🕒" });
      setTourForLogistics(null);

      // If backend returns the updated tour, we can update it locally to flip the name/icon immediately
      if (updatedTour && typeof updatedTour === "object") {
        setTours((prev) =>
          prev.map((t) =>
            (t.tour_id || t.id) === tourId ? { ...t, ...updatedTour } : t
          )
        );
      }

      // Also refresh the full manifest to ensure everything is in sync
      if (onActionSuccess) onActionSuccess();
      await loadManifest();
    } catch (err) {
      toast.error(`Failed to update logistics: ${err.message}`);
    } finally {
      setIsSubmitting(false);
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
      <div className="flex flex-col w-full h-full duration-300 bg-white shadow-2xl animate-in slide-in-from-right relative">
        {/* Sticky Headcount Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 bg-emerald-600 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Users size={20} className="text-emerald-50" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white leading-none mb-1">
                Boarding Status
              </p>
              <h3 className="text-lg font-bold leading-none text-white">
                {headcount.boarded}{" "}
                <span className="text-white/80">/ {headcount.total}</span>
              </h3>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase text-white/90">
              Total Boarded
            </span>
            <span className="text-xl font-bold text-white">
              {headcount.total > 0
                ? Math.round((headcount.boarded / headcount.total) * 100)
                : 0}
              %
            </span>
          </div>
        </div>

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
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[10px] text-teal-400 font-bold uppercase">
                  Passenger List
                </p>
                {selectedTour.time && (
                  <>
                    <span className="text-teal-700">•</span>
                    <span className="text-[10px] font-black text-white bg-teal-600 px-1.5 py-0.5 rounded uppercase tracking-wider">
                      {selectedTour.time}
                    </span>
                  </>
                )}
              </div>
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
          <h3 className="mb-4 text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">
            Operational Manifest
          </h3>

          {primaryList.length > 0 ? (
            primaryList.map((p) => {
              const id = p.id || p.uuid;
              return (
                <PassengerRow
                  key={id}
                  passenger={p}
                  isCheckedIn={!!checkedIn[id]}
                  onCheckIn={toggleCheckIn}
                  onCancel={handleCancelBooking}
                />
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 bg-white border border-dashed rounded-xl">
              <p className="text-sm font-medium italic">
                No active passengers.
              </p>
            </div>
          )}

          {/* Forensic View: Inactive/Cancelled Bookings */}
          {inactiveList.length > 0 && (
            <div className="mt-8">
              <button
                onClick={() => setShowInactive(!showInactive)}
                className="flex items-center justify-between w-full p-3 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <span className="text-[10px] font-black tracking-widest text-gray-500 uppercase">
                  Cancelled / Inactive ({inactiveList.length})
                </span>
                {showInactive ? (
                  <ChevronUp size={16} className="text-gray-400" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400" />
                )}
              </button>

              {showInactive && (
                <div className="mt-4 space-y-3 opacity-60 grayscale">
                  {inactiveList.map((p) => {
                    const id = p.id || p.uuid;
                    return (
                      <PassengerRow
                        key={id}
                        passenger={p}
                        isCheckedIn={!!checkedIn[id]}
                        onCheckIn={toggleCheckIn}
                        onCancel={handleCancelBooking}
                      />
                    );
                  })}
                </div>
              )}
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
          <p className="text-xs font-black tracking-widest text-slate-500 uppercase">
            {format(date, "MMM do, yyyy")}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-slate-500 transition-colors rounded-full hover:bg-gray-100"
          aria-label="Close manifest"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 p-5 space-y-4 overflow-y-auto bg-gray-50/30">
        <h3 className="mb-2 text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">
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
              onSetLogistics={setTourForLogistics}
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

      <LogisticsModal
        isOpen={!!tourForLogistics}
        tour={tourForLogistics}
        onClose={() => setTourForLogistics(null)}
        onConfirm={handleUpdateLogistics}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default DayManifest;
