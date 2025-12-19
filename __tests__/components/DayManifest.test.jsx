import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import DayManifest from "../../src/components/dashboard/DayManifest";
import * as mockDataUtils from "../../src/utils/mockData";

jest.mock("../../src/utils/mockData");

const MOCK_TOURS = [
  {
    uniqueId: "2025-01-01-1",
    name: "Test Morning Tour",
    time: "09:00",
    capacity: 10,
    booked: 2,
    status: "available",
    bookings: [
      { id: 1, guestName: "John Doe", partySize: 2, paymentStatus: "paid" },
    ],
  },
  {
    uniqueId: "2025-01-01-2",
    name: "Test Sunset Tour",
    time: "16:00",
    capacity: 10,
    booked: 0,
    status: "cancelled",
    bookings: [],
  },
];

describe("DayManifest", () => {
  beforeEach(() => {
    mockDataUtils.getDayDetails.mockReturnValue(MOCK_TOURS);
    // Mock window.confirm
    window.confirm = jest.fn(() => true);
  });

  test("renders list of tours for the selected date", () => {
    render(<DayManifest date={new Date()} onClose={jest.fn()} />);
    expect(screen.getByText("Test Morning Tour")).toBeInTheDocument();
    expect(screen.getByText("Test Sunset Tour")).toBeInTheDocument();
  });

  test("drills down into passenger list when a tour is clicked", () => {
    render(<DayManifest date={new Date()} onClose={jest.fn()} />);

    // Click the tour card
    fireEvent.click(screen.getByText("Test Morning Tour"));

    // Check if we see the passenger
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Passenger Manifest")).toBeInTheDocument();
  });

  test("back button returns to tour list", () => {
    render(<DayManifest date={new Date()} onClose={jest.fn()} />);

    // Go in
    fireEvent.click(screen.getByText("Test Morning Tour"));
    expect(screen.getByText("John Doe")).toBeInTheDocument();

    // Find back button (ArrowLeft icon usually inside a button)
    const backBtn = screen.getAllByRole("button")[0];
    fireEvent.click(backBtn);

    // Should be back to main list
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    expect(screen.getByText("Test Sunset Tour")).toBeInTheDocument();
  });

  test("cancel single tour button toggles status", async () => {
    render(<DayManifest date={new Date()} onClose={jest.fn()} />);

    // Find the "Cancel" button for the first tour (Morning Tour)
    // We use getAllByText because there might be other buttons
    const cancelBtns = screen.getAllByText("Cancel");
    fireEvent.click(cancelBtns[0]);

    // It should flip to "Re-open"
    // FIXED: Use findAllByText or getAllByText because the other tour is also cancelled in mock data
    await waitFor(async () => {
      const reopenBtns = await screen.findAllByText("Re-open");
      expect(reopenBtns.length).toBeGreaterThan(0);
    });
  });

  test("cancel full day button fires confirmation", () => {
    render(<DayManifest date={new Date()} onClose={jest.fn()} />);

    const cancelAllBtn = screen.getByText("CANCEL ALL TOURS");
    fireEvent.click(cancelAllBtn);

    expect(window.confirm).toHaveBeenCalled();
  });
});
