import React, { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import Mail from "lucide-react/dist/esm/icons/mail";
import Clock from "lucide-react/dist/esm/icons/clock";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Eye from "lucide-react/dist/esm/icons/eye";
import LayoutDashboard from "lucide-react/dist/esm/icons/layout-dashboard";
import { getEmailSettings, updateEmailSetting, getEmailPreview } from "@/api";
import type { EmailSetting } from "@/api/schemas";
import { useLanguage } from "@/context/LanguageContext";
import EmailPreviewModal from "@/components/admin/EmailPreviewModal";
import ConfirmationModal from "@/components/common/ConfirmationModal";

interface SettingCardProps {
  setting: EmailSetting;
  onToggle: (slug: string, currentState: boolean) => void;
  onTimeChange: (slug: string, newTime: string) => void;
  updatingSlugs: Set<string>;
}

const SettingCard: React.FC<SettingCardProps> = ({
  setting,
  onToggle,
  onTimeChange,
  updatingSlugs,
}) => {
  const { t } = useLanguage();
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
          disabled={updatingSlugs.has(setting.slug)}
          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
            setting.is_enabled ? "bg-emerald-500" : "bg-slate-200"
          }`}
        >
          {updatingSlugs.has(setting.slug) ? (
            <Loader2
              size={10}
              className="animate-spin text-teal-600 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            />
          ) : (
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                setting.is_enabled ? "translate-x-5" : "translate-x-1"
              }`}
            />
          )}
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
            <span>{t("admin_cc_time_label")}</span>
          </div>
          <div className="relative">
            <input
              type="time"
              defaultValue={setting.scheduled_time.substring(0, 5)}
              onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                onTimeChange(setting.slug, e.target.value)
              }
              className="bg-white border border-slate-100 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
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

const EmailsView: React.FC = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<EmailSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingSlugs, setUpdatingSlugs] = useState<Set<string>>(new Set());

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    slug: string;
    currentState: boolean;
    name: string;
  }>({
    isOpen: false,
    slug: "",
    currentState: false,
    name: "",
  });

  // Email Preview State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewTemplateName, setPreviewTemplateName] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await getEmailSettings();
      if (Array.isArray(data)) {
        setSettings(data);
      }
    } catch (err) {
      // Errors are handled by request wrapper
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggle = (slug: string, currentState: boolean) => {
    const settingName =
      settings.find((s) => s.slug === slug)?.display_name || "Configuração";
    setConfirmModal({
      isOpen: true,
      slug,
      currentState,
      name: settingName,
    });
  };

  const executeToggle = async () => {
    const { slug, currentState } = confirmModal;
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    setUpdatingSlugs((prev) => new Set(prev).add(slug));

    try {
      const updated = await updateEmailSetting(slug, {
        is_enabled: !currentState,
      });
      if (updated) {
        setSettings((prev) =>
          prev.map((s) => (s.slug === slug ? { ...s, ...updated } : s))
        );
        toast.success(t("admin_cc_toast_settings_updated"));
      }
    } catch (_err: unknown) {
      toast.error(t("admin_cc_toast_error"));
    } finally {
      setUpdatingSlugs((prev) => {
        const next = new Set(prev);
        next.delete(slug);
        return next;
      });
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
      toast.success(t("admin_cc_toast_time_success"));
    } catch (_err: unknown) {
      setSettings(originalSettings);
      toast.error(t("admin_cc_toast_time_error"));
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

  const galleryTemplates = [
    {
      slug: "guest_confirmation",
      name: t("admin_cc_tpl_guest_ticket"),
      isScheduled: false,
    },
    {
      slug: "guest_reminder_24h",
      name: t("admin_cc_tpl_guest_reminder"),
      isScheduled: true,
    },
    {
      slug: "guest_weather_cancel",
      name: t("admin_cc_tpl_guest_cancel"),
      isScheduled: false,
    },
    {
      slug: "guest_review_request",
      name: t("admin_cc_tpl_guest_review"),
      isScheduled: true,
    },
    {
      slug: "admin_notification",
      name: t("admin_cc_tpl_new_booking"),
      isScheduled: false,
    },
    {
      slug: "admin_daily_manifest",
      name: t("admin_cc_tpl_admin_manifest"),
      isScheduled: true,
    },
    {
      slug: "admin_refund_list",
      name: t("admin_cc_tpl_refund_list"),
      isScheduled: false,
    },
    {
      slug: "admin_monthly_summary",
      name: t("admin_cc_tpl_admin_summary"),
      isScheduled: true,
    },
  ];

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
          {t("nav_emails")}
        </h1>
        <p className="text-slate-500">{t("admin_cc_subtitle")}</p>
      </header>

      <div className="space-y-8">
        {/* Email Settings Section */}
        <section className="bg-slate-50 border border-slate-100 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="text-teal-600" size={18} />
            <h2 className="font-bold text-teal-900 text-lg">
              {t("admin_cc_email_controls")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                {t("admin_cc_customer")}
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
                {t("admin_cc_internal")}
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

        {/* Template Gallery Section */}
        <section className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <LayoutDashboard className="text-teal-600" size={18} />
            <h2 className="font-bold text-teal-900 text-lg">
              {t("admin_cc_template_gallery")}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {galleryTemplates.map((item) => (
              <div
                key={item.slug}
                className="flex flex-col justify-between p-4 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all group"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        item.isScheduled
                          ? "bg-purple-100 text-purple-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {item.isScheduled
                        ? t("admin_cc_badge_scheduled")
                        : t("admin_cc_badge_instant")}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-700 mb-1">
                    {item.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mb-4">
                    {item.slug.includes("guest")
                      ? t("admin_cc_customer")
                      : t("admin_cc_internal")}
                  </p>
                </div>
                <button
                  onClick={() => handlePreview(item.slug, item.name)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-50 text-slate-600 hover:bg-teal-600 hover:text-white transition-all text-xs font-bold"
                >
                  <Eye size={14} />
                  {t("admin_cc_preview")}
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-[10px] text-slate-400 font-medium text-center leading-relaxed">
            {t("admin_cc_timezone_warning")}
          </p>
        </div>
      </div>

      <EmailPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        htmlContent={previewHtml}
        templateName={previewTemplateName}
        loading={previewLoading}
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={t("admin_cc_confirm_toggle_title")}
        description={t("admin_cc_confirm_toggle_description")
          .replace(
            "{{action}}",
            confirmModal.currentState
              ? t("admin_cc_toast_disabled")
              : t("admin_cc_toast_activated")
          )
          .replace("{{name}}", confirmModal.name)}
        confirmLabel={t("admin_cc_confirm_toggle_confirm")}
        cancelLabel={t("admin_cc_confirm_toggle_cancel")}
        onConfirm={executeToggle}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        variant={confirmModal.currentState ? "danger" : "info"}
      />
    </div>
  );
};

export default EmailsView;
