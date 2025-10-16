// booking.js - REFACTORED VERSION WITH SINGLE DYNAMIC MODAL
import {
  getTours,
  getAvailability,
  bookTour,
  resetMockBookings,
} from "./apiMock.js";

document.addEventListener("DOMContentLoaded", async () => {
  console.log("[Booking] DOM loaded");

  // --- Mobile Menu Toggle ---
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
      console.log("[Booking] Mobile menu toggled");
    });
  } else {
    console.warn("[Booking] Mobile menu elements missing");
  }

  // --- DOM Elements ---
  const datePicker = document.getElementById("availability-date");
  const availabilitySlotsDiv = document.getElementById("availability-slots");
  const resetBookingsBtn = document.getElementById("reset-bookings-btn");

  // Modal Elements
  const modal = document.getElementById("booking-modal");
  const modalContent = document.getElementById("booking-modal-content");
  const modalClose = document.getElementById("booking-modal-close");

  if (!datePicker || !availabilitySlotsDiv) {
    console.error("[Booking] Required DOM elements missing", {
      datePicker,
      availabilitySlotsDiv,
    });
    return;
  }

  // --- State ---
  let tours = [];
  let selectedDate = null;

  // --- Initialization ---
  async function init() {
    try {
      console.log("[Booking] Fetching tours...");
      tours = await getTours();
      console.log("[Booking] Tours fetched:", tours);

      const today = new Date();
      const defaultDateString = today.toISOString().split("T")[0];
      datePicker.value = defaultDateString;
      selectedDate = defaultDateString;

      console.log("[Booking] Rendering availability for date:", selectedDate);
      await renderAvailabilityForDate(selectedDate);
    } catch (err) {
      console.error("[Booking] Initialization failed:", err);
    }
  }

  // --- Render Availability with Spinner ---
  async function renderAvailabilityForDate(dateString) {
    console.log("[Booking] Showing spinner for", dateString);
    availabilitySlotsDiv.innerHTML = `
      <div class="flex justify-center items-center py-20">
        <svg class="animate-spin h-10 w-10 text-[#FF6B6B]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        <span class="ml-4 text-gray-500 font-medium">Checking availability...</span>
      </div>
    `;

    try {
      console.log("[Booking] Fetching availability...");
      const availability = await getAvailability(dateString);
      console.log("[Booking] Availability fetched:", availability);

      const formattedDate = new Date(dateString).toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      let html = `<div class="opacity-0 transition-opacity duration-500">
        <h3 class="text-2xl font-bold text-center mb-6 text-gray-800">Bookings for ${formattedDate}</h3>`;

      if (!tours.length) {
        html += '<p class="text-center text-gray-500">No tours available.</p>';
        console.warn("[Booking] No tours available");
      } else {
        html += '<div class="space-y-4">';
        for (const tour of tours) {
          const a = availability.find((av) => av.tour_id === tour.id);
          const isAvailable = a?.available ?? false;
          const remaining = a?.remaining ?? 0;

          let buttonClass, buttonText, disabled;

          if (!isAvailable) {
            buttonClass = "bg-gray-300 text-gray-600 cursor-not-allowed";
            buttonText = "Unavailable";
            disabled = "disabled";
          } else if (remaining <= 0) {
            buttonClass = "bg-gray-400 cursor-not-allowed";
            buttonText = "Full";
            disabled = "disabled";
          } else {
            buttonClass = "bg-[#FF6B6B] hover:bg-[#FF5252]";
            buttonText = `Book (${remaining} left)`;
            disabled = "";
          }

          html += `
            <div class="flex flex-col sm:flex-row justify-between items-center p-4 border border-gray-200 rounded-lg">
              <div class="text-left">
                <h4 class="font-semibold text-lg">${tour.name}</h4>
                <p class="text-sm text-gray-600">${tour.description}</p>
                <p class="text-sm text-gray-500 mt-1">Duration: ${tour.duration} • $${tour.price} • Capacity: ${tour.capacity}</p>
              </div>
              <button
                data-tour-id="${tour.id}"
                data-date="${dateString}"
                class="book-slot-btn px-6 py-3 rounded-lg font-bold text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] transition-all duration-200 ${buttonClass}"
                ${disabled}
              >
                ${buttonText}
              </button>
            </div>
          `;
        }
        html += "</div>";
      }

      html += "</div>"; // fade-in wrapper

      availabilitySlotsDiv.innerHTML = html;

      // Trigger fade-in
      setTimeout(() => {
        const fadeDiv = availabilitySlotsDiv.querySelector("div.opacity-0");
        if (fadeDiv) fadeDiv.classList.remove("opacity-0");
      }, 50);

      // Add event listeners for booking buttons
      const buttons = document.querySelectorAll(".book-slot-btn");
      console.log(
        "[Booking] Adding event listeners to",
        buttons.length,
        "buttons"
      );
      buttons.forEach((btn) =>
        btn.addEventListener("click", handleBookingClick)
      );
    } catch (error) {
      console.error("[Booking] Error loading availability:", error);
      availabilitySlotsDiv.innerHTML = `<p class="text-center text-red-500">Error loading availability. Please try again.</p>`;
    }
  }

  // --- Handle Booking Click ---
  async function handleBookingClick(event) {
    const button = event.currentTarget;
    const tourId = button.getAttribute("data-tour-id");
    const date = button.getAttribute("data-date");

    console.log("[Booking] Booking click:", { tourId, date });

    if (!tourId || !date) return;

    const tour = tours.find((t) => t.id === tourId);
    if (!tour) return;

    const availability = await getAvailability(date);
    const tourAvailability = availability.find((a) => a.tour_id === tourId);

    if (!tourAvailability || !tourAvailability.available) {
      alert("This tour is no longer available.");
      return;
    }

    openBookingModal(tour, date, tourAvailability.remaining);
  }

  // --- Open Dynamic Booking Modal (Single Screen with Real-Time Updates) ---
  function openBookingModal(tour, date, remaining) {
    const formattedDate = new Date(date).toLocaleDateString();

    // Build modal HTML with dynamic updating
    modalContent.innerHTML = `
      <button
        id="booking-modal-close-btn"
        class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 font-bold text-xl"
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
          <span class="font-semibold">Price per person:</span> $${tour.price}
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
            <span class="font-semibold">$${tour.price}</span>
          </div>
          
          <div class="flex justify-between pt-2 border-t border-gray-300">
            <span class="text-gray-700 font-semibold">Total:</span>
            <span id="summary-total" class="font-bold text-lg text-[#FF6B6B]">$${
              tour.price
            }</span>
          </div>
          
          <div class="flex justify-between pt-2">
            <span class="text-gray-600">Remaining seats after booking:</span>
            <span id="summary-remaining" class="font-semibold text-green-600">${
              remaining - 1
            }</span>
          </div>
        </div>
      </div>

      <button
        id="booking-confirm-btn"
        class="bg-[#FF6B6B] hover:bg-[#FF5252] text-white font-bold py-3 px-6 rounded-lg w-full transition-all duration-200 shadow-lg"
      >
        Continue to Pay
      </button>
    `;

    // Re-attach close listener
    const closeBtn = document.getElementById("booking-modal-close-btn");
    closeBtn.addEventListener("click", closeModal);

    // Get dynamic elements
    const quantitySelect = document.getElementById("booking-quantity-select");
    const summaryQuantity = document.getElementById("summary-quantity");
    const summaryTotal = document.getElementById("summary-total");
    const summaryRemaining = document.getElementById("summary-remaining");
    const confirmBtn = document.getElementById("booking-confirm-btn");

    // Real-time update handler
    function updateSummary() {
      const qty = parseInt(quantitySelect.value, 10);
      const total = qty * tour.price;
      const remainingAfter = remaining - qty;

      summaryQuantity.textContent = qty;
      summaryTotal.textContent = `$${total}`;
      summaryRemaining.textContent = remainingAfter;

      // Update remaining color based on availability
      if (remainingAfter === 0) {
        summaryRemaining.classList.remove("text-green-600");
        summaryRemaining.classList.add("text-orange-600");
      } else {
        summaryRemaining.classList.remove("text-orange-600");
        summaryRemaining.classList.add("text-green-600");
      }
    }

    // Listen for quantity changes
    quantitySelect.addEventListener("change", updateSummary);

    // Confirm button handler
    confirmBtn.addEventListener("click", async () => {
      const qty = parseInt(quantitySelect.value, 10);

      confirmBtn.disabled = true;
      confirmBtn.textContent = "Processing Payment...";

      const result = await bookTour(date, tour.id, qty);

      if (result.success) {
        const remainingAfter = remaining - qty;
        alert(
          `✅ Booking Confirmed!\n\nTour: ${
            tour.name
          }\nDate: ${formattedDate}\nQuantity: ${qty}\nTotal: $${
            qty * tour.price
          }\n\nRemaining seats: ${remainingAfter}`
        );
        closeModal();
        await renderAvailabilityForDate(date);
      } else {
        alert(`❌ Booking failed: ${result.message}`);
        confirmBtn.disabled = false;
        confirmBtn.textContent = "Continue to Pay";
      }
    });

    // Open modal with animation
    modal.classList.remove("hidden");
    setTimeout(() => {
      modal.classList.remove("opacity-0");
      modalContent.classList.remove("scale-90");
    }, 10);
  }

  // --- Modal Close ---
  function closeModal() {
    modal.classList.add("opacity-0");
    modalContent.classList.add("scale-90");
    setTimeout(() => modal.classList.add("hidden"), 200);
  }

  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });

  // --- Reset Mock Data ---
  if (resetBookingsBtn) {
    resetBookingsBtn.addEventListener("click", () => {
      if (confirm("Reset all simulated bookings?")) {
        console.log("[Booking] Resetting mock bookings...");
        resetMockBookings();
        renderAvailabilityForDate(selectedDate);
      }
    });
  }

  // --- Listen for Date Change ---
  datePicker.addEventListener("change", async (e) => {
    selectedDate = e.target.value;
    console.log("[Booking] Date changed to:", selectedDate);
    await renderAvailabilityForDate(selectedDate);
  });

  // --- Start ---
  init();
});
