import React from "react";
import { render, screen } from "@testing-library/react";
import About from "../../src/pages/About";
import { LanguageProvider } from "../../src/context/LanguageContext";

const renderWithProvider = (ui) => {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
};

describe("About Page component", () => {
  it("renders the translated title correctly", () => {
    renderWithProvider(<About />);
    expect(
      screen.getByText(/Conheça Seu Guia|Meet Your Guide/i)
    ).toBeInTheDocument();
  });

  it("renders multiple paragraphs from the bio array", () => {
    renderWithProvider(<About />);
    expect(
      screen.getByText(/Nascido no Rio de Janeiro|Born in Rio de Janeiro/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /instrutor certificado pela IKO|certified instructor with IKO/i
      )
    ).toBeInTheDocument();
  }); // ← this was missing, causing the parse failure

  it("gracefully hides the image if it fails to load", () => {
    renderWithProvider(<About />);
    const img = screen.getByAltText(/Instructor/i);
    img.dispatchEvent(new Event("error"));
    expect(img.style.display).toBe("none");
  });
});
