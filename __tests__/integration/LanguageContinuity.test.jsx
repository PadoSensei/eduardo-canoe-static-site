import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Tours from "../../src/pages/Tours";
import Header from "../../src/components/Header";
import { LanguageProvider } from "../../src/context/LanguageContext";

describe("Language Continuity", () => {
  test("Tour Modal reflects the language selected in the Header", async () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <Header />
          <Tours />
        </LanguageProvider>
      </MemoryRouter>
    );

    // 1. Switch to Portuguese in the Header
    fireEvent.click(screen.getByText(/PT/i));

    // 2. Open a Tour Modal
    // We check for the PT version of "View Details" (Ver Detalhes)
    fireEvent.click(screen.getAllByText(/Ver Detalhes/i)[0]);

    // 3. ASSERT: Modal content is in Portuguese
    // "What to bring" becomes "O que levar"
    expect(screen.getByText(/O que levar:/i)).toBeInTheDocument();
  });
});
