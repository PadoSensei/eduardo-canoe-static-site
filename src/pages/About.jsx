import React from "react";
import { useLanguage } from "../context/LanguageContext";
import SEO from "../components/common/SEO";

const About = () => {
  const { t, language } = useLanguage();

  // Call the function to get the bio array
  const bioData = t("about_bio");

  // Since your t() function returns the 'key' string if not found,
  // we check if we actually got an array back.
  const bioParagraphs = Array.isArray(bioData) ? bioData : [];

  return (
    <div className="max-w-3xl px-6 pt-32 pb-20 mx-auto leading-relaxed text-gray-800">
      <SEO
        title={t("seo_about_title")}
        description={t("seo_about_description")}
        path="/about"
        lang={language}
        image="/img/Edu_Cover.jpeg"
      />
      {/* Function calls: t("key") */}
      <h1 className="mb-8 text-4xl font-bold font-lora text-slate-900">
        {t("about_title")}
      </h1>

      <div className="mb-10 overflow-hidden bg-gray-100 shadow-lg rounded-xl aspect-video">
        <img
          src="/img/Edu_Cover.jpeg"
          alt="Instructor"
          className="object-cover w-full h-full"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      </div>

      <section className="space-y-6">
        {bioParagraphs.length > 0 ? (
          bioParagraphs.map((paragraph, index) => (
            <p key={index} className="text-lg leading-relaxed text-gray-700">
              {paragraph}
            </p>
          ))
        ) : (
          /* This shows if t("about_bio") didn't return an array */
          <p className="italic text-gray-400">Biography content not found.</p>
        )}
      </section>

      <div className="p-6 mt-12 border-l-4 border-blue-500 rounded-r-lg bg-blue-50">
        <p className="font-semibold text-blue-900">{t("about_iko_status")}</p>
        <p className="text-sm italic text-blue-800">{t("about_projects")}</p>
      </div>
    </div>
  );
};

export default About;
