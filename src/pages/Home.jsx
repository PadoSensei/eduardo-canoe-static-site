import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Anchor, Sun, Waves } from "lucide-react"; // Icons

const Home = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col">
      {/* --- HERO SECTION --- */}
      <section className="relative w-full h-screen flex items-center justify-center text-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full">
          <video
            playsInline
            autoPlay
            muted
            loop
            poster="/img/pipa-canoe-poster.jpg"
            className="w-full h-full object-cover"
          >
            <source src="/img/Pipa-Canoe_1.mp4" type="video/mp4" />
          </video>
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 bg-gradient-to-b from-black/60 via-transparent to-black/60"></div>
        </div>

        {/* Content */}
        <div className="relative z-20 px-4 sm:px-6 max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-lg">
            {t("heroTitle")}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8 font-light drop-shadow-md">
            {t("heroSubtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/book"
              className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg transition-all transform hover:scale-105"
            >
              {t("ctaButton")}
            </Link>
            <a
              href="#details"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-gray-900 transition-all"
            >
              {t("learnMore")}
            </a>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="details" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            {t("detailsTitle")}
          </h2>
          <p className="text-lg text-gray-600 mb-16 max-w-3xl mx-auto">
            {t("detailsSubtitle")}
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Card 1 */}
            <div className="p-8 bg-orange-50 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-6 text-[#FF6B6B]">
                <Waves size={64} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                {t("card1Title")}
              </h3>
              <p className="text-gray-700">{t("card1Text")}</p>
            </div>

            {/* Card 2 */}
            <div className="p-8 bg-orange-50 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-6 text-[#FF6B6B]">
                <Anchor size={64} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                {t("card2Title")}
              </h3>
              <p className="text-gray-700">{t("card2Text")}</p>
            </div>

            {/* Card 3 */}
            <div className="p-8 bg-orange-50 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-6 text-[#FF6B6B]">
                <Sun size={64} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                {t("card3Title")}
              </h3>
              <p className="text-gray-700">{t("card3Text")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- GALLERY SECTION --- */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            {t("carouselTitle")}
          </h2>
          <p className="text-lg text-gray-600 mb-12">{t("carouselSubtitle")}</p>

          {/* Simple Grid Gallery for React (Easier than Carousel logic for now) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            <img
              src="/img/Vibe_Beach.jpg"
              className="rounded-lg shadow-md hover:scale-105 transition-transform object-cover h-64 w-full"
              alt="Gallery 1"
            />
            <img
              src="/img/Whatsapp_1.jpeg"
              className="rounded-lg shadow-md hover:scale-105 transition-transform object-cover h-64 w-full"
              alt="Gallery 2"
            />
            <img
              src="/img/Whatsapp_2.jpeg"
              className="rounded-lg shadow-md hover:scale-105 transition-transform object-cover h-64 w-full"
              alt="Gallery 3"
            />
            <img
              src="/img/Whatsapp_3.jpeg"
              className="rounded-lg shadow-md hover:scale-105 transition-transform object-cover h-64 w-full"
              alt="Gallery 4"
            />
            <img
              src="/img/Vibe_Forest.jpg"
              className="rounded-lg shadow-md hover:scale-105 transition-transform object-cover h-64 w-full"
              alt="Gallery 5"
            />
          </div>
        </div>
      </section>

      {/* --- MAP SECTION --- */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            {t("mapTitle")}
          </h2>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            {t("mapSubtitle")}
          </p>
          <div className="max-w-4xl mx-auto h-96 rounded-xl shadow-2xl overflow-hidden border-4 border-gray-100">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31719.98894129596!2d-35.06209282568359!3d-6.231932399999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7b28e4438342429%3A0xe7a55a4b4fc34e4a!2sPraia%20de%20Pipa%2C%20Tibau%20do%20Sul%20-%20State%20of%20Rio%20Grande%20do%20Norte%2C%20Brazil!5e0!3m2!1sen!2sus!4v1672925100000!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Map"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
