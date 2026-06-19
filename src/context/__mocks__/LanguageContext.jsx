const useLanguage = () => ({
  t: (key) =>
    ({
      label_num_guests: "Number of Guests",
      label_price_per_person: "Price per person",
      label_total: "Total",
      label_book_now: "Book Now",
      label_confirm: "Confirm Booking",
      label_cancel: "Cancel",
    })[key] ?? key,
  language: "en",
  setLanguage: jest.fn(),
});

const LanguageProvider = ({ children }) => children;

module.exports = { useLanguage, LanguageProvider };
