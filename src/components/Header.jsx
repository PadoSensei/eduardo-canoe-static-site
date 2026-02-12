import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Menu, X } from "lucide-react";
import BrandLogo from "./BrandLogo";

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const location = useLocation();
  const isHome = location.pathname === "/";

  // Dynamic classes: Transparent on Home (over video), Dark on other pages
  const headerClasses = isHome
    ? "absolute top-0 left-0 right-0 z-50 p-4 md:p-6 transition-all duration-300"
    : "bg-gray-900 text-white shadow-md p-4 md:p-6 sticky top-0 z-50";

  return (
    <header className={headerClasses}>
      <div className="container flex items-center justify-between mx-auto">
        {/* Logo Section */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-4 group">
            {/* We use h-14 (56px) to ensure the text inside the logo is readable */}
            <BrandLogo className="transition-all duration-300 w-14 h-14 md:w-16 md:h-16 group-hover:scale-105" />

            <div className="flex flex-col">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-white font-lora md:text-2xl">
                Pipa Canoa Havaiana
              </h1>
              <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-gray-300 font-sans opacity-80">
                Tibau do Sul • Brasil
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden space-x-6 font-semibold text-white md:flex">
          <Link to="/tours" className="transition hover:text-gray-300">
            {t("navTours")}
          </Link>
          <Link to="/book" className="transition hover:text-gray-300">
            {t("navBook")}
          </Link>
          <Link to="/about" className="transition hover:text-gray-300">
            {t("navAbout")}
          </Link>
          <Link to="/faq" className="transition hover:text-gray-300">
            {t("navFaq")}
          </Link>
        </nav>

        {/* Language & Mobile Toggle */}
        <div className="flex items-center space-x-4 text-white">
          <div className="hidden space-x-2 text-sm font-bold md:flex">
            <button
              onClick={() => setLanguage("en")}
              className={`hover:text-gray-300 ${
                language === "en"
                  ? "opacity-100 border-b-2 border-white"
                  : "opacity-60"
              }`}
              aria-label="Change language to English"
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("pt")}
              className={`hover:text-gray-300 ${
                language === "pt"
                  ? "opacity-100 border-b-2 border-white"
                  : "opacity-60"
              }`}
              aria-label="Mudar idioma para Português"
            >
              PT
            </button>
            <button
              onClick={() => setLanguage("es")}
              className={`hover:text-gray-300 ${
                language === "es"
                  ? "opacity-100 border-b-2 border-white"
                  : "opacity-60"
              }`}
              aria-label="Cambiar idioma a Español"
            >
              ES
            </button>
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="flex flex-col p-4 mt-4 space-y-4 text-white bg-gray-900 border-t border-gray-700 shadow-xl md:hidden rounded-b-xl">
          <div className="flex items-center gap-3 pb-2 mb-2 border-b border-gray-800">
            <BrandLogo className="w-6 h-6" />
            <span className="text-lg font-bold">Menu</span>
          </div>

          <Link
            to="/tours"
            onClick={() => setIsMenuOpen(false)}
            className="py-2 border-b border-gray-700"
          >
            {t("navTours")}
          </Link>
          <Link
            to="/book"
            onClick={() => setIsMenuOpen(false)}
            className="py-2 border-b border-gray-700"
          >
            {t("navBook")}
          </Link>
          <Link
            to="/about"
            onClick={() => setIsMenuOpen(false)}
            className="py-2 border-b border-gray-700"
          >
            {t("navAbout")}
          </Link>
          <Link
            to="/faq"
            onClick={() => setIsMenuOpen(false)}
            className="py-2 border-b border-gray-700"
          >
            {t("navFaq")}
          </Link>

          <div className="flex justify-center gap-6 pt-2">
            <button
              onClick={() => setLanguage("en")}
              className={language === "en" ? "font-bold" : "opacity-70"}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("pt")}
              className={language === "pt" ? "font-bold" : "opacity-70"}
            >
              PT
            </button>
            <button
              onClick={() => setLanguage("es")}
              className={language === "es" ? "font-bold" : "opacity-70"}
            >
              ES
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
