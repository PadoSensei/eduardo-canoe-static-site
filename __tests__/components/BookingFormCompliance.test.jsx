import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { BookingForm } from "../../src/components/booking/BookingForm";
import { LanguageProvider } from "../../src/context/LanguageContext";

const mockTour = {
  name: "Sunrise Tour",
  price: 150,
  remaining: 5,
};

const renderForm = (props = {}) => {
  return render(
    <BrowserRouter>
      <LanguageProvider>
        <BookingForm
          tour={mockTour}
          selectedDate="2026-01-20"
          guestName="John"
          guestEmail="john@test.com"
          numPeople={1}
          acceptedTerms={false}
          setAcceptedTerms={jest.fn()}
          onConfirm={jest.fn()}
          onCancel={jest.fn()}
          isSubmitting={false}
          {...props}
        />
      </LanguageProvider>
    </BrowserRouter>
  );
};

describe("BookingForm Compliance (LGPD)", () => {
  test("Confirm button is disabled when terms are NOT accepted", () => {
    renderForm({ acceptedTerms: false });
    const confirmBtn = screen.getByRole("button", { name: /Confirm/i });
    expect(confirmBtn).toBeDisabled();
    // Check for the grayscale class we added
    expect(confirmBtn).toHaveClass("disabled:bg-gray-300");
  });

  test("Confirm button is enabled when terms ARE accepted", () => {
    renderForm({ acceptedTerms: true });
    const confirmBtn = screen.getByRole("button", { name: /Confirm/i });
    expect(confirmBtn).not.toBeDisabled();
  });

  test("Checkbox toggles the acceptedTerms state", () => {
    const setAcceptedTermsMock = jest.fn();
    renderForm({
      acceptedTerms: false,
      setAcceptedTerms: setAcceptedTermsMock,
    });

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(setAcceptedTermsMock).toHaveBeenCalledWith(true);
  });

  test("Legal links point to correct routes and open in new tab", () => {
    renderForm();
    const termsLink = screen.getByRole("link", { name: /Terms of Service/i });
    const privacyLink = screen.getByRole("link", { name: /Privacy Policy/i });

    expect(termsLink).toHaveAttribute("href", "/terms");
    expect(termsLink).toHaveAttribute("target", "_blank");

    expect(privacyLink).toHaveAttribute("href", "/privacy");
    expect(privacyLink).toHaveAttribute("target", "_blank");
  });
});
