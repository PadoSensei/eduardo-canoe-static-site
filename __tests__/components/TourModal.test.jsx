import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TourModal from "../../src/components/TourModal";
import {
  LanguageProvider,
  useLanguage,
} from "../../src/context/LanguageContext";

// Mock the language context to control strings in tests
jest.mock("../../src/context/LanguageContext", () => ({
  ...jest.requireActual("../../src/context/LanguageContext"),
  useLanguage: jest.fn(),
  LanguageProvider: ({ children }) => <div>{children}</div>,
}));

const mockTour = {
  id: "sunrise",
  title: "Sunrise Adventure",
  desc: "A beautiful morning.",
  detail: "Full comprehensive description here.",
  img: "/img/test.jpg",
  price: "R$ 250",
};

const renderTourModal = (tour, onClose = jest.fn()) => {
  return render(
    <MemoryRouter>
      <LanguageProvider>
        <TourModal tour={tour} onClose={onClose} />
      </LanguageProvider>
    </MemoryRouter>
  );
};

describe("TourModal Component", () => {
  beforeEach(() => {
    useLanguage.mockReturnValue({
      language: "en",
      t: (key) => {
        const manual = {
          ctaButton: "Book Now",
          btnCancel: "Cancel",
          modalIncluded: "Included:",
          modalBring: "What to bring:",
        };
        return manual[key] || key;
      },
    });
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  test("renders tour details correctly when tour is provided", () => {
    renderTourModal(mockTour);
    expect(screen.getByText(mockTour.title)).toBeInTheDocument();
    expect(screen.getByText(mockTour.price)).toBeInTheDocument();
    expect(screen.getByText(mockTour.detail)).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("src", mockTour.img);
  });

  test("calls onClose when the backdrop is clicked", () => {
    const onCloseMock = jest.fn();
    renderTourModal(mockTour, onCloseMock);
    const backdrop = screen.getByRole("dialog");
    fireEvent.click(backdrop);
    expect(onCloseMock).toHaveBeenCalled();
  });

  test("does NOT call onClose when clicking inside the modal content", () => {
    const onCloseMock = jest.fn();
    renderTourModal(mockTour, onCloseMock);
    const title = screen.getByText(mockTour.title);
    fireEvent.click(title);
    expect(onCloseMock).not.toHaveBeenCalled();
  });

  test("calls onClose when the Escape key is pressed", () => {
    const onCloseMock = jest.fn();
    renderTourModal(mockTour, onCloseMock);
    fireEvent.keyDown(window, { key: "Escape", code: "Escape" });
    // Flexible assertion to handle potential re-renders in test env
    expect(onCloseMock).toHaveBeenCalled();
  });

  test("Booking button links to the /book route", () => {
    renderTourModal(mockTour);
    const bookBtn = screen.getByRole("link", { name: /book now/i });
    expect(bookBtn).toHaveAttribute("href", "/book");
  });
});
