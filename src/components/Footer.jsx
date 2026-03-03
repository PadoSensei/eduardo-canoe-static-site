import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Instagram } from "lucide-react";
import BrandLogo from "./BrandLogo";

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="pt-16 pb-8 text-white bg-gray-900 border-t border-gray-800">
      <div className="container px-6 mx-auto">
        <div className="grid grid-cols-1 gap-12 mb-16 md:grid-cols-3">
          {/* Column 1: Brand Identity & Mission */}
          <div className="flex flex-col space-y-6">
            <div className="flex items-center gap-5">
              <BrandLogo className="w-16 h-16 transition-transform shadow-2xl md:w-20 md:h-20 hover:scale-105" />

              <div>
                <h2 className="text-2xl font-bold leading-none tracking-tighter font-lora">
                  Pipa Canoa <br />
                  <span className="text-[#FF6B6B]">Havaiana</span>
                </h2>
                <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">
                  Adventures
                </p>
              </div>
            </div>

            <p className="max-w-xs text-sm italic font-light leading-relaxed text-gray-400">
              "{t("heroSubtitle").substring(0, 115)}..."
            </p>

            {/* Social Branding */}
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://www.instagram.com/pipa_canoa_havaiana"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-400 transition-all group hover:text-white"
              >
                <div className="p-2.5 rounded-xl bg-gray-800 group-hover:bg-[#FF6B6B] transition-all transform group-hover:-translate-y-1 shadow-lg">
                  <Instagram size={22} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold tracking-widest uppercase">
                    @pipacanoe
                  </span>
                  <span className="text-[10px] text-gray-600 group-hover:text-gray-400 transition-colors">
                    Follow our journey
                  </span>
                </div>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Navigation */}
          <div className="flex flex-col md:items-center">
            <div className="w-full max-w-[150px]">
              <h3 className="mb-6 text-xs font-black tracking-[0.2em] text-gray-600 uppercase">
                Explore
              </h3>
              <ul className="space-y-4 text-sm font-medium text-gray-400">
                <li>
                  <Link
                    to="/"
                    className="transition-colors hover:text-[#FF6B6B] hover:translate-x-1 inline-block transform"
                  >
                    {t("navHome")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tours"
                    className="transition-colors hover:text-[#FF6B6B] hover:translate-x-1 inline-block transform"
                  >
                    {t("navTours")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="transition-colors hover:text-[#FF6B6B] hover:translate-x-1 inline-block transform"
                  >
                    {t("navAbout")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/faq"
                    className="transition-colors hover:text-[#FF6B6B] hover:translate-x-1 inline-block transform"
                  >
                    {t("navFaq")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/book"
                    className="transition-colors hover:text-[#FF6B6B] hover:translate-x-1 inline-block transform text-[#FF6B6B]"
                  >
                    {t("navBook")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 3: Legal & Local Presence */}
          <div className="flex flex-col md:items-end">
            <div className="w-full max-w-[200px]">
              <h3 className="mb-6 text-xs font-black tracking-[0.2em] text-gray-600 uppercase">
                {t("footerLegal")}
              </h3>
              <ul className="mb-8 space-y-4 text-sm text-gray-400">
                <li>
                  <Link
                    to="/terms"
                    className="transition-colors hover:text-white"
                  >
                    {t("footerTerms")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="transition-colors hover:text-white"
                  >
                    {t("footerPrivacy")}
                  </Link>
                </li>
              </ul>

              {/* Local Stamp */}
              <div className="pt-6 border-t border-gray-800">
                <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">
                  Base Pipa
                </p>
                <p className="mt-1 text-sm italic text-gray-400 font-lora">
                  Tibau do Sul, RN
                </p>
                <p className="text-xs text-gray-600">Lagoa das Guaraíras</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Final Polish & Credits */}
        <div className="flex flex-col items-center justify-between gap-6 pt-10 border-t border-gray-800 md:flex-row">
          <p className="text-[10px] tracking-widest text-gray-600 uppercase font-bold text-center md:text-left">
            © {currentYear} Pipa Canoa Havaiana Adventures • All Rights Reserved
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {/* Handcrafted Tag */}
            <span className="text-[10px] text-gray-600 uppercase tracking-widest text-center">
              {t("footer_powered_by")}
            </span>

            <div className="hidden md:block w-8 h-[1px] bg-gray-800"></div>

            {/* AI SOLUTIONS CREDIT */}
            <span className="text-[10px] text-gray-600 uppercase tracking-widest">
              {t("footer_developed_by")}{" "}
              <a
                href="https://aisolutions.irish" // Replace with your actual company URL
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold transition-colors text-gray-500 hover:text-[#FF6B6B]"
              >
                AI Solutions
              </a>
            </span>

            <div className="hidden md:block w-8 h-[1px] bg-gray-800"></div>

            {/* Aloha Spirit Tag */}
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter italic">
              Aloha Spirit
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
