import React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import "@testing-library/jest-dom";
import DayManifest from "../../src/components/dashboard/DayManifest";

const API_BASE = "http://localhost:8000/api/v1";

// Mock Supabase to prevent Auth listeners from leaking in the test process
jest.mock("../../src/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  },
}));

const server = setupServer(
  http.options(`${API_BASE}/*`, () => new HttpResponse(null, { status: 204 })),
  http.get(`${API_BASE}/admin/manifest/*`, () =>
    HttpResponse.json([
      {
        tour_id: 1,
        display_name: "Morning Tour",
        booked_count: 2,
        capacity: 10,
        status: "available",
        passengers: [{ name: "John Doe", pax: 2, email: "john@test.com" }],
      },
    ])
  )
);

beforeAll(() => server.listen());
afterEach(async () => {
  server.resetHandlers();
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });
  jest.clearAllMocks();
});
afterAll(() => server.close());

describe("DayManifest Component", () => {
  test("renders tours and handles selection", async () => {
    render(
      <DayManifest
        date={new Date("2026-02-12T12:00:00Z")}
        onClose={jest.fn()}
      />
    );

    await waitForElementToBeRemoved(() =>
      screen.queryByText(/Loading Manifest/i)
    );

    const tourCard = await screen.findByText("Morning Tour");
    fireEvent.click(tourCard);

    expect(await screen.findByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText(/2 Pax/i)).toBeInTheDocument();
  });
});
