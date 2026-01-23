import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../../src/App";

// A component that simply throws an error
const ProblematicComponent = () => {
  throw new Error("Component Crashed!");
};

describe("Global Error Boundary", () => {
  // We suppress console.error for this test to keep logs clean
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test("displays the fallback UI when a child component crashes", () => {
    // We render App but force a crash by mocking Home to be the problematic component
    jest.mock("../../src/pages/Home", () => () => {
      throw new Error("Crashed");
    });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/Oops!/i)).toBeInTheDocument();
    expect(screen.getByText(/Refresh Page/i)).toBeInTheDocument();
  });
});
