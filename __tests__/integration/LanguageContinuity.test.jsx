import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Tours from "../../src/pages/Tours";
import Layout from "../../src/components/Layout";
import { LanguageProvider } from "../../src/context/LanguageContext";

// 1. Updated Mock: Match the new API call used in Tours.jsx
jest.mock("../../src/api", () => ({
  getTourTemplates: jest.fn(() =>
    Promise.resolve([
      {
        id: "1",
        tourType: "sunset",
        name: "Sunset Tour",
        price: 100,
        // Adding arrays so the Modal doesn't have empty list warnings
        inclusions: ["Canoe"],
        requirements: ["Water"],
        description: "A soulful sunset experience.",
        shortDescription: "Short sunset blurb.",
      },
    ])
  ),
}));

const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <LanguageProvider>{ui}</LanguageProvider>
    </BrowserRouter>
  );
};

test("Tour Modal reflects the language selected in the Header", async () => {
  renderWithProviders(
    <Layout>
      <Tours />
    </Layout>
  );

  // 2. Click the PT button (The aria-label we restored in the Header)
  const ptButton = screen.getByLabelText(/Mudar idioma para Português/i);
  fireEvent.click(ptButton);

  // 3. WAIT for the async load of the tour cards
  // findAllByText handles the transition from "Loading adventures..." to the data
  const viewDetailsBtns = await screen.findAllByText(/Ver Detalhes/i);
  fireEvent.click(viewDetailsBtns[0]);

  // 4. ASSERT: The modal opened and correctly translated the static UI string
  // "What to bring" in en -> "O que levar" in pt
  expect(screen.getByText(/O que levar/i)).toBeInTheDocument();
});
