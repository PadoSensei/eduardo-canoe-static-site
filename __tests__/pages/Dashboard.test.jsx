// __tests__/pages/Dashboard.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Dashboard from "../../src/pages/Dashboard";
import { LanguageProvider } from "../../src/context/LanguageContext";
import { supabase } from "../../src/supabaseClient";

// 1. Mock the Supabase client
jest.mock("../../src/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      signOut: jest.fn(),
    },
  },
}));

const renderDashboard = () => {
  return render(
    <LanguageProvider>
      <Dashboard />
    </LanguageProvider>
  );
};

describe("Dashboard Page Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // 2. Simulate a logged-in session for all tests in this file
    supabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: { email: "eduardo@example.com" },
          access_token: "mock-token",
        },
      },
    });
  });

  test("initially shows calendar when logged in", async () => {
    renderDashboard();

    // Use findBy to wait for the session check to resolve and the calendar to render
    const currentYear = new Date().getFullYear().toString();
    expect(
      await screen.findByText(new RegExp(currentYear))
    ).toBeInTheDocument();

    // Ensure the "Operations" header is visible
    expect(screen.getByText(/Operations/i)).toBeInTheDocument();
    expect(screen.getByText(/eduardo@example.com/i)).toBeInTheDocument();
  });

  test("clicking a date opens the manifest", async () => {
    renderDashboard();

    // Find a day (e.g., 15) and click it
    // Note: dates might appear multiple times (prev/next month), we grab the first
    const dayNumber = await screen.findAllByText("15");
    fireEvent.click(dayNumber[0]);

    await waitFor(() => {
      expect(screen.getByText(/Day Controls/i)).toBeInTheDocument();
      expect(screen.getByText(/CANCEL ALL TOURS/i)).toBeInTheDocument();
    });
  });

  test("logout button calls supabase signOut", async () => {
    renderDashboard();

    const logoutBtn = await screen.findByRole("button", { name: /logout/i });
    fireEvent.click(logoutBtn);

    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
});
