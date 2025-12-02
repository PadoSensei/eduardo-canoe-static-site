// --- tours-booking.js ---

// Import API functions. We are now using getAvailabilityAndDetails for fetching
// both tour information and its availability status.
import {
  getAvailabilityAndDetails,
  bookTour,
  resetMockBookings,
} from "./api.js";

// --- GLOBAL CONFIGURATION ---
const API_BASE_URL = "http://localhost:8000/api/v1"; // Your backend base URL

// --- DOM Element Cache ---
// Cache frequently used DOM elements. These will be initialized when initializePage is called.
let toursGrid = null;
let modal = null;
let modalContent = null;
let modalClose = null;
let mobileMenuButton = null;
let mobileMenu = null;
// Note: datePicker, availabilitySlotsDiv, resetBookingsBtn are NOT in tours.html
// If you need them on this page, they must be added to tours.html.

// --- State ---
let toursData = []; // Will store data fetched from the API (combining details and availability)
let selectedDate = null; // Stores the currently displayed/selected date

// --- Utility Functions (NOW EXPORTABLE for testing) ---

/**
 * Opens the booking modal with the selected tour's details and availability.
 * @param {object} tour - The tour object fetched from the API.
 * @param {string} date - The selected date for booking.
 * @param {number} remaining - The number of remaining spots for the tour on that date.
 */
export function openBookingModal(tour, date, remaining) {
  const formattedDate = new Date(date).toLocaleDateString();

  // --- Build Modal HTML dynamically ---
  modalContent.innerHTML = `
    <button
      id="booking-modal-close-btn"
      class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 font-bold text-xl focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
      aria-label="Close booking modal"
    >
      &times;
    </button>
    
    <h3 class="text-2xl font-bold mb-4 text-gray-800">${tour.name}</h3>
    
    <div class="space-y-3 mb-6">
      <p class="text-gray-600">
        <span class="font-semibold">Date:</span> ${formattedDate}
      </p>
      <p class="text-gray-600">
        <span class="font-semibold">Price per person:</span> $${tour.price.toFixed(
          2
        )}
      </p>
    </div>

    <div class="mb-6">
      <label for="booking-quantity-select" class="block font-semibold mb-2 text-gray-700">
        Select Quantity:
      </label>
      <select
        id="booking-quantity-select"
        class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
        aria-label="Select quantity to book"
      >
        ${Array.from({ length: remaining }, (_, i) => i + 1)
          .map((i) => `<option value="${i}">${i}</option>`)
          .join("")}
      </select>
    </div>

    <!-- DYNAMIC SUMMARY SECTION -->
    <div class="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
      <h4 class="font-bold text-lg mb-3 text-gray-800">Booking Summary</h4>
      
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-600">Quantity:</span>
          <span id="summary-quantity" class="font-semibold">1</span>
        </div>
        
        <div class="flex justify-between">
          <span class="text-gray-600">Price per person:</span>
          <span class="font-semibold">$${tour.price.toFixed(2)}</span>
        </div>
        
        <div class="flex justify-between pt-2 border-t border-gray-300">
          <span class="text-gray-700 font-semibold">Total:</span>
          <span id="summary-total" class="font-bold text-lg text-[#FF6B6B]">$${tour.price.toFixed(
            2
          )}</span>
        </div>
        
        <div class="flex justify-between pt-2">
          <span class="text-gray-600">Remaining seats after booking:</span>
          <span id="summary-remaining" class="font-semibold text-green-600">${Math.max(
            0,
            remaining - 1
          )}</span>
        </div>
      </div>
    </div>

    <button
      id="booking-confirm-btn"
      class="bg-[#FF6B6B] hover:bg-[#FF5252] text-white font-bold py-3 px-6 rounded-lg w-full transition-all duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400"
    >
      Continue to Pay
    </button>
    
    <p class="text-center text-sm text-gray-500 mt-4">
      Want to book a different date? <a href="book.html" class="text-[#FF6B6B] hover:underline">Visit our booking page</a>
    </p>
  `;

  // --- Re-attach event listeners for modal interactions ---
  const modalCloseBtn = document.getElementById("booking-modal-close-btn");
  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);

  const quantitySelect = document.getElementById("booking-quantity-select");
  const summaryQuantity = document.getElementById("summary-quantity");
  const summaryTotal = document.getElementById("summary-total");
  const summaryRemaining = document.getElementById("summary-remaining");
  const confirmBtn = document.getElementById("booking-confirm-btn");

  // Real-time update handler for quantity change
  function updateSummary() {
    const qty = parseInt(quantitySelect.value, 10);
    const total = qty * tour.price;
    const remainingAfter = remaining - qty;

    summaryQuantity.textContent = qty;
    summaryTotal.textContent = `$${total.toFixed(2)}`;
    summaryRemaining.textContent = Math.max(0, remainingAfter); // Ensure non-negative

    // Update remaining color based on availability
    if (remainingAfter === 0) {
      summaryRemaining.classList.remove("text-green-600");
      summaryRemaining.classList.add("text-orange-600");
    } else {
      summaryRemaining.classList.remove("text-orange-600");
      summaryRemaining.classList.add("text-green-600");
    }
  }
  if (quantitySelect) quantitySelect.addEventListener("change", updateSummary);

  // Confirm button handler for booking
  confirmBtn.addEventListener("click", async () => {
    const qty = parseInt(quantitySelect.value, 10);

    confirmBtn.disabled = true;
    confirmBtn.textContent = "Processing...";

    const result = await bookTour(date, tour.id, qty);

    if (result.success) {
      alert(
        `✅ Booking Confirmed!\n\nTour: ${
          tour.name
        }\nDate: ${formattedDate}\nQuantity: ${qty}\nTotal: $${(
          qty * tour.price
        ).toFixed(2)}\n\nPayment details will be provided shortly.`
      );
      closeModal();
      // Refresh the tour list to reflect the new availability after booking
      await renderTourListAndAvailability(date);
    } else {
      alert(`❌ Booking failed: ${result.message}`);
      confirmBtn.disabled = false; // Re-enable button
      confirmBtn.textContent = "Continue to Pay";
    }
  });

  // Open modal with animation
  modal.classList.remove("hidden");
  requestAnimationFrame(() => {
    modal.classList.remove("opacity-0");
    modalContent.classList.remove("scale-90");
  });
}

/**
 * Closes the booking modal with animation.
 */
export function closeModal() {
  // EXPORTED
  if (!modal) return; // Exit if modal element not found
  modal.classList.add("opacity-0");
  modalContent.classList.add("scale-90");
  setTimeout(() => modal.classList.add("hidden"), 200); // Match CSS transition duration
}

/**
 * Attaches event listeners to all "Book Now" buttons within the tour listing.
 */
export function addBookButtonEventListeners() {
  // EXPORTED
  const bookButtons = document.querySelectorAll(".tour-book-btn");
  console.log(`[Tours Page] Found ${bookButtons.length} booking buttons.`);

  bookButtons.forEach((btn) => {
    // Remove existing listeners first if the function is called multiple times (e.g., after re-rendering)
    btn.removeEventListener("click", handleBookButtonClick);
    btn.addEventListener("click", handleBookButtonClick);
  });
}

/**
 * Handles the click event for "Book Now" buttons, preparing modal data.
 * @param {Event} event - The click event object.
 */
// It's good practice to export functions that are called by event listeners attached in exported functions.
export async function handleBookButtonClick(event) {
  // EXPORTED
  const button = event.currentTarget;
  const tourId = button.getAttribute("data-tour-id");
  const date = button.getAttribute("data-date");
  const remaining = parseInt(button.getAttribute("data-remaining"), 10);

  console.log("[Tours Page] Book button clicked:", { tourId, date, remaining });

  if (!tourId || !date || isNaN(remaining)) {
    console.error("[Tours Page] Missing data on book button:", {
      tourId,
      date,
      remaining,
    });
    alert(
      "Error: Missing booking information. Please try selecting a tour again."
    );
    return;
  }

  // Find the full tour object from our fetched data
  const tour = toursData.find((t) => t.id === tourId);
  if (!tour) {
    console.error(
      "[Tours Page] Tour details not found in fetched data for ID:",
      tourId
    );
    alert("Error: Tour details not found. Please refresh the page.");
    await renderTourListAndAvailability(date);
    return;
  }

  // Double-check availability (though buttons should be disabled if unavailable)
  if (remaining <= 0 || !tour.available) {
    alert("This tour is no longer available or has reached full capacity.");
    await renderTourListAndAvailability(date);
    return;
  }

  openBookingModal(tour, date, remaining);
}

/**
 * Renders the list of tours and their availability for a given date.
 * Dynamically creates HTML elements based on fetched API data.
 * @param {string} dateString - The date (YYYY-MM-DD) to fetch availability for.
 */
export async function renderTourListAndAvailability(dateString) {
  // EXPORTED
  console.log(
    `[Tours Page] Rendering tours and availability for ${dateString}...`
  );

  if (!toursGrid) {
    console.error(
      "[Tours Page] Tour grid element is not available. Cannot render tours."
    );
    return;
  }

  // --- Display Loading State ---
  toursGrid.innerHTML = `
    <div class="col-span-full flex justify-center items-center py-20">
      <svg class="animate-spin h-10 w-10 text-[#FF6B6B]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
      <span class="ml-4 text-gray-500 font-medium">Loading tours...</span>
    </div>
  `;

  try {
    // --- Fetch Tour Details AND Availability ---
    const tourData = await getAvailabilityAndDetails(dateString);
    toursData = tourData; // Store fetched data for modal access

    console.log(
      `[Tours Page] Fetched ${toursData.length} tours for ${dateString}:`,
      toursData
    );

    toursGrid.innerHTML = ""; // Clear loading state

    // --- Handle No Tours Found ---
    if (toursData.length === 0) {
      toursGrid.innerHTML =
        '<p class="col-span-full text-center text-gray-500 py-10">No tours available for this date. Please select another date.</p>';
      return;
    }

    // --- Dynamically Render Each Tour Card ---
    toursData.forEach((tour) => {
      // Constructing tour card HTML
      const tourCardHtml = `
        <div
          class="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl shadow-lg overflow-hidden card-hover flex flex-col lg:flex-row"
        >
          <div class="lg:w-1/2">
            <img
              src="${tour.image_url}"
              alt="${tour.name}"
              class="w-full h-64 lg:h-full object-cover"
            />
          </div>
          <div class="lg:w-1/2 p-8">
            <div class="flex justify-center mb-6 lg:justify-start" aria-hidden="true">
              <svg class="h-16 w-16 text-[#FF6B6B]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            </div>
            <h3 class="text-2xl font-bold mb-4 text-gray-800">${tour.name}</h3>
            <p class="text-gray-700 leading-relaxed mb-6">${
              tour.description
            }</p>
            <div class="mb-6">
              <p class="text-sm text-gray-600 mb-2"><strong>Duration:</strong> ${
                tour.duration
              }</p>
              <p class="text-sm text-gray-600 mb-2"><strong>Price per person:</strong> $${tour.price.toFixed(
                2
              )}</p>
              <p class="text-sm text-gray-600"><strong>Availability:</strong> ${
                tour.available
                  ? tour.remaining > 0
                    ? `${tour.remaining} spots left`
                    : "Fully Booked"
                  : "Unavailable"
              }</p>
            </div>
            <button
              data-tour-id="${tour.id}"
              data-date="${dateString}"
              data-remaining="${tour.remaining}"
              class="tour-book-btn px-6 py-3 rounded-lg font-bold text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] transition-all duration-200 
                ${
                  tour.available && tour.remaining > 0
                    ? "bg-[#FF6B6B] hover:bg-[#FF5252]"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }
              "
              ${tour.available && tour.remaining > 0 ? "" : "disabled"}
            >
              ${
                tour.available && tour.remaining > 0
                  ? "Book Now"
                  : tour.remaining === 0
                  ? "Full"
                  : "Unavailable"
              }
            </button>
          </div>
        </div>
      `;
      toursGrid.insertAdjacentHTML("beforeend", tourCardHtml);
    });

    addBookButtonEventListeners();
  } catch (error) {
    console.error("[Tours Page] Error loading tours:", error);
    toursGrid.innerHTML = `
      <p class="col-span-full text-center text-red-500 py-10">
        Failed to load tours. Please check your connection or try again later. 
        <br>Error: ${error.message}
      </p>
    `;
  }
}

/**
 * Initializes the page, sets up DOM elements and event listeners.
 * This function is exported to be callable by tests.
 */
export function initializePage() {
  // EXPORTED
  console.log("[Tours Page] Initializing page...");

  // --- Get DOM Elements ---
  toursGrid = document.getElementById("tours-content")?.querySelector(".grid");
  modal = document.getElementById("booking-modal");
  modalContent = document.getElementById("booking-modal-content");
  modalClose = document.getElementById("booking-modal-close");
  mobileMenuButton = document.getElementById("mobile-menu-button");
  mobileMenu = document.getElementById("mobile-menu");

  // --- Basic Element Checks ---
  if (!toursGrid) {
    console.error(
      "[Tours Page] Tour grid element (#tours-content .grid) not found. Cannot render tours."
    );
    return;
  }
  if (!modal || !modalContent || !modalClose) {
    console.warn(
      "[Tours Page] Booking modal elements missing. Booking functionality will be impaired."
    );
  }

  // --- Setup Mobile Menu Toggle ---
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
      console.log("[Tours Page] Mobile menu toggled.");
    });
  } else {
    console.warn("[Tours Page] Mobile menu elements missing.");
  }

  // --- Date Selection Handling ---
  const datePicker = document.getElementById("availability-date");

  const today = new Date();
  selectedDate = today.toISOString().split("T")[0];

  if (datePicker) {
    datePicker.value = selectedDate;
    datePicker.addEventListener("change", async (e) => {
      selectedDate = e.target.value;
      console.log("[Tours Page] Date changed to:", selectedDate);
      await renderTourListAndAvailability(selectedDate);
    });
  } else {
    console.log(
      "[Tours Page] Date picker element (#availability-date) not found. Using today's date for initial load."
    );
  }

  // Initial Render is handled by the caller (DOMContentLoaded or tests)
  // If called directly (like in tests), we ensure render is called.
  if (selectedDate) {
    // This call might be redundant if DOMContentLoaded also calls it,
    // but ensures it runs in test environments where DOMContentLoaded might not fire naturally.
    // However, in tests, we'll call renderTourListAndAvailability directly after initializePage is done.
    // So, this might be removed to avoid double rendering if initializePage is called multiple times.
    // For now, let's rely on the test's beforeEach calling renderTourListAndAvailability after initializePage.
    // await renderTourListAndAvailability(selectedDate);
  }
}

// --- Modal Close Event Listeners Setup ---
// This is a helper function for setup, doesn't need to be exported unless tests target it directly.
function setupModalEventListeners() {
  const modalCloseBtn = document.getElementById("booking-modal-close-btn");
  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal?.classList.contains("hidden")) {
      closeModal();
    }
  });
}

// --- Reset Mock Data Button Listener (for development) ---
function setupResetButtonListener() {
  const resetBookingsBtn = document.getElementById("reset-bookings-btn");
  if (resetBookingsBtn) {
    resetBookingsBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to reset all simulated bookings?")) {
        console.log("[Tours Page] Resetting mock bookings...");
        resetMockBookings();
        if (selectedDate) {
          renderTourListAndAvailability(selectedDate);
        }
      }
    });
  }
}

// --- Document Ready Listener ---
// This runs when the DOM is fully loaded in the browser.
document.addEventListener("DOMContentLoaded", async () => {
  await initializePage(); // Call the exported initializePage function
  setupModalEventListeners();
  // setupResetButtonListener();
});

// --- Exports for Testing ---
// Explicitly export all functions that tests will interact with.
// export { openBookingModal, closeModal };
