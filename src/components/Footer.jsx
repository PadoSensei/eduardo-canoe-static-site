import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Instagram, ArrowUpRight } from "lucide-react";
import BrandLogo from "./BrandLogo";

// Optimized Link Component for Horizontal Layout
const FooterLink = ({ to, children, primary }) => (
  <li>
    <Link
      to={to}
      className={`group relative flex items-center gap-1 transition-all duration-300 ${
        primary
          ? "text-[#FF6B6B] font-black"
          : "text-gray-400 hover:text-white font-bold"
      }`}
    >
      {children}
      <ArrowUpRight
        size={10}
        className={`transition-all duration-300 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 ${
          primary ? "text-[#FF6B6B]" : "text-gray-500"
        }`}
      />
    </Link>
  </li>
);

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="pt-20 pb-10 text-white bg-gray-900 border-t border-white/5">
      <div className="container px-6 mx-auto">
        <div className="grid items-start grid-cols-1 gap-16 mb-20 md:grid-cols-12">
          {/* Column 1: Brand (4 Cols) */}
          <div className="space-y-8 md:col-span-4">
            <div className="flex items-center gap-5">
              <BrandLogo className="w-16 h-16 transition-transform shadow-2xl hover:-rotate-3" />
              <div>
                <h2 className="text-2xl font-bold leading-none tracking-tighter font-lora">
                  Pipa Canoa <br />
                  <span className="text-[#FF6B6B]">Havaiana</span>
                </h2>
                <p className="mt-2 text-[9px] uppercase tracking-[0.4em] text-gray-500 font-black">
                  Experience the Soul
                </p>
              </div>
            </div>

            <p className="max-w-sm text-sm italic font-medium leading-relaxed text-gray-400/70">
              &quot;{t("heroSubtitle").substring(0, 115)}...&quot;
            </p>

            <div className="flex items-center gap-6">
              <a
                href="https://www.instagram.com/pipa_canoa_havaiana"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 group"
              >
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-[#FF6B6B] group-hover:border-[#FF6B6B] transition-all duration-500">
                  <Instagram size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                    Instagram
                  </span>
                  <span className="text-xs text-gray-400 group-hover:text-[#FF6B6B] transition-colors">
                    @pipacanoe
                  </span>
                </div>
              </a>
            </div>
          </div>

          {/* Column 2: Center Navigation (5 Cols) - THE HORIZONTAL GRID */}
          <div className="py-2 md:col-span-5">
            <ul className="flex flex-row flex-wrap justify-start md:justify-center gap-x-10 gap-y-6 text-[11px] uppercase tracking-[0.2em]">
              <FooterLink to="/">{t("navHome")}</FooterLink>
              <FooterLink to="/tours">{t("navTours")}</FooterLink>
              <FooterLink to="/about">{t("navAbout")}</FooterLink>
              <FooterLink to="/faq">{t("navFaq")}</FooterLink>
              <FooterLink to="/book" primary>
                {t("navBook")}
              </FooterLink>
            </ul>
          </div>

          {/* Column 3: Legal & Local (3 Cols) */}
          <div className="flex flex-col text-left md:col-span-3 md:items-end md:text-right">
            <h3 className="mb-6 text-[9px] font-black uppercase tracking-[0.3em] text-gray-600">
              {t("footerLegal")}
            </h3>
            <ul className="flex flex-col gap-4 text-[11px] uppercase tracking-widest mb-10">
              <FooterLink to="/terms">{t("footerTerms")}</FooterLink>
              <FooterLink to="/privacy">{t("footerPrivacy")}</FooterLink>
            </ul>

            <div className="w-full pt-6 space-y-4 border-t border-white/5 md:w-auto">
              <div>
                <p className="text-[9px] font-black text-[#FF6B6B] uppercase tracking-widest mb-1">
                  Base Pipa
                </p>
                <p className="text-sm italic text-gray-300 font-lora">
                  Tibau do Sul, RN
                </p>
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">
                  Local
                </p>
                <p className="text-xs text-gray-500">Lagoa das Guaraíras</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-8 pt-10 border-t border-white/5 md:flex-row">
          <p className="text-[9px] tracking-[0.2em] text-gray-600 uppercase font-bold">
            © {currentYear} Pipa Canoa Havaiana
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <span className="text-[9px] text-gray-500 uppercase tracking-[0.2em]">
              {t("footer_powered_by")}
            </span>
            <div className="hidden md:block w-6 h-[1px] bg-white/10"></div>
            <span className="text-[9px] text-gray-500 uppercase tracking-[0.2em]">
              {t("footer_developed_by")}{" "}
              <a
                href="https://aisolutions.irish"
                target="_blank"
                rel="noopener noreferrer"
                className="font-black text-gray-400 hover:text-[#FF6B6B] transition-colors"
              >
                AI Solutions
              </a>
            </span>
            <div className="hidden md:block w-6 h-[1px] bg-white/10"></div>
            <span className="text-[9px] text-[#FF6B6B] font-bold uppercase tracking-[0.1em] italic">
              Aloha Spirit
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
