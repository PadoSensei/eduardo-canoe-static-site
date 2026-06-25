import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import LogisticsModal from "../../src/components/dashboard/LogisticsModal";
import { useLanguage } from "../../src/context/LanguageContext";

// Mock useLanguage context
jest.mock("../../src/context/LanguageContext", () => ({
  useLanguage: jest.fn(),
}));

// Mock Lucide icons to avoid SVGR issues in tests
jest.mock("lucide-react/dist/esm/icons/x", () => () => <div data-testid="icon-x" />);
jest.mock("lucide-react/dist/esm/icons/clock", () => () => <div data-testid="icon-clock" />);
jest.mock("lucide-react/dist/esm/icons/star", () => () => <div data-testid="icon-star" />);

describe("LogisticsModal", () => {
  const mockTour = {
    id: 1,
    display_name: "Sunset Tour",
    is_special_event: false,
  };

  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useLanguage.mockReturnValue({
      t: (key) => key,
    });
  });

  const getToggleButton = () => {
    // Find the toggle button. It's the one after the "Special Event" text.
    // In the DOM, it's a button with classes like "relative inline-flex..."
    return screen.getAllByRole("button").find(btn =>
      btn.className.includes("relative inline-flex")
    );
  };

  test("renders with correct initial toggle state from tour.is_special_event", () => {
    render(
      <LogisticsModal
        isOpen={true}
        tour={mockTour}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isSubmitting={false}
      />
    );

    expect(screen.getByText("Sunset Tour")).toBeInTheDocument();

    // Toggle button should be off (bg-slate-200)
    const toggleButton = getToggleButton();
    expect(toggleButton).toHaveClass("bg-slate-200");
  });

  test("renders with special event toggle ON when tour.is_special_event is true", () => {
    const specialTour = { ...mockTour, is_special_event: true };
    render(
      <LogisticsModal
        isOpen={true}
        tour={specialTour}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isSubmitting={false}
      />
    );

    const toggleButton = getToggleButton();
    expect(toggleButton).toHaveClass("bg-teal-600");
  });

  test("clicking the toggle updates the visual state", () => {
    render(
      <LogisticsModal
        isOpen={true}
        tour={mockTour}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isSubmitting={false}
      />
    );

    const toggleButton = getToggleButton();
    expect(toggleButton).toHaveClass("bg-slate-200");

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveClass("bg-teal-600");

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveClass("bg-slate-200");
  });

  test("clicking 'Save Logistics' calls onConfirm with { is_special_event: true } after toggle", () => {
    render(
      <LogisticsModal
        isOpen={true}
        tour={mockTour}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isSubmitting={false}
      />
    );

    const toggleButton = getToggleButton();
    fireEvent.click(toggleButton);

    const saveButton = screen.getByText("Save Logistics");
    fireEvent.click(saveButton);

    expect(mockOnConfirm).toHaveBeenCalledWith({
      is_special_event: true,
    });
  });

  test("does not call onConfirm when Cancel is clicked", () => {
    render(
      <LogisticsModal
        isOpen={true}
        tour={mockTour}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isSubmitting={false}
      />
    );

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });
});
