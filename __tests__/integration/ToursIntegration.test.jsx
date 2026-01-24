import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Tours from "../../src/pages/Tours";
import { LanguageProvider } from "../../src/context/LanguageContext";

const renderToursPage = () => {
  return render(
    <BrowserRouter>
      <LanguageProvider>
        <Tours />
      </LanguageProvider>
    </BrowserRouter>
  );
};

describe("Tours Page Integration", () => {
  test("clicking a tour card opens the detail modal", async () => {
    renderToursPage();

    // 1. Initially, details from the modal should not be visible
    // We check for a string that only exists in the modal description
    expect(screen.queryByText(/Included:/i)).not.toBeInTheDocument();

    // 2. Find the Sunrise Tour card and click it
    const tourCard = screen.getByText(/Sunrise Tour/i);
    fireEvent.click(tourCard);

    // 3. ASSERT: The modal should now be in the DOM
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // 4. ASSERT: Modal-specific content is visible
    expect(screen.getByText(/What to bring:/i)).toBeInTheDocument();

    // 5. ASSERT: The correct detailed description is shown (checking a snippet)
    expect(screen.getByText(/witness the Atlantic sun/i)).toBeInTheDocument();
  });

  test("modal can be closed via the close button", () => {
    renderToursPage();

    // Open it
    fireEvent.click(screen.getByText(/Sunrise Tour/i));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Close it using the button aria-label we added for a11y
    const closeBtn = screen.getByLabelText(/close modal/i);
    fireEvent.click(closeBtn);

    // ASSERT: Modal is gone
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
