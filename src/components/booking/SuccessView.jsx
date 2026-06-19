import React, { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import BrandLogo from "../BrandLogo";
import LocationLink from "../common/LocationLink";
import Copy from "lucide-react/dist/esm/icons/copy";
import Check from "lucide-react/dist/esm/icons/check";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
// import MessageSquare from "lucide-react/dist/esm/icons/message-square";

export function SuccessView({
  guestEmail,
  booking,
  selectedDate,
  onClose,
  tourName,
}) {
  const { language, t } = useLanguage();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // GA4 Purchase Event
    if (window.gtag && booking?.uuid) {
      const firedKey = `fired_purchase_${booking.uuid}`;
      if (!localStorage.getItem(firedKey)) {
        window.gtag("event", "purchase", {
          transaction_id: booking.display_id || booking.uuid,
          value: booking.total_price || 0,
          currency: "BRL",
          items: [
            {
              item_id: booking.tour_id,
              item_name: "Canoe Tour",
            },
          ],
        });
        localStorage.setItem(firedKey, "true");
      }
    }
  }, [booking]);

  const displayId =
    booking?.display_id || booking?.uuid?.slice(0, 8).toUpperCase() || "------";

  const handleCopy = () => {
    navigator.clipboard.writeText(displayId);
    setCopied(true);
    if (navigator.vibrate) navigator.vibrate(50);
    setTimeout(() => setCopied(false), 2000);
  };

  const dateToFormat = booking?.tour_date || selectedDate;
  const tourDateObj = dateToFormat
    ? new Date(dateToFormat + "T12:00:00")
    : null;

  const formattedDate = tourDateObj
    ? new Intl.DateTimeFormat(language || "en", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(tourDateObj)
    : "";

  const secondaryDate =
    tourDateObj && language !== "pt"
      ? new Intl.DateTimeFormat("pt-BR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(tourDateObj)
      : null;

  return (
    <div className="text-center animate-fadeIn">
      {/* Brand Header for Success */}
      <div className="flex flex-col items-center mb-6">
        <BrandLogo className="w-20 h-20 mb-6 shadow-xl" />
        <CheckCircle2
          size={64}
          className="mb-2 text-emerald-500 animate-bounce-short"
        />
      </div>

      <h3 id="modal-title" className="mb-1 text-2xl font-bold text-gray-800">
        {t("successTitle")}
      </h3>

      <p className="mb-6 text-xs font-bold tracking-widest uppercase text-emerald-600">
        {tourName || booking?.tour_name || t("card3Title")}
      </p>

      {/* Prominent Tour Date & Meeting Time for Quick Verification */}
      {(formattedDate || booking?.meeting_time) && (
        <div className="mb-4 animate-fadeInUp flex flex-col items-center gap-2">
          {formattedDate && (
            <div className="inline-flex flex-col items-center px-6 py-2 border-2 border-emerald-100 rounded-2xl bg-emerald-50/50 w-full max-w-[240px]">
              <div className="flex items-center gap-2 mb-0.5">
                <Calendar size={14} className="text-emerald-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                  {t("labelDate")}
                </span>
              </div>
              <span className="text-lg font-black leading-tight text-emerald-900">
                {formattedDate}
              </span>
              {secondaryDate && (
                <span className="text-[11px] font-bold text-emerald-600/70 mt-0.5">
                  {secondaryDate}
                </span>
              )}
            </div>
          )}

          {booking?.meeting_time && (
            <div className="inline-flex flex-col items-center px-6 py-4 border-2 border-amber-100 rounded-2xl bg-amber-50/50 w-full max-w-[240px] shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-amber-600 text-sm">🕒</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                  {t("logistics_meeting")}
                </span>
              </div>
              <span className="text-3xl font-black leading-tight text-slate-950">
                {booking.meeting_time}
              </span>
            </div>
          )}
        </div>
      )}

      <p className="px-4 mb-6 text-sm leading-relaxed text-gray-600">
        {t("successMessage")}{" "}
        <strong className="block mt-1 font-semibold text-gray-900">
          {guestEmail}
        </strong>
      </p>

      {/* Special Notes Section */}
      {/* {booking?.special_notes && (
        <div className="px-4 mb-6">
          <div className="relative p-3 overflow-hidden text-sm italic text-left border-l-4 bg-slate-50 border-slate-200 text-slate-700">
            <div className="flex items-center gap-2 mb-1.5 non-italic">
              <MessageSquare size={14} className="text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {t("booking.your_notes")}
              </span>
            </div>
            <p className="overflow-y-auto break-words whitespace-pre-wrap max-h-24">
              {booking.special_notes}
            </p>
          </div>
        </div>
      )} */}

      {/* Digital Voucher ID Card */}
      <div className="px-4 mb-8">
        <div className="relative p-6 overflow-hidden border-2 border-dashed bg-emerald-50 border-emerald-200 rounded-2xl group">
          {/* Decorative circles for ticket effect */}
          <div className="absolute w-6 h-6 -translate-y-1/2 bg-white border-r-2 border-dashed rounded-full -left-3 top-1/2 border-emerald-200" />
          <div className="absolute w-6 h-6 -translate-y-1/2 bg-white border-l-2 border-dashed rounded-full -right-3 top-1/2 border-emerald-200" />

          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600/60 block mb-1">
            {t("label_booking_id")}
          </span>
          <div className="flex items-center justify-center gap-3">
            <span className="font-mono text-3xl font-black tracking-wider text-emerald-900">
              #{displayId}
            </span>
            <button
              onClick={handleCopy}
              className={`p-2 rounded-xl transition-all active:scale-90 ${
                copied
                  ? "bg-emerald-500 text-white"
                  : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
              }`}
              title={t("btn_copy_id")}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
          {copied && (
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-emerald-600 animate-fadeIn">
              {t("btnCopied")}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <LocationLink className="w-full" />
      </div>

      <button
        onClick={onClose}
        className="w-full px-6 py-3 font-bold text-gray-600 transition-all bg-gray-100 rounded-lg hover:bg-gray-200"
      >
        {t("btnDone")}
      </button>
    </div>
  );
}
