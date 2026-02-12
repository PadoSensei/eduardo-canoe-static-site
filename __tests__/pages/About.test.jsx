import React from "react";
import { render, screen } from "@testing-library/react";
// Go up two levels to root, then into src/pages
import About from "../../src/pages/About";
// Go up two levels to root, then into src/context
import { LanguageProvider } from "../../src/context/LanguageContext";

const renderWithProvider = (ui) => {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
};

describe("About Page component", () => {
  it("renders the translated title correctly", () => {
    renderWithProvider(<About />);
    expect(screen.getByText(/Meet Your Guide/i)).toBeInTheDocument();
  });

  it("renders multiple paragraphs from the bio array", () => {
    renderWithProvider(<About />);
    expect(screen.getByText(/Born in Rio de Janeiro/i)).toBeInTheDocument();
    expect(
      screen.getByText(/certified instructor with IKO/i)
    ).toBeInTheDocument();
  });

  it("gracefully hides the image if it fails to load", () => {
    renderWithProvider(<About />);
    const img = screen.getByAltText(/Instructor/i);
    img.dispatchEvent(new Event("error"));
    expect(img.style.display).toBe("none");
  });
});
