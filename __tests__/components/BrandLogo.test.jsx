import React from "react";
import { render, screen } from "@testing-library/react";
import BrandLogo from "../../src/components/BrandLogo";
import { LanguageProvider } from "../../src/context/LanguageContext"; // Added Provider

// Helper to wrap component in context
const renderWithProvider = (ui) => {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
};

describe("BrandLogo Component", () => {
  it("renders the logo with the correct alt text", () => {
    renderWithProvider(<BrandLogo />);

    const logo = screen.getByRole("img");

    // This matches the 'en' value in your translations.js
    expect(logo).toHaveAttribute("alt", "Pipa Canoa Havaiana Logo");
  });

  it("applies custom classes for sizing to the container", () => {
    const customClass = "h-12 w-12";

    // We render the component
    renderWithProvider(<BrandLogo className={customClass} />);

    // Since the classes are on the wrapper div, we find the image
    // and then look at its parent (the container)
    const logoImg = screen.getByRole("img");
    const container = logoImg.closest("div");

    expect(container).toHaveClass(customClass);
  });
});
