// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardCalendar from "../components/dashboard/DashboardCalendar";
import DayManifest from "../components/dashboard/DayManifest";

const Dashboard = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);

  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  // Sync selectedDate with URL param
  useEffect(() => {
    if (date) {
      const parsedDate = new Date(date + "T12:00:00");
      if (!isNaN(parsedDate.getTime())) {
        setSelectedDate(parsedDate);
      }
    } else {
      setSelectedDate(null);
    }
  }, [date]);

  const handleDateSelect = (newDate) => {
    const search = window.location.search;
    if (newDate) {
      const dateString = newDate.toISOString().split("T")[0];
      navigate(`/admin/manifest/${dateString}${search}`);
    } else {
      navigate(`/admin${search}`);
    }
  };

  return (
    <div className="relative">
      <div
        className={`flex justify-between items-end mb-4 md:mb-6 ${
          selectedDate ? "hidden md:flex" : "flex"
        }`}
      >
        <div>
          <h1 className="text-2xl font-bold text-teal-900 md:text-3xl font-lora">
            Operations
          </h1>
          <p className="text-xs text-gray-500 md:text-sm">
            Manage your daily tours and passenger manifests.
          </p>
        </div>
      </div>
      <div className="relative flex flex-col items-start gap-6 lg:flex-row">
        <div className="w-full lg:flex-1">
          <DashboardCalendar
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
            refreshKey={refreshKey}
          />
        </div>
        {selectedDate && (
          <div className="fixed inset-0 z-50 lg:static lg:z-auto lg:w-[400px] lg:shrink-0 lg:h-[calc(100vh-100px)] shadow-2xl lg:shadow-none">
            <DayManifest
              date={selectedDate}
              onClose={() => handleDateSelect(null)}
              onActionSuccess={triggerRefresh}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
