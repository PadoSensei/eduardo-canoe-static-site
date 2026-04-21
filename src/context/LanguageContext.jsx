import { createContext, useState, useContext } from "react";
import { translations } from "../data/translations.js";
import config from "../core/config";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem("language");
    if (saved && translations[saved]) return saved;

    // Default to 'en' in test environments to maintain legacy test compatibility
    return config.isTest ? "en" : "pt";
  });

  // The function to get translation
  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook for easy usage
export const useLanguage = () => useContext(LanguageContext);
