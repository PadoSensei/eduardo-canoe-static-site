import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import BookingSystem from "../src/components/BookingSystem";
import { bookingTranslations } from "../src/data/bookingTranslations";

// 1. Mock the API functions
import * as api from "../src/api";
jest.mock("../src/api");

// 2. Programmable Mock for Language Context
// We create a Jest function we can control
const mockUseLanguage = jest.fn();

jest.mock("../src/context/LanguageContext", () => ({
  useLanguage: () => mockUseLanguage(),
}));

describe("BookingSystem Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // DEFAULT: Set language to English for standard functional tests
    mockUseLanguage.mockReturnValue({ language: "en" });
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
        name: "Sunset Tour",
        price: 150,
        isBookable: true,
        remaining: 5,
        capacity: 10,
        duration: "2h",
      },
    ];

    api.getAvailableTours.mockResolvedValue(mockTours);

    render(<BookingSystem />);

    await waitFor(() => {
      expect(screen.getByText("Sunset Tour")).toBeInTheDocument();
    });
    expect(screen.getByText("Book Now")).toBeInTheDocument();
  });

  // --- DYNAMIC LANGUAGE TEST ---

  test("Renders UI correctly in a randomly selected language (PT/ES)", async () => {
    // 1. Pick a random language that isn't English
    const languages = ["pt", "es"];
    const randomLang = languages[Math.floor(Math.random() * languages.length)];

    console.log(
      `🎲 BookingSystem Test: Randomly testing in [${randomLang.toUpperCase()}]`
    );

    // 2. Change the Mock Return Value to the random language
    mockUseLanguage.mockReturnValue({ language: randomLang });

    // 3. Setup API data
    api.getAvailableTours.mockResolvedValue([
      {
        id: "1",
        instanceId: 101,
        name: "Test Tour",
        price: 100,
        isBookable: true,
        remaining: 5,
      },
    ]);

    render(<BookingSystem />);

    // 4. Get the expected translation from your data file
    const expectedBookBtn = bookingTranslations[randomLang].bookBtn;
    const expectedTitle = bookingTranslations[randomLang].title;

    // 5. Verify the UI matches the translation file
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
