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

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-gray-50">
        <div className="w-full max-w-md p-10 bg-white border border-gray-100 shadow-xl rounded-3xl">
          <div className="flex justify-center mb-6">
            <div className="p-4 text-teal-600 rounded-full bg-teal-50">
              <Lock size={32} />
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-center text-teal-900">
            Admin Access
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute text-gray-400 left-3 top-3" size={20} />
              <input
                type="email"
                required
                placeholder="eduardo@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-3 pl-10 pr-4 border border-gray-200 outline-none rounded-xl focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-bold text-white bg-teal-600 rounded-xl disabled:bg-gray-300"
            >
              {loading ? (
                <Loader2 className="mx-auto animate-spin" />
              ) : (
                "Send Magic Link"
              )}
            </button>
          </form>
          {authMessage && (
            <div
              className={`mt-6 p-4 rounded-lg text-sm text-center ${
                authMessage.type === "error"
                  ? "bg-red-50 text-red-600"
                  : "bg-green-50 text-green-600"
              }`}
            >
              {authMessage.text}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {!config.isProduction && (
        <div className="fixed top-2 right-2 z-[60] px-3 py-1 bg-orange-500/80 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg pointer-events-none">
          LOCAL DEV
        </div>
      )}
      <div className="p-2 mx-auto max-w-7xl md:p-6">
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
              Logged in as{" "}
              <span className="font-semibold">{session.user.email}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-bold tracking-widest text-gray-400 uppercase transition-colors hover:text-red-500"
          >
            <LogOut size={16} /> Logout
          </button>
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
    </div>
  );
};

export default Dashboard;
