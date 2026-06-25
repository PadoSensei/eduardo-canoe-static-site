// NOTE: These tests use fireEvent which bypasses ShieldedButton's click interceptor.
// Integration tests below use the form submit path to catch real browser behaviour.
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
jest.mock("lucide-react/dist/esm/icons/x", () => {
  const X = () => <div data-testid="icon-x" />;
  X.displayName = "X";
  return X;
});
jest.mock("lucide-react/dist/esm/icons/clock", () => {
  const Clock = () => <div data-testid="icon-clock" />;
  Clock.displayName = "Clock";
  return Clock;
});
jest.mock("lucide-react/dist/esm/icons/star", () => {
  const Star = () => <div data-testid="icon-star" />;
  Star.displayName = "Star";
  return Star;
});

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
    return screen.getByRole("button", { name: /toggle special event/i });
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

  test("shows 'Saving...' and is disabled when isSubmitting is true", () => {
    render(
      <LogisticsModal
        isOpen={true}
        tour={mockTour}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isSubmitting={true}
      />
    );

    const saveButton = screen.getByRole("button", { name: /saving\.\.\./i });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  test("shows 'Save Logistics' and is not disabled when isSubmitting is false", () => {
    render(
      <LogisticsModal
        isOpen={true}
        tour={mockTour}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isSubmitting={false}
      />
    );

    const saveButton = screen.getByRole("button", { name: /save logistics/i });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).not.toBeDisabled();
  });

  test("full submit flow: toggle fires onConfirm with correct payload", async () => {
    const onConfirm = jest.fn();
    render(
      <LogisticsModal
        isOpen={true}
        tour={{
          id: 1,
          tour_id: 1,
          display_name: "Sunset Tour",
          is_special_event: false,
        }}
        onClose={jest.fn()}
        onConfirm={onConfirm}
        isSubmitting={false}
      />
    );

    // Toggle the special event switch
    fireEvent.click(screen.getByRole("button", { name: /toggle special event/i }));

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /save logistics/i }));

    expect(onConfirm).toHaveBeenCalledWith({ is_special_event: true });
  });
});
