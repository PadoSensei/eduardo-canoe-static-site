import React, { useState, useEffect } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
} from "date-fns";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
// REPLACED MOCK WITH REAL API
import { fetchMonthlySchedule } from "../../api";

const DashboardCalendar = ({ onDateSelect, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookingData, setBookingData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1; // getMonth is 0-indexed

        // Fetch real data from Railway
        const data = await fetchMonthlySchedule(year, month);

        /**
         * The backend returns a map of dates:
         * { "2026-02-07": { "booked_count": 20, "capacity": 28, "status": "available" } }
         * We map "booked_count" to "bookings" to keep your existing style logic working.
         */
        const formattedData = {};
        Object.keys(data).forEach((dateKey) => {
          const dayStats = data[dateKey];
          formattedData[dateKey] = {
            ...dayStats,
            bookings: dayStats.booked_count || 0,
            // Calculate percentage for the heatmap
            percent:
              dayStats.capacity > 0
                ? (dayStats.booked_count || 0) / dayStats.capacity
                : 0,
          };
        });

        setBookingData(formattedData);
      } catch (err) {
        console.error("Failed to load live calendar data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentDate]);

  const monthStart = startOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(monthStart),
    end: endOfWeek(endOfMonth(monthStart)),
  });

  const getStyleForDate = (day) => {
    const dateKey = format(day, "yyyy-MM-dd");
    const data = bookingData[dateKey];

    let classes =
      "relative border border-gray-100 cursor-pointer transition-all duration-200 h-14 md:h-32 ";

    if (!isSameMonth(day, monthStart))
      return classes + "bg-gray-50/50 text-gray-300";

    // Highlight selected day
    if (selectedDate && isSameDay(day, selectedDate)) {
      classes += "ring-2 ring-teal-600 ring-inset z-10 ";
    }

    if (!data) return classes + "bg-white";

    if (data.status === "cancelled" || data.status === "cancelled_weather")
      return classes + "bg-gray-200 text-gray-400 striped-background";

    // Heatmap Colors based on LIVE percentage
    if (data.bookings === 0) return classes + "bg-white hover:bg-gray-50";
    if (data.percent < 0.4)
      return classes + "bg-teal-50 hover:bg-teal-100 text-teal-900";
    if (data.percent < 0.8)
      return classes + "bg-teal-100 hover:bg-teal-200 text-teal-900";

    return classes + "bg-teal-600 text-white font-semibold";
  };

  return (
    <div className="relative overflow-hidden bg-white border border-gray-100 shadow-lg rounded-xl">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        </div>
      )}

      {/* Header controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 md:text-2xl">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.setMonth(currentDate.getMonth() - 1))
              )
            }
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.setMonth(currentDate.getMonth() + 1))
              )
            }
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
          <div
            key={i}
            className="py-2 text-xs font-bold text-center text-gray-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const data = bookingData[dateKey];

          return (
            <div
              key={day.toString()}
              onClick={() => onDateSelect(day)}
              className={getStyleForDate(day)}
            >
              <div className="flex items-center justify-between p-1 text-xs font-medium md:p-2 md:text-sm">
                <span>{format(day, "d")}</span>
                {data?.percent > 0.8 && isSameMonth(day, monthStart) && (
                  <div className="md:hidden w-1.5 h-1.5 rounded-full bg-white/80"></div>
                )}
              </div>

              {/* Desktop Details */}
              {data?.bookings > 0 &&
                isSameMonth(day, monthStart) &&
                !data.status.includes("cancelled") && (
                  <div className="absolute hidden text-right md:block bottom-2 right-2">
                    <div className="text-xs font-bold">
                      {data.bookings}/{data.capacity}
                    </div>
                    <div className="text-[10px] opacity-80">Booked</div>
                  </div>
                )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
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
