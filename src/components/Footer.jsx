import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Instagram } from "lucide-react"; // Import the icon

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8 border-t border-gray-800">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Column 1: Brand & Social */}
          <div className="flex flex-col space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-bold font-lora tracking-tight">
                Pipa Canoa Havaiana{" "}
                <span className="text-[#FF6B6B]">Adventures</span>
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                {t("heroSubtitle").substring(0, 100)}...
              </p>
            </div>

            {/* Social Placeholder */}
            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/pipa_canoa_havaiana"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 text-gray-400 hover:text-white transition-all"
                aria-label="Follow us on Instagram"
              >
                <div className="p-2 rounded-lg bg-gray-800 group-hover:bg-[#FF6B6B] transition-colors">
                  <Instagram size={20} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  @pipacanoe
                </span>
              </a>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">
              Explore
            </h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  {t("navHome")}
                </Link>
              </li>
              <li>
                <Link
                  to="/tours"
                  className="hover:text-white transition-colors"
                >
                  {t("navTours")}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  {t("navFaq")}
                </Link>
              </li>
              <li>
                <Link to="/book" className="hover:text-white transition-colors">
                  {t("navBook")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal (Compliance) */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">
              {t("footerLegal")}
            </h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link
                  to="/terms"
                  className="hover:text-white transition-colors"
                >
                  {t("footerTerms")}
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-white transition-colors"
                >
                  {t("footerPrivacy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">
            © {currentYear} Pipa Canoa Havaiana.
          </p>
          <div className="flex items-center gap-2 text-gray-500 text-xs italic">
            <span>Tibau do Sul, RN - Brasil</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
