import React, { useEffect, useState, useCallback, useRef } from "react";
import History from 'lucide-react/dist/esm/icons/history';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import Mail from 'lucide-react/dist/esm/icons/mail';
import CloudRain from 'lucide-react/dist/esm/icons/cloud-rain';
import PlusCircle from 'lucide-react/dist/esm/icons/plus-circle';
import Info from 'lucide-react/dist/esm/icons/info';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import Search from 'lucide-react/dist/esm/icons/search';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import Settings from 'lucide-react/dist/esm/icons/settings';
import { getActivityLog } from "@/api";
import type { ActivityLog } from "@/api/schemas";
import { useLanguage } from "@/context/LanguageContext";
import { formatDistanceToNow } from "date-fns";
import { ptBR, enUS, es, fr } from "date-fns/locale";

const ActivityIcon = ({
  type,
  category,
}: {
  type: string;
  category: string;
}) => {
  const t = type.toUpperCase();
  const c = category.toLowerCase();

  // Color mapping based on category for high-contrast tags
  const getCategoryStyles = () => {
    switch (c) {
      case "payments":
        return "border-emerald-200 bg-emerald-50 text-emerald-600";
      case "communications":
        return "border-blue-200 bg-blue-50 text-blue-600";
      case "bookings":
        return "border-teal-200 bg-teal-50 text-teal-600";
      default:
        return "border-slate-200 bg-slate-50 text-slate-600";
    }
  };

  const iconStyles = `relative z-10 w-10 h-10 shrink-0 rounded-xl border-2 flex items-center justify-center shadow-sm transition-colors ${getCategoryStyles()}`;

  if (t === "PAYMENT_CONFIRMED" || t === "SUCCESS" || c === "payments")
    return (
      <div className={iconStyles}>
        <CheckCircle2 size={20} />
      </div>
    );
  if (t === "EMAILS_SENT" || c === "communications")
    return (
      <div className={iconStyles}>
        <Mail size={20} />
      </div>
    );
  if (t === "WEATHER_CANCEL" || t === "ERROR")
    return (
      <div className={`${iconStyles} border-red-200 bg-red-50 text-red-600`}>
        <CloudRain size={20} />
      </div>
    );
  if (t === "BOOKING_CREATED" || c === "bookings")
    return (
      <div className={iconStyles}>
        <PlusCircle size={20} />
      </div>
    );
  if (c === "system")
    return (
      <div className={iconStyles}>
        <Settings size={20} />
      </div>
    );

  return (
    <div className={iconStyles}>
      <Info size={20} />
    </div>
  );
};

const ActivityView: React.FC = () => {
  const { t, language } = useLanguage();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [isPulsing, setIsPulsing] = useState(false);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getLocale = () => {
    switch (language) {
      case "pt":
        return ptBR;
      case "es":
        return es;
      case "fr":
        return fr;
      default:
        return enUS;
    }
  };

  const fetchActivities = useCallback(
    async (showLoading = true) => {
      if (showLoading) setLoading(true);
      try {
        const data = await getActivityLog({
          category,
          search: debouncedSearch,
        });
        if (Array.isArray(data)) {
          setActivities(data);
        }
      } catch (err) {
        // Errors handled by request wrapper
      } finally {
        if (showLoading) setLoading(false);
        setIsRefreshing(false);
      }
    },
    [category, debouncedSearch]
  );

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(() => {
      fetchActivities(false);
    }, 30000); // 30s polling
    return () => clearInterval(interval);
  }, [fetchActivities]);

  // Handle Debounced Search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [search]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setIsPulsing(true);
    fetchActivities(false);
    setTimeout(() => setIsPulsing(false), 600);
  };

  const categories = [
    { id: "all", label: t("admin_cc_filter_all") },
    { id: "payments", label: t("admin_cc_cat_payments") },
    { id: "communications", label: t("admin_cc_cat_communications") },
    { id: "bookings", label: t("admin_cc_cat_bookings") },
    { id: "system", label: t("admin_cc_cat_system") },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-teal-900 font-lora mb-2">
            {t("nav_activity")}
          </h1>
          <p className="text-slate-500 max-w-2xl">{t("admin_cc_subtitle")}</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
        >
          <RefreshCw
            size={18}
            className={`${isRefreshing ? "animate-spin text-teal-600" : ""}`}
          />
          {t("admin_cc_refresh")}
        </button>
      </header>

      {/* Controls Bar */}
      <div className="mb-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        <div className="lg:col-span-4 relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder={t("admin_cc_search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
          />
        </div>

        <div className="lg:col-span-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                category === cat.id
                  ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                  : "bg-white border border-slate-100 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <section className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col min-h-[600px] mb-12">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
              <History className="text-teal-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-teal-900 leading-none">
                {t("admin_cc_activity_feed")}
              </h2>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                {category.toUpperCase()} • {activities.length} Events
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-tighter">
                Live Monitoring
              </span>
            </div>
          </div>
        </div>

        <div
          className={`flex-1 p-8 transition-opacity duration-300 ${
            isPulsing ? "opacity-50" : "opacity-100"
          }`}
        >
          {loading && activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96">
              <Loader2 className="w-10 h-10 animate-spin text-teal-600 mb-4" />
              <p className="text-slate-400 font-medium">Synchronizing...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-slate-400 gap-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                <Search size={40} className="opacity-20" />
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-600">
                  {debouncedSearch
                    ? t("admin_cc_search_empty")
                    : t("admin_cc_activity_empty")}
                </p>
                <p className="text-sm opacity-60">
                  {t("admin_cc_activity_hint")}
                </p>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-[1.2rem] top-0 bottom-0 w-1 bg-slate-50 rounded-full" />
              <div className="space-y-10 relative">
                {activities.map((activity, idx) => (
                  <div
                    key={activity.id || `act-${idx}`}
                    className="flex gap-6 relative group"
                  >
                    <ActivityIcon
                      type={activity.event_type}
                      category={activity.category}
                    />

                    <div className="flex-1 pt-1.5">
                      <div className="flex justify-between items-start mb-1 gap-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-lg group-hover:text-teal-700 transition-colors">
                            {activity.description}
                          </span>
                          {activity.tour_details && (
                            <span className="text-xs font-medium text-slate-500 mt-0.5 flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              {activity.tour_details}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span
                            title={new Date(
                              activity.timestamp
                            ).toLocaleString()}
                            className="text-[11px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full whitespace-nowrap"
                          >
                            {formatDistanceToNow(new Date(activity.timestamp), {
                              addSuffix: true,
                              locale: getLocale(),
                            })}
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                              activity.category === "payments"
                                ? "border-emerald-200 text-emerald-600 bg-emerald-50/50"
                                : activity.category === "communications"
                                  ? "border-blue-200 text-blue-600 bg-blue-50/50"
                                  : activity.category === "bookings"
                                    ? "border-teal-200 text-teal-600 bg-teal-50/50"
                                    : "border-slate-200 text-slate-500 bg-slate-50/50"
                            }`}
                          >
                            {activity.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                            {activity.guest_name?.charAt(0) || "G"}
                          </div>
                          <span className="text-slate-600 font-semibold">
                            {activity.guest_name}
                          </span>
                        </div>
                        <div className="h-4 w-px bg-slate-100" />
                        <span className="text-xs font-mono text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded">
                          #{activity.display_id}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ActivityView;
