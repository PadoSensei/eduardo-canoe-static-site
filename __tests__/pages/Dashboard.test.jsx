import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import DayManifest from "../../src/components/dashboard/DayManifest";
import { LanguageProvider } from "../../src/context/LanguageContext";

const API_BASE = "http://localhost:8000/api/v1";

const MOCK_MANIFEST = [
  {
    tour_id: 101,
    display_name: "Test Morning Tour",
    time: "09:00",
    capacity: 10,
    booked_count: 8,
    status: "available",
    passengers: [
      { name: "John Doe", pax: 2, email: "john@test.com", status: "confirmed" },
    ],
  },
];

const server = setupServer(
  http.get(`${API_BASE}/admin/manifest/*`, () =>
    HttpResponse.json(MOCK_MANIFEST)
  ),
  http.post(`${API_BASE}/admin/bookings`, () =>
    HttpResponse.json({ success: true })
  )
);

beforeAll(() => {
  server.listen();
  // SENIOR FIX: JSDOM doesn't support alert/confirm. We must mock them globally.
  window.alert = jest.fn();
  window.confirm = jest.fn(() => true);
});
afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
});
afterAll(() => server.close());

const renderManifest = () =>
  render(
    <MemoryRouter>
      <LanguageProvider>
        <DayManifest date={new Date()} onClose={jest.fn()} />
      </LanguageProvider>
    </MemoryRouter>
  );

describe("DayManifest Integration", () => {
  test("renders list of tours and seat counts", async () => {
    renderManifest();

    // 1. Wait for async load
    expect(await screen.findByText("Test Morning Tour")).toBeInTheDocument();

    // 2. FIX: Use a function matcher to find text split across multiple <span> elements
    const seatDisplay = screen.getByText((content, node) => {
      const hasText = (node) => node.textContent === "8 / 10";
      const nodeHasText = hasText(node);
      const childrenDontHaveText = Array.from(node.children).every(
        (child) => !hasText(child)
      );
      return nodeHasText && childrenDontHaveText;
    });
    expect(seatDisplay).toBeInTheDocument();
  });

  test("Manual booking form respects remaining capacity", async () => {
    renderManifest();
    fireEvent.click(await screen.findByText("Test Morning Tour"));
    fireEvent.click(screen.getByText(/Add Guest/i));

    // Targeted via the aria-label we added to the refactored component
    const plusBtn = screen.getByLabelText(/Increase passengers/i);

    // Initial 1 -> click -> 2
    fireEvent.click(plusBtn);
    expect(screen.getByText("2")).toBeInTheDocument();

    // Click again -> should stay at 2 (Math.min logic)
    fireEvent.click(plusBtn);
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
