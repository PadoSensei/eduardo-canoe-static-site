import React from "react";
import { useLanguage } from "../context/LanguageContext";
import SEO from "../components/common/SEO";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";

const About = () => {
  const { t, language } = useLanguage();

  // Call the function to get the bio array
  const bioData = t("about_bio");
  const bioParagraphs = Array.isArray(bioData) ? bioData : [];

  // Badges and Timeline guards
  const badgesData = t("about_badges");
  const badges = Array.isArray(badgesData) ? badgesData : [];

  const timelineData = t("about_timeline");
  const timeline = Array.isArray(timelineData) ? timelineData : [];

  return (
    <div className="bg-white">
      <SEO
        title={t("seo_about_title")}
        description={t("seo_about_description")}
        path="/about"
        lang={language}
        image="/img/Edu_Cover.webp"
      />

      {/* Section 1 — Cinematic Hero */}
      <section className="relative h-screen min-h-[600px] overflow-hidden">
        <img
          src="/img/Edu_Cover.webp"
          alt="Edu"
          className="absolute inset-0 w-full h-full object-cover object-top"
          fetchPriority="high"
          loading="eager"
          onError={(e) => (e.target.style.display = "none")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 md:p-16 max-w-2xl">
          <h1 className="font-lora text-4xl md:text-6xl font-bold text-white mb-3 leading-tight">
            {t("about_title")}
          </h1>
          <p className="text-xs md:text-sm tracking-widest uppercase text-red-400 font-semibold">
            {t("about_hero_tagline")}
          </p>
        </div>
      </section>

      {/* Section 2 — Two-Column Intro */}
      <section className="py-20 px-6 md:px-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-start">
          {/* Left Column */}
          <div className="md:col-span-2 md:sticky md:top-28 self-start">
            <div className="relative w-full aspect-square max-w-sm mx-auto">
              <img
                src="/img/Edu_Cover.webp"
                alt="Edu"
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
                loading="lazy"
                onError={(e) => (e.target.style.display = "none")}
              />
              <div className="absolute -bottom-3 -right-3 w-full h-full rounded-2xl border-2 border-red-400 -z-10" />
            </div>
            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              {badges.map((badge, idx) => (
                <span
                  key={idx}
                  className="text-xs border border-red-400 text-red-400 rounded-full px-3 py-1 font-medium"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="md:col-span-3">
            <p className="text-xs uppercase tracking-widest text-red-400 font-semibold mb-4">
              {t("about_section_story")}
            </p>
            {bioParagraphs.slice(0, 3).map((paragraph, index) => (
              <p
                key={index}
                className="text-lg leading-loose text-slate-700 mb-6"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 — Journey Timeline */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6 md:px-16">
          <p className="text-xs uppercase tracking-widest text-red-400 font-semibold mb-2">
            {t("about_section_journey")}
          </p>
          <h2 className="font-lora text-3xl font-bold text-slate-900 mb-12">
            {t("about_journey_heading")}
          </h2>

          <div className="space-y-0">
            {timeline.map((item, index) => (
              <div
                key={index}
                className="relative pl-10 pb-12 border-l-2 border-slate-200 last:border-transparent"
              >
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-red-400 border-2 border-white shadow" />
                <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-1">
                  {item.year} · {item.location}
                </p>
                <p className="text-base leading-relaxed text-slate-700">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 — Dark Pull Quote */}
      <section className="relative py-24 px-6 bg-slate-900 overflow-hidden">
        <img
          src="/img/Edu_Cover.webp"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center opacity-5"
          aria-hidden="true"
          loading="lazy"
          onError={(e) => (e.target.style.display = "none")}
        />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <span className="font-lora text-8xl text-red-400 leading-none block mb-4">
            &quot;
          </span>
          <blockquote className="font-lora text-2xl md:text-3xl italic text-white leading-relaxed mb-8">
            {t("about_pullquote")}
          </blockquote>
          <cite className="text-sm uppercase tracking-widest text-red-400 not-italic">
            {t("about_pullquote_attribution")}
          </cite>
        </div>
      </section>

      {/* Section 5 — Remaining Bio + Credential Card */}
      <section className="py-20 px-6 md:px-16 max-w-4xl mx-auto">
        {bioParagraphs.slice(3).map((paragraph, index) => (
          <p key={index} className="text-lg leading-loose text-slate-700 mb-6">
            {paragraph}
          </p>
        ))}

        <div className="mt-14 rounded-2xl bg-slate-900 p-8 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-xl">
          <div className="flex-shrink-0 w-14 h-14 rounded-full bg-red-400 flex items-center justify-center">
            <ShieldCheck className="text-white w-7 h-7" />
          </div>
          <div className="flex flex-col gap-1 w-full">
            <p className="text-white font-bold text-lg">
              {t("about_iko_status")}
            </p>
            <p className="text-slate-400 text-sm italic">
              {t("about_projects")}
            </p>
            <hr className="border-slate-700 my-3 w-full" />
            <p className="text-slate-500 text-xs uppercase tracking-widest">
              {t("about_credential_label")}
            </p>
          </div>
        </div>
      </section>

      {/* Section 6 — Closing CTA Strip */}
      <section className="relative py-28 px-6 overflow-hidden">
        <img
          src="/img/Edu_Cover.webp"
          alt="CTA Background"
          className="absolute inset-0 w-full h-full object-cover object-center -z-10 scale-105"
          loading="lazy"
          onError={(e) => (e.target.style.display = "none")}
        />
        <div className="absolute inset-0 bg-slate-900/70 -z-10" />
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="text-center md:text-left">
            <p className="text-xs uppercase tracking-widest text-red-400 font-semibold mb-2">
              {t("about_cta_label")}
            </p>
            <h2 className="font-lora text-3xl md:text-4xl font-bold text-white">
              {t("about_cta_heading")}
            </h2>
          </div>
          <a
            href="/book"
            className="inline-block bg-red-500 hover:bg-red-600 transition-colors text-white font-bold px-8 py-4 rounded-full text-sm uppercase tracking-widest shadow-lg whitespace-nowrap"
          >
            {t("about_cta_button")}
          </a>
        </div>
      </section>
    </div>
  );
};

export default About;
