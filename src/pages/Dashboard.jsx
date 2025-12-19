import React, { useState } from "react";
import DashboardCalendar from "../components/dashboard/DashboardCalendar";
import DayManifest from "../components/dashboard/DayManifest";

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(null);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto md:p-6 p-2">
        {/* Page Header - Hides on mobile if a date is open to save space */}
        <div
          className={`flex justify-between items-center mb-4 md:mb-6 ${
            selectedDate ? "hidden md:flex" : "flex"
          }`}
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-teal-900">
              Operations
            </h1>
            <p className="text-xs md:text-sm text-gray-500">
              Tap a date to manage bookings.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 relative items-start">
          {/* CALENDAR: Full width on mobile. On desktop, it takes available space. */}
          <div className="w-full lg:flex-1">
            <DashboardCalendar
              onDateSelect={setSelectedDate}
              selectedDate={selectedDate}
            />
          </div>

          {/* MANIFEST PANEL: 
              Mobile: Fixed Full Screen Overlay (z-50) covering everything.
              Desktop: Static Side Column (width 400px) sitting next to calendar.
          */}
          {selectedDate && (
            <div className="fixed inset-0 z-50 lg:static lg:z-auto lg:w-[400px] lg:shrink-0 lg:h-[calc(100vh-100px)]">
              <DayManifest
                date={selectedDate}
                onClose={() => setSelectedDate(null)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
