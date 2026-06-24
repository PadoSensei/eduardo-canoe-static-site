import React, { useState, useEffect } from "react";
import X from "lucide-react/dist/esm/icons/x";
import Clock from "lucide-react/dist/esm/icons/clock";
import Star from "lucide-react/dist/esm/icons/star";
import ShieldedButton from "../common/ShieldedButton";
import { useLanguage } from "../../context/LanguageContext";

const LogisticsModal = ({ isOpen, tour, onClose, onConfirm, isSubmitting }) => {
  const { t: _t } = useLanguage();
  const [isSpecialEvent, setIsSpecialEvent] = useState(false);

  useEffect(() => {
    if (isOpen && tour) {
      setIsSpecialEvent(!!tour.is_special_event);
    }
  }, [isOpen, tour]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      is_special_event: isSpecialEvent,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between p-6 border-b bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 text-teal-700 rounded-lg">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">
                Set Logistics
              </h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                {tour.display_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                <Star size={18} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-950 uppercase">
                  Special Event
                </p>
                <p className="text-[10px] font-bold text-slate-500">
                  Enable Full Moon UI/Banner
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsSpecialEvent(!isSpecialEvent)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 ${
                isSpecialEvent ? "bg-teal-600" : "bg-slate-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isSpecialEvent ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-all"
            >
              Cancel
            </button>
            <ShieldedButton
              type="submit"
              isLoading={isSubmitting}
              className="flex-1 py-4 bg-slate-950 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
            >
              Save Logistics
            </ShieldedButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogisticsModal;
