import React from "react";
import CloudRain from "lucide-react/dist/esm/icons/cloud-rain";
import ShieldedButton from "../../common/ShieldedButton";
import { useLanguage } from "../../../context/LanguageContext";

const TourCard = ({ tour, isSubmitting, onCancel, onSelect }) => {
  const { t } = useLanguage();
  const isCancelled = tour.status === "cancelled";

  return (
    <div
      className={`p-5 bg-white border rounded-xl shadow-sm transition-all ${
        isCancelled
          ? "cursor-pointer border-red-200 bg-red-50/40 hover:border-red-300"
          : "hover:shadow-md cursor-pointer hover:border-teal-100"
      }`}
      onClick={() => onSelect(tour)}
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-bold text-teal-950 font-lora">
            {tour.display_name}
          </h4>
          <span
            className={`text-[10px] uppercase font-black tracking-widest ${
              isCancelled ? "text-red-600" : "text-slate-500"
            }`}
          >
            {tour.status}
          </span>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-teal-600">
            {tour.booked_count}
          </span>
          <span className="text-sm font-bold text-gray-300">
            {" "}
            / {tour.capacity}
          </span>
        </div>
      </div>

      {isCancelled ? (
        <span className="mt-4 inline-flex w-full items-center justify-center bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold">
          TOUR CANCELLED
        </span>
      ) : (
        <ShieldedButton
          isLoading={isSubmitting}
          onClick={(e) => {
            e.stopPropagation();
            onCancel(tour);
          }}
          className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all"
        >
          <CloudRain size={14} /> {t("admin_cancel_weather_button")}
        </ShieldedButton>
      )}
    </div>
  );
};

export default TourCard;
