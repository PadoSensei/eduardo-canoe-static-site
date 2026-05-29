import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import DayManifest from "../src/components/dashboard/DayManifest";
import { LanguageProvider } from "../src/context/LanguageContext";

const API_BASE = "http://localhost:8080/api/v1";

jest.mock("@/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { access_token: "fake-token" } },
        error: null,
      }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  },
}));

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const mockTourData = (passengers) => [
  {
    tour_id: 101,
    display_name: "Test Tour",
    booked_count: 0,
    capacity: 10,
    status: "available",
    passengers: passengers,
  },
];

describe("DayManifest Headcount Logic", () => {
  it("excludes cancelled passengers from the header total", async () => {
    const passengers = [
      { uuid: "p1", name: "Active", num_people: 2, status: "confirmed" },
      { uuid: "p2", name: "Cancelled", num_people: 1, status: "cancelled" },
    ];

    server.use(
      http.get(`${API_BASE}/admin/manifest/*`, () =>
        HttpResponse.json(mockTourData(passengers))
      )
    );

    render(
      <MemoryRouter>
        <LanguageProvider>
          <DayManifest
            date={new Date("2026-01-19T12:00:00Z")}
            onClose={jest.fn()}
          />
        </LanguageProvider>
      </MemoryRouter>
    );

    // Select the tour
    fireEvent.click(await screen.findByText("Test Tour"));

    // Check header headcount: Should be "0 / 2" because only Active is counted
    const headcountDisplay = await screen.findByText("0");
    const totalDisplay = screen.getByText("/ 2");
    expect(headcountDisplay).toBeInTheDocument();
    expect(totalDisplay).toBeInTheDocument();
  });

  it("includes pending_payment in both primary list and header total", async () => {
    const passengers = [
      { uuid: "p1", name: "Active", num_people: 2, status: "confirmed" },
      { uuid: "p2", name: "Pending", num_people: 1, status: "pending_payment" },
    ];

    server.use(
      http.get(`${API_BASE}/admin/manifest/*`, () =>
        HttpResponse.json(mockTourData(passengers))
      )
    );

    render(
      <MemoryRouter>
        <LanguageProvider>
          <DayManifest
            date={new Date("2026-01-19T12:00:00Z")}
            onClose={jest.fn()}
          />
        </LanguageProvider>
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByText("Test Tour"));

    // Iron Shield: Now counts BOTH confirmed (2) and pending_payment (1) = 3
    expect(await screen.findByText("0")).toBeInTheDocument();
    expect(screen.getByText("/ 3")).toBeInTheDocument();

    // Both should be in primary list (Operational Manifest)
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();

    // Check for "AWAITING PAYMENT" badge on the Pending row
    expect(screen.getByText(/AWAITING PAYMENT/i)).toBeInTheDocument();
  });

  it("moves cancelled/inactive bookings to the collapsed section", async () => {
    const passengers = [
      { uuid: "p1", name: "Active", num_people: 2, status: "confirmed" },
      { uuid: "p2", name: "Cancelled", num_people: 1, status: "cancelled" },
      { uuid: "p3", name: "Expired", num_people: 1, status: "expired" },
    ];

    server.use(
      http.get(`${API_BASE}/admin/manifest/*`, () =>
        HttpResponse.json(mockTourData(passengers))
      )
    );

    render(
      <MemoryRouter>
        <LanguageProvider>
          <DayManifest
            date={new Date("2026-01-19T12:00:00Z")}
            onClose={jest.fn()}
          />
        </LanguageProvider>
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByText("Test Tour"));

    // Active should be visible
    expect(screen.getByText("Active")).toBeInTheDocument();

    // Cancelled and Expired should NOT be visible initially
    expect(screen.queryByText("Cancelled")).not.toBeInTheDocument();
    expect(screen.queryByText("Expired")).not.toBeInTheDocument();

    // Expand the inactive section
    const expandBtn = screen.getByText(/Cancelled \/ Inactive \(2\)/i);
    fireEvent.click(expandBtn);

    // Now they should be visible
    expect(await screen.findByText("Cancelled")).toBeInTheDocument();
    expect(screen.getByText("Expired")).toBeInTheDocument();
  });
});
