import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Tours from "../../src/pages/Tours";
import Layout from "../../src/components/Layout";
import { LanguageProvider } from "../../src/context/LanguageContext";

// Mock the API so tours actually load
jest.mock("../../src/api", () => ({
  getAvailableTours: jest.fn(() =>
    Promise.resolve([
      {
        id: "1",
        tourType: "sunset",
        name: "Sunset Tour",
        price: 100,
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

  const ptButton = screen.getByLabelText(/Mudar idioma para Português/i);
  fireEvent.click(ptButton);

  // WAIT for the async load
  const viewDetailsBtns = await screen.findAllByText(/Ver Detalhes/i);
  fireEvent.click(viewDetailsBtns[0]);

  // Check modal content (Portuguese translation for "What to bring")
  expect(screen.getByText(/O que levar/i)).toBeInTheDocument();
});
