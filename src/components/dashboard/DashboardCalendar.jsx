import React, { useState, useEffect, useMemo } from "react";
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
import { ChevronLeft, ChevronRight, Loader2, DollarSign } from "lucide-react";
import { fetchMonthlySchedule } from "../../api";

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
              price: parseFloat(dayStats.price || 0),
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
      return total + day.bookings * day.price;
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
      return classes + "bg-gray-50/50 text-gray-300";

    if (selectedDate && isSameDay(day, selectedDate)) {
      classes += "ring-2 ring-teal-600 ring-inset z-10 ";
    }

    if (!data) return classes + "bg-white";

    if (data.status?.includes("cancelled"))
      return classes + "bg-gray-200 text-gray-400 striped-background";

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
          <div className="flex items-center gap-1.5 text-teal-600 font-bold text-xs uppercase tracking-wider">
            <DollarSign size={14} />
            <span>
              Revenue: R${" "}
              {monthlyRevenue.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </span>
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
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100"
            aria-label="Previous Month"
          >
            <ChevronLeft size={20} />
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
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100"
            aria-label="Next Month"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

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
              <div className="flex flex-col items-start h-full p-2">
                <span className="text-xs font-bold md:text-sm">
                  {format(day, "d")}
                </span>
                {data && isSameMonth(day, monthStart) && data.capacity > 0 && (
                  <div className="mt-auto text-[9px] md:text-xs font-black opacity-60">
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
