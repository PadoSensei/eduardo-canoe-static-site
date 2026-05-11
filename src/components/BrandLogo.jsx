import React from "react";
import { useLanguage } from "../context/LanguageContext";

const BrandLogo = ({ className = "w-16 h-16" }) => {
  const { t } = useLanguage();

  return (
    /* 
      1. bg-white: This is the 'frame'. Because your logo is a black circle, 
         putting it on white creates an immediate 'pop' against the dark header.
      2. p-0.5: Just a tiny bit of white padding to create a clean 'ring' effect.
    */
    <div
      className={`overflow-hidden rounded-full bg-white shadow-xl flex items-center justify-center border-2 border-white ${className}`}
    >
      <img
        src="/img/logo.webp"
        alt={t("logoAlt")}
        /* 
           object-cover + w-full: This ensures the black background 
           of your image fills the entire white circle.
        */
        className="block object-cover w-full h-full"
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />
    </div>
  );
};

export default BrandLogo;
