// __tests__/BookingSystem.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import BookingSystem from "../src/components/BookingSystem";
import * as api from "../api";

// Mock the API module
jest.mock("../api");

const mockTours = [
  {
    id: "tour-1",
    instanceId: 101,
    tourType: "morning",
    name: "Morning Adventure",
    description: "Start your day right",
    price: 100.0,
    remaining: 5,
    isBookable: true,
    capacity: 10,
    duration: "2h",
    imageUrl: "test.jpg",
    tourDate: "2025-12-04",
  },
];

const mockBookingResponse = {
  success: true,
  booking: {
    uuid: "booking-uuid-123",
    status: "pending_payment",
  },
  paymentInfo: {
    qr_code: "00020126580014br.gov.bcb.pix0136mock-txn-id",
    qr_code_image: "https://api.qrserver.com/v1/create-qr-code/?data=test",
    amount: 100.0,
  },
};

describe("BookingSystem Payment Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.getAvailableTours.mockResolvedValue(mockTours);
    api.createBooking.mockResolvedValue(mockBookingResponse);
  });

  test("displays Pix QR code after successful booking", async () => {
    render(<BookingSystem />);

    // 1. Wait for tours to load
    await waitFor(() => {
      expect(screen.getByText("Morning Adventure")).toBeInTheDocument();
    });

    // 2. Click "Book Now"
    const bookButtons = screen.getAllByText("Book Now");
    fireEvent.click(bookButtons[0]);

    // 3. Fill out the form
    fireEvent.change(screen.getByLabelText(/Your Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Your Email/i), {
      target: { value: "john@example.com" },
    });

    // 4. Click Confirm
    const confirmButton = screen.getByText("Confirm Booking");
    fireEvent.click(confirmButton);

    // 5. Assert Payment Info is displayed
    // We check for the Header and the QR Image
    await waitFor(() => {
      expect(screen.getByText("Booking Reserved!")).toBeInTheDocument();
      expect(screen.getByAltText("Pix QR Code")).toBeInTheDocument();
    });
  });

  test("allows user to copy Pix code (mobile flow)", async () => {
    // 1. Mock the Clipboard API
    const mockWriteText = jest.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    render(<BookingSystem />);

    // 2. Navigate to Payment View
    await waitFor(() => screen.getByText("Morning Adventure"));
    fireEvent.click(screen.getAllByText("Book Now")[0]);
    fireEvent.change(screen.getByLabelText(/Your Name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText(/Your Email/i), {
      target: { value: "john@test.com" },
    });
    fireEvent.click(screen.getByText("Confirm Booking"));

    // 3. Wait for Payment View
    await waitFor(() =>
      expect(screen.getByText("Booking Reserved!")).toBeInTheDocument()
    );

    // 4. Find and Click the "Copy" button
    const copyButton = screen.getByText(/Copy Pix Code/i);
    fireEvent.click(copyButton);

    // 5. Assert Clipboard was called
    expect(mockWriteText).toHaveBeenCalledWith(
      mockBookingResponse.paymentInfo.qr_code
    );

    // 6. Assert feedback message appears
    await waitFor(() => {
      expect(screen.getByText(/Code Copied!/i)).toBeInTheDocument();
    });
  });

  test("polls for payment status and shows success message when confirmed", async () => {
    jest.useFakeTimers(); // Take control of time

    // 1. Setup the sequence of status checks
    // First call: pending, Second call: pending, Third call: confirmed
    api.getBookingStatus
      .mockResolvedValueOnce({ status: "pending_payment" })
      .mockResolvedValueOnce({ status: "pending_payment" })
      .mockResolvedValue({ status: "confirmed" });

    render(<BookingSystem />);

    // 2. Navigate to Payment View
    await waitFor(() => screen.getByText("Morning Adventure"));
    fireEvent.click(screen.getAllByText("Book Now")[0]);
    fireEvent.change(screen.getByLabelText(/Your Name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText(/Your Email/i), {
      target: { value: "john@test.com" },
    });
    fireEvent.click(screen.getByText("Confirm Booking"));

    // 3. Wait for Payment View (QR Code)
    await waitFor(() =>
      expect(screen.getByText("Booking Reserved!")).toBeInTheDocument()
    );

    // 4. Fast-forward time (e.g., 3 seconds) to trigger the first poll
    // We wrap this in act() because it triggers state updates
    await React.act(async () => {
      jest.advanceTimersByTime(3000);
    });

    // 5. Fast-forward again (next poll) - still pending
    await React.act(async () => {
      jest.advanceTimersByTime(3000);
    });

    // 6. Fast-forward again (next poll) - NOW it becomes confirmed
    await React.act(async () => {
      jest.advanceTimersByTime(3000);
    });

    // 7. Assert: The UI should change from "Scan to Pay" to "Payment Confirmed!"
    await waitFor(() => {
      expect(screen.getByText("Payment Confirmed!")).toBeInTheDocument();
      // The QR code should be gone
      expect(screen.queryByAltText("Pix QR Code")).not.toBeInTheDocument();
    });

    jest.useRealTimers(); // Cleanup
  });
});
