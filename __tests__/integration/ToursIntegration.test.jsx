import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Tours from "../../src/pages/Tours";
import { LanguageProvider } from "../../src/context/LanguageContext";
import { getAvailableTours } from "../../src/api";

jest.mock("../../src/api", () => ({
  getAvailableTours: jest.fn(() =>
    Promise.resolve([
      {
        id: "sunset-2026-03-04",
        tourType: "sunset",
        name: "Sunset Tour",
        price: 100,
        inclusions: ["Canoe"],
        requirements: ["Water"],
      },
    ])
  ),
}));

// Replaces the missing ReferenceError
const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <LanguageProvider>{ui}</LanguageProvider>
    </BrowserRouter>
  );
};

describe("Tours Page Integration", () => {
  test("clicking a tour card opens the detail modal", async () => {
    renderWithProviders(<Tours />);

    // Use findBy to wait for the API call to finish
    const tourCard = await screen.findByText(/Sunset Tour/i);
    fireEvent.click(tourCard);

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  test("modal can be closed via the close button", async () => {
    renderWithProviders(<Tours />);

    // WAIT for the card to appear
    const tourCard = await screen.findByText(/Sunset Tour/i);
    fireEvent.click(tourCard);

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Use the X button
    const closeBtn = screen.getByRole("button", { name: "" }); // The lucide-x button
    fireEvent.click(closeBtn);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
