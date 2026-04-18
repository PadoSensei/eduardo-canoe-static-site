import React, { useEffect, useRef } from "react";
import { AlertTriangle, CloudRain, X } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import ShieldedButton from "../common/ShieldedButton";

const WeatherCancelModal = ({
  tour,
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}) => {
  const { t } = useLanguage();
  const modalRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement;

      const handleTab = (e) => {
        if (e.key !== "Tab") return;
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
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
        if (e.key === "Escape" && !isSubmitting) onClose();
      };

      window.addEventListener("keydown", handleEsc);
      window.addEventListener("keydown", handleTab);

      // Autofocus first element
      setTimeout(() => {
        const first = modalRef.current?.querySelectorAll(
          "button, [href], input, select, textarea"
        )[0];
        first?.focus();
      }, 50);

      return () => {
        window.removeEventListener("keydown", handleEsc);
        window.removeEventListener("keydown", handleTab);
        previousFocus.current?.focus();
      };
    }
  }, [isOpen, onClose, isSubmitting]);

  if (!isOpen || !tour) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all animate-in fade-in duration-200"
      onClick={() => !isSubmitting && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className="bg-white w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-red-50 rounded-full text-red-600 animate-pulse">
              <AlertTriangle size={40} />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-center text-gray-900 font-lora mb-4">
            {t("admin_cancel_confirm_title")}
          </h3>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-6 text-center">
            <p className="text-sm font-bold text-teal-900 mb-1">
              {tour.display_name}
            </p>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-black">
              {tour.booked_count} {t("admin_cancel_guests_booked")}
            </p>
          </div>

          <p className="text-sm text-gray-600 text-center leading-relaxed mb-8">
            {t("admin_cancel_confirm_body")}
          </p>

          <div className="flex flex-col gap-3">
            <ShieldedButton
              onClick={() => {
                if ("vibrate" in navigator) {
                  navigator.vibrate([75, 50, 75]);
                }
                onConfirm();
              }}
              isLoading={isSubmitting}
              className="w-full py-4 min-h-[44px] bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-95 flex gap-2"
            >
              <CloudRain size={18} /> {t("admin_cancel_weather_button")}
            </ShieldedButton>

            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full py-4 bg-white hover:bg-gray-50 text-gray-500 font-bold rounded-2xl transition-all disabled:opacity-50"
            >
              {t("admin_cancel_go_back")}
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          disabled={isSubmitting}
          aria-label={t("aria_modal_close")}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default WeatherCancelModal;
