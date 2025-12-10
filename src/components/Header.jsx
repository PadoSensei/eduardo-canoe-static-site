import { useState } from "react";
import { Link, useLocation } from "react-router-dom"; // 1. Import useLocation
import { useLanguage } from "../context/LanguageContext";
import { Menu, X } from "lucide-react";

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 2. Get the current path
  const location = useLocation();
  const isHome = location.pathname === "/";

  // 3. Define classes based on the page
  // Home: Absolute (floats over video), Transparent background
  // Others: Sticky (stays at top), Dark Background (matches footer/theme)
  const headerClasses = isHome
    ? "absolute top-0 left-0 right-0 z-50 p-4 md:p-6 transition-all duration-300"
    : "bg-gray-900 text-white shadow-md p-4 md:p-6 sticky top-0 z-50";

  return (
    // 4. Apply the dynamic class
    <header className={headerClasses}>
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white text-shadow-md hover:text-gray-200 transition">
            <Link to="/">{"Pipa Canoe"}</Link>
          </h1>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-6 text-white font-semibold">
          <Link to="/tours" className="hover:text-gray-300 transition">
            {t("navTours")}
          </Link>
          <Link to="/book" className="hover:text-gray-300 transition">
            {t("navBook")}
          </Link>
          <Link to="/faq" className="hover:text-gray-300 transition">
            {t("navFaq")}
          </Link>
        </nav>

        {/* Language & Mobile Toggle */}
        <div className="flex items-center space-x-4 text-white">
          <div className="hidden md:flex space-x-2 font-bold text-sm">
            <button
              onClick={() => setLanguage("en")}
              className={`hover:text-gray-300 ${
                language === "en"
                  ? "opacity-100 border-b-2 border-white"
                  : "opacity-60"
              }`}
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
            >
              ES
            </button>
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-700 p-4 mt-4 rounded-b-xl text-white flex flex-col space-y-4 shadow-xl">
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
            to="/faq"
            onClick={() => setIsMenuOpen(false)}
            className="py-2 border-b border-gray-700"
          >
            {t("navFaq")}
          </Link>
          <div className="flex gap-6 pt-2 justify-center">
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
