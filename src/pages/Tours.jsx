import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import TourModal from "../components/TourModal";

const Tours = () => {
  const { t } = useLanguage();
  const [selectedTour, setSelectedTour] = useState(null);

  // Note: I added 'detail' and 'id' to the objects to fuel the modal content
  const tours = [
    {
      id: "sunrise",
      title: t("card1Title"),
      desc: t("card1Text"),
      detail: t("tourSunriseDetail"),
      img: "/img/Vibe_Forest.jpg",
      price: "R$ 250",
    },
    {
      id: "full_day",
      title: t("card2Title"),
      desc: t("card2Text"),
      detail: t("tourFullDayDetail"),
      img: "/img/Whatsapp_1.jpeg",
      price: "R$ 500",
    },
    {
      id: "sunset",
      title: t("card3Title"),
      desc: t("card3Text"),
      detail: t("tourSunsetDetail"),
      img: "/img/Whatsapp_2.jpeg",
      price: "R$ 200",
    },
  ];

  return (
    <div className="pt-24 pb-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4 font-lora">
          {t("navTours")}
        </h1>
        <p className="text-xl text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          {t("detailsSubtitle")}
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour) => (
            <div
              key={tour.id}
              className="bg-white rounded-3xl shadow-md overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100"
              onClick={() => setSelectedTour(tour)}
            >
              <div className="h-64 overflow-hidden relative">
                <img
                  src={tour.img}
                  alt={tour.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-teal-900/0 group-hover:bg-teal-900/20 transition-colors flex items-center justify-center">
                  <span className="bg-white text-teal-900 px-6 py-2 rounded-full font-bold shadow-xl translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    {t("viewDetails")}
                  </span>
                </div>
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold mb-3 text-teal-950 font-lora">
                  {tour.title}
                </h3>
                <p className="text-gray-600 mb-6 flex-grow leading-relaxed">
                  {tour.desc}
                </p>
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-xl font-black text-teal-900">
                    {tour.price}
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

      {/* --- REUSABLE MODAL --- */}
      <TourModal tour={selectedTour} onClose={() => setSelectedTour(null)} />
    </div>
  );
};

export default Tours;
