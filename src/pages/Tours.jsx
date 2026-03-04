import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { getAvailableTours } from "../api"; // 1. Import real API
import TourModal from "../components/TourModal";
import { format } from "date-fns";

const Tours = () => {
  const { t } = useLanguage();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTour, setSelectedTour] = useState(null);

  useEffect(() => {
    const loadTours = async () => {
      try {
        const today = format(new Date(), "yyyy-MM-dd");
        const data = await getAvailableTours(today);
        setTours(data || []);
      } catch (err) {
        console.error("Failed to load tours:", err);
      } finally {
        setLoading(false);
      }
    };
    loadTours();
  }, []);

  if (loading) {
    return (
      <div className="pt-32 text-center text-gray-500">
        Loading adventures...
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="container px-6 mx-auto">
        <h1 className="mb-4 text-4xl font-bold text-center text-gray-900 md:text-5xl font-lora">
          {t("navTours")}
        </h1>
        <p className="max-w-2xl mx-auto mb-12 text-xl text-center text-gray-600">
          {t("detailsSubtitle")}
        </p>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour) => (
            <div
              key={tour.id}
              className="flex flex-col overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-md cursor-pointer rounded-3xl hover:shadow-xl group"
              onClick={() => setSelectedTour(tour)}
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={tour.imageUrl || "/img/sunrise_pic.jpg"} // Use DB image
                  alt={tour.name}
                  className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                />
                {/* View Details Overlay */}
                <div className="absolute inset-0 flex items-center justify-center transition-colors bg-teal-900/0 group-hover:bg-teal-900/20">
                  <span className="px-6 py-2 font-bold text-teal-900 transition-all duration-300 translate-y-4 bg-white rounded-full shadow-xl opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                    {t("viewDetails")}
                  </span>
                </div>
              </div>

              <div className="flex flex-col flex-grow p-8">
                <h3 className="mb-3 text-2xl font-bold text-teal-950 font-lora">
                  {tour.name}
                </h3>
                <p className="flex-grow mb-6 leading-relaxed text-gray-600">
                  {/* Priority: translation.js blurb, Fallback: DB short description */}
                  {t(`tour_${tour.tourType}_short`) || tour.shortDescription}
                </p>

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xl font-black text-teal-900">
                    R$ {tour.price}
                  </span>
                  <span className="text-[#FF6B6B] font-bold group-hover:translate-x-1 transition-transform">
                    {t("viewDetails")} →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <TourModal tour={selectedTour} onClose={() => setSelectedTour(null)} />
    </div>
  );
};

export default Tours;
