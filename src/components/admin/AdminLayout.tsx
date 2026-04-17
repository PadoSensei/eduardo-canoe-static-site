import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/supabaseClient";
import { Session } from "@supabase/supabase-js";
import {
  LayoutDashboard,
  Mail,
  LogOut,
  Lock,
  Loader2,
  Menu,
  X,
  LucideIcon,
} from "lucide-react";
import config from "@/core/config";
import { useLanguage } from "@/context/LanguageContext";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMounted = useRef(true);

  const shouldBypass =
    !config.isProduction &&
    (import.meta.env.VITE_SKIP_AUTH === "true" ||
      new URLSearchParams(location.search).get("bypass") === "true");

  useEffect(() => {
    isMounted.current = true;

    if (shouldBypass) {
      setSession({
        user: { email: "Bypass Mode", id: "bypass" },
        access_token: null,
        refresh_token: null,
        expires_in: 0,
        token_type: "bearer",
      } as unknown as Session);
    }

    const recoverSession = () => {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.includes("auth-token")) {
            const data = JSON.parse(localStorage.getItem(key) || "");
            if (data && data.user) return data;
          }
        }
      } catch {
        return null;
      }
      return null;
    };

    const localSession = recoverSession();
    if (localSession) setSession(localSession);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
              className={`mt-6 p-4 rounded-lg text-sm text-center ${authMessage.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}
            >
              {authMessage.text}
            </div>
          )}
        </div>
      </div>
    );
  }

  const menuItems: { label: string; path: string; icon: LucideIcon }[] = [
    { label: "Operations", path: "/admin", icon: LayoutDashboard },
    {
      label: t("navNotifications") || "Notifications",
      path: "/admin/settings",
      icon: Mail,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {!config.isProduction && (
        <div className="fixed top-2 right-2 z-[70] px-3 py-1 bg-orange-500/80 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg pointer-events-none">
          LOCAL DEV
        </div>
      )}

      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center z-50">
        <h1 className="text-xl font-bold text-teal-900 font-lora">
          Admin Suite
        </h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-0 z-40 bg-teal-900 text-white w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold font-lora mb-8 hidden md:block">
            Admin Suite
          </h1>
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path === "/admin" &&
                  location.pathname.startsWith("/admin/manifest"));
              return (
                <Link
                  key={item.path}
                  to={item.path + (shouldBypass ? "?bypass=true" : "")}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive
                      ? "bg-teal-800 text-white"
                      : "text-teal-100 hover:bg-teal-800/50"
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="absolute bottom-0 w-full p-6 border-t border-teal-800">
          <p className="text-xs text-teal-300 mb-4 truncate">
            {session.user?.email}
          </p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-bold tracking-widest text-teal-400 uppercase hover:text-red-400 transition-colors w-full"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8">{children}</main>
    </div>
  );
};

export default AdminLayout;
