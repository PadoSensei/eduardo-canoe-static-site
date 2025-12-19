// __tests__/pages/Dashboard.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react"; // Added waitFor
import "@testing-library/jest-dom";
import Dashboard from "../../src/pages/Dashboard";

describe("Dashboard Page Integration", () => {
  test("initially shows only calendar (desktop view logic check)", () => {
    render(<Dashboard />);
    // Note: Adjust the year regex if your mock data implies a specific year
    expect(screen.getByText(/202/)).toBeInTheDocument();
    expect(screen.queryByText("Day Controls")).not.toBeInTheDocument();
  });

  test("clicking a date opens the manifest", async () => {
    // Async
    render(<Dashboard />);

    // Find a day and click it.
    // We target the outer div by getting the text and traversing up.
    // Note: In the new structure, we want to ensure we click the cell.
    const dayNumber = screen.getAllByText("15")[0];
    fireEvent.click(dayNumber);

    // FIXED: Wrap in waitFor to handle React state update
    await waitFor(() => {
      expect(screen.getByText("Day Controls")).toBeInTheDocument();
      expect(screen.getByText("CANCEL ALL TOURS")).toBeInTheDocument();
    });
  });

  test("closing the manifest resets the view", async () => {
    // Async
    render(<Dashboard />);

    // Open
    const dayNumber = screen.getAllByText("15")[0];
    fireEvent.click(dayNumber);

    await waitFor(() => {
      expect(screen.getByText("Day Controls")).toBeInTheDocument();
    });

    // Close
    // Find the Close button (usually an SVG or accessible name) inside the panel
    // Since we don't have aria-labels on buttons in the provided code, we look for the button element
    const closeButton = screen
      .getByText("Day Controls")
      .closest("div")
      .parentElement.parentElement // Traverse up to container
      .querySelector("button"); // The close button is the first button in the header

    fireEvent.click(closeButton);

    // FIXED: Wrap in waitFor
    await waitFor(() => {
      expect(screen.queryByText("Day Controls")).not.toBeInTheDocument();
    });
  });
});
