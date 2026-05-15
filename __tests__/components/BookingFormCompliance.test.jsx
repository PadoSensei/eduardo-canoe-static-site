import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { BookingForm } from "../../src/components/booking/BookingForm";
import {
  LanguageProvider,
  useLanguage,
} from "../../src/context/LanguageContext";

// Mock the language context
jest.mock("../../src/context/LanguageContext", () => {
  const actual = jest.requireActual("../../src/context/LanguageContext");
  return {
    ...actual,
    useLanguage: jest.fn(),
  };
});

describe("BookingForm Compliance (LGPD)", () => {
  const mockTour = {
    name: "Sunrise Tour",
    price: 150,
    remaining: 5,
  };

  const renderForm = () => {
    // Mock translation function to return actual English text
    useLanguage.mockReturnValue({
      language: "en",
      t: (key) => {
        const translations = {
          bookTitle: "Book",
          labelDate: "Date",
          pricePrefix: "R$",
          labelName: "Your Name",
          labelEmail: "Your Email",
          labelNotes: "Special Notes (Optional)",
          placeholderName: "Enter your full name",
          placeholderEmail: "your@email.com",
          placeholderNotes: "Food allergies or special occasions...",
          btnConfirm: "Confirm Booking",
          btnCancel: "Cancel",
          // CRITICAL: Add these translation mappings
          labelAcceptTerms: "I accept the",
          linkTerms: "Terms of Service",
          linkAnd: "and",
          linkPrivacy: "Privacy Policy",
        };
        return translations[key] || key;
      },
    });

    return render(
      <MemoryRouter>
        <LanguageProvider>
          <BookingForm
            tour={mockTour}
            selectedDate="2026-01-20"
            guestName="John"
            setGuestName={() => {}}
            guestEmail="john@test.com"
            setGuestEmail={() => {}}
            numPeople={1}
            setNumPeople={() => {}}
            specialNotes=""
            setSpecialNotes={() => {}}
            acceptedTerms={false}
            setAcceptedTerms={() => {}}
            onConfirm={() => {}}
            onCancel={() => {}}
            isSubmitting={false}
            error={null}
          />
        </LanguageProvider>
      </MemoryRouter>
    );
  };

  test("Legal links point to correct routes and open in new tab", () => {
    renderForm();
    const termsLink = screen.getByRole("link", { name: /Terms of Service/i });
    const privacyLink = screen.getByRole("link", { name: /Privacy Policy/i });

    expect(termsLink).toHaveAttribute("href", "/terms");
    expect(termsLink).toHaveAttribute("target", "_blank");
    expect(termsLink).toHaveAttribute("rel", "noopener noreferrer");

    expect(privacyLink).toHaveAttribute("href", "/privacy");
    expect(privacyLink).toHaveAttribute("target", "_blank");
    expect(privacyLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("Checkbox is required and prevents submission when unchecked", () => {
    renderForm();
    const checkbox = screen.getByRole("checkbox");
    const confirmButton = screen.getByRole("button", { name: /Confirm/i });

    expect(checkbox).not.toBeChecked();
    expect(confirmButton).toBeDisabled();
  });
});
