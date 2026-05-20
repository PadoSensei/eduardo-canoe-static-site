import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { getTourTemplates } from "../api";
import TourModal from "../components/TourModal";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import CalendarOff from "lucide-react/dist/esm/icons/calendar-off";
import EmptyState from "../components/common/EmptyState";
import SEO from "../components/common/SEO";
import type { TourTemplateUI } from "@/api/schemas";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Unknown error";
}

const Tours: React.FC = () => {
  const { t, language } = useLanguage();
  const [tours, setTours] = useState<TourTemplateUI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [selectedTour, setSelectedTour] = useState<TourTemplateUI | null>(null);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        setError(false);
        const data = await getTourTemplates();
        setTours(data || []);
      } catch (err: unknown) {
        if (getErrorMessage(err) === "NetworkError") {
          // 404 is a valid business state (Empty)
          setTours([]);
        } else {
          setError(true);
          console.error("Failed to load tour menu:", err);
        }
      } finally {
        setLoading(false);
      }
    };
    loadMenu();
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <SEO
        title={t("seo_tours_title")}
        description={t("seo_tours_description")}
        path="/tours"
        lang={language}
        services={tours.map((tour) => ({
          "@type": "Service",
          name: tour.name,
          description:
            t(tour.descriptionKey || `tour_${tour.tourType}_short`) ||
            tour.shortDescription,
          offers: {
            "@type": "Offer",
            price: tour.price,
            priceCurrency: "BRL",
          },
        }))}
      />
      <div className="container px-6 mx-auto">
        <h1 className="mb-4 text-4xl font-bold text-center text-gray-900 md:text-5xl font-lora">
          {t("navTours")}
        </h1>
        <p className="max-w-2xl mx-auto mb-12 text-xl text-center text-gray-600">
          {t("detailsSubtitle")}
        </p>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-12 h-12 text-[#FF6B6B] animate-spin mb-4" />
            <p className="text-xs font-medium tracking-widest text-gray-400 uppercase animate-pulse">
              {t("loading")}
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <p className="font-medium text-red-500">{t("errorGeneric")}</p>
          </div>
        ) : tours.length === 0 ? (
          <EmptyState
            message={t("tours_none_available_general")}
            icon={CalendarOff}
          />
        ) : (
          <div className="grid justify-center gap-8 mx-auto md:grid-cols-2 lg:grid-cols-3 justify-items-center">
            {tours.map((tour) => (
              <div
                key={tour.id}
                className="flex flex-col w-full max-w-sm mx-auto overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-md cursor-pointer rounded-3xl hover:shadow-xl group"
                onClick={() => setSelectedTour(tour)}
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={tour.imageUrl || "/img/sunrise_pic.webp"}
                    alt={tour.name}
                    loading="lazy"
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
                    {t(tour.descriptionKey || `tour_${tour.tourType}_short`) ||
                      tour.shortDescription}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
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
