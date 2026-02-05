import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import DayManifest from "../../src/components/dashboard/DayManifest";
import { LanguageProvider } from "../../src/context/LanguageContext";

const API_BASE = "http://localhost:8000/api/v1";

// 1. Define the mock data in the format your real API returns (Snake Case)
const MOCK_MANIFEST = [
  {
    tour_id: 101,
    display_name: "Test Morning Tour",
    time: "09:00",
    capacity: 10,
    booked_count: 8, // Leaves 2 seats available
    status: "available",
    passengers: [
      { name: "John Doe", pax: 2, email: "john@test.com", status: "confirmed" },
    ],
  },
  {
    tour_id: 102,
    display_name: "Test Sunset Tour",
    time: "16:00",
    capacity: 10,
    booked_count: 0,
    status: "available",
    passengers: [],
  },
];

// 2. Setup the Mock Service Worker (MSW)
const server = setupServer(
  http.get(`${API_BASE}/admin/manifest/*`, () =>
    HttpResponse.json(MOCK_MANIFEST)
  ),
  http.post(`${API_BASE}/admin/bookings`, () =>
    HttpResponse.json({ success: true, booking: { id: 1 }, payment_info: {} })
  )
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const renderManifest = (date = new Date()) => {
  return render(
    <MemoryRouter>
      <LanguageProvider>
        <DayManifest date={date} onClose={jest.fn()} />
      </LanguageProvider>
    </MemoryRouter>
  );
};

describe("DayManifest Component Integration", () => {
  beforeEach(() => {
    // Eduardo's business logic requires confirmation for bulk actions
    window.confirm = jest.fn(() => true);
  });

  test("renders list of tours after loading state finishes", async () => {
    renderManifest();

    // Verify initial loading state is visible
    expect(screen.getByText(/Loading Manifest/i)).toBeInTheDocument();

    // Wait for the API data to render (findBy handles the async wait)
    const tourTitle = await screen.findByText("Test Morning Tour");
    expect(tourTitle).toBeInTheDocument();

    // SENIOR FIX: Use a regular expression to find the seat count.
    // This allows the test to pass even if the text is split by spans or has extra spaces.
    expect(
      screen.getByText((content, element) => {
        return element.textContent === "8 / 10";
      })
    ).toBeInTheDocument();
  });

  test("drills down into passenger list when a tour is clicked", async () => {
    renderManifest();

    const tourCard = await screen.findByText("Test Morning Tour");
    fireEvent.click(tourCard);

    // Verify drill-down view headers
    expect(
      await screen.findByText(/Confirmed Passengers/i)
    ).toBeInTheDocument();

    // Verify passenger data from the mock
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("2 Pax")).toBeInTheDocument();
  });

  test("back button returns to the tour list", async () => {
    renderManifest();

    fireEvent.click(await screen.findByText("Test Morning Tour"));
    expect(screen.getByText("John Doe")).toBeInTheDocument();

    // Find the back button using the aria-label added for accessibility
    const backBtn = screen.getByLabelText(/back to tour list/i);
    fireEvent.click(backBtn);

    // Verify we are back on the main list
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    expect(screen.getByText("Test Sunset Tour")).toBeInTheDocument();
  });

  test("Manual booking form respects remaining capacity", async () => {
    renderManifest();

    // Navigate to the "Add Guest" form
    fireEvent.click(await screen.findByText("Test Morning Tour"));
    fireEvent.click(screen.getByText(/Add Guest/i));

    // Based on MOCK_MANIFEST: 8/10 booked, so only 2 seats remain.
    // The initial passenger count in the form is 1.
    // We target the plus button using the specific aria-label.
    const plusBtn = screen.getByLabelText(/Increase passengers/i);

    // Click Plus once: 1 -> 2
    fireEvent.click(plusBtn);
    expect(screen.getByText("2")).toBeInTheDocument();

    // Click Plus again: Should stay at 2 (Math.min logic prevents overbooking)
    fireEvent.click(plusBtn);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.queryByText("3")).not.toBeInTheDocument();
  });

  test("fires confirmation dialog when attempting to cancel all tours", async () => {
    renderManifest();

    // Ensure we wait for the data to load so the "Day Controls" section is visible
    const cancelBtn = await screen.findByText(/CANCEL ALL TOURS/i);
    fireEvent.click(cancelBtn);

    // Verify Eduardo is asked for confirmation before bulk deletion
    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining("Cancel all tours")
    );
  });
});
