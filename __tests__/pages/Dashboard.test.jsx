import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import {
  MemoryRouter,
  Routes,
  Route,
  useOutletContext,
} from "react-router-dom";
import "@testing-library/jest-dom";
import Dashboard from "../../src/pages/Dashboard";
import { LanguageProvider } from "../../src/context/LanguageContext";

const API_BASE = "http://localhost:8080/api/v1";

// 1. Mock the Router Context
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useOutletContext: jest.fn(),
}));

jest.mock("../../src/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            access_token: "mock-token",
            user: { email: "eduardo@example.com" },
          },
        },
        error: null,
      }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  },
}));

/** Matches `DayStatsSchema` aggregation logic */
function buildSchedulePayload(request) {
  const url = new URL(request.url);
  const year = Number(url.searchParams.get("year"));
  const month = Number(url.searchParams.get("month"));
  const mm = String(month).padStart(2, "0");
  const dayKey = `${year}-${mm}-15`;
  return {
    [dayKey]: {
      booked_count: 5,
      capacity: 10,
      price: 100,
      revenue: 500,
      status: "available",
    },
  };
}

/** IRON SHIELD: Using 'num_people' to match the refactored ledger contract */
const MOCK_MANIFEST = [
  {
    tour_id: 101,
    display_name: "Test Morning Tour",
    booked_count: 5,
    capacity: 10,
    status: "available",
    passengers: [
      {
        id: 9001,
        uuid: "passenger-uuid-1",
        name: "Jane Doe",
        num_people: 1,
        email: "jane@example.com",
        checked_in: false,
      },
    ],
  },
];

const server = setupServer(
  http.options(`${API_BASE}/*`, () => new HttpResponse(null, { status: 204 })),
  http.get(`${API_BASE}/admin/schedule*`, ({ request }) =>
    HttpResponse.json(buildSchedulePayload(request))
  ),
  http.get(`${API_BASE}/admin/manifest/*`, () =>
    HttpResponse.json(MOCK_MANIFEST)
  ),
  http.get(`${API_BASE}/tours/available*`, () => HttpResponse.json([]))
);

beforeAll(() => server.listen());
afterEach(async () => {
  server.resetHandlers();
  jest.clearAllMocks();
});
afterAll(() => server.close());

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
  beforeEach(() => {
    useOutletContext.mockReturnValue({
      session: { user: { email: "eduardo@example.com" } },
    });
  });

  test("initially shows calendar and logged in user", async () => {
    renderDashboard();
    expect(await screen.findByText(/Operations/i)).toBeInTheDocument();
    expect(await screen.findByText(/eduardo@example.com/i)).toBeInTheDocument();
  });

  test("clicking an active date opens the manifest", async () => {
    renderDashboard();

    // IRON SHIELD: Wait for the API to return 500 revenue so we know the day is active
    await screen.findByText(/500[\s,.]*00/);

    const days = await screen.findAllByText("15");
    const activeDay = days.find(
      (d) => d.closest(".cursor-pointer") && !d.closest(".text-slate-400")
    );

    fireEvent.click(activeDay);

    // Verify manifest appears
    expect(await screen.findByText("Test Morning Tour")).toBeInTheDocument();
  });

  test("clicking a tour card shows the passenger list", async () => {
    renderDashboard();

    // Wait for calendar to load
    await screen.findByText(/500,00/i);

    const days = await screen.findAllByText("15");
    const activeDay = days.find(
      (d) => d.closest(".cursor-pointer") && !d.closest(".text-slate-400")
    );

    fireEvent.click(activeDay);

    const tourCard = await screen.findByText("Test Morning Tour");
    fireEvent.click(tourCard);

    // Verify transition to manifest list
    expect(
      await screen.findByText(/Operational Manifest/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });
});
