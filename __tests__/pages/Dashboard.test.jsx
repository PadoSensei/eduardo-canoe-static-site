import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import Dashboard from "../../src/pages/Dashboard";
import { LanguageProvider } from "../../src/context/LanguageContext";

const API_BASE = "http://localhost:8000/api/v1";

// 1. Setup MSW to handle both schedule and manifest
const server = setupServer(
  http.options(`${API_BASE}/*`, () => new HttpResponse(null, { status: 204 })),
  http.get(`${API_BASE}/admin/schedule`, () => HttpResponse.json([])),
  http.get(`${API_BASE}/admin/manifest/*`, () =>
    HttpResponse.json([
      {
        tour_id: 101,
        display_name: "Test Morning Tour",
        time: "09:00",
        booked_count: 5,
        capacity: 10,
        status: "available",
        passengers: [],
      },
    ])
  )
);

beforeAll(() => {
  server.listen();
  window.alert = jest.fn();
  window.confirm = jest.fn(() => true);
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock Supabase Auth to bypass the login screen
jest.mock("../../src/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(() =>
        Promise.resolve({
          data: { session: { user: { email: "eduardo@example.com" } } },
        })
      ),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      signOut: jest.fn(() => Promise.resolve()),
    },
  },
}));

const renderDashboard = () =>
  render(
    <MemoryRouter initialEntries={["/admin"]}>
      <LanguageProvider>
        <Dashboard />
      </LanguageProvider>
    </MemoryRouter>
  );

describe("Dashboard Page Integration", () => {
  test("initially shows calendar when logged in", async () => {
    renderDashboard();
    // Wait for the auth session check to finish and render the "Operations" view
    expect(await screen.findByText(/Operations/i)).toBeInTheDocument();
    expect(screen.getByText(/eduardo@example.com/i)).toBeInTheDocument();
  });

  test("clicking a date opens the manifest panel and shows tour list", async () => {
    renderDashboard();

    // Find a day on the calendar (e.g., the 15th)
    const days = await screen.findAllByText("15");

    await act(async () => {
      fireEvent.click(days[0]);
    });

    // SENIOR FIX: When we click a date, the component shows "Day Controls"
    // and the list of tours. "Confirmed Passengers" is in the next view.
    const controlsHeader = await screen.findByText(/Day Controls/i);
    expect(controlsHeader).toBeInTheDocument();

    // Verify the mock tour data we provided in MSW is visible
    expect(screen.getByText("Test Morning Tour")).toBeInTheDocument();
  });

  test("clicking a tour card shows the passenger list", async () => {
    renderDashboard();

    // 1. Open the date manifest
    const days = await screen.findAllByText("15");
    await act(async () => {
      fireEvent.click(days[0]);
    });

    // 2. Click the specific tour card to see passengers
    const tourCard = await screen.findByText("Test Morning Tour");
    await act(async () => {
      fireEvent.click(tourCard);
    });

    // 3. NOW we expect to see the passenger header
    expect(
      await screen.findByText(/Confirmed Passengers/i)
    ).toBeInTheDocument();
  });

  test("logout button clears session", async () => {
    renderDashboard();
    const logoutBtn = await screen.findByRole("button", { name: /logout/i });

    await act(async () => {
      fireEvent.click(logoutBtn);
    });

    const { supabase } = require("../../src/supabaseClient");
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
});
