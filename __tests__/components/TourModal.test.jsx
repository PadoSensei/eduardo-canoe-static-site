import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TourModal from "../../src/components/TourModal";
import {
  LanguageProvider,
  useLanguage,
} from "../../src/context/LanguageContext";

jest.mock("../../src/context/LanguageContext", () => ({
  ...jest.requireActual("../../src/context/LanguageContext"),
  useLanguage: jest.fn(),
  LanguageProvider: ({ children }) => <div>{children}</div>,
}));

const mockTour = {
  instanceId: 101,
  tourType: "sunset",
  name: "Sunrise Adventure",
  description: "Full comprehensive description here.",
  imageUrl: "/img/test.jpg",
  price: 250,
  inclusions: ["Paddle", "Lifejacket"],
  requirements: ["Sunscreen"],
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
          logoAlt: "Pipa Canoa Havaiana Logo",
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

    expect(screen.getByText(mockTour.name)).toBeInTheDocument();
    // Use Regex to match the price even with the "R$" prefix
    expect(screen.getByText(new RegExp(mockTour.price))).toBeInTheDocument();
    // Component now looks up translation key: tour_sunset_detail
    expect(screen.getByText(/tour_sunset_detail/i)).toBeInTheDocument();

    const tourImage = screen.getByAltText(mockTour.name);
    expect(tourImage).toHaveAttribute("src", mockTour.imageUrl);
  });

  test("does NOT call onClose when clicking inside the modal content", () => {
    const onCloseMock = jest.fn();
    renderTourModal(mockTour, onCloseMock);
    // Fixed: Use mockTour.name instead of title
    const title = screen.getByText(mockTour.name);
    fireEvent.click(title);
    expect(onCloseMock).not.toHaveBeenCalled();
  });

  test("calls onClose when the Escape key is pressed", () => {
    const onCloseMock = jest.fn();
    renderTourModal(mockTour, onCloseMock);
    fireEvent.keyDown(window, { key: "Escape", code: "Escape" });
    expect(onCloseMock).toHaveBeenCalled();
  });

  test("Booking button links to the /book route", () => {
    renderTourModal(mockTour);
    const bookBtn = screen.getByRole("link", { name: /book now/i });
    expect(bookBtn).toHaveAttribute("href", "/book");
  });
});
