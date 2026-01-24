import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../../src/App";
import { LanguageProvider } from "../../src/context/LanguageContext";

describe("Legal Page Routing", () => {
  test("renders the Terms of Service page when navigating to /terms", async () => {
    render(
      <MemoryRouter initialEntries={["/terms"]}>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </MemoryRouter>
    );

    // Use getByRole to target the heading specifically (avoid footer link)
    expect(
      screen.getByRole("heading", { name: /Terms of Service/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/v1.0/i)).toBeInTheDocument();
  });

  test("renders the Privacy Policy page when navigating to /privacy", () => {
    render(
      <MemoryRouter initialEntries={["/privacy"]}>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </MemoryRouter>
    );

    // Use getByRole to target the heading specifically (avoid footer link)
    expect(
      screen.getByRole("heading", { name: /Privacy Policy/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/LGPD/i)).toBeInTheDocument();
  });
});
