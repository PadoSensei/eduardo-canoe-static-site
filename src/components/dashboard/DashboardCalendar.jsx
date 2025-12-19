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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getDayDetails } from "../../utils/mockData";

const DashboardCalendar = ({ onDateSelect, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookingData, setBookingData] = useState({});

  useEffect(() => {
    // Generate data for the view
    const data = {};
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });

    days.forEach((day) => {
      const tours = getDayDetails(day);
      const totalCapacity = tours.reduce((sum, t) => sum + t.capacity, 0);
      const totalBooked = tours.reduce((sum, t) => sum + t.booked, 0);
      const allCancelled = tours.every((t) => t.status === "cancelled");

      data[format(day, "yyyy-MM-dd")] = {
        status: allCancelled ? "cancelled" : "available",
        bookings: totalBooked,
        capacity: totalCapacity,
        percent: totalCapacity > 0 ? totalBooked / totalCapacity : 0,
      };
    });
    setBookingData(data);
  }, [currentDate]);

  const monthStart = startOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(monthStart),
    end: endOfWeek(endOfMonth(monthStart)),
  });

  const getStyleForDate = (day) => {
    const dateKey = format(day, "yyyy-MM-dd");
    const data = bookingData[dateKey];

    // Base styles
    let classes =
      "relative border border-gray-100 cursor-pointer transition-all duration-200 ";

    // RESPONSIVE HEIGHT: h-14 on mobile, h-32 on desktop
    classes += "h-14 md:h-32 ";

    // Grey out days not in current month
    if (!isSameMonth(day, monthStart))
      return classes + "bg-gray-50/50 text-gray-300";
    if (!data) return classes + "bg-white";

    // Highlight selected day
    if (selectedDate && isSameDay(day, selectedDate)) {
      classes += "ring-2 ring-teal-600 ring-inset z-10 ";
    }

    if (data.status === "cancelled")
      return classes + "bg-gray-200 text-gray-400 striped-background";

    // Heatmap Colors
    if (data.bookings === 0) return classes + "bg-white hover:bg-gray-50";
    if (data.percent < 0.4)
      return classes + "bg-teal-50 hover:bg-teal-100 text-teal-900";
    if (data.percent < 0.8)
      return classes + "bg-teal-100 hover:bg-teal-200 text-teal-900";
    return classes + "bg-teal-600 text-white font-semibold";
  };

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
      {/* Header controls */}
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <h2 className="text-lg md:text-2xl font-bold text-gray-800">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.setMonth(currentDate.getMonth() - 1))
              )
            }
            className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.setMonth(currentDate.getMonth() + 1))
              )
            }
            className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Days Header - abbreviated on all screens */}
      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
          <div
            key={i}
            className="py-2 text-center text-xs font-bold text-gray-400"
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
              <div className="p-1 md:p-2 text-xs md:text-sm font-medium flex justify-between items-center">
                <span>{format(day, "d")}</span>

                {/* Mobile Dot: Shows a white pulse if the day is very busy */}
                {data?.percent > 0.8 && isSameMonth(day, monthStart) && (
                  <div className="md:hidden w-1.5 h-1.5 rounded-full bg-white/80"></div>
                )}
              </div>

              {/* Desktop Details: Hidden on mobile (block on md) */}
              {data?.bookings > 0 &&
                isSameMonth(day, monthStart) &&
                data.status !== "cancelled" && (
                  <div className="hidden md:block absolute bottom-2 right-2 text-right">
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

      {/* Responsive Legend */}
      <div className="p-3 bg-gray-50 text-[10px] md:text-xs grid grid-cols-3 md:flex md:gap-6 text-gray-600 border-t border-gray-100 gap-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-white border rounded"></div> Empty
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-teal-50 border border-teal-100 rounded"></div>{" "}
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
