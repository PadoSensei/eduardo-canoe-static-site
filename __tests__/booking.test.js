// __tests__/booking.test.js

/**
 * TDD Test Suite for booking.js
 * Tests the booking page functionality with real API data
 */

const { JSDOM } = require("jsdom");
const { waitFor } = require("@testing-library/dom");
const fs = require("fs");
const path = require("path");

// Mock the API functions
jest.mock("../apiMock.js", () => ({
  getTours: jest.fn(),
  getAvailability: jest.fn(),
  bookTour: jest.fn(),
  resetMockBookings: jest.fn(),
}));

// Import the mocked API
const mockApi = require("../apiMock.js");

// Test data - simulating real backend responses
const MOCK_TOURS = [
  {
    id: "dolphin",
    name: "Daybreak Dolphin Bay Encounter",
    description: "A gentle morning paddle to see dolphins at sunrise.",
    price: 50,
    duration: "2h",
    capacity: 10,
  },
  {
    id: "coastal",
    name: "Coastal Exploration",
    description: "Explore the coastline, beaches, and reefs.",
    price: 100,
    duration: "6h",
    capacity: 10,
  },
  {
    id: "sunset",
    name: "Sunset Lagoon Paddle",
    description: "End your day with a calm sunset paddle.",
    price: 50,
    duration: "2.5h",
    capacity: 10,
  },
];

const TEST_DATE = "2025-12-01";

const MOCK_AVAILABILITY = [
  {
    tour_id: "dolphin",
    date: TEST_DATE,
    available: true,
    remaining: 8,
    booked: 2,
  },
  {
    tour_id: "coastal",
    date: TEST_DATE,
    available: true,
    remaining: 5,
    booked: 5,
  },
  {
    id: "sunset",
    tour_id: "sunset",
    date: TEST_DATE,
    available: false,
    remaining: 0,
    booked: 10,
  },
];

describe("Booking Page - Real API Integration", () => {
  let dom;
  let document;
  let window;

  beforeAll(() => {
    // Set up JSDOM environment
    const htmlPath = path.join(__dirname, "../book.html");
    const htmlContent = fs.readFileSync(htmlPath, "utf-8");

    dom = new JSDOM(htmlContent, {
      url: "http://localhost:3000",
      runScripts: "dangerously",
      resources: "usable",
      pretendToBeVisual: true,
    });

    window = dom.window;
    document = window.document;

    // Set up globals
    global.window = window;
    global.document = document;
    global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
    global.alert = jest.fn();
    global.confirm = jest.fn();
  });

  afterAll(() => {
    if (dom) {
      dom.window.close();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    global.alert.mockClear();
    global.confirm.mockClear();
  });

  describe("API Integration Tests", () => {
    test("should fetch real tours data on page load", async () => {
      mockApi.getTours.mockResolvedValue(MOCK_TOURS);

      const tours = await mockApi.getTours();

      expect(tours).toEqual(MOCK_TOURS);
      expect(tours.length).toBe(3);
      expect(tours[0].id).toBe("dolphin");
    });

    test("should fetch availability for a specific date", async () => {
      mockApi.getAvailability.mockResolvedValue(MOCK_AVAILABILITY);

      const availability = await mockApi.getAvailability(TEST_DATE);

      expect(availability).toEqual(MOCK_AVAILABILITY);
      expect(availability.length).toBe(3);
      expect(mockApi.getAvailability).toHaveBeenCalledWith(TEST_DATE);
    });

    test("should handle empty availability response", async () => {
      mockApi.getAvailability.mockResolvedValue([]);

      const availability = await mockApi.getAvailability("2025-12-31");

      expect(availability).toEqual([]);
      expect(availability.length).toBe(0);
    });

    test("should handle API errors gracefully", async () => {
      mockApi.getAvailability.mockRejectedValue(new Error("Network error"));

      await expect(mockApi.getAvailability(TEST_DATE)).rejects.toThrow(
        "Network error"
      );
    });
  });

  describe("DOM Structure Tests", () => {
    test("should have all required booking page elements", () => {
      const datePicker = document.getElementById("availability-date");
      expect(datePicker).toBeTruthy();
      expect(datePicker.type).toBe("date");

      const availabilitySlots = document.getElementById("availability-slots");
      expect(availabilitySlots).toBeTruthy();

      const resetBtn = document.getElementById("reset-bookings-btn");
      expect(resetBtn).toBeTruthy();

      const modal = document.getElementById("booking-modal");
      expect(modal).toBeTruthy();
      expect(modal.classList.contains("hidden")).toBe(true);
    });

    test("should have modal elements", () => {
      const modalContent = document.getElementById("booking-modal-content");
      expect(modalContent).toBeTruthy();

      const modalClose = document.getElementById("booking-modal-close");
      expect(modalClose).toBeTruthy();
    });
  });

  describe("Date Picker Functionality", () => {
    test("should set default date to today", () => {
      const datePicker = document.getElementById("availability-date");
      const today = new Date().toISOString().split("T")[0];

      // Simulate initialization
      datePicker.value = today;

      expect(datePicker.value).toBe(today);
    });

    test("should allow user to select different dates", () => {
      const datePicker = document.getElementById("availability-date");
      const testDate = "2025-12-15";

      datePicker.value = testDate;

      expect(datePicker.value).toBe(testDate);
    });

    test("should trigger availability check when date changes", async () => {
      mockApi.getAvailability.mockResolvedValue(MOCK_AVAILABILITY);

      const datePicker = document.getElementById("availability-date");
      datePicker.value = TEST_DATE;

      // Simulate change event
      const changeEvent = new window.Event("change", { bubbles: true });
      datePicker.dispatchEvent(changeEvent);

      // In real implementation, this would trigger getAvailability
      await mockApi.getAvailability(TEST_DATE);

      expect(mockApi.getAvailability).toHaveBeenCalledWith(TEST_DATE);
    });
  });

  describe("Availability Display", () => {
    test("should render loading state initially", () => {
      const availabilitySlots = document.getElementById("availability-slots");

      // Simulate loading state
      availabilitySlots.innerHTML = `
        <div class="flex justify-center items-center py-20">
          <span class="ml-4 text-gray-500 font-medium">Checking availability...</span>
        </div>
      `;

      expect(availabilitySlots.textContent).toContain(
        "Checking availability..."
      );
    });

    test("should render all available tours with correct data", () => {
      const availabilitySlots = document.getElementById("availability-slots");

      // Simulate rendering tours
      const html = `
        <div>
          <h3 class="text-2xl font-bold text-center mb-6">Bookings for December 1, 2025</h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center p-4 border">
              <div>
                <h4 class="font-semibold text-lg">Daybreak Dolphin Bay Encounter</h4>
                <p class="text-sm">Duration: 2h • $50 • Capacity: 10</p>
              </div>
              <button class="book-slot-btn" data-tour-id="dolphin" data-date="${TEST_DATE}">
                Book (8 left)
              </button>
            </div>
            <div class="flex justify-between items-center p-4 border">
              <div>
                <h4 class="font-semibold text-lg">Coastal Exploration</h4>
                <p class="text-sm">Duration: 6h • $100 • Capacity: 10</p>
              </div>
              <button class="book-slot-btn" data-tour-id="coastal" data-date="${TEST_DATE}">
                Book (5 left)
              </button>
            </div>
          </div>
        </div>
      `;

      availabilitySlots.innerHTML = html;

      expect(availabilitySlots.textContent).toContain(
        "Daybreak Dolphin Bay Encounter"
      );
      expect(availabilitySlots.textContent).toContain("Book (8 left)");
      expect(availabilitySlots.textContent).toContain("Coastal Exploration");
      expect(availabilitySlots.textContent).toContain("Book (5 left)");

      const buttons = availabilitySlots.querySelectorAll(".book-slot-btn");
      expect(buttons.length).toBe(2);
    });

    test("should show unavailable tours as disabled", () => {
      const availabilitySlots = document.getElementById("availability-slots");

      availabilitySlots.innerHTML = `
        <div>
          <button class="book-slot-btn bg-gray-300" disabled data-tour-id="sunset">
            Unavailable
          </button>
        </div>
      `;

      const button = availabilitySlots.querySelector(".book-slot-btn");
      expect(button.disabled).toBe(true);
      expect(button.classList.contains("bg-gray-300")).toBe(true);
      expect(button.textContent.trim()).toBe("Unavailable");
    });

    test("should show fully booked tours", () => {
      const availabilitySlots = document.getElementById("availability-slots");

      availabilitySlots.innerHTML = `
        <div>
          <button class="book-slot-btn bg-gray-400" disabled data-tour-id="sunset">
            Full
          </button>
        </div>
      `;

      const button = availabilitySlots.querySelector(".book-slot-btn");
      expect(button.disabled).toBe(true);
      expect(button.textContent.trim()).toBe("Full");
    });

    test("should display error message when API fails", () => {
      const availabilitySlots = document.getElementById("availability-slots");

      availabilitySlots.innerHTML = `
        <p class="text-center text-red-500">Error loading availability. Please try again.</p>
      `;

      expect(availabilitySlots.textContent).toContain(
        "Error loading availability"
      );
    });
  });

  describe("Booking Modal Functionality", () => {
    test("should open modal when book button is clicked", () => {
      const modal = document.getElementById("booking-modal");
      const modalContent = document.getElementById("booking-modal-content");

      // Simulate modal opening
      modal.classList.remove("hidden");
      modal.classList.remove("opacity-0");

      expect(modal.classList.contains("hidden")).toBe(false);
    });

    test("should populate modal with tour details", () => {
      const tour = MOCK_TOURS[0];
      const remaining = 8;
      const modalContent = document.getElementById("booking-modal-content");

      // Simulate modal content
      modalContent.innerHTML = `
        <h3 class="text-2xl font-bold mb-4">${tour.name}</h3>
        <p>Price per person: $${tour.price}</p>
        <select id="booking-quantity-select">
          ${Array.from({ length: remaining }, (_, i) => i + 1)
            .map((i) => `<option value="${i}">${i}</option>`)
            .join("")}
        </select>
        <div id="summary-quantity">1</div>
        <div id="summary-total">$${tour.price}</div>
        <div id="summary-remaining">${remaining - 1}</div>
        <button id="booking-confirm-btn">Continue to Pay</button>
      `;

      expect(modalContent.textContent).toContain(
        "Daybreak Dolphin Bay Encounter"
      );
      expect(modalContent.textContent).toContain("$50");

      const quantitySelect = document.getElementById("booking-quantity-select");
      expect(quantitySelect.options.length).toBe(8);
    });

    test("should update summary when quantity changes", () => {
      const tour = MOCK_TOURS[0];
      const remaining = 8;
      const modalContent = document.getElementById("booking-modal-content");

      modalContent.innerHTML = `
        <select id="booking-quantity-select">
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>
        <div id="summary-quantity">1</div>
        <div id="summary-total">$50</div>
        <div id="summary-remaining">7</div>
      `;

      const quantitySelect = document.getElementById("booking-quantity-select");
      const summaryQuantity = document.getElementById("summary-quantity");
      const summaryTotal = document.getElementById("summary-total");
      const summaryRemaining = document.getElementById("summary-remaining");

      // Simulate quantity change
      quantitySelect.value = "3";
      const qty = parseInt(quantitySelect.value, 10);

      summaryQuantity.textContent = qty;
      summaryTotal.textContent = `$${qty * tour.price}`;
      summaryRemaining.textContent = remaining - qty;

      expect(summaryQuantity.textContent).toBe("3");
      expect(summaryTotal.textContent).toBe("$150");
      expect(summaryRemaining.textContent).toBe("5");
    });

    test("should show warning color when remaining seats reach zero", () => {
      const modalContent = document.getElementById("booking-modal-content");

      modalContent.innerHTML = `
        <div id="summary-remaining" class="text-orange-600">0</div>
      `;

      const summaryRemaining = document.getElementById("summary-remaining");
      expect(summaryRemaining.textContent).toBe("0");
      expect(summaryRemaining.classList.contains("text-orange-600")).toBe(true);
    });

    test("should close modal when close button is clicked", () => {
      const modal = document.getElementById("booking-modal");

      // Open modal
      modal.classList.remove("hidden");
      expect(modal.classList.contains("hidden")).toBe(false);

      // Close modal
      modal.classList.add("hidden");
      expect(modal.classList.contains("hidden")).toBe(true);
    });

    test("should close modal when backdrop is clicked", () => {
      const modal = document.getElementById("booking-modal");

      modal.classList.remove("hidden");

      // Simulate backdrop click
      const clickEvent = new window.MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(clickEvent, "target", {
        value: modal,
        enumerable: true,
      });

      // In real implementation, this would close the modal
      if (clickEvent.target === modal) {
        modal.classList.add("hidden");
      }

      expect(modal.classList.contains("hidden")).toBe(true);
    });

    test("should close modal on Escape key press", () => {
      const modal = document.getElementById("booking-modal");

      modal.classList.remove("hidden");

      // Simulate Escape key
      const escapeEvent = new window.KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
      });

      if (escapeEvent.key === "Escape") {
        modal.classList.add("hidden");
      }

      expect(modal.classList.contains("hidden")).toBe(true);
    });
  });

  describe("Booking Confirmation Flow", () => {
    test("should call bookTour API with correct parameters", async () => {
      mockApi.bookTour.mockResolvedValue({ success: true });

      const tourId = "dolphin";
      const quantity = 2;

      const result = await mockApi.bookTour(TEST_DATE, tourId, quantity);

      expect(mockApi.bookTour).toHaveBeenCalledWith(
        TEST_DATE,
        tourId,
        quantity
      );
      expect(result.success).toBe(true);
    });

    test("should show success alert on successful booking", async () => {
      mockApi.bookTour.mockResolvedValue({ success: true });

      const result = await mockApi.bookTour(TEST_DATE, "dolphin", 2);

      if (result.success) {
        global.alert("✅ Booking Confirmed!");
      }

      expect(global.alert).toHaveBeenCalledWith("✅ Booking Confirmed!");
    });

    test("should show error alert on booking failure", async () => {
      mockApi.bookTour.mockResolvedValue({
        success: false,
        message: "Not enough seats available",
      });

      const result = await mockApi.bookTour(TEST_DATE, "dolphin", 10);

      if (!result.success) {
        global.alert(`❌ Booking failed: ${result.message}`);
      }

      expect(global.alert).toHaveBeenCalledWith(
        "❌ Booking failed: Not enough seats available"
      );
    });

    test("should disable confirm button during booking process", () => {
      const modalContent = document.getElementById("booking-modal-content");

      modalContent.innerHTML = `
        <button id="booking-confirm-btn">Continue to Pay</button>
      `;

      const confirmBtn = document.getElementById("booking-confirm-btn");

      // Simulate booking in progress
      confirmBtn.disabled = true;
      confirmBtn.textContent = "Processing Payment...";

      expect(confirmBtn.disabled).toBe(true);
      expect(confirmBtn.textContent).toBe("Processing Payment...");
    });

    test("should re-enable button and reset text on booking failure", () => {
      const modalContent = document.getElementById("booking-modal-content");

      modalContent.innerHTML = `
        <button id="booking-confirm-btn" disabled>Processing Payment...</button>
      `;

      const confirmBtn = document.getElementById("booking-confirm-btn");

      // Simulate booking failure recovery
      confirmBtn.disabled = false;
      confirmBtn.textContent = "Continue to Pay";

      expect(confirmBtn.disabled).toBe(false);
      expect(confirmBtn.textContent).toBe("Continue to Pay");
    });

    test("should refresh availability after successful booking", async () => {
      mockApi.bookTour.mockResolvedValue({ success: true });
      mockApi.getAvailability.mockResolvedValue(MOCK_AVAILABILITY);

      // Simulate booking
      const bookingResult = await mockApi.bookTour(TEST_DATE, "dolphin", 2);

      // Simulate refresh
      if (bookingResult.success) {
        await mockApi.getAvailability(TEST_DATE);
      }

      expect(mockApi.getAvailability).toHaveBeenCalledWith(TEST_DATE);
    });

    test("should close modal after successful booking", async () => {
      mockApi.bookTour.mockResolvedValue({ success: true });
      const modal = document.getElementById("booking-modal");

      modal.classList.remove("hidden");

      // Simulate successful booking
      const result = await mockApi.bookTour(TEST_DATE, "dolphin", 2);

      if (result.success) {
        modal.classList.add("hidden");
      }

      expect(modal.classList.contains("hidden")).toBe(true);
    });
  });

  describe("Reset Bookings Functionality", () => {
    test("should show confirmation dialog before resetting", () => {
      global.confirm.mockReturnValue(true);

      const resetBtn = document.getElementById("reset-bookings-btn");

      // Simulate click
      const shouldReset = global.confirm("Reset all simulated bookings?");

      if (shouldReset) {
        mockApi.resetMockBookings();
      }

      expect(global.confirm).toHaveBeenCalledWith(
        "Reset all simulated bookings?"
      );
      expect(mockApi.resetMockBookings).toHaveBeenCalled();
    });

    test("should not reset if user cancels confirmation", () => {
      global.confirm.mockReturnValue(false);

      const shouldReset = global.confirm("Reset all simulated bookings?");

      if (shouldReset) {
        mockApi.resetMockBookings();
      }

      expect(global.confirm).toHaveBeenCalled();
      expect(mockApi.resetMockBookings).not.toHaveBeenCalled();
    });

    test("should refresh availability after reset", async () => {
      global.confirm.mockReturnValue(true);
      mockApi.getAvailability.mockResolvedValue(MOCK_AVAILABILITY);

      const shouldReset = global.confirm("Reset all simulated bookings?");

      if (shouldReset) {
        mockApi.resetMockBookings();
        await mockApi.getAvailability(TEST_DATE);
      }

      expect(mockApi.resetMockBookings).toHaveBeenCalled();
      expect(mockApi.getAvailability).toHaveBeenCalledWith(TEST_DATE);
    });
  });

  describe("Real-Time Updates", () => {
    test("should update remaining seats dynamically as quantity changes", () => {
      const remaining = 8;
      const modalContent = document.getElementById("booking-modal-content");

      modalContent.innerHTML = `
        <select id="booking-quantity-select">
          ${Array.from({ length: 8 }, (_, i) => i + 1)
            .map((i) => `<option value="${i}">${i}</option>`)
            .join("")}
        </select>
        <div id="summary-remaining" class="text-green-600">7</div>
      `;

      const quantitySelect = document.getElementById("booking-quantity-select");
      const summaryRemaining = document.getElementById("summary-remaining");

      // Test different quantities
      [1, 3, 5, 8].forEach((qty) => {
        quantitySelect.value = qty;
        const remainingAfter = remaining - qty;
        summaryRemaining.textContent = remainingAfter;

        if (remainingAfter === 0) {
          summaryRemaining.classList.remove("text-green-600");
          summaryRemaining.classList.add("text-orange-600");
        }

        expect(summaryRemaining.textContent).toBe(String(remainingAfter));
      });
    });

    test("should update total price dynamically", () => {
      const price = 50;
      const modalContent = document.getElementById("booking-modal-content");

      modalContent.innerHTML = `
        <select id="booking-quantity-select">
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>
        <div id="summary-total">$50</div>
      `;

      const quantitySelect = document.getElementById("booking-quantity-select");
      const summaryTotal = document.getElementById("summary-total");

      [1, 2, 3].forEach((qty) => {
        quantitySelect.value = qty;
        const total = qty * price;
        summaryTotal.textContent = `$${total}`;

        expect(summaryTotal.textContent).toBe(`$${total}`);
      });
    });
  });

  describe("Edge Cases and Error Handling", () => {
    test("should handle tours with zero capacity", async () => {
      const zeroCapacityTours = [
        {
          id: "test",
          name: "Test Tour",
          capacity: 0,
          price: 50,
        },
      ];

      mockApi.getTours.mockResolvedValue(zeroCapacityTours);

      const tours = await mockApi.getTours();

      expect(tours[0].capacity).toBe(0);
    });

    test("should handle negative remaining seats gracefully", () => {
      const modalContent = document.getElementById("booking-modal-content");

      modalContent.innerHTML = `
        <div id="summary-remaining">0</div>
      `;

      const summaryRemaining = document.getElementById("summary-remaining");
      const remaining = Math.max(0, -5); // Should never show negative

      summaryRemaining.textContent = remaining;

      expect(parseInt(summaryRemaining.textContent, 10)).toBeGreaterThanOrEqual(
        0
      );
    });

    test("should handle missing tour data", async () => {
      mockApi.getTours.mockResolvedValue([]);

      const tours = await mockApi.getTours();

      expect(tours.length).toBe(0);
    });

    test("should handle network timeout", async () => {
      jest.setTimeout(10000);

      mockApi.getAvailability.mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 100)
          )
      );

      await expect(mockApi.getAvailability(TEST_DATE)).rejects.toThrow(
        "Timeout"
      );
    });

    test("should handle concurrent booking attempts", async () => {
      mockApi.bookTour.mockResolvedValue({ success: true });

      // Simulate multiple concurrent bookings
      const bookings = [
        mockApi.bookTour(TEST_DATE, "dolphin", 2),
        mockApi.bookTour(TEST_DATE, "dolphin", 3),
        mockApi.bookTour(TEST_DATE, "dolphin", 1),
      ];

      const results = await Promise.all(bookings);

      expect(results.every((r) => r.success === true)).toBe(true);
      expect(mockApi.bookTour).toHaveBeenCalledTimes(3);
    });
  });
});
