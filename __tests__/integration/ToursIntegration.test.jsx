import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Tours from "../../src/pages/Tours";
import { LanguageProvider } from "../../src/context/LanguageContext";
jest.mock("../../src/api", () => ({
  // 2. Mock the new 'Menu' API
  getTourTemplates: jest.fn(() =>
    Promise.resolve([
      {
        id: "sunset-template",
        tourType: "sunset",
        name: "Sunset Tour",
        price: 100,
        inclusions: ["Canoe"],
        requirements: ["Water"],
      },
      {
        id: "full_moon-template",
        tourType: "full_moon",
        name: "Full Moon Celebration",
        price: 200,
        inclusions: ["Live Music"],
        requirements: ["Jacket"],
      },
    ])
  ),
  // Keep the availability mock for consistency
  getAvailableTours: jest.fn(() => Promise.resolve([])),
}));

const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <LanguageProvider>{ui}</LanguageProvider>
    </BrowserRouter>
  );
};

describe("Tours Page Integration", () => {
  test("displays the full menu of available tour types", async () => {
    renderWithProviders(<Tours />);

    // 3. ASSERT: Both tours from our 'Menu' mock should appear
    expect(await screen.findByText(/Sunset Tour/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/Full Moon Celebration/i)
    ).toBeInTheDocument();
  });

  test("clicking a tour card opens the detail modal", async () => {
    renderWithProviders(<Tours />);
    const tourCard = await screen.findByText(/Sunset Tour/i);
    fireEvent.click(tourCard);
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });
});
