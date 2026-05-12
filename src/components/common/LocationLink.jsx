// src/components/common/LocationLink.jsx
import React from "react";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import { useLanguage } from "../../context/LanguageContext";
import config from "../../core/config";

const LocationLink = ({ className = "" }) => {
  const { t } = useLanguage();

  return (
    <a
      href={config.googleMapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 px-6 py-3 font-bold text-white transition-all bg-emerald-600 rounded-lg shadow-md hover:bg-emerald-700 hover:shadow-lg active:scale-95 ${className}`}
    >
      <MapPin size={20} />
      {t("btn_see_meeting_point")}
    </a>
  );
};

export default LocationLink;
