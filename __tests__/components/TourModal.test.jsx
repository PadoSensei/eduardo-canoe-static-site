import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import TourModal from "../../src/components/TourModal";
import { LanguageProvider } from "../../src/context/LanguageContext";

// Mock Tour Data
const mockTour = {
  id: "sunrise",
  title: "Sunrise Adventure",
  desc: "A beautiful morning.",
  detail: "Full comprehensive description here.",
  img: "/img/test.jpg",
  price: "R$ 250",
};

// Helper to render with all required providers
const renderTourModal = (tour, onClose = jest.fn()) => {
  return render(
    <BrowserRouter>
      <LanguageProvider>
        <TourModal tour={tour} onClose={onClose} />
      </LanguageProvider>
    </BrowserRouter>
  );
};

describe("TourModal Component", () => {
  test("renders tour details correctly when tour is provided", () => {
    renderTourModal(mockTour);

    expect(screen.getByText(mockTour.title)).toBeInTheDocument();
    expect(screen.getByText(mockTour.price)).toBeInTheDocument();
    expect(screen.getByText(mockTour.detail)).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("src", mockTour.img);
  });

  test("does not render when tour is null", () => {
    const { container } = renderTourModal(null);
    expect(container.firstChild).toBeNull();
  });

  test("calls onClose when the 'X' button is clicked", () => {
    const onCloseMock = jest.fn();
    renderTourModal(mockTour, onCloseMock);

    const closeBtn = screen.getByLabelText(/close modal/i);
    fireEvent.click(closeBtn);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  test("calls onClose when the backdrop (outer overlay) is clicked", () => {
    const onCloseMock = jest.fn();
    renderTourModal(mockTour, onCloseMock);

    // The backdrop is the outermost div with the fixed class
    const backdrop = screen.getByRole("dialog");
    fireEvent.click(backdrop);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  test("does NOT call onClose when the modal content is clicked", () => {
    const onCloseMock = jest.fn();
    renderTourModal(mockTour, onCloseMock);

    // Click the title or the description inside the modal
    const title = screen.getByText(mockTour.title);
    fireEvent.click(title);

    expect(onCloseMock).not.toHaveBeenCalled();
  });

  test("calls onClose when the Escape key is pressed", () => {
    const onCloseMock = jest.fn();
    renderTourModal(mockTour, onCloseMock);

    fireEvent.keyDown(window, { key: "Escape", code: "Escape" });

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  test("Booking button links to the /book route", () => {
    renderTourModal(mockTour);
    const bookBtn = screen.getByRole("link", { name: /book now/i }); // Matches ctaButton translation
    expect(bookBtn).toHaveAttribute("href", "/book");
  });
});
