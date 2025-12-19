import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import DashboardCalendar from "../../src/components/dashboard/DashboardCalendar";
import * as mockDataUtils from "../../src/utils/mockData";

// Mock the data generator to control the "Heatmap" colors
jest.mock("../../src/utils/mockData");

describe("DashboardCalendar", () => {
  beforeEach(() => {
    // Setup consistent return data
    mockDataUtils.getDayDetails.mockReturnValue([
      { capacity: 10, booked: 10, status: "available" }, // Full
      { capacity: 10, booked: 0, status: "available" }, // Empty
      { capacity: 10, booked: 0, status: "available" }, // Empty
    ]);
  });

  test("renders the current month header", () => {
    render(<DashboardCalendar onDateSelect={jest.fn()} selectedDate={null} />);

    // We expect the current month (e.g., "December 2025")
    const currentMonth = new Date().toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    expect(screen.getByText(currentMonth)).toBeInTheDocument();
  });

  test("calls onDateSelect when a day is clicked", () => {
    const handleDateSelect = jest.fn();
    render(
      <DashboardCalendar onDateSelect={handleDateSelect} selectedDate={null} />
    );

    // Click on the 15th of the month
    const dayButton = screen.getByText("15").closest("div");
    fireEvent.click(dayButton);

    expect(handleDateSelect).toHaveBeenCalledTimes(1);
  });

  test("applies selection ring class when selectedDate matches", () => {
    const today = new Date();
    render(<DashboardCalendar onDateSelect={jest.fn()} selectedDate={today} />);

    const dayText = today.getDate().toString();
    // Use getAllByText because previous/next months might show the same number
    // We grab the one that is likely the main day
    const dayElements = screen.getAllByText(dayText);
    const dayCell = dayElements.find((el) => el.closest(".ring-teal-600"));

    expect(dayCell).toBeInTheDocument();
  });
});
