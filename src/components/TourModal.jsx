// src/components/TourModal.jsx
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { X, CheckCircle, Backpack } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

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
      {/* ... rest of the JSX is correct ... */}
      <div
        className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="h-48 md:h-72 relative shrink-0">
          <img
            src={tour.img}
            className="w-full h-full object-cover"
            alt={tour.title}
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-2 rounded-full transition-all border border-white/30"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 md:p-10 overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-3xl md:text-4xl font-bold text-teal-950 font-lora">
              {tour.title}
            </h2>
            <span className="bg-orange-50 text-[#FF6B6B] px-4 py-1 rounded-full font-bold text-xl border border-orange-100">
              {tour.price}
            </span>
          </div>

          <p className="text-gray-700 text-lg leading-relaxed mb-10">
            {tour.detail}
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100/50">
              <h4 className="font-bold flex items-center gap-2 text-teal-900 mb-3">
                <CheckCircle size={20} className="text-teal-600" />
                {t("modalIncluded")}
              </h4>
              <p className="text-sm text-teal-800/80 leading-relaxed">
                {t("modalIncludedList")}
              </p>
            </div>
            <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100/50">
              <h4 className="font-bold flex items-center gap-2 text-orange-900 mb-3">
                <Backpack size={20} className="text-orange-600" />
                {t("modalBring")}
              </h4>
              <p className="text-sm text-orange-800/80 leading-relaxed">
                {t("modalBringList")}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sticky bottom-0 bg-white pt-4 border-t border-gray-100">
            <Link
              to="/book"
              className="flex-[2] bg-[#FF6B6B] hover:bg-[#FF5252] text-white text-center py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-200 transition-all active:scale-[0.98]"
            >
              {t("ctaButton")}
            </Link>
            <button
              onClick={onClose}
              className="flex-1 border-2 border-gray-200 text-gray-500 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-colors"
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
