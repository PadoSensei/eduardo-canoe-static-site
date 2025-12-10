import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Menu, X } from "lucide-react"; // Icons
import { useState } from "react";

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white text-shadow-md">
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
              className={language === "en" ? "opacity-100" : "opacity-60"}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("pt")}
              className={language === "pt" ? "opacity-100" : "opacity-60"}
            >
              PT
            </button>
            <button
              onClick={() => setLanguage("es")}
              className={language === "es" ? "opacity-100" : "opacity-60"}
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
        <div className="md:hidden bg-black/80 backdrop-blur-md p-4 mt-2 rounded-xl text-white flex flex-col space-y-4">
          <Link to="/tours" onClick={() => setIsMenuOpen(false)}>
            {t("navTours")}
          </Link>
          <Link to="/book" onClick={() => setIsMenuOpen(false)}>
            {t("navBook")}
          </Link>
          <Link to="/faq" onClick={() => setIsMenuOpen(false)}>
            {t("navFaq")}
          </Link>
          <div className="flex gap-4 pt-2 border-t border-gray-600">
            <button onClick={() => setLanguage("en")}>EN</button>
            <button onClick={() => setLanguage("pt")}>PT</button>
            <button onClick={() => setLanguage("es")}>ES</button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
