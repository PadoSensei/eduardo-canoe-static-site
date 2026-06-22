import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import DashboardCalendar from "../components/dashboard/DashboardCalendar";
import DayManifest from "../components/dashboard/DayManifest";
import config from "@/core/config";

const Dashboard = () => {
  const { date } = useParams();
  const navigate = useNavigate();

  // IRON SHIELD: Inherit session from AdminLayout context
  const { session } = useOutletContext();

  const [selectedDate, setSelectedDate] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  // Sync internal date state with URL parameter
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
    <div className="relative animate-fadeIn">
      {!config.isProduction && (
        <div className="fixed top-2 right-2 z-[60] px-3 py-1 bg-orange-500/80 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg pointer-events-none">
          LOCAL DEV
        </div>
      )}

      <div className="p-2 mx-auto max-w-7xl md:p-6">
        {/* Header Section */}
        <div
          className={`mb-6 flex justify-between items-end ${selectedDate ? "hidden md:flex" : "flex"}`}
        >
          <div>
            <h1 className="text-2xl font-black tracking-tight uppercase text-slate-900 md:text-3xl font-lora">
              Operations
            </h1>
            <p className="text-xs font-medium text-slate-500">
              Logged in as{" "}
              <span className="font-bold text-teal-600">
                {session?.user?.email}
              </span>
            </p>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="relative flex flex-col items-start gap-6 lg:flex-row">
          <div className="w-full p-2 bg-white border shadow-sm lg:flex-1 rounded-3xl border-slate-100 md:p-4">
            <DashboardCalendar
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
              refreshKey={refreshKey}
            />
          </div>

          {/* Sidebar Manifest */}
          {selectedDate && (
            <div className="fixed inset-0 z-50 lg:static lg:z-auto lg:w-[450px] lg:shrink-0 lg:h-[calc(100vh-120px)] shadow-2xl lg:shadow-none bg-white">
              <DayManifest
                date={selectedDate}
                onClose={() => handleDateSelect(null)}
                onActionSuccess={triggerRefresh}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
