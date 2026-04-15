// src/pages/Dashboard.jsx - Full File
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import DashboardCalendar from "../components/dashboard/DashboardCalendar";
import DayManifest from "../components/dashboard/DayManifest";
import { Lock, Mail, Loader2, LogOut } from "lucide-react";
import config from "@/core/config";

const Dashboard = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState(null);

  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  const isMounted = useRef(true);

  const location = useLocation();
  const shouldBypass =
    !config.isProduction &&
    (import.meta.env.VITE_SKIP_AUTH === "true" ||
      new URLSearchParams(location.search).get("bypass") === "true" ||
      window.location.search.includes("bypass=true"));

  useEffect(() => {
    isMounted.current = true;

    // --- HYBRID AUTH STRATEGY (PRODUCTION READY) ---

    // 1. Manual Bypass (Priority for E2E and Dev)
    if (shouldBypass) {
      setSession((prev) =>
        prev?.user?.email === "dev-tester@ai-solutions.irish"
          ? prev
          : { user: { email: "dev-tester@ai-solutions.irish" } }
      );
      return;
    }

    // 2. Manual Storage Recovery (Critical for Auth Setup stability)
    // We look for any auth token in storage to set state immediately
    const recoverSession = () => {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.includes("auth-token")) {
            const data = JSON.parse(localStorage.getItem(key));
            if (data && data.user) return data;
          }
        }
      } catch {
        return null;
      }
      return null;
    };

    const localSession = recoverSession();
    if (localSession) {
      setSession(localSession);
    }

    // 3. Supabase SDK Handlers
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (isMounted.current && currentSession) {
        setSession(currentSession);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (isMounted.current) setSession(currentSession);
    });

    return () => {
      isMounted.current = false;
      if (subscription) subscription.unsubscribe();
    };
  }, [shouldBypass]);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isMounted.current) return;
    setLoading(true);
    setAuthMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/admin" },
    });

    if (isMounted.current) {
      if (error) {
        setAuthMessage({ type: "error", text: error.message });
      } else {
        setAuthMessage({ type: "success", text: "Check your email!" });
      }
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (shouldBypass) {
      setSession(null);
      navigate("/admin");
      return;
    }

    await supabase.auth.signOut();
    if (isMounted.current) {
      setSession(null);
      navigate("/admin");
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
