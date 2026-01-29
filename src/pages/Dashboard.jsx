import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import DashboardCalendar from "../components/dashboard/DashboardCalendar";
import DayManifest from "../components/dashboard/DayManifest";
import { Lock, Mail, Loader2, LogOut } from "lucide-react";

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState(null);

  // 1. Listen for Auth changes (detects when they click the Magic Link)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Handle Magic Link Request
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // This ensures the link sends them back to the admin page
        emailRedirectTo: window.location.origin + "/admin",
      },
    });

    if (error) {
      setAuthMessage({ type: "error", text: error.message });
    } else {
      setAuthMessage({
        type: "success",
        text: "Check your email for the login link!",
      });
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSelectedDate(null);
  };

  // --- STATE A: NOT LOGGED IN (The Gate) ---
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
          <p className="mb-8 text-sm text-center text-gray-500">
            Enter your email to receive a secure login link.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute text-gray-400 left-3 top-3" size={20} />
              <input
                type="email"
                required
                placeholder="eduardo@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-3 pl-10 pr-4 transition-all border border-gray-200 outline-none rounded-xl focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center w-full gap-2 py-3 font-bold text-white transition-all bg-teal-600 shadow-lg hover:bg-teal-700 rounded-xl"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
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

  // --- STATE B: AUTHORIZED (The Original Dashboard) ---
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-2 mx-auto max-w-7xl md:p-6">
        {/* Page Header */}
        <div
          className={`flex justify-between items-end mb-4 md:mb-6 ${
            selectedDate ? "hidden md:flex" : "flex"
          }`}
        >
          <div>
            <h1 className="text-2xl font-bold text-teal-900 md:text-3xl">
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
              onDateSelect={setSelectedDate}
              selectedDate={selectedDate}
            />
          </div>

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
