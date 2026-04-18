import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { Waves, Compass, Wind } from "lucide-react";

const ChapterMarker = ({ icon: Icon }) => (
  <div className="flex items-center justify-center w-12 h-12 mb-6 rounded-full bg-emerald-100/50">
    <Icon className="w-6 h-6 text-emerald-600" />
  </div>
);

const About = () => {
  const { t } = useLanguage();

  const bioData = t("about_bio");
  const bioParagraphs = Array.isArray(bioData) ? bioData : [];

  const pullQuote = "Today I follow this path... projects that unite sport, culture, tourism, and connection with nature";
  // Attempt to find the actual paragraph for the pull quote to ensure accuracy if translated
  const pullQuoteText = bioParagraphs.find(p => p.includes("Today I follow this path") || p.includes("Hoje sigo esse caminho") || p.includes("Hoy sigo este camino") || p.includes("Aujourd'hui, je poursuis ce chemin")) || pullQuote;

  return (
    <div className="max-w-6xl px-6 pt-32 pb-20 mx-auto">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Left Column: Content */}
        <div className="lg:col-span-7">
          <h1 className="mb-12 text-5xl font-bold font-lora text-slate-900 lg:text-6xl">
            {t("about_title")}
          </h1>

          <div className="mb-12 overflow-hidden shadow-2xl rounded-2xl aspect-video">
            <img
              src="/img/Edu_Cover.jpeg"
              alt="Instructor"
              className="object-cover w-full h-full"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>

          <section className="space-y-12">
            {bioParagraphs.length > 0 ? (
              <>
                {/* Phase 1: Rio Origins */}
                <div>
                  <ChapterMarker icon={Waves} />
                  <p className="text-xl leading-relaxed text-gray-700 first-letter:text-5xl first-letter:font-lora first-letter:mr-3 first-letter:float-left first-letter:text-emerald-600">
                    {bioParagraphs[0]}
                  </p>
                </div>

                {/* Phase 2: International */}
                <div>
                  <ChapterMarker icon={Compass} />
                  <div className="space-y-6">
                    {bioParagraphs.slice(1, 3).map((paragraph, index) => (
                      <p key={index} className="text-lg leading-relaxed text-gray-700">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Mobile IKO Badge */}
                <div className="lg:hidden">
                  <div className="p-6 border border-emerald-100 rounded-2xl bg-emerald-50/30">
                     <p className="text-sm font-bold tracking-widest uppercase text-emerald-600 mb-2">Expertise</p>
                     <p className="text-xl font-semibold text-slate-900">{t("about_iko_status")}</p>
                     <p className="mt-2 text-sm italic text-emerald-800/70">{t("about_projects")}</p>
                  </div>
                </div>

                {/* Phase 3: Pipa Return */}
                <div>
                  <ChapterMarker icon={Wind} />
                  <div className="space-y-6">
                    {bioParagraphs.slice(3).map((paragraph, index) => {
                      // Skip the pull quote paragraph in the main flow if it matches
                      if (paragraph === pullQuoteText) return null;
                      return (
                        <p key={index} className="text-lg leading-relaxed text-gray-700">
                          {paragraph}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <p className="italic text-gray-400">Biography content not found.</p>
            )}
          </section>
        </div>

        {/* Right Column: Sidebar */}
        <div className="lg:col-span-4 lg:col-start-9">
          <div className="sticky top-32 space-y-12">
            {/* Desktop IKO Badge */}
            <div className="hidden lg:block p-8 border-2 border-emerald-100 rounded-3xl bg-white shadow-sm hover:shadow-md transition-shadow">
               <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-emerald-50">
                  <span className="text-2xl font-bold text-emerald-600">IKO</span>
               </div>
               <p className="text-sm font-bold tracking-widest uppercase text-emerald-600 mb-2">Certified Professional</p>
               <h3 className="text-2xl font-bold text-slate-900 leading-tight mb-4">{t("about_iko_status")}</h3>
               <p className="text-sm italic text-slate-600 border-t border-emerald-50 pt-4">{t("about_projects")}</p>
            </div>

            {/* Pull Quote */}
            <blockquote className="relative p-8 border-l-4 border-emerald-500 bg-emerald-50/50 rounded-r-2xl">
              <p className="text-2xl font-lora italic text-emerald-900 leading-relaxed">
                "{pullQuoteText}"
              </p>
              <footer className="mt-4 text-emerald-700 font-medium">— Edu, Lead Instructor</footer>
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
