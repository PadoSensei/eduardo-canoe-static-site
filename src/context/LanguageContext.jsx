import { createContext, useState, useContext } from "react";
import { translations } from "../data/translations.js";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem("language");
    return saved && translations[saved] ? saved : "pt";
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
