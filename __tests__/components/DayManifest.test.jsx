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
  ),
  http.post(`${API_BASE}/admin/tours/*/weather-cancel`, () =>
    HttpResponse.json({ success: true })
  )
);

beforeAll(() => {
  server.listen();
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
  test("renders list of tours after loading state finishes", async () => {
    renderManifest();
    expect(await screen.findByText("Test Morning Tour")).toBeInTheDocument();

    // Flexible matcher for "8 / 10"
    expect(
      screen.getByText((content, node) => {
        const hasText = (node) =>
          node.textContent.replace(/\s/g, "") === "8/10";
        return (
          hasText(node) &&
          Array.from(node.children).every((child) => !hasText(child))
        );
      })
    ).toBeInTheDocument();
  });

  test("drills down into passenger list when a tour is clicked", async () => {
    renderManifest();
    fireEvent.click(await screen.findByText("Test Morning Tour"));
    expect(
      await screen.findByText(/Confirmed Passengers/i)
    ).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  test("Manual booking form respects remaining capacity", async () => {
    renderManifest();
    fireEvent.click(await screen.findByText("Test Morning Tour"));
    fireEvent.click(screen.getByLabelText(/Add Guest/i));

    const plusBtn = screen.getByLabelText(/Increase passengers/i);
    fireEvent.click(plusBtn); // 1 -> 2
    expect(screen.getByText("2")).toBeInTheDocument();

    fireEvent.click(plusBtn); // Should stay at 2
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  test("fires confirmation dialog when attempting to cancel all tours", async () => {
    renderManifest();
    const cancelBtn = await screen.findByText(/CANCEL ALL TOURS/i);
    fireEvent.click(cancelBtn);
    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining("Cancel all tours")
    );
  });
});
