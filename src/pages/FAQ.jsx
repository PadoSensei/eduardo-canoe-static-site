import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { faqData } from "../data/faqData";
import { ChevronDown } from "lucide-react";

// --- FAQ Item Component ---
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full py-4 flex justify-between items-start text-left focus:outline-none group"
      >
        <span
          className={`font-semibold text-base pr-4 transition-colors duration-200 ${
            isOpen
              ? "text-[#FF6B6B]"
              : "text-gray-800 group-hover:text-gray-600"
          }`}
        >
          {question}
        </span>
        {/* Icon Wrapper: Prevents shrinking and handles rotation */}
        <span className="flex-shrink-0 mt-1 ml-2">
          <ChevronDown
            size={20}
            className={`text-gray-400 transition-transform duration-300 ${
              isOpen ? "rotate-180 text-[#FF6B6B]" : ""
            }`}
          />
        </span>
      </button>

      {/* Answer Section */}
      {/* Used a simple transition class for fade-in effect */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[500px] opacity-100 mb-4" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-gray-600 leading-relaxed text-sm md:text-base">
          {answer}
        </p>
      </div>
    </div>
  );
};

// --- Main FAQ Component ---
const FAQ = () => {
  const { language, t } = useLanguage();

  // Fallback to English if language key not found
  const currentFaqData = faqData[language] || faqData["en"];

  return (
    <div className="pt-24 pb-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {t("faqSectionTitle")}
          </h1>
          <p className="text-gray-600 text-base md:text-lg max-w-xl mx-auto">
            {t("faqSubtitle")}
          </p>
        </div>

        {/* Categories Loop */}
        <div className="space-y-6 md:space-y-8">
          {currentFaqData.map((category, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Category Header */}
              <div className="bg-gray-50/50 px-5 py-4 border-b border-gray-100">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 uppercase tracking-wide">
                  {category.title}
                </h2>
              </div>

              {/* Items Container */}
              <div className="px-5 md:px-8">
                {category.items.map((item, itemIndex) => (
                  <FAQItem key={itemIndex} question={item.q} answer={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        {/* <div className="mt-12 md:mt-16 text-center px-4">
          <p className="text-gray-600 mb-4 text-sm md:text-base">
            Can't find the answer you're looking for?
          </p>
          <a
            href="https://wa.me/5584999999999" // Replace with actual number
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto inline-flex justify-center items-center bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 px-8 rounded-full shadow-lg transition-transform transform active:scale-95 hover:-translate-y-0.5"
          >
            <span className="mr-2">💬</span> Chat on WhatsApp
          </a>
        </div> */}
      </div>
    </div>
  );
};

export default FAQ;
