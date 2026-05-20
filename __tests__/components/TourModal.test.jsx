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
  name: "Sunset Adventure",
  description: "Full comprehensive description here.",
  imageUrl: "/img/test.jpg",
  price: 250,
  duration: "2 Hours",
  capacity: 10,
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
          logistics_duration: "Duration",
          logistics_capacity: "Capacity",
          logistics_meeting: "Meeting Point",
        };
        return manual[key] || key;
      },
    });
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  test("renders tour details and logistics correctly", () => {
    renderTourModal(mockTour);

    // 1. Core Info
    expect(screen.getByText(mockTour.name)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(mockTour.price))).toBeInTheDocument();

    // 2. New Logistics Strip Verification
    expect(screen.getByText(/Duration/i)).toBeInTheDocument();
    expect(screen.getByText(mockTour.duration)).toBeInTheDocument();

    // 3. Translation Key Verification
    expect(screen.getByText(/tour_sunset_detail/i)).toBeInTheDocument();

    // 4. Image verification
    const tourImage = screen.getByAltText(mockTour.name);
    expect(tourImage).toHaveAttribute("src", mockTour.imageUrl);
  });

  test("does NOT call onClose when clicking inside the content area", () => {
    const onCloseMock = jest.fn();
    renderTourModal(mockTour, onCloseMock);

    // Clicking the title (inside the modal) should not trigger the backdrop's onClose
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

  test("Booking button contains correct link and visual arrow", () => {
    renderTourModal(mockTour);
    // The link now contains an arrow, so we use a partial text match or find by role
    const bookBtn = screen.getByRole("link", { name: /book now/i });
    expect(bookBtn).toHaveAttribute("href", "/book");
    expect(screen.getByText("→")).toBeInTheDocument();
  });
});
