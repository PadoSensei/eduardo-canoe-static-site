import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const FAQ = () => {
  const { t } = useLanguage();

  // We can eventually move this data array into translations.js too
  const faqData = [
    { q: t("faq1Question"), a: t("faq1Answer") },
    { q: t("faq2Question"), a: t("faq2Answer") },
    { q: t("faq3Question"), a: t("faq3Answer") },
  ];

  return (
    <div className="pt-32 pb-16 bg-white container mx-auto px-6">
      <h2 className="text-3xl font-bold text-center mb-8">
        {t("faqSectionTitle")}
      </h2>

      <div className="max-w-3xl mx-auto space-y-4">
        {faqData.map((item, index) => (
          <FAQItem key={index} question={item.q} answer={item.a} />
        ))}
      </div>
    </div>
  );
};

// Simple internal component for the accordion
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-orange-50 rounded-lg p-4 shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left font-bold flex justify-between"
      >
        {question}
        <span>{isOpen ? "-" : "+"}</span>
      </button>
      {isOpen && <p className="mt-2 text-gray-700">{answer}</p>}
    </div>
  );
};

export default FAQ;
