import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom";
import Dashboard from "../../src/pages/Dashboard";
import { LanguageProvider } from "../../src/context/LanguageContext";

const API_BASE = "http://localhost:8000/api/v1";

const server = setupServer(
  http.options(`${API_BASE}/*`, () => new HttpResponse(null, { status: 204 })),
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
        passengers: [
          {
            name: "Jane Doe",
            pax: 1,
            email: "jane@example.com",
            uuid: "passenger-uuid-1",
            status: "confirmed",
          },
        ],
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
        data: {
          session: {
            access_token: "fake-admin-token",
            user: { email: "eduardo@example.com" },
          },
        },
        error: null,
      }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      signOut: jest.fn().mockResolvedValue({}),
    },
  },
}));

const renderDashboard = (initialEntry = "/admin") =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <LanguageProvider>
        <Routes>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/manifest/:date" element={<Dashboard />} />
        </Routes>
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

    const days = await screen.findAllByText("15");
    const activeDay = days.find((d) => !d.className.includes("text-gray-300"));
    await act(async () => {
      fireEvent.click(activeDay);
    });

    expect(
      await screen.findByText("Test Morning Tour", {}, { timeout: 5000 })
    ).toBeInTheDocument();

    // "Daily Schedule" is the heading in DayManifest — was "Day Controls"
    expect(screen.getByText(/Daily Schedule/i)).toBeInTheDocument();
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

    // "Confirmed Bookings" is the heading in DayManifest — was "Confirmed Passengers"
    expect(
      await screen.findByText(/Confirmed Bookings/i, {}, { timeout: 5000 })
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
    expect(await screen.findByText(/Admin Access/i)).toBeInTheDocument();
  });
});
