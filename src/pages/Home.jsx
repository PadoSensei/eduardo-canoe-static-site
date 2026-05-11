import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import SEO from "../components/common/SEO";

const Home = () => {
  const { t, language } = useLanguage();

  return (
    <div className="flex flex-col bg-gray-900">
      <SEO
        title={t("seo_home_title")}
        description={t("seo_home_description")}
        path="/"
        lang={language}
      />
      {/* --- HERO SECTION --- */}
      <section className="relative flex items-center justify-center w-full h-screen overflow-hidden text-center">
        {/* Video Background Layer */}
        <div className="absolute inset-0 w-full h-full">
          <video
            playsInline
            autoPlay
            muted
            loop
            preload="none"
            poster="/img/hero-poster.webp"
            className="object-cover w-full h-full"
          >
            <source src="/img/Pipa-Canoe_1.mp4" type="video/mp4" />
          </video>

          {/* Overlay 1: Vignette for text readability */}
          <div className="absolute inset-0 bg-black/30 bg-gradient-to-b from-black/60 via-transparent to-black/20"></div>

          {/* Overlay 2: THE CINEMATIC TRANSITION 
              Fades the video into the exact background color of the footer */}
          <div className="absolute bottom-0 left-0 right-0 z-10 h-64 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>

          {/* Subtle Brand Horizon Line */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#FF6B6B] opacity-20 z-20"></div>
        </div>

        {/* Content Layer */}
        <div className="relative z-30 max-w-5xl px-6 mx-auto">
          {/* <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF6B6B]">
              Tibau do Sul • RN
            </span>
          </div> */}

          <h1 className="mb-6 text-5xl font-black leading-tight text-white sm:text-6xl md:text-8xl font-lora drop-shadow-2xl hero-title">
            {t("heroTitle")}
          </h1>

          <p className="max-w-2xl mx-auto mb-10 text-lg font-medium leading-relaxed sm:text-xl text-white/80 drop-shadow-lg hero-description">
            {t("heroSubtitle")}
          </p>

          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
            <Link
              to="/book"
              className="group bg-[#FF6B6B] hover:bg-white hover:text-[#FF6B6B] text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-2"
            >
              {t("ctaButton")}
              <ChevronRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <Link
              to="/tours"
              className="px-10 py-4 text-sm font-black tracking-widest text-white uppercase transition-all border-2 border-white/30 rounded-2xl hover:bg-white/10 hover:border-white backdrop-blur-sm"
            >
              {t("learnMore")}
            </Link>
          </div>
        </div>

        {/* Subtle Scroll Indicator */}
        <div className="absolute z-30 -translate-x-1/2 opacity-50 bottom-12 left-1/2 animate-bounce">
          <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent"></div>
        </div>
      </section>

      {/* 
          Note: intermediate sections are commented out.
          The gray-900 background on the parent div ensures 
          a seamless merge with the footer.
      */}
    </div>
  );
};

export default Home;
