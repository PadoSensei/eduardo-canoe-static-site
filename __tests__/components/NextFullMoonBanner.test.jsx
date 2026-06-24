import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { NextFullMoonBanner } from "../../src/components/booking/NextFullMoonBanner";
import { LanguageProvider } from "../../src/context/LanguageContext";

// IRON SHIELD: Using the real provider ensures we test the interaction
// between the Discovery Logic and the active Localization state.
const renderWithProvider = (ui) => {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
};

describe("NextFullMoonBanner", () => {
  const mockOnDateSelect = jest.fn();
  const nextMoonDate = "2026-05-20";

  beforeEach(() => {
    mockOnDateSelect.mockClear();
  });

  test("renders nothing when nextDate is missing", () => {
    const { container } = renderWithProvider(
      <NextFullMoonBanner
        nextDate={null}
        selectedDate="2026-05-15"
        onDateSelect={mockOnDateSelect}
      />
    );
    // Requirement: Shield the UI from empty discovery data
    expect(container.firstChild).toBeNull();
  });

  /**
   * IRON SHIELD: Lateness Shield & Discovery Requirement.
   * Per Eduardo's instruction: The banner should be displayed
   * ONLY on non-full moon days to bring users to the specialty date.
   * Once selected, it must vanish to declutter the booking flow.
   */
  test("renders nothing when nextDate equals selectedDate", () => {
    const { container } = renderWithProvider(
      <NextFullMoonBanner
        nextDate={nextMoonDate}
        selectedDate={nextMoonDate}
        onDateSelect={mockOnDateSelect}
      />
    );

    // Assertion: The banner must be hidden (null) when the user is on the right date.
    expect(container.firstChild).toBeNull();
  });

  test("renders banner when nextDate is different from selectedDate", () => {
    renderWithProvider(
      <NextFullMoonBanner
        nextDate={nextMoonDate}
        selectedDate="2026-05-15"
        onDateSelect={mockOnDateSelect}
      />
    );

    // Requirement: High-visibility discovery on standard days
    expect(screen.getByTestId("full-moon-banner")).toBeInTheDocument();

    // Verification: Does the localized date (20) appear in the banner?
    expect(screen.getByText(/20/i)).toBeInTheDocument();
  });

  test("calls onDateSelect when clicked", () => {
    renderWithProvider(
      <NextFullMoonBanner
        nextDate={nextMoonDate}
        selectedDate="2026-05-15"
        onDateSelect={mockOnDateSelect}
      />
    );

    // Interaction: Clicking the discovery anchor
    fireEvent.click(screen.getByTestId("full-moon-banner"));

    // Result: User is transported to the specialty date
    expect(mockOnDateSelect).toHaveBeenCalledWith(nextMoonDate);
  });
});
