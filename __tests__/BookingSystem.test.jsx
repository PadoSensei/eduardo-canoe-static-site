import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import BookingSystem from "../src/components/BookingSystem";
import { bookingTranslations } from "../src/data/bookingTranslations";

// 1. Mock the API functions
import * as api from "../src/api";
jest.mock("../src/api");

// 2. Programmable Mock for Language Context
const mockUseLanguage = jest.fn();

jest.mock("../src/context/LanguageContext", () => ({
  useLanguage: () => mockUseLanguage(),
}));

// Helper to simulate translations for the test
// This mimics your translations.js structure for the keys used in BookingSystem
const mockT = (key) => {
  const map = {
    card1Title: "Sunrise Tour",
    card2Title: "Full Day Tour",
    card3Title: "Sunset Tour",
  };
  return map[key] || key;
};

describe("BookingSystem Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // DEFAULT SETUP: English + working translator function
    mockUseLanguage.mockReturnValue({
      language: "en",
      t: mockT,
    });
  });

  // --- STANDARD FUNCTIONAL TESTS (English) ---

  test("Renders loading state initially", () => {
    api.getAvailableTours.mockReturnValue(new Promise(() => {}));
    render(<BookingSystem />);
    expect(
      screen.getByText(/Loading available adventures/i)
    ).toBeInTheDocument();
  });

  test("Renders available tours after fetching", async () => {
    const mockTours = [
      {
        id: "1",
        instanceId: 101,
        // FIX: Added tourType so the component knows which name to render
        tourType: "sunset",
        name: "Sunset Tour", // Fallback name
        price: 150,
        isBookable: true,
        remaining: 5,
        capacity: 10,
        duration: "2h",
      },
    ];

    api.getAvailableTours.mockResolvedValue(mockTours);

    render(<BookingSystem />);

    // Now this will find "Sunset Tour" because tourType='sunset' -> t('card3Title') -> 'Sunset Tour'
    await waitFor(() => {
      expect(screen.getByText("Sunset Tour")).toBeInTheDocument();
    });
    expect(screen.getByText("Book Now")).toBeInTheDocument();
  });

  // --- DYNAMIC LANGUAGE TEST ---

  test("Renders UI correctly in a randomly selected language (PT/ES)", async () => {
    const languages = ["pt", "es"];
    const randomLang = languages[Math.floor(Math.random() * languages.length)];

    console.log(
      `🎲 BookingSystem Test: Randomly testing in [${randomLang.toUpperCase()}]`
    );

    // FIX: Ensure the mock returns the language AND the t function
    mockUseLanguage.mockReturnValue({
      language: randomLang,
      t: mockT,
    });

    api.getAvailableTours.mockResolvedValue([
      {
        id: "1",
        instanceId: 101,
        tourType: "sunrise", // Use 'sunrise' to test card1Title logic
        name: "Test Tour",
        price: 100,
        isBookable: true,
        remaining: 5,
      },
    ]);

    render(<BookingSystem />);

    const expectedBookBtn = bookingTranslations[randomLang].bookBtn;
    const expectedTitle = bookingTranslations[randomLang].title;

    await waitFor(() => {
      expect(screen.getByText(expectedBookBtn)).toBeInTheDocument();
    });
    expect(screen.getByText(expectedTitle)).toBeInTheDocument();
  });

  // --- INTERACTION TEST (English) ---

  test("Handles booking flow correctly", async () => {
    const mockTours = [
      {
        id: "1",
        instanceId: 101,
        tourType: "sunset", // FIX: Added tourType
        name: "Test Tour",
        price: 100,
        isBookable: true,
        remaining: 5,
      },
    ];

    api.getAvailableTours.mockResolvedValue(mockTours);
    api.createBooking.mockResolvedValue({
      success: true,
      booking: { uuid: "123" },
      paymentInfo: { qr_code: "pix-code", qr_code_image: "img.png" },
    });

    render(<BookingSystem />);

    const bookBtn = await screen.findByText(/Book Now/i);
    fireEvent.click(bookBtn);

    fireEvent.change(screen.getByPlaceholderText(/Enter your full name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), {
      target: { value: "john@example.com" },
    });

    const confirmBtn = screen.getByText(/Confirm Booking/i);
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(api.createBooking).toHaveBeenCalled();
    });
  });
});
