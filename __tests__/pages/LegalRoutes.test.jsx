import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import App from "../../src/App";

describe("Legal Page Routing", () => {
  test("renders the Terms of Service page when navigating to /terms", async () => {
    render(
      <MemoryRouter initialEntries={["/terms"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/Terms of Service/i)).toBeInTheDocument();
    expect(screen.getByText(/v1.0/i)).toBeInTheDocument();
  });

  test("renders the Privacy Policy page when navigating to /privacy", () => {
    render(
      <MemoryRouter initialEntries={["/privacy"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/Privacy Policy/i)).toBeInTheDocument();
    expect(screen.getByText(/LGPD/i)).toBeInTheDocument();
  });
});
