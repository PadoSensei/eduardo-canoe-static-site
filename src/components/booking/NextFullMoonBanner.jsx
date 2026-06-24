import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import Moon from "lucide-react/dist/esm/icons/moon";
import { formatDateForComparison } from "../../utils/timeUtils";

export function NextFullMoonBanner({ nextDate, selectedDate, onDateSelect }) {
  const { t, language } = useLanguage();

  const normalizedNext = formatDateForComparison(nextDate);
  const normalizedSelected = formatDateForComparison(selectedDate);

  // IRON SHIELD: If no date or user is ALREADY on the specialty date, hide the banner
  if (!normalizedNext || normalizedNext === normalizedSelected) return null;

  const formattedDate = new Intl.DateTimeFormat(
    language === "en" ? "en-US" : language === "pt" ? "pt-BR" : language,
    { day: "numeric", month: "long" }
  ).format(new Date(nextDate + "T12:00:00"));

  const message = t("booking_next_full_moon_on").replace(
    "{date}",
    formattedDate
  );

  return (
    <div
      onClick={() => onDateSelect(nextDate)}
      className="flex items-center gap-4 p-4 mb-8 transition-all border border-indigo-100 shadow-sm cursor-pointer bg-indigo-50 rounded-2xl hover:bg-indigo-100 group"
      data-testid="full-moon-banner"
    >
      <div className="p-2 transition-transform bg-indigo-600 rounded-full shadow-lg group-hover:scale-110">
        <Moon className="text-white" size={20} />
      </div>
      <div className="flex-grow">
        <p className="text-sm font-bold leading-tight text-indigo-900 md:text-base">
          {message}
        </p>
        <p className="mt-1 text-xs font-bold tracking-widest text-indigo-600 uppercase">
          {t("viewDetails")} →
        </p>
      </div>
    </div>
  );
}
