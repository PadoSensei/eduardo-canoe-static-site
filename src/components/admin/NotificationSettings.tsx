import React, { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Mail,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Info,
  CheckCircle2,
  CloudRain,
  PlusCircle,
  Eye,
  History,
  LayoutDashboard,
  LucideIcon,
} from "lucide-react";
import {
  getEmailSettings,
  updateEmailSetting,
  getActivityLog,
  getEmailPreview,
} from "@/api";
import type { EmailSetting, ActivityLog } from "@/api/schemas";
import { useLanguage } from "@/context/LanguageContext";
import EmailPreviewModal from "./EmailPreviewModal";

interface SettingCardProps {
  setting: EmailSetting;
  onToggle: (slug: string, currentState: boolean) => void;
  onTimeChange: (slug: string, newTime: string) => void;
  updatingSlugs: Set<string>;
}

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

const SettingCard: React.FC<SettingCardProps> = ({
  setting,
  onToggle,
  onTimeChange,
  updatingSlugs,
}) => {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-slate-900 text-sm">
              {setting.display_name}
            </h3>
          </div>
          <p className="text-xs text-slate-500 line-clamp-1">
            {setting.description}
          </p>
        </div>

        <button
          onClick={() => onToggle(setting.slug, setting.is_enabled)}
          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
            setting.is_enabled ? "bg-emerald-500" : "bg-slate-200"
          }`}
        >
          <span
            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
              setting.is_enabled ? "translate-x-5" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {setting.scheduled_time !== null && (
        <div
          className={`mt-3 pt-3 border-t border-slate-50 flex items-center justify-between ${
            !setting.is_enabled ? "opacity-40 pointer-events-none" : ""
          }`}
        >
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            <Clock size={12} />
            <span>Horário</span>
          </div>
          <div className="relative">
            <input
              type="time"
              defaultValue={setting.scheduled_time.substring(0, 5)}
              onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                onTimeChange(setting.slug, e.target.value)
              }
              className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            {updatingSlugs.has(setting.slug) && (
              <div className="absolute -right-5 top-1/2 -translate-y-1/2">
                <Loader2 size={10} className="animate-spin text-teal-600" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const NotificationSettings: React.FC = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<EmailSetting[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingSlugs, setUpdatingSlugs] = useState<Set<string>>(new Set());

  // Email Preview State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewTemplateName, setPreviewTemplateName] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [settingsData, activitiesData] = await Promise.all([
        getEmailSettings(),
        getActivityLog(),
      ]);
      if (settingsData) setSettings(settingsData);
      if (activitiesData) setActivities(activitiesData);
    } catch (err) {
      // Errors are handled by request wrapper
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData(false);
    }, 30000); // 30s polling
    return () => clearInterval(interval);
  }, []);

  const handleToggle = async (slug: string, currentState: boolean) => {
    const originalSettings = [...settings];
    setSettings((prev) =>
      prev.map((s) =>
        s.slug === slug ? { ...s, is_enabled: !currentState } : s
      )
    );
    const newStatusLabel = !currentState ? "ativado" : "desativado";
    const settingName =
      settings.find((s) => s.slug === slug)?.display_name || "Configuração";
    toast.success(`${settingName} ${newStatusLabel}`);
    try {
      await updateEmailSetting(slug, { is_enabled: !currentState });
    } catch (_err: unknown) {
      setSettings(originalSettings);
      toast.error("Erro ao salvar alteração.");
    }
  };

  const handleTimeChange = async (slug: string, newTime: string) => {
    if (!newTime) return;
    const formattedTime = `${newTime}:00`;
    const originalSettings = [...settings];
    setSettings((prev) =>
      prev.map((s) =>
        s.slug === slug ? { ...s, scheduled_time: formattedTime } : s
      )
    );
    setUpdatingSlugs((prev) => new Set(prev).add(slug));
    try {
      await updateEmailSetting(slug, { scheduled_time: formattedTime });
      toast.success("Horário atualizado");
    } catch (_err: unknown) {
      setSettings(originalSettings);
      toast.error("Erro ao atualizar horário");
    } finally {
      setUpdatingSlugs((prev) => {
        const next = new Set(prev);
        next.delete(slug);
        return next;
      });
    }
  };

  const handlePreview = async (slug: string, name: string) => {
    setPreviewTemplateName(name);
    setPreviewLoading(true);
    setIsPreviewOpen(true);
    try {
      const data = await getEmailPreview(slug);
      setPreviewHtml(data?.html || null);
    } catch (err) {
      setPreviewHtml(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const groupedSettings = useMemo(
    () => ({
      guest: settings.filter((s) => s.slug.startsWith("guest_")),
      admin: settings.filter((s) => s.slug.startsWith("admin_")),
    }),
    [settings]
  );

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
          {t("navNotifications") || "Command Center"}
        </h1>
        <p className="text-slate-500">
          Monitoramento em tempo real e gestão de comunicações do sistema.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column: Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col h-full min-h-[600px]">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <History className="text-teal-600" size={20} />
                <h2 className="text-lg font-bold text-teal-900">
                  Live Activity Feed
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

            <div className="flex-1 overflow-auto p-6">
              {activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 py-12">
                  <History size={48} className="opacity-20" />
                  <p>Nenhuma atividade recente encontrada.</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-100" />
                  <div className="space-y-8 relative">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex gap-4 relative">
                        <div className="relative z-10 w-8 h-8 shrink-0 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                          <ActivityIcon type={activity.event_type} />
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-slate-900 text-sm">
                              {activity.description}
                            </span>
                            <time className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                              {new Date(activity.timestamp).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" }
                              )}
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

        {/* Side Column: Settings & Gallery */}
        <div className="space-y-8">
          {/* Email Settings Panel */}
          <section className="bg-slate-50 border border-slate-100 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="text-teal-600" size={18} />
              <h2 className="font-bold text-teal-900">Email Controls</h2>
            </div>

            <div className="space-y-4">
              <div className="mb-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  Customer
                </h3>
                <div className="space-y-3">
                  {groupedSettings.guest.map((s) => (
                    <SettingCard
                      key={s.slug}
                      setting={s}
                      onToggle={handleToggle}
                      onTimeChange={handleTimeChange}
                      updatingSlugs={updatingSlugs}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  Internal
                </h3>
                <div className="space-y-3">
                  {groupedSettings.admin.map((s) => (
                    <SettingCard
                      key={s.slug}
                      setting={s}
                      onToggle={handleToggle}
                      onTimeChange={handleTimeChange}
                      updatingSlugs={updatingSlugs}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Template Gallery Panel */}
          <section className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <LayoutDashboard className="text-teal-600" size={18} />
              <h2 className="font-bold text-teal-900">Template Gallery</h2>
            </div>

            <div className="space-y-3">
              {[
                { slug: "guest_confirmation", name: "Guest Ticket" },
                { slug: "admin_notification", name: "New Booking Alert" },
                { slug: "admin_refund_list", name: "Daily Refund List" },
              ].map((item) => (
                <button
                  key={item.slug}
                  onClick={() => handlePreview(item.slug, item.name)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-50 hover:border-teal-200 hover:bg-teal-50/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-white transition-colors">
                      <Eye
                        size={16}
                        className="text-slate-400 group-hover:text-teal-600"
                      />
                    </div>
                    <span className="text-sm font-bold text-slate-700">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-slate-300 uppercase group-hover:text-teal-400">
                    Preview
                  </span>
                </button>
              ))}
            </div>
          </section>

          <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-[10px] text-slate-400 font-medium text-center leading-relaxed">
              TIMEZONE: PIPA/BR (GMT-3)
              <br />
              All automated events are triggered based on local operations time.
            </p>
          </div>
        </div>
      </div>

      <EmailPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        htmlContent={previewHtml}
        templateName={previewTemplateName}
        loading={previewLoading}
      />
    </div>
  );
};

export default NotificationSettings;
