import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const Tours = () => {
  const { t } = useLanguage();

  const tours = [
    {
      title: t("card1Title"),
      desc: t("card1Text"),
      img: "/img/Vibe_Forest.jpg",
      price: "R$ 150",
    },
    {
      title: t("card2Title"),
      desc: t("card2Text"),
      img: "/img/Whatsapp_1.jpeg",
      price: "R$ 200",
    },
    {
      title: t("card3Title"),
      desc: t("card3Text"),
      img: "/img/Whatsapp_2.jpeg",
      price: "R$ 180",
    },
  ];

  return (
    <div className="pt-24 pb-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4">
          {t("navTours")}
        </h1>
        <p className="text-xl text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          {t("detailsSubtitle")}
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition-shadow"
            >
              <div className="h-64 overflow-hidden">
                <img
                  src={tour.img}
                  alt={tour.title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold mb-2">{tour.title}</h3>
                <p className="text-gray-600 mb-6 flex-grow">{tour.desc}</p>
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-lg font-bold text-gray-800">
                    {tour.price}
                  </span>
                  <Link
                    to="/book"
                    className="bg-[#FF6B6B] text-white px-6 py-2 rounded-full font-bold hover:bg-[#FF5252] transition-colors"
                  >
                    {t("ctaButton")}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tours;
