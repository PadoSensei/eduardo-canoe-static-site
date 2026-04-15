import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { getTourTemplates } from "../api";
import TourModal from "../components/TourModal";
import { Loader2, Search } from "lucide-react"; // Added for professional spinner
import EmptyState from "../components/common/EmptyState";

const Tours = () => {
  const { t } = useLanguage();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTour, setSelectedTour] = useState(null);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const data = await getTourTemplates();
        setTours(data || []);
      } catch (err) {
        console.error("Failed to load tour menu:", err);
      } finally {
        setLoading(false);
      }
    };
    loadMenu();
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="container px-6 mx-auto">
        {/* Header Section remains visible to maintain layout */}
        <h1 className="mb-4 text-4xl font-bold text-center text-gray-900 md:text-5xl font-lora">
          {t("navTours")}
        </h1>
        <p className="max-w-2xl mx-auto mb-12 text-xl text-center text-gray-600">
          {t("detailsSubtitle")}
        </p>

        {loading ? (
          /* 1. Refactored Loading State: Centered Spinner with reserved space */
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-12 h-12 text-[#FF6B6B] animate-spin mb-4" />
            <p className="text-xs font-medium tracking-widest text-gray-400 uppercase animate-pulse">
              {t("loading")}
            </p>
          </div>
        ) : tours.length === 0 ? (
          <EmptyState
            message={t("tours_none_available_general")}
            icon={<Search className="w-12 h-12" strokeWidth={1.5} />}
          />
        ) : (
          /* 2. Refactored Grid: justify-center ensures cards stay in the middle if < 3 */
          <div className="grid justify-center gap-8 md:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour) => (
              <div
                key={tour.id}
                className="flex flex-col w-full max-w-sm mx-auto overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-md cursor-pointer rounded-3xl hover:shadow-xl group"
                onClick={() => setSelectedTour(tour)}
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={tour.imageUrl || "/img/sunrise_pic.jpg"}
                    alt={tour.name}
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                  />
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
                    {t(`tour_${tour.tourType}_short`) || tour.shortDescription}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        {t("pricePrefix")}
                      </span>
                      <span className="text-xl font-black text-teal-900">
                        R$ {tour.price}
                      </span>
                    </div>
                    <span className="text-[#FF6B6B] font-bold group-hover:translate-x-1 transition-transform">
                      {t("viewDetails")} →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TourModal tour={selectedTour} onClose={() => setSelectedTour(null)} />
    </div>
  );
};

export default Tours;
