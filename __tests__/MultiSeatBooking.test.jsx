import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BookingSystem from "../src/components/BookingSystem";
import * as api from "../src/api";
import { LanguageProvider } from "../src/context/LanguageContext";

// 1. Mock the API module
jest.mock("../src/api");

// 2. Mock Data
const MOCK_TOURS = [
  {
    id: "sunrise-2025-12-15",
    instanceId: 101,
    tourType: "sunrise",
    name: "Sunrise Tour",
    price: 150.0,
    remaining: 5,
    isBookable: true,
    capacity: 10,
    duration: "2h",
    tourDate: "2025-12-15",
  },
];

const mockCreateBookingResponse = {
  success: true,
  booking: { uuid: "123-abc" },
  paymentInfo: { copy_paste: "pix-code" },
};

// 3. Wrapper to provide Context
const renderWithContext = (component) => {
  return render(<LanguageProvider>{component}</LanguageProvider>);
};

describe("Multi-Seat Booking Flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.getAvailableTours.mockResolvedValue(MOCK_TOURS);
    api.createBooking.mockResolvedValue(mockCreateBookingResponse);
  });

  test("calculates total price correctly when increasing guest count", async () => {
    renderWithContext(<BookingSystem />);

    // Wait for tours to load
    await waitFor(() => {
      expect(screen.getByText(/Sunrise Tour/i)).toBeInTheDocument();
    });

    // Open Modal
    const bookButtons = screen.getAllByText(/Book Now/i);
    fireEvent.click(bookButtons[0]);

    // Check initial state
    const guestsInput = screen.getByLabelText(/Number of Guests/i);
    expect(guestsInput).toHaveValue(1);

    // FIX: Use getAllByText because "R$ 150.00" appears in background list, unit price, and total
    expect(screen.getAllByText("R$ 150.00").length).toBeGreaterThan(0);

    // Change guests to 3
    fireEvent.change(guestsInput, { target: { value: "3" } });

    // Verify Input Update
    expect(guestsInput).toHaveValue(3);

    // Verify Dynamic Price Calculation (3 * 150 = 450)
    // "R$ 450.00" should be unique because unit price (150) stays 150
    expect(screen.getByText("R$ 450.00")).toBeInTheDocument();
  });

  test("enforces capacity limit (cannot book more than remaining)", async () => {
    renderWithContext(<BookingSystem />);

    await waitFor(() => screen.getByText(/Sunrise Tour/i));
    fireEvent.click(screen.getAllByText(/Book Now/i)[0]);

    const guestsInput = screen.getByLabelText(/Number of Guests/i);

    // Attempt to book 10 people (Only 5 remaining in MOCK_TOURS)
    fireEvent.change(guestsInput, { target: { value: "10" } });

    // Should be clamped to 5
    expect(guestsInput).toHaveValue(5);

    // Price should be 5 * 150 = 750
    expect(screen.getByText("R$ 750.00")).toBeInTheDocument();
  });

  test("sends correct multi-seat payload to the API", async () => {
    renderWithContext(<BookingSystem />);

    await waitFor(() => screen.getByText(/Sunrise Tour/i));
    fireEvent.click(screen.getAllByText(/Book Now/i)[0]);

    // 1. Set details
    fireEvent.change(screen.getByLabelText(/Number of Guests/i), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter your full name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), {
      target: { value: "john@example.com" },
    });

    // 2. Click Confirm
    const confirmBtn = screen.getByRole("button", { name: /Confirm Booking/i });
    fireEvent.click(confirmBtn);

    // 3. Verify API Call
    await waitFor(() => {
      expect(api.createBooking).toHaveBeenCalledWith({
        tourId: 101,
        guestName: "John Doe",
        guestEmail: "john@example.com",
        numPeople: 2, // Vital check
        totalPrice: 300.0, // Vital check (150 * 2)
      });
    });
  });
});
