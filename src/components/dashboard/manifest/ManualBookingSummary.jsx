import React, { useEffect, useRef } from "react";
import { CheckCircle, X, Mail, Users } from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";
import { formatCurrency } from "../../../utils/formatters";

const ManualBookingSummary = ({ booking, onClose }) => {
  const { t } = useLanguage();
  const modalRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    previousFocus.current = document.activeElement;

    const handleTab = (e) => {
      if (e.key !== "Tab") return;
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements) return;
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);
    window.addEventListener("keydown", handleTab);

    // Focus close button or first action
    setTimeout(() => {
      modalRef.current?.querySelector("button")?.focus();
    }, 50);

    return () => {
      window.removeEventListener("keydown", handleEsc);
      window.removeEventListener("keydown", handleTab);
      previousFocus.current?.focus();
    };
  }, [onClose]);

  if (!booking) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-emerald-50 rounded-full text-emerald-600 animate-bounce">
              <CheckCircle size={48} />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-center text-gray-900 font-lora mb-2">
            {t("admin_manual_booking_success_title")}
          </h3>
          <p className="text-sm text-gray-500 text-center mb-8">
            {t("admin_manual_booking_success_subtitle")}
          </p>

          <div className="space-y-4 bg-gray-50 p-6 rounded-3xl border border-gray-100 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white rounded-xl shadow-sm text-teal-600">
                <Users size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                  {t("admin_manual_booking_guest")}
                </p>
                <p className="font-bold text-gray-900 leading-none">
                  {booking.guest_name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-2 bg-white rounded-xl shadow-sm text-teal-600">
                <Mail size={18} />
              </div>
              <p className="font-medium text-gray-600 text-sm">
                {booking.guest_email}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1">
                  {t("admin_manual_booking_total")}
                </span>
                <span className="text-lg font-black text-emerald-600">
                  {formatCurrency(booking.total_price)}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1">
                  {t("admin_manual_booking_pax")}
                </span>
                <span className="text-lg font-black text-teal-900">
                  {booking.num_people}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-teal-100 transition-all active:scale-95"
          >
            {t("admin_manual_booking_done")}
          </button>
        </div>

        <button
          onClick={onClose}
          aria-label={t("aria_modal_close")}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default ManualBookingSummary;
