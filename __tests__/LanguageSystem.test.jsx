import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { LanguageProvider, useLanguage } from "../src/context/LanguageContext";
import { translations } from "../src/data/translations";

// --- HELPER COMPONENTS ---
const TranslationWrapper = ({ missingKey }) => {
  const { t } = useLanguage();
  return <div data-testid="missing-translation">{t(missingKey)}</div>;
};

// A simple component to test if the Context provides the correct text
const TestComponent = () => {
  const { t, setLanguage, language } = useLanguage();
  return (
    <div>
      <span data-testid="current-lang">{language}</span>
      <h1 data-testid="hero-title">{t("heroTitle")}</h1>
      <div data-testid="buttons">
        <button onClick={() => setLanguage("en")}>EN</button>
        <button onClick={() => setLanguage("pt")}>PT</button>
        <button onClick={() => setLanguage("es")}>ES</button>
      </div>
    </div>
  );
};

describe("Translation System", () => {
  //STRATEGY 1: Structural Integrity
  // This ensures you didn't forget to translate a key in PT or ES
  test("All languages should have the same keys as English", () => {
    const enKeys = Object.keys(translations.en).sort();
    const otherLanguages = Object.keys(translations).filter(
      (lang) => lang !== "en"
    );

    otherLanguages.forEach((lang) => {
      const langKeys = Object.keys(translations[lang]).sort();

      // If this fails, it means you added a key to English but forgot it in 'lang'
      expect(langKeys).toEqual(enKeys);
    });
  });

  // STRATEGY 2: The Randomized Behavior Test
  // This picks a random language, clicks the button, and checks the text
  test("UI updates correctly when switching to a random language", () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    // 1. Get available languages excluding the default 'en'
    const availableLangs = ["pt", "es"];

    // 2. Pick a random language
    const randomLang =
      availableLangs[Math.floor(Math.random() * availableLangs.length)];

    // 3. Find the button for that random language and click it
    const button = screen.getByText(randomLang.toUpperCase());
    fireEvent.click(button);

    // 4. ASSERTIONS

    // Check if the internal state updated
    expect(screen.getByTestId("current-lang")).toHaveTextContent(randomLang);

    // Check if the text actually changed to the correct translation
    // We look up what the text *should* be in your translations file
    const expectedTitle = translations[randomLang].heroTitle;
    expect(screen.getByTestId("hero-title")).toHaveTextContent(expectedTitle);
  });

  // STRATEGY 3: Fallback Safety
  // If a key is missing, it should not crash, but return an empty string (Shielded Fallback)
  test("Returns empty string if translation is missing (Shielded Fallback)", () => {
    render(
      <LanguageProvider>
        <TestComponent />
        <TranslationWrapper missingKey="nonExistentKey" />
      </LanguageProvider>
    );

    // Should render nothing for the missing key
    expect(screen.getByTestId("missing-translation")).toHaveTextContent("");
  });
});
