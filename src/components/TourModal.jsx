import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import X from "lucide-react/dist/esm/icons/x";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import Backpack from "lucide-react/dist/esm/icons/backpack";
import Clock from "lucide-react/dist/esm/icons/clock";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import { useLanguage } from "../context/LanguageContext";
import BrandLogo from "./BrandLogo";
import { formatCurrency } from "../utils/formatters";
import { getNextSpecialtyTour } from "../api";

const TourModal = ({ tour, onClose }) => {
  const { t } = useLanguage();
  const [nextDate, setNextDate] = useState(null);

  useEffect(() => {
    if (tour?.isSpecialEvent || tour?.is_special_event) {
      getNextSpecialtyTour().then((data) => {
        if (data?.next_date) setNextDate(data.next_date);
      });
    } else {
      setNextDate(null);
    }
  }, [tour]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!tour) return null;

  const description =
    t(tour.descriptionKey?.replace("_short", "_detail")) ||
    t(`tour_${tour.tourType}_detail`) ||
    tour.description;
  const paragraphs = description.split("\n\n");

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md transition-all animate-in fade-in duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image Section */}
        <div className="relative h-48 md:h-72 shrink-0">
          <img
            src={tour.imageUrl || "/img/sunset_pic.webp"}
            className="object-cover w-full h-full"
            loading="lazy"
            alt={tour.name}
          />
          <div className="absolute top-6 left-6">
            <BrandLogo className="w-12 h-12 border-2 border-white shadow-xl" />
          </div>
          <button
            onClick={onClose}
            className="absolute p-2 text-white transition-all border rounded-full top-6 right-6 bg-black/10 hover:bg-black/30 backdrop-blur-md border-white/20"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-h-0 p-8 pb-12 overflow-y-auto md:p-10">
          {/* Header Metadata */}
          <div className="flex flex-col justify-between gap-4 mb-8 md:flex-row md:items-start">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.4em] text-[#FF6B6B] font-black">
                {tour.isSpecialEvent || tour.is_special_event
                  ? "Monthly Event"
                  : "Daily Tour"}
              </p>
              <h2 className="text-3xl font-bold md:text-4xl text-teal-950 font-lora">
                {tour.name || tour.tour_name}
              </h2>
            </div>
            <div className="px-4 py-2 border bg-teal-50 rounded-2xl border-teal-100/50">
              <span className="block text-2xl font-black text-teal-900">
                {formatCurrency(tour.price)}
              </span>
            </div>
          </div>

          {/* Logistics Strip */}
          <div className="flex flex-wrap gap-6 pb-8 mb-10 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-orange-500" />
              <span className="text-xs font-bold tracking-tighter text-gray-500 uppercase">
                {t("logistics_duration")}:
              </span>
              <span className="text-xs font-black text-teal-950">
                {tour.duration}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-blue-500" />
              <span className="text-xs font-bold tracking-tighter text-gray-500 uppercase">
                {t("label_meeting_point")}:
              </span>
              <span className="text-xs font-black text-teal-950">
                Sunset Stairs
              </span>
            </div>
            {(tour.meetingTime || tour.meeting_time) && (
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-blue-600" />
                <span className="text-sm font-black tracking-tighter text-gray-500 uppercase">
                  {t("logistics_meeting")}:
                </span>
                <span className="text-lg font-black text-teal-950">
                  {tour.meetingTime || tour.meeting_time}
                </span>
              </div>
            )}
          </div>

          {/* Narrative Body */}
          <div className="mb-12 space-y-6 leading-relaxed text-gray-600">
            {paragraphs.map((p, i) => (
              <p
                key={i}
                className={`${
                  i === 0 ? "text-lg text-teal-900 font-semibold" : "text-base"
                }`}
              >
                {p}
              </p>
            ))}
          </div>

          {/* Lists Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-teal-700 uppercase tracking-[0.2em] flex items-center gap-2">
                <CheckCircle size={14} /> {t("modalIncluded")}
              </h4>
              <ul className="space-y-2">
                {(tour.inclusions || []).map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-gray-500"
                  >
                    <span className="font-bold text-teal-400">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-orange-700 uppercase tracking-[0.2em] flex items-center gap-2">
                <Backpack size={14} /> {t("modalBring")}
              </h4>
              <ul className="space-y-2">
                {(tour.requirements || []).map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-gray-500"
                  >
                    <span className="font-bold text-orange-400">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Action Bar - Fixed Bottom with Glassmorphism */}
        <div className="flex items-center justify-between gap-4 p-6 border-t border-gray-100 md:px-10 bg-white/90 backdrop-blur-md shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-gray-400 transition-colors hover:text-gray-600"
          >
            {t("btnCancel")}
          </button>

          <Link
            to={nextDate ? `/book?date=${nextDate}` : "/book"}
            className="bg-teal-950 hover:bg-black text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl transition-all hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
          >
            {t("ctaButton")}
            <span className="text-teal-400">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TourModal;
