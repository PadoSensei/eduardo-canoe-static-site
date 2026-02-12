import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { X, CheckCircle, Backpack } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import BrandLogo from "./BrandLogo";

const TourModal = ({ tour, onClose }) => {
  const { t } = useLanguage();

  // 1. Hook must be at the top level
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // 2. Guard clause comes AFTER hooks
  if (!tour) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/70 backdrop-blur-sm transition-all animate-in fade-in duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image Section */}
        <div className="relative h-48 md:h-72 shrink-0">
          <img
            src={tour.img}
            className="object-cover w-full h-full"
            alt={tour.title}
          />

          {/* Brand Watermark: Ensures brand recognition on tour photography */}
          <div className="absolute top-4 left-4 drop-shadow-2xl">
            <BrandLogo className="w-12 h-12 border-2 border-white md:w-14 md:h-14" />
          </div>

          <button
            onClick={onClose}
            className="absolute p-2 text-white transition-all border rounded-full top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md border-white/30"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Section */}
        <div className="p-6 overflow-y-auto md:p-10">
          <div className="flex items-start justify-between mb-6">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold md:text-4xl text-teal-950 font-lora">
                {tour.title}
              </h2>
              {/* Branding Sub-tag: Reinforces the company identity */}
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#FF6B6B] font-bold">
                Pipa Canoa Havaiana
              </p>
            </div>
            <span className="bg-orange-50 text-[#FF6B6B] px-4 py-1 rounded-full font-bold text-xl border border-orange-100">
              {tour.price}
            </span>
          </div>

          <p className="mb-10 text-lg leading-relaxed text-gray-700">
            {tour.detail}
          </p>

          {/* Details Grid */}
          <div className="grid gap-8 mb-10 md:grid-cols-2">
            <div className="p-4 border bg-teal-50/50 rounded-2xl border-teal-100/50">
              <h4 className="flex items-center gap-2 mb-3 font-bold text-teal-900">
                <CheckCircle size={20} className="text-teal-600" />
                {t("modalIncluded")}
              </h4>
              <p className="text-sm leading-relaxed text-teal-800/80">
                {t("modalIncludedList")}
              </p>
            </div>
            <div className="p-4 border bg-orange-50/50 rounded-2xl border-orange-100/50">
              <h4 className="flex items-center gap-2 mb-3 font-bold text-orange-900">
                <Backpack size={20} className="text-orange-600" />
                {t("modalBring")}
              </h4>
              <p className="text-sm leading-relaxed text-orange-800/80">
                {t("modalBringList")}
              </p>
            </div>
          </div>

          {/* Action Footer: Sticky to ensure 'Book' button is always visible */}
          <div className="sticky bottom-0 flex flex-col gap-4 pt-4 bg-white border-t border-gray-100 sm:flex-row">
            <Link
              to="/book"
              className="flex-[2] bg-[#FF6B6B] hover:bg-[#FF5252] text-white text-center py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-200 transition-all active:scale-[0.98]"
            >
              {t("ctaButton")}
            </Link>
            <button
              onClick={onClose}
              className="flex-1 py-4 text-lg font-bold text-gray-500 transition-colors border-2 border-gray-200 rounded-2xl hover:bg-gray-50"
            >
              {t("btnCancel")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourModal;
