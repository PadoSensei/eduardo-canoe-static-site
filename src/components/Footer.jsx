import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Instagram } from "lucide-react"; // Import the icon

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="pt-12 pb-8 text-white bg-gray-900 border-t border-gray-800">
      <div className="container px-6 mx-auto">
        <div className="grid grid-cols-1 gap-12 mb-12 md:grid-cols-3">
          {/* Column 1: Brand & Social */}
          <div className="flex flex-col space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-bold tracking-tight font-lora">
                Pipa Canoa Havaiana{" "}
                <span className="text-[#FF6B6B]">Adventures</span>
              </h2>
              <p className="max-w-xs text-sm leading-relaxed text-gray-400">
                {t("heroSubtitle").substring(0, 100)}...
              </p>
            </div>

            {/* Social Placeholder */}
            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/pipa_canoa_havaiana"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 transition-all group hover:text-white"
                aria-label="Follow us on Instagram"
              >
                <div className="p-2 rounded-lg bg-gray-800 group-hover:bg-[#FF6B6B] transition-colors">
                  <Instagram size={20} />
                </div>
                <span className="text-xs font-bold tracking-widest uppercase transition-opacity opacity-0 group-hover:opacity-100">
                  @pipacanoe
                </span>
              </a>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h3 className="mb-4 text-sm font-bold tracking-widest text-gray-500 uppercase">
              Explore
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/" className="transition-colors hover:text-white">
                  {t("navHome")}
                </Link>
              </li>
              <li>
                <Link
                  to="/tours"
                  className="transition-colors hover:text-white"
                >
                  {t("navTours")}
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="transition-colors hover:text-white"
                >
                  {t("navAbout")}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="transition-colors hover:text-white">
                  {t("navFaq")}
                </Link>
              </li>
              <li>
                <Link to="/book" className="transition-colors hover:text-white">
                  {t("navBook")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal (Compliance) */}
          <div>
            <h3 className="mb-4 text-sm font-bold tracking-widest text-gray-500 uppercase">
              {t("footerLegal")}
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
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
          </div>
        </div>

        {/* Bottom Bar: Copyright */}
        <div className="flex flex-col items-center justify-between gap-4 pt-8 border-t border-gray-800 md:flex-row">
          <p className="text-xs text-gray-500">
            © {currentYear} Pipa Canoa Havaiana.
          </p>
          <div className="flex items-center gap-2 text-xs italic text-gray-500">
            <span>Tibau do Sul, RN - Brasil</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
