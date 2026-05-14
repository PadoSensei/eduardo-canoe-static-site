import React, { useState, useEffect, useMemo } from "react";
import { startOfMonth } from "date-fns";
import { endOfMonth } from "date-fns";
import { startOfWeek } from "date-fns";
import { endOfWeek } from "date-fns";
import { eachDayOfInterval } from "date-fns";
import { format } from "date-fns";
import { isSameMonth } from "date-fns";
import { isSameDay } from "date-fns";
import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import { fetchMonthlySchedule } from "../../api";
import { formatCurrency } from "../../utils/formatters";

const DashboardCalendar = ({ onDateSelect, selectedDate, refreshKey }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookingData, setBookingData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      setLoading(true);
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;

        const data = await fetchMonthlySchedule(year, month, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        const formattedData = {};
        if (data) {
          Object.keys(data).forEach((dateKey) => {
            const dayStats = data[dateKey];
            formattedData[dateKey] = {
              ...dayStats,
              bookings: dayStats.booked_count || 0,
              price: dayStats.price || 0,
              revenue: dayStats.revenue || 0,
              percent:
                dayStats.capacity > 0
                  ? (dayStats.booked_count || 0) / dayStats.capacity
                  : 0,
            };
          });
        }

        setBookingData(formattedData);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Failed to load live calendar data:", err);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => controller.abort();
  }, [currentDate, refreshKey]); // RE-FETCH when Manifest triggers a change

  const monthlyRevenue = useMemo(() => {
    return Object.values(bookingData).reduce((total, day) => {
      if (day.status?.includes("cancelled")) return total;
      return total + (day.revenue || 0);
    }, 0);
  }, [bookingData]);

  const monthStart = startOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(monthStart),
    end: endOfWeek(endOfMonth(monthStart)),
  });

  const getStyleForDate = (day) => {
    const dateKey = format(day, "yyyy-MM-dd");
    const data = bookingData[dateKey];

    let classes =
      "relative border border-gray-100 cursor-pointer transition-all duration-200 h-16 md:h-32 ";

    if (!isSameMonth(day, monthStart))
      return classes + "bg-gray-50/50 text-slate-400";

    if (selectedDate && isSameDay(day, selectedDate)) {
      classes += "ring-4 ring-teal-600 ring-inset z-10 bg-teal-50/30 ";
    }

    if (!data) return classes + "bg-white";

    if (data.status?.includes("cancelled"))
      return (
        classes + "bg-gray-200 text-slate-500 striped-background font-black"
      );

    if (data.bookings === 0) return classes + "bg-white hover:bg-gray-50";
    if (data.percent < 0.4)
      return classes + "bg-teal-50 hover:bg-teal-100 text-teal-900";
    if (data.percent < 0.8)
      return classes + "bg-teal-100 hover:bg-teal-200 text-teal-900";

    return classes + "bg-teal-600 text-white font-semibold";
  };

  return (
    <div className="relative overflow-hidden bg-white border border-gray-100 shadow-lg rounded-xl">
      {loading && (
        <div className="absolute inset-0 z-20 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        </div>
      )}

      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-gray-800 md:text-2xl font-lora">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm uppercase tracking-wider">
            <DollarSign size={16} />
            <span>Revenue: {formatCurrency(monthlyRevenue)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() =>
              // FIX: Ensure we land on the 1st to avoid month-end length mismatches
              setCurrentDate(
                new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth() - 1,
                  1
                )
              )
            }
            className="p-2 border-2 border-slate-200 rounded-lg hover:bg-slate-100 transition-colors text-slate-900 opacity-100"
            aria-label="Previous Month"
          >
            <ChevronLeft size={24} strokeWidth={3} />
          </button>
          <button
            onClick={() =>
              // FIX: Ensure we land on the 1st to avoid month-end length mismatches
              setCurrentDate(
                new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth() + 1,
                  1
                )
              )
            }
            className="p-2 border-2 border-slate-200 rounded-lg hover:bg-slate-100 transition-colors text-slate-900 opacity-100"
            aria-label="Next Month"
          >
            <ChevronRight size={24} strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
          <div
            key={i}
            className="py-2 text-xs font-black text-center text-slate-500"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {calendarDays.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const data = bookingData[dateKey];
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          return (
            <div
              key={day.toString()}
              onClick={() => onDateSelect(day)}
              className={getStyleForDate(day)}
            >
              <div className="flex flex-col items-start h-full p-2">
                <span
                  className={`text-xs font-black md:text-sm ${
                    isSelected
                      ? "text-teal-900"
                      : isSameMonth(day, monthStart)
                        ? "text-slate-700"
                        : "text-slate-400"
                  }`}
                >
                  {format(day, "d")}
                </span>
                {data && isSameMonth(day, monthStart) && data.capacity > 0 && (
                  <div
                    className={`mt-auto text-[9px] md:text-xs font-black ${
                      data.percent >= 0.8 ? "text-white" : "text-slate-600"
                    }`}
                  >
                    {data.bookings}/{data.capacity}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 bg-gray-50 text-[10px] md:text-xs grid grid-cols-3 md:flex md:gap-6 text-gray-600 border-t border-gray-100 gap-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-white border rounded"></div> Empty
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border border-teal-100 rounded bg-teal-50"></div>{" "}
          Low
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-teal-100 border border-teal-200 rounded"></div>{" "}
          Busy
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-teal-600 border border-teal-700 rounded"></div>{" "}
          Full
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-200 border border-gray-300 rounded"></div>{" "}
          Closed
        </div>
      </div>
    </div>
  );
};

export default DashboardCalendar;
