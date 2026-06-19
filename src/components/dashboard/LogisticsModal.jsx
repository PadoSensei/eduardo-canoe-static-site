import React, { useState, useEffect } from "react";
import X from "lucide-react/dist/esm/icons/x";
import Clock from "lucide-react/dist/esm/icons/clock";
import Star from "lucide-react/dist/esm/icons/star";
import ShieldedButton from "../common/ShieldedButton";
import { useLanguage } from "../../context/LanguageContext";
import { getTourTemplates } from "../../api";

const LogisticsModal = ({ isOpen, tour, onClose, onConfirm, isSubmitting }) => {
  const { t: _t } = useLanguage();
  const [startTime, setStartTime] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [isSpecialEvent, setIsSpecialEvent] = useState(false);
  const [template, setTemplate] = useState(null);

  useEffect(() => {
    if (isOpen && tour) {
      setStartTime(tour.start_time || "");
      setMeetingTime(tour.meeting_time || "");
      setIsSpecialEvent(!!tour.is_special_event);

      // Fetch template for "Default" indicator context
      getTourTemplates().then((templates) => {
        if (templates) {
          const tourType = tour.tour_type || tour.tourType;
          const tpl = templates.find(
            (t) => t.tourType === tourType || t.name === tourType
          );
          setTemplate(tpl);
        }
      });
    }
  }, [isOpen, tour]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // 🛡️ IRON SHIELD: Explicitly wiring all fields to the PATCH request payload
    onConfirm({
      start_time: startTime || null,
      meeting_time: meetingTime || null,
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-950 font-bold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all"
              />
              {template && !startTime && (
                <p className="text-[10px] text-slate-400 font-bold italic">
                  Default: {template.startTime || template.start_time || "N/A"}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                Meeting Time
              </label>
              <input
                type="time"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-950 font-bold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all"
              />
              {template && !meetingTime && (
                <p className="text-[10px] text-slate-400 font-bold italic">
                  Default:{" "}
                  {template.meetingTime || template.meeting_time || "N/A"}
                </p>
              )}
            </div>
          </div>

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
