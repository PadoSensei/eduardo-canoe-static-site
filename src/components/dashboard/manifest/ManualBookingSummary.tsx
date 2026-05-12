import React from "react";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import { useLanguage } from "../../../context/LanguageContext";

interface ManualBookingSummaryProps {
  displayId: string;
  guestName: string;
  onFinish: () => void;
}

const ManualBookingSummary: React.FC<ManualBookingSummaryProps> = ({
  displayId,
  guestName,
  onFinish,
}) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-8 text-center bg-white animate-in fade-in zoom-in duration-300">
      <div className="mb-6 p-4 bg-emerald-50 rounded-full">
        <CheckCircle2 size={64} className="text-emerald-500" />
      </div>

      <h2 className="text-2xl font-black text-teal-900 mb-2">
        {t("successTitle") || "Booking Confirmed!"}
      </h2>

      <p className="text-slate-500 mb-8 max-w-xs">
        Manual reservation for{" "}
        <span className="font-bold text-slate-700">{guestName}</span> has been
        successfully added to the manifest.
      </p>

      <div className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 mb-8">
        <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
          Reservation ID
        </span>
        <span className="text-4xl font-mono font-black text-teal-600 tracking-tighter">
          #{displayId}
        </span>
      </div>

      <button
        onClick={onFinish}
        className="w-full py-5 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-white bg-teal-600 rounded-2xl shadow-lg shadow-teal-200 hover:bg-teal-700 hover:-translate-y-0.5 active:scale-95 transition-all"
      >
        <span>{t("btnDone") || "Finish"}</span>
        <ArrowRight size={20} />
      </button>
    </div>
  );
};

export default ManualBookingSummary;
