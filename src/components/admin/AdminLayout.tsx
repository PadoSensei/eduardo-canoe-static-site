import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { supabase } from "@/supabaseClient";
import type { Session } from "@supabase/supabase-js";
import {
  LayoutDashboard,
  Mail,
  LogOut,
  Lock,
  Loader2,
  Menu,
  X,
  Bell,
} from "lucide-react";
import config from "@/core/config";
import { useLanguage } from "@/context/LanguageContext";

interface MobileOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileOverlay: React.FC<MobileOverlayProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 transition-opacity duration-300 bg-slate-950/60 backdrop-blur-sm md:hidden"
      onClick={onClose}
      aria-hidden="true"
    />
  );
};

function createDevBypassSession(): Session {
  const expiresAt = Math.floor(Date.now() / 1000) + 3600;
  return {
    access_token: "bypass",
    refresh_token: "",
    expires_in: 3600,
    expires_at: expiresAt,
    token_type: "bearer",
    user: {
      id: "bypass",
      email: "Bypass Mode",
      user_metadata: {},
      app_metadata: {},
      aud: "authenticated",
      role: "authenticated",
      created_at: new Date().toISOString(),
    },
  } as Session;
}

const AdminLayout: React.FC = () => {
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

  useEffect(() => {
    if (isSidebarOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  const shouldBypass =
    !config.isProduction &&
    (import.meta.env.VITE_SKIP_AUTH === "true" ||
      location.search.includes("bypass=true"));

  useEffect(() => {
    isMounted.current = true;
    const recoverSession = () => {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.includes("auth-token")) {
            const data = JSON.parse(localStorage.getItem(key) || "");
            if (data?.user) return data;
          }
        }
      } catch {
        return null;
      }
      return null;
    };

    const local = recoverSession();
    if (local) setSession(local);
    else if (shouldBypass) setSession(createDevBypassSession());

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (isMounted.current && s) setSession(s);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      if (isMounted.current)
        setSession(s || (shouldBypass ? createDevBypassSession() : null));
    });

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, [shouldBypass]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/admin" },
    });
    if (isMounted.current) {
      if (error) setAuthMessage({ type: "error", text: error.message });
      else setAuthMessage({ type: "success", text: "Check your email!" });
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    navigate("/admin");
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
          <h1 className="mb-2 text-2xl font-bold text-center text-teal-900 font-lora text-uppercase">
            Admin Access
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              required
              placeholder="eduardo@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 outline-none text-slate-900 rounded-xl focus:ring-2 focus:ring-teal-500"
            />
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

  const menuItems = [
    {
      label: t("nav_operations") || "Operações",
      path: "/admin/operations",
      icon: LayoutDashboard,
    },
    {
      label: t("nav_notifications") || "Notificações",
      path: "/admin/activity",
      icon: Bell,
    },
    { label: t("nav_emails") || "E-mails", path: "/admin/emails", icon: Mail },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 md:flex-row text-slate-950">
      {!config.isProduction && (
        <div className="fixed top-0 left-0 w-full z-[100] h-1 bg-orange-600" />
      )}

      <header className="sticky top-0 z-40 flex items-center justify-between p-4 bg-white border-b-2 md:hidden border-slate-200">
        <h1 className="text-xl font-black tracking-tight uppercase text-slate-900 font-lora">
          EduCanoe Admin
        </h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle Menu"
        >
          {isSidebarOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </header>

      <MobileOverlay
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-60 bg-slate-950 text-white w-72 transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full p-6">
          <h1 className="hidden mb-10 text-2xl font-bold tracking-tight uppercase font-lora md:block">
            EduCanoe Admin
          </h1>
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const isActive =
                location.pathname.startsWith(item.path) ||
                (item.path === "/admin/operations" &&
                  location.pathname === "/admin");
              return (
                <Link
                  key={item.path}
                  to={item.path + (shouldBypass ? "?bypass=true" : "")}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all font-black uppercase text-xs tracking-widest ${isActive ? "bg-white text-slate-950 shadow-lg" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
                >
                  <item.icon size={20} /> <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="pt-6 border-t border-slate-800">
            <p className="text-[10px] mb-4 truncate font-mono text-slate-500 uppercase">
              {session.user.email}
            </p>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full gap-2 py-3 text-xs font-black tracking-widest uppercase transition-all border border-slate-700 rounded-xl text-slate-300 hover:bg-red-500 hover:text-white"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-h-0 overflow-x-hidden bg-white md:bg-gray-50">
        {/* IRON SHIELD: Passing the session down via Context */}
        <Outlet context={{ session }} />
      </main>
    </div>
  );
};

export default AdminLayout;
