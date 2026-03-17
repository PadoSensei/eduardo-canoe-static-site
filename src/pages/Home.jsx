import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Anchor, Sun, Waves } from "lucide-react"; // Icons

const Home = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col">
      {/* --- HERO SECTION --- */}
      <section className="relative flex items-center justify-center w-full h-screen overflow-hidden text-center">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full">
          <video
            playsInline
            autoPlay
            muted
            loop
            preload="metadata"
            fetchpriority="high"
            poster="/img/pipa-canoe-poster.jpg"
            className="object-cover w-full h-full"
          >
            <source src="/img/Pipa-Canoe_1.mp4" type="video/mp4" />
          </video>
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 bg-gradient-to-b from-black/60 via-transparent to-black/60"></div>
        </div>

        {/* Content */}
        <div className="relative z-20 max-w-5xl px-4 mx-auto sm:px-6">
          <h1 className="mb-6 text-4xl font-black text-white sm:text-5xl md:text-7xl drop-shadow-lg">
            {t("heroTitle")}
          </h1>
          <p className="max-w-3xl mx-auto mb-8 text-lg font-light sm:text-xl md:text-2xl text-white/90 drop-shadow-md">
            {t("heroSubtitle")}
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/book"
              className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg transition-all transform hover:scale-105"
            >
              {t("ctaButton")}
            </Link>
            <a
              href="#details"
              className="px-8 py-4 text-lg font-bold text-white transition-all border-2 border-white rounded-lg hover:bg-white hover:text-gray-900"
            >
              {t("learnMore")}
            </a>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      {/* <section id="details" className="py-16 bg-white md:py-24">
        <div className="container px-6 mx-auto text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-800 md:text-4xl">
            {t("detailsTitle")}
          </h2>
          <p className="max-w-3xl mx-auto mb-16 text-lg text-gray-600">
            {t("detailsSubtitle")}
          </p>

          <div className="grid max-w-6xl gap-8 mx-auto md:grid-cols-3">
            {/* Card 1 */}
      {/* <div className="p-8 transition-shadow shadow-lg bg-orange-50 rounded-xl hover:shadow-xl">
              <div className="flex justify-center mb-6 text-[#FF6B6B]">
                <Waves size={64} strokeWidth={1.5} />
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-800">
                {t("card1Title")}
              </h3>
              <p className="text-gray-700">{t("card1Text")}</p>
            </div> */}

      {/* Card 2 */}
      {/* <div className="p-8 transition-shadow shadow-lg bg-orange-50 rounded-xl hover:shadow-xl">
              <div className="flex justify-center mb-6 text-[#FF6B6B]">
                <Anchor size={64} strokeWidth={1.5} />
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-800">
                {t("card2Title")}
              </h3>
              <p className="text-gray-700">{t("card2Text")}</p>
            </div> */}

      {/* Card 3 */}
      {/* <div className="p-8 transition-shadow shadow-lg bg-orange-50 rounded-xl hover:shadow-xl">
              <div className="flex justify-center mb-6 text-[#FF6B6B]">
                <Sun size={64} strokeWidth={1.5} />
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-800">
                {t("card3Title")}
              </h3>
              <p className="text-gray-700">{t("card3Text")}</p>
            </div>
          </div>
        </div>
      </section> */}

      {/* --- GALLERY SECTION --- */}
      {/* <section className="py-16 bg-gray-50 md:py-24">
        <div className="container px-6 mx-auto text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-800 md:text-4xl">
            {t('carouselTitle')}
          </h2>
          <p className="mb-12 text-lg text-gray-600">{t('carouselSubtitle')}</p> */}

      {/* Simple Grid Gallery for React (Easier than Carousel logic for now) */}
      {/* <div className="grid max-w-6xl grid-cols-1 gap-4 mx-auto md:grid-cols-2 lg:grid-cols-3">
             <img src="/img/Vibe_Beach.jpg" className="object-cover w-full h-64 transition-transform rounded-lg shadow-md hover:scale-105" alt="Gallery 1" />
             <img src="/img/Whatsapp_1.jpeg" className="object-cover w-full h-64 transition-transform rounded-lg shadow-md hover:scale-105" alt="Gallery 2" />
             <img src="/img/Whatsapp_2.jpeg" className="object-cover w-full h-64 transition-transform rounded-lg shadow-md hover:scale-105" alt="Gallery 3" />
             <img src="/img/Whatsapp_3.jpeg" className="object-cover w-full h-64 transition-transform rounded-lg shadow-md hover:scale-105" alt="Gallery 4" />
             <img src="/img/Vibe_Forest.jpg" className="object-cover w-full h-64 transition-transform rounded-lg shadow-md hover:scale-105" alt="Gallery 5" />
          </div> */}
      {/* </div>
      </section> */}

      {/* --- MAP SECTION --- */}
      {/* <section className="py-16 bg-white md:py-24">
        <div className="container px-6 mx-auto text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-800 md:text-4xl">
            {t("mapTitle")}
          </h2>
          <p className="max-w-2xl mx-auto mb-12 text-lg text-gray-600">
            {t("mapSubtitle")}
          </p>
          <div className="max-w-4xl mx-auto overflow-hidden border-4 border-gray-100 shadow-2xl h-96 rounded-xl">
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
      </section> */}
    </div>
  );
};

export default Home;
