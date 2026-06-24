import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import Moon from "lucide-react/dist/esm/icons/moon";
import { formatDateForComparison } from "../../utils/timeUtils";

export function NextFullMoonBanner({ nextDate, selectedDate, onDateSelect }) {
  const { t, language } = useLanguage();

  const normalizedNext = formatDateForComparison(nextDate);
  const normalizedSelected = formatDateForComparison(selectedDate);

  if (!normalizedNext) return null;
  const isSelected = normalizedNext === normalizedSelected;

  if (isSelected) return null;

  const formattedDate = new Intl.DateTimeFormat(
    language === "en" ? "en-US" : language === "pt" ? "pt-BR" : language,
    { day: "numeric", month: "long" }
  ).format(new Date(nextDate + "T12:00:00"));

  const message = isSelected
    ? t("booking_full_moon_selected")
    : t("booking_next_full_moon_on").replace("{date}", formattedDate);

  return (
    <div
      onClick={() => onDateSelect(nextDate)}
      className={`mb-8 p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all group border ${
        isSelected
          ? "bg-amber-50 border-amber-200 hover:bg-amber-100 shadow-sm"
          : "bg-indigo-50 border-indigo-100 hover:bg-indigo-100"
      }`}
      data-testid="full-moon-banner"
    >
      <div
        className={`${
          isSelected ? "bg-amber-500" : "bg-indigo-600"
        } p-2 rounded-full shadow-lg group-hover:scale-110 transition-transform`}
      >
        <Moon className="text-white" size={20} />
      </div>
      <div className="flex-grow">
        <p
          className={`${
            isSelected ? "text-amber-900" : "text-indigo-900"
          } font-bold text-sm md:text-base leading-tight`}
        >
          {message}
        </p>
        {!isSelected && (
          <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest mt-1">
            {t("viewDetails")} →
          </p>
        )}
        {isSelected && (
          <p className="text-amber-600 text-[10px] font-black uppercase tracking-widest mt-1">
            {t("booking_full_moon_confirmed")}
          </p>
        )}
      </div>
    </div>
  );
}
