import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import Dashboard from "../../src/pages/Dashboard";
import { LanguageProvider } from "../../src/context/LanguageContext";

const API_BASE = "http://localhost:8000/api/v1";

const server = setupServer(
  http.options(`${API_BASE}/*`, () => new HttpResponse(null, { status: 204 })),
  // Wildcard is required to match query parameters (?year=2026...)
  http.get(`${API_BASE}/admin/schedule*`, () => HttpResponse.json({})),
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
  ),
  http.get(`${API_BASE}/tours/available*`, () => HttpResponse.json([]))
);

beforeAll(() => {
  server.listen();
  window.alert = jest.fn();
  window.confirm = jest.fn(() => true);
});

afterEach(async () => {
  server.resetHandlers();
  // Ensure microtasks flush to prevent uv_stream leaks
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  jest.clearAllMocks();
});

afterAll(() => server.close());

jest.mock("../../src/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { user: { email: "eduardo@example.com" } } },
      }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      signOut: jest.fn().mockResolvedValue({}),
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
    expect(await screen.findByText(/Operations/i)).toBeInTheDocument();
    expect(await screen.findByText(/eduardo@example.com/i)).toBeInTheDocument();
  });

  test("clicking an active date opens the manifest and shows tours", async () => {
    renderDashboard();
    await screen.findByText(/Operations/i);

    // Find all day "15"s and click the one that is NOT grayed out
    const days = await screen.findAllByText("15");
    const activeDay = days.find((d) => !d.className.includes("text-gray-300"));

    await act(async () => {
      fireEvent.click(activeDay);
    });

    // findByText waits for the MSW manifest response
    expect(
      await screen.findByText("Test Morning Tour", {}, { timeout: 5000 })
    ).toBeInTheDocument();
    expect(screen.getByText(/Day Controls/i)).toBeInTheDocument();
  });

  test("clicking a tour card shows the passenger list", async () => {
    renderDashboard();
    const days = await screen.findAllByText("15");
    const activeDay = days.find((d) => !d.className.includes("text-gray-300"));

    await act(async () => {
      fireEvent.click(activeDay);
    });

    const tourCard = await screen.findByText("Test Morning Tour");
    await act(async () => {
      fireEvent.click(tourCard);
    });

    expect(
      await screen.findByText(/Confirmed Passengers/i)
    ).toBeInTheDocument();
  });

  test("logout button clears session and returns to login", async () => {
    renderDashboard();
    const logoutBtn = await screen.findByRole("button", { name: /logout/i });

    await act(async () => {
      fireEvent.click(logoutBtn);
    });

    const { supabase } = require("../../src/supabaseClient");
    expect(supabase.auth.signOut).toHaveBeenCalled();
    // Proves the transition finished and requests are closed
    expect(await screen.findByText(/Admin Access/i)).toBeInTheDocument();
  });
});
