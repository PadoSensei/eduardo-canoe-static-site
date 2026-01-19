export const getTourTranslationKey = (tourType) => {
  const mapping = {
    sunrise: "card1Title",
    morning: "card1Title",
    full_day: "card2Title",
    all_day: "card2Title",
    sunset: "card3Title",
    evening: "card3Title",
  };
  return mapping[tourType] || null;
};
