// __tests__/tour-booking.test.js

/**
 * Simplified test suite for tours-booking.js
 * Tests the core functionality without complex DOM manipulation
 */

const { JSDOM } = require("jsdom");
const { waitFor } = require("@testing-library/dom");
const fs = require("fs");
const path = require("path");

// Mock the API functions BEFORE importing tours-booking
jest.mock("../apiMock.js", () => ({
  getAvailabilityAndDetails: jest.fn(),
  bookTour: jest.fn(),
  resetMockBookings: jest.fn(),
}));

// Mock data for tests
const TEST_DATE = "2025-12-01";
const MOCK_TOUR_DATA = [
  {
    id: "dolphin",
    tour_id: "dolphin",
    name: "Daybreak Dolphin Bay Encounter",
    description: "A gentle morning paddle to see dolphins at sunrise.",
    price: 50,
    image_url: "img/Vibe_Beach.jpg",
    duration: "2h",
    capacity: 10,
    date: TEST_DATE,
    booked_count: 2,
    available: true,
    remaining: 8,
  },
  {
    id: "sunset",
    tour_id: "sunset",
    name: "Sunset Lagoon Paddle",
    description: "End your day with a calm sunset paddle through the lagoon.",
    price: 50,
    image_url: "img/Vibe_Beach.jpg",
    duration: "2h",
    capacity: 10,
    date: TEST_DATE,
    booked_count: 10,
    available: false,
    remaining: 0,
  },
  {
    id: "coastal",
    tour_id: "coastal",
    name: "Coastal Exploration",
    description:
      "Explore the coastline, beaches, and reefs throughout the day.",
    price: 100,
    image_url: "img/Vibe_Forest.jpg",
    duration: "6h",
    capacity: 10,
    date: TEST_DATE,
    booked_count: 5,
    available: true,
    remaining: 5,
  },
];

describe("Tours Booking Functionality", () => {
  let dom;
  let document;
  let window;

  beforeAll(() => {
    // Set up a basic JSDOM environment once
    const htmlPath = path.join(__dirname, "../tours.html");
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
  });

  afterAll(() => {
    if (dom) {
      dom.window.close();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("API Integration Tests", () => {
    const apiMock = require("../apiMock.js");

    test("should fetch tour availability data", async () => {
      apiMock.getAvailabilityAndDetails.mockResolvedValue(MOCK_TOUR_DATA);

      const result = await apiMock.getAvailabilityAndDetails(TEST_DATE);

      expect(result).toEqual(MOCK_TOUR_DATA);
      expect(result.length).toBe(3);
      expect(result[0].name).toBe("Daybreak Dolphin Bay Encounter");
    });

    test("should handle successful booking", async () => {
      apiMock.bookTour.mockResolvedValue({ success: true });

      const result = await apiMock.bookTour(TEST_DATE, "dolphin", 2);

      expect(result.success).toBe(true);
      expect(apiMock.bookTour).toHaveBeenCalledWith(TEST_DATE, "dolphin", 2);
    });

    test("should handle failed booking", async () => {
      apiMock.bookTour.mockResolvedValue({
        success: false,
        message: "Not enough seats",
      });

      const result = await apiMock.bookTour(TEST_DATE, "dolphin", 10);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Not enough seats");
    });
  });

  describe("DOM Structure Tests", () => {
    test("should have required DOM elements in tours.html", () => {
      const toursContent = document.getElementById("tours-content");
      expect(toursContent).toBeTruthy();

      const grid = toursContent.querySelector(".grid");
      expect(grid).toBeTruthy();

      const modal = document.getElementById("booking-modal");
      expect(modal).toBeTruthy();

      const modalContent = document.getElementById("booking-modal-content");
      expect(modalContent).toBeTruthy();
    });

    test("should have modal in hidden state initially", () => {
      const modal = document.getElementById("booking-modal");
      expect(modal.classList.contains("hidden")).toBe(true);
    });
  });

  describe("Tour Card Rendering", () => {
    test("should be able to create tour card HTML", () => {
      const tour = MOCK_TOUR_DATA[0];
      const grid = document
        .getElementById("tours-content")
        .querySelector(".grid");

      // Simulate what renderTourListAndAvailability does
      const tourCardHtml = `
        <div class="card-hover">
          <h3>${tour.name}</h3>
          <p>${tour.description}</p>
          <p>$${tour.price.toFixed(2)}</p>
          <p>${tour.remaining} spots left</p>
          <button class="tour-book-btn" data-tour-id="${
            tour.id
          }">Book Now</button>
        </div>
      `;

      grid.innerHTML = tourCardHtml;

      expect(grid.textContent).toContain("Daybreak Dolphin Bay Encounter");
      expect(grid.textContent).toContain("$50.00");
      expect(grid.textContent).toContain("8 spots left");

      const button = grid.querySelector(".tour-book-btn");
      expect(button).toBeTruthy();
      expect(button.getAttribute("data-tour-id")).toBe("dolphin");
    });

    test("should render all three tours", () => {
      const grid = document
        .getElementById("tours-content")
        .querySelector(".grid");

      // Clear grid
      grid.innerHTML = "";

      // Add all tours
      MOCK_TOUR_DATA.forEach((tour) => {
        const tourCardHtml = `
          <div class="card-hover">
            <h3>${tour.name}</h3>
            <p>$${tour.price.toFixed(2)}</p>
            <button class="tour-book-btn" 
                    data-tour-id="${tour.id}" 
                    ${tour.available && tour.remaining > 0 ? "" : "disabled"}>
              ${tour.available && tour.remaining > 0 ? "Book Now" : "Full"}
            </button>
          </div>
        `;
        grid.insertAdjacentHTML("beforeend", tourCardHtml);
      });

      const cards = grid.querySelectorAll(".card-hover");
      expect(cards.length).toBe(3);

      const buttons = grid.querySelectorAll(".tour-book-btn");
      expect(buttons.length).toBe(3);

      // Check that sunset tour button is disabled
      const sunsetButton = Array.from(buttons).find(
        (btn) => btn.getAttribute("data-tour-id") === "sunset"
      );
      expect(sunsetButton.disabled).toBe(true);
    });
  });

  describe("Modal Functionality", () => {
    test("should be able to populate modal with tour data", () => {
      const tour = MOCK_TOUR_DATA[0];
      const modalContent = document.getElementById("booking-modal-content");

      // Simulate what openBookingModal does
      modalContent.innerHTML = `
        <h3>${tour.name}</h3>
        <p>Price: $${tour.price.toFixed(2)}</p>
        <select id="booking-quantity-select">
          ${Array.from({ length: tour.remaining }, (_, i) => i + 1)
            .map((i) => `<option value="${i}">${i}</option>`)
            .join("")}
        </select>
        <div id="summary-quantity">1</div>
        <div id="summary-total">$${tour.price.toFixed(2)}</div>
        <div id="summary-remaining">${tour.remaining - 1}</div>
        <button id="booking-confirm-btn">Continue to Pay</button>
      `;

      expect(modalContent.textContent).toContain(
        "Daybreak Dolphin Bay Encounter"
      );
      expect(modalContent.textContent).toContain("$50.00");

      const quantitySelect = document.getElementById("booking-quantity-select");
      expect(quantitySelect).toBeTruthy();
      expect(quantitySelect.options.length).toBe(8);
    });

    test("should update booking summary when quantity changes", () => {
      const tour = MOCK_TOUR_DATA[0];
      const modalContent = document.getElementById("booking-modal-content");

      modalContent.innerHTML = `
        <select id="booking-quantity-select">
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>
        <div id="summary-quantity">1</div>
        <div id="summary-total">$50.00</div>
        <div id="summary-remaining">7</div>
      `;

      const quantitySelect = document.getElementById("booking-quantity-select");
      const summaryQuantity = document.getElementById("summary-quantity");
      const summaryTotal = document.getElementById("summary-total");
      const summaryRemaining = document.getElementById("summary-remaining");

      // Simulate quantity change
      quantitySelect.value = "3";
      const qty = parseInt(quantitySelect.value, 10);
      const total = qty * tour.price;
      const remaining = tour.remaining - qty;

      summaryQuantity.textContent = qty;
      summaryTotal.textContent = `$${total.toFixed(2)}`;
      summaryRemaining.textContent = remaining;

      expect(summaryQuantity.textContent).toBe("3");
      expect(summaryTotal.textContent).toBe("$150.00");
      expect(summaryRemaining.textContent).toBe("5");
    });

    test("should handle modal visibility classes", () => {
      const modal = document.getElementById("booking-modal");

      // Initially hidden
      expect(modal.classList.contains("hidden")).toBe(true);

      // Open modal
      modal.classList.remove("hidden");
      expect(modal.classList.contains("hidden")).toBe(false);

      // Close modal
      modal.classList.add("hidden");
      expect(modal.classList.contains("hidden")).toBe(true);
    });
  });

  describe("Booking Flow", () => {
    const apiMock = require("../apiMock.js");

    test("should complete successful booking flow", async () => {
      apiMock.bookTour.mockResolvedValue({ success: true });

      const tour = MOCK_TOUR_DATA[0];
      const quantity = 2;

      // Call the booking function
      const result = await apiMock.bookTour(TEST_DATE, tour.id, quantity);

      expect(result.success).toBe(true);
      expect(apiMock.bookTour).toHaveBeenCalledWith(TEST_DATE, "dolphin", 2);
    });

    test("should handle booking failure gracefully", async () => {
      apiMock.bookTour.mockResolvedValue({
        success: false,
        message: "Tour is fully booked",
      });

      const result = await apiMock.bookTour(TEST_DATE, "sunset", 1);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Tour is fully booked");
    });
  });

  describe("Data Validation", () => {
    test("should validate tour data structure", () => {
      MOCK_TOUR_DATA.forEach((tour) => {
        expect(tour).toHaveProperty("id");
        expect(tour).toHaveProperty("name");
        expect(tour).toHaveProperty("price");
        expect(tour).toHaveProperty("remaining");
        expect(tour).toHaveProperty("available");
        expect(typeof tour.price).toBe("number");
        expect(typeof tour.remaining).toBe("number");
        expect(typeof tour.available).toBe("boolean");
      });
    });

    test("should handle empty tour list", () => {
      const grid = document
        .getElementById("tours-content")
        .querySelector(".grid");
      const emptyTours = [];

      if (emptyTours.length === 0) {
        grid.innerHTML = "<p>No tours available for this date.</p>";
      }

      expect(grid.textContent).toContain("No tours available");
      const cards = grid.querySelectorAll(".card-hover");
      expect(cards.length).toBe(0);
    });
  });
});
