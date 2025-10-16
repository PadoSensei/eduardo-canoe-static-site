// tours-booking.js - Booking integration for tours page
import { getTours, getAvailability, bookTour } from "./apiMock.js";

document.addEventListener("DOMContentLoaded", async () => {
  console.log("[Tours] Booking integration loaded");

  // Modal Elements
  const modal = document.getElementById("booking-modal");
  const modalContent = document.getElementById("booking-modal-content");
  const modalClose = document.getElementById("booking-modal-close");

  if (!modal || !modalContent) {
    console.error("[Tours] Booking modal elements missing");
    return;
  }

  // State
  let tours = [];

  // Load tours data
  try {
    tours = await getTours();
    console.log("[Tours] Tours loaded:", tours);
  } catch (err) {
    console.error("[Tours] Failed to load tours:", err);
  }

  // Get today's date as default
  const today = new Date();
  const defaultDateString = today.toISOString().split("T")[0];

  // Add event listeners to all "Book Now" buttons
  const bookButtons = document.querySelectorAll(".tour-book-btn");
  console.log("[Tours] Found", bookButtons.length, "booking buttons");

  bookButtons.forEach((btn) => {
    btn.addEventListener("click", async (event) => {
      const tourId = event.currentTarget.getAttribute("data-tour-id");
      console.log("[Tours] Book button clicked for tour:", tourId);

      const tour = tours.find((t) => t.id === tourId);
      if (!tour) {
        console.error("[Tours] Tour not found:", tourId);
        alert("Tour not found. Please try again.");
        return;
      }

      // Get availability for today
      const availability = await getAvailability(defaultDateString);
      const tourAvailability = availability.find((a) => a.tour_id === tourId);

      if (
        !tourAvailability ||
        !tourAvailability.available ||
        tourAvailability.remaining <= 0
      ) {
        alert(
          "This tour is currently unavailable. Please visit our booking page to check other dates."
        );
        return;
      }

      openBookingModal(tour, defaultDateString, tourAvailability.remaining);
    });
  });

  // Open Dynamic Booking Modal
  function openBookingModal(tour, date, remaining) {
    const formattedDate = new Date(date).toLocaleDateString();

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
      
      <p class="text-center text-sm text-gray-500 mt-4">
        Want to book a different date? <a href="book.html" class="text-[#FF6B6B] hover:underline">Visit our booking page</a>
      </p>
    `;

    const closeBtn = document.getElementById("booking-modal-close-btn");
    closeBtn.addEventListener("click", closeModal);

    const quantitySelect = document.getElementById("booking-quantity-select");
    const summaryQuantity = document.getElementById("summary-quantity");
    const summaryTotal = document.getElementById("summary-total");
    const summaryRemaining = document.getElementById("summary-remaining");
    const confirmBtn = document.getElementById("booking-confirm-btn");

    function updateSummary() {
      const qty = parseInt(quantitySelect.value, 10);
      const total = qty * tour.price;
      const remainingAfter = remaining - qty;

      summaryQuantity.textContent = qty;
      summaryTotal.textContent = `$${total}`;
      summaryRemaining.textContent = remainingAfter;

      if (remainingAfter === 0) {
        summaryRemaining.classList.remove("text-green-600");
        summaryRemaining.classList.add("text-orange-600");
      } else {
        summaryRemaining.classList.remove("text-orange-600");
        summaryRemaining.classList.add("text-green-600");
      }
    }

    quantitySelect.addEventListener("change", updateSummary);

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
      } else {
        alert(`❌ Booking failed: ${result.message}`);
        confirmBtn.disabled = false;
        confirmBtn.textContent = "Continue to Pay";
      }
    });

    modal.classList.remove("hidden");
    setTimeout(() => {
      modal.classList.remove("opacity-0");
      modalContent.classList.remove("scale-90");
    }, 10);
  }

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
});
