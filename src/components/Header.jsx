import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Menu, X, Globe } from "lucide-react"; // Added Globe for a premium touch
import BrandLogo from "./BrandLogo";

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const location = useLocation();
  const isHome = location.pathname === "/";

  // Effect to handle glassmorphism on scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Professional Class Logic
  const headerClasses = isHome
    ? `fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 md:px-8 py-4 ${
        isScrolled
          ? "bg-gray-900/95 backdrop-blur-md shadow-lg py-3"
          : "bg-transparent"
      }`
    : "bg-gray-900 text-white shadow-md px-4 md:px-8 py-4 sticky top-0 z-50";

  const navLinkClass = `
    text-[10px] font-black uppercase tracking-[0.15em] px-4 py-1.5 rounded-full
    transition-all duration-300 relative group
    hover:text-[#FF6B6B]
  `;

  const langBtnClass = (active) => `
    px-2 py-1 text-[10px] font-black transition-all duration-300
    ${active ? "text-[#FF6B6B] scale-110" : "text-gray-400 hover:text-white"}
  `;

  return (
    <header className={headerClasses}>
      <div className="container flex items-center justify-between mx-auto">
        {/* Logo Section */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-4 group">
            <BrandLogo className="w-12 h-12 transition-all duration-500 md:w-14 md:h-14 group-hover:rotate-6 group-hover:scale-110" />
            <div className="flex flex-col">
              <h1 className="text-lg font-bold leading-none tracking-tight text-white font-lora md:text-xl">
                Pipa Canoa <span className="text-[#FF6B6B]">Havaiana</span>
              </h1>
              <span className="text-[9px] uppercase tracking-[0.3em] text-gray-400 font-bold mt-1 group-hover:text-gray-200 transition-colors">
                Tibau do Sul • Brasil
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Nav - Using the same visual language as Footer headers */}
        <nav className="items-center hidden md:flex">
          <div className="flex items-center px-2 py-1 border rounded-full shadow-sm bg-black/20 backdrop-blur-md border-white/10">
            {[
              { to: "/tours", label: t("navTours") },
              { to: "/book", label: t("navBook") },
              { to: "/about", label: t("navAbout") },
              { to: "/faq", label: t("navFaq") },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`${navLinkClass} ${
                  location.pathname === link.to
                    ? "text-[#FF6B6B]"
                    : "text-gray-300"
                }`}
              >
                {link.label}
                {/* Subtle active indicator dot - optional but premium */}
                {location.pathname === link.to && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#FF6B6B] rounded-full" />
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Language & Mobile Toggle */}
        <div className="flex items-center space-x-6 text-white">
          {/* Desktop Language Switcher */}
          <div className="items-center hidden px-3 py-1 border rounded-full bg-black/20 border-white/10 md:flex">
            <Globe size={12} className="mr-2 text-gray-500" />
            {["en", "pt", "es", "fr"].map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={langBtnClass(language === lang)}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            className="p-2 transition-colors hover:text-[#FF6B6B] md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Refactored for Premium Feel */}
      {isMenuOpen && (
        <div className="fixed inset-x-0 top-[72px] p-6 flex flex-col space-y-6 text-white bg-gray-900/98 backdrop-blur-xl border-t border-white/5 shadow-2xl md:hidden rounded-b-[2rem] animate-in slide-in-from-top duration-300">
          <div className="space-y-4">
            {[
              { to: "/tours", label: t("navTours") },
              { to: "/book", label: t("navBook") },
              { to: "/about", label: t("navAbout") },
              { to: "/faq", label: t("navFaq") },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
                className="block text-2xl font-bold font-lora py-2 border-b border-white/5 hover:text-[#FF6B6B] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Language Selection */}
          <div className="pt-4">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4">
              Select Language
            </p>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
              {["en", "pt", "es", "fr"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    setIsMenuOpen(false);
                  }}
                  className={`text-sm font-black transition-all ${
                    language === lang
                      ? "text-[#FF6B6B] scale-125"
                      : "text-gray-400"
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
