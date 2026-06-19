import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { NextFullMoonBanner } from "../../src/components/booking/NextFullMoonBanner";
import { LanguageProvider } from "../../src/context/LanguageContext";

// Mocking the language context if needed, but using the real provider for better coverage
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
    expect(container.firstChild).toBeNull();
  });

  test("renders validation anchor when nextDate equals selectedDate", () => {
    renderWithProvider(
      <NextFullMoonBanner
        nextDate={nextMoonDate}
        selectedDate={nextMoonDate}
        onDateSelect={mockOnDateSelect}
      />
    );
    expect(
      screen.getByText(/You have selected the Full Moon party|Você selecionou o lual de Lua Cheia/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Confirmed Selection|Seleção Confirmada/i)).toBeInTheDocument();
  });

  test("renders banner when nextDate is different from selectedDate", () => {
    renderWithProvider(
      <NextFullMoonBanner
        nextDate={nextMoonDate}
        selectedDate="2026-05-15"
        onDateSelect={mockOnDateSelect}
      />
    );
    expect(screen.getByTestId("full-moon-banner")).toBeInTheDocument();
    // Check if the localized date appears in the document
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
    fireEvent.click(screen.getByTestId("full-moon-banner"));
    expect(mockOnDateSelect).toHaveBeenCalledWith(nextMoonDate);
  });
});
