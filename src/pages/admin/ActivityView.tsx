import React, { useEffect, useState } from "react";
import {
  History,
  CheckCircle2,
  Mail,
  CloudRain,
  PlusCircle,
  Info,
  Loader2,
} from "lucide-react";
import { getActivityLog } from "@/api";
import type { ActivityLog } from "@/api/schemas";
import { useLanguage } from "@/context/LanguageContext";

const ActivityIcon = ({ type }: { type: string }) => {
  const t = type.toUpperCase();
  if (t === "PAYMENT_CONFIRMED" || t === "SUCCESS")
    return <CheckCircle2 className="text-emerald-500" size={18} />;
  if (t === "EMAILS_SENT") return <Mail className="text-blue-500" size={18} />;
  if (t === "WEATHER_CANCEL" || t === "ERROR")
    return <CloudRain className="text-red-500" size={18} />;
  if (t === "BOOKING_CREATED")
    return <PlusCircle className="text-teal-500" size={18} />;
  return <Info className="text-slate-400" size={18} />;
};

const ActivityView: React.FC = () => {
  const { t } = useLanguage();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await getActivityLog();
      if (Array.isArray(data)) {
        setActivities(data);
      }
    } catch (err) {
      // Errors handled by request wrapper
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(() => {
      fetchActivities(false);
    }, 30000); // 30s polling
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-teal-900 font-lora mb-2">
          {t("nav_activity")}
        </h1>
        <p className="text-slate-500">{t("admin_cc_subtitle")}</p>
      </header>

      <section className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <History className="text-teal-600" size={20} />
            <h2 className="text-lg font-bold text-teal-900">
              {t("admin_cc_activity_feed")}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-100 rounded-full">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-tighter">
                Live
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 py-12">
              <History size={48} className="opacity-20" />
              <p>{t("admin_cc_activity_empty")}</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-100" />
              <div className="space-y-8 relative">
                {activities.map((activity, idx) => (
                  <div
                    key={activity.id || `act-${idx}`}
                    className="flex gap-4 relative"
                  >
                    <div className="relative z-10 w-8 h-8 shrink-0 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                      <ActivityIcon type={activity.event_type} />
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-900 text-sm">
                          {activity.description}
                        </span>
                        <time className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                          {new Date(activity.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </time>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-slate-500 font-medium">
                          {activity.guest_name}
                        </span>
                        <span className="text-slate-300 font-mono">
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
