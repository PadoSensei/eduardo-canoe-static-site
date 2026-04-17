import React, { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Mail,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Info,
  LucideIcon,
} from "lucide-react";
import { getEmailSettings, updateEmailSetting } from "@/api";
import type { EmailSetting } from "@/api/schemas";
import { useLanguage } from "@/context/LanguageContext";

interface SettingCardProps {
  setting: EmailSetting;
}

interface SectionProps {
  title: string;
  items: EmailSetting[];
  icon: LucideIcon;
}

const NotificationSettings: React.FC = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<EmailSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingSlugs, setUpdatingSlugs] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getEmailSettings();
        if (data) setSettings(data);
      } catch (err) {
        // Error is handled by request wrapper
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const groupedSettings = useMemo(() => {
    return {
      guest: settings.filter((s) => s.slug.startsWith("guest_")),
      admin: settings.filter((s) => s.slug.startsWith("admin_")),
      other: settings.filter(
        (s) => !s.slug.startsWith("guest_") && !s.slug.startsWith("admin_")
      ),
    };
  }, [settings]);

  const handleToggle = async (slug: string, currentState: boolean) => {
    const originalSettings = [...settings];

    // Optimistic UI
    setSettings((prev) =>
      prev.map((s) =>
        s.slug === slug ? { ...s, is_enabled: !currentState } : s
      )
    );

    const newStatusLabel = !currentState ? "ativado" : "desativado";
    const settingName =
      settings.find((s) => s.slug === slug)?.display_name ||
      "Configuração";
    toast.success(`${settingName} ${newStatusLabel}`);

    try {
      await updateEmailSetting(slug, { is_enabled: !currentState });
    } catch (_err: unknown) {
      // Rollback on failure
      setSettings(originalSettings);
      toast.error("Erro crítico: Falha ao salvar alteração. Revertendo...");
    }
  };

  const handleTimeChange = async (slug: string, newTime: string) => {
    if (!newTime) return;

    const formattedTime = `${newTime}:00`;
    const originalSettings = [...settings];

    // Optimistic UI
    setSettings((prev) =>
      prev.map((s) =>
        s.slug === slug ? { ...s, scheduled_time: formattedTime } : s
      )
    );

    setUpdatingSlugs((prev: Set<string>) => {
      const next = new Set(prev);
      next.add(slug);
      return next;
    });

    try {
      await updateEmailSetting(slug, { scheduled_time: formattedTime });
      toast.success("Horário de entrega atualizado");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  function SettingCard({ setting }: SettingCardProps) {
    return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-900">{setting.display_name}</h3>
            <div className="group relative">
              <Info size={14} className="text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {setting.description}
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-500 line-clamp-2">
            {setting.description}
          </p>
        </div>

        <button
          onClick={() => handleToggle(setting.slug, setting.is_enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            setting.is_enabled ? "bg-emerald-500" : "bg-gray-200"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              setting.is_enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {setting.scheduled_time !== null && (
        <div
          className={`mt-4 pt-4 border-t border-gray-50 flex items-center justify-between ${!setting.is_enabled ? "opacity-40 pointer-events-none" : ""}`}
        >
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock size={16} />
            <span>Horário de Entrega</span>
          </div>
          <div className="relative">
            <input
              type="time"
              defaultValue={setting.scheduled_time.substring(0, 5)}
              onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                handleTimeChange(setting.slug, e.target.value)
              }
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            {updatingSlugs.has(setting.slug) && (
              <div className="absolute -right-6 top-1/2 -translate-y-1/2">
                <Loader2 size={12} className="animate-spin text-teal-600" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    );
  }

  function Section({ title, items, icon: Icon }: SectionProps) {
    if (items.length === 0) return null;
    return (
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Icon className="text-teal-600" size={20} />
          <h2 className="text-xl font-bold text-teal-900">{title}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map((setting) => (
            <SettingCard key={setting.slug} setting={setting} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-teal-900 font-lora mb-2">
          {t("navNotifications") || "Notifications"}
        </h1>
        <p className="text-gray-500">
          Gerencie como e quando o sistema envia comunicações automáticas.
        </p>
      </div>

      <Section
        title="Customer Notifications"
        items={groupedSettings.guest}
        icon={ShieldCheck}
      />

      <Section
        title="Internal Operations"
        items={groupedSettings.admin}
        icon={ShieldAlert}
      />

      {groupedSettings.other.length > 0 && (
        <Section
          title="Other Settings"
          items={groupedSettings.other}
          icon={Mail}
        />
      )}

      <div className="mt-12 p-4 bg-gray-100 rounded-xl text-center">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
          Todos os horários estão configurados no fuso horário local de Pipa
          (GMT-3).
        </p>
      </div>
    </div>
  );
};

export default NotificationSettings;
