import React from "react";
import { render, screen } from "@testing-library/react";
import BrandLogo from "../../src/components/BrandLogo";

describe("BrandLogo Component", () => {
  it("renders the logo with the correct alt text", () => {
    render(<BrandLogo />);
    const logo = screen.getByRole("img");
    // Accessibility is key: it should describe the brand
    expect(logo).toHaveAttribute("alt", "Pipa Canoa Havaiana Logo");
  });

  it("applies custom classes for sizing", () => {
    const customClass = "h-12 w-12";
    render(<BrandLogo className={customClass} />);
    const logo = screen.getByRole("img");
    // Ensure the component actually uses the classes we pass in
    expect(logo).toHaveClass(customClass);
  });
});
