import React, { useState, useMemo } from "react";
import { useLanguage } from "../context/LanguageContext";
import { faqData } from "../data/faqData";
import { ChevronDown, Search, X } from "lucide-react";

const FAQItem = ({ question, answer, searchTerm }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Simple highlight logic for the search term
  const highlightText = (text, highlight) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark
              key={i}
              className="bg-yellow-100 text-gray-900 rounded-sm px-0.5"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-start justify-between w-full py-5 text-left group"
      >
        <span
          className={`font-bold text-lg pr-4 transition-colors ${
            isOpen ? "text-[#FF6B6B]" : "text-slate-800"
          }`}
        >
          {highlightText(question, searchTerm)}
        </span>
        <ChevronDown
          size={20}
          className={`mt-1 text-gray-400 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-[#FF6B6B]" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-[500px] opacity-100 pb-6" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-base leading-relaxed text-gray-600">
          {highlightText(answer, searchTerm)}
        </p>
      </div>
    </div>
  );
};

const FAQ = () => {
  const { language, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const currentFaqData = faqData[language] || faqData["en"];

  // Filter Logic
  const filteredFaq = useMemo(() => {
    return currentFaqData
      .filter((cat) => activeCategory === "all" || cat.id === activeCategory)
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.a.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [currentFaqData, searchTerm, activeCategory]);

  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50">
      <div className="container max-w-4xl px-6 mx-auto">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-black md:text-5xl text-slate-900 font-lora">
            {t("faqSectionTitle")}
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-500">
            {t("faqSubtitle")}
          </p>
        </div>

        {/* Search Bar Component */}
        <div className="relative max-w-2xl mx-auto mb-10">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 pointer-events-none">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Search for questions (e.g. 'swim', 'price', 'moon')..."
            className="w-full pl-12 pr-12 py-4 bg-white rounded-2xl border-none shadow-lg focus:ring-4 focus:ring-[#FF6B6B]/10 transition-all outline-none text-slate-700 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
              activeCategory === "all"
                ? "bg-[#FF6B6B] text-white shadow-md"
                : "bg-white text-slate-500 hover:bg-slate-100"
            }`}
          >
            All Questions
          </button>
          {currentFaqData.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                activeCategory === Math.floor(cat.id) ||
                activeCategory === cat.id
                  ? "bg-teal-900 text-white shadow-md"
                  : "bg-white text-slate-500 hover:bg-slate-100"
              }`}
            >
              <span>{cat.icon}</span> {cat.title}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="space-y-10">
          {filteredFaq.length > 0 ? (
            filteredFaq.map((category) => (
              <div key={category.id} className="animate-fadeIn">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">{category.icon}</span>
                  <h2 className="text-xl font-black tracking-widest uppercase text-slate-800">
                    {category.title}
                  </h2>
                  <div className="flex-grow h-px ml-4 bg-slate-200"></div>
                </div>
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 px-8">
                  {category.items.map((item, idx) => (
                    <FAQItem
                      key={idx}
                      question={item.q}
                      answer={item.a}
                      searchTerm={searchTerm}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-300">
              <p className="font-medium text-slate-400">
                No questions found matching &quot;{searchTerm}&quot;
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setActiveCategory("all");
                }}
                className="mt-4 text-[#FF6B6B] font-bold underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
