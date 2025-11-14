// booking.js

import {
  fetchAvailabilityAndDetails,
  createBooking, // <--- CHANGED: was 'bookTour'
  // resetMockBookings, <--- REMOVE: This doesn't exist in the real API
  pingBackend,
} from "./apiService.js";

//------------------------------------------------------
// Utility helpers
//------------------------------------------------------

function normalizeDate(dateStr) {
  if (!dateStr) return "";
  const [yyyy, mm, dd] = dateStr.split("-");
  return `${dd}/${mm}/${yyyy}`;
}

function clearBookingUI() {
  const list = document.getElementById("availability-results");
  if (list) list.innerHTML = "";
}

function showLoading() {
  const list = document.getElementById("availability-results");
  if (list) list.innerHTML = `<p>Loading availability...</p>`;
}

function showError(msg) {
  const list = document.getElementById("availability-results");
  if (list)
    list.innerHTML = `<p class="error text-red-500 text-center">${msg}</p>`;
}

//------------------------------------------------------
// Render function — builds availability list
//------------------------------------------------------

function renderAvailabilityResults(availabilityArray) {
  const list = document.getElementById("availability-results");
  if (!list) return;

  if (!availabilityArray || availabilityArray.length === 0) {
    list.innerHTML = `<p class="text-center">No tours available for this date.</p>`;
    return;
  }

  const html = availabilityArray
    .map(
      (item) => `
      <div class="booking-item border-b p-4 flex justify-between items-center">
        <div>
            <h4 class="font-bold">${item.name}</h4>
            <p class="text-sm text-gray-600">Remaining seats: ${item.seats_available}</p>
        </div>
        <button class="book-btn bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          data-tour-id="${item.tour_id}"
          data-date="${item.date}"
        >
          Book Now
        </button>
      </div>
      `
    )
    .join("");

  list.innerHTML = `<div class="booking-list">${html}</div>`;

  // Add event listeners
  document.querySelectorAll(".book-btn").forEach((btn) =>
    btn.addEventListener("click", async () => {
      const tid = btn.getAttribute("data-tour-id");
      const d = btn.getAttribute("data-date");

      // Prepare the real data payload expected by the backend
      const bookingPayload = {
        tour_date: d,
        tour_id: parseInt(tid), // Ensure ID is a number if backend expects it
        pax: 1,
        // Add 'user_id' or 'email' here if your backend requires it
      };

      try {
        // CHANGED: Use createBooking instead of bookTour
        const result = await createBooking(bookingPayload);

        if (result.success) {
          alert(`✅ Booking created for Tour ${tid} on ${d}`);
          // Optional: Refresh availability
          btn.disabled = true;
          btn.textContent = "Booked";
        } else {
          throw new Error(result.message);
        }
      } catch (err) {
        alert(`❌ Failed to book: ${err.message}`);
      }
    })
  );
}

//------------------------------------------------------
// Reset button handler
//------------------------------------------------------

async function handleResetBookings() {
  alert("Resetting is only available in Demo mode (mock data).");
}

//------------------------------------------------------
// DOM Ready Handler
//------------------------------------------------------

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Checking backend connection...");

  try {
    const isBackendUp = await pingBackend();
    if (isBackendUp) {
      console.log("✅ Backend connection successful!");
    } else {
      console.error("❌ Backend connection failed.");
      showError("Could not connect to the server. Is the backend running?");
      return;
    }
  } catch (e) {
    console.error("Ping execution error:", e);
  }

  const datePicker = document.getElementById("booking-date");
  const resetBtn = document.getElementById("reset-bookings-btn");

  if (resetBtn) {
    resetBtn.addEventListener("click", handleResetBookings);
  }

  if (datePicker) {
    datePicker.addEventListener("change", async (e) => {
      const rawDate = e.target.value;
      const normalized = normalizeDate(rawDate);

      showLoading();

      try {
        const tours = await fetchAvailabilityAndDetails(normalized);
        console.log("Normalized date:", normalized);
        console.log("API returned tours:", tours);

        renderAvailabilityResults(tours);
      } catch (err) {
        console.error("Error fetching availability:", err);
        showError(err.message);
      }
    });
  }
});
