//------------------------------------------------------
// ✅ tours-booking.js — updated to use apiService.js
//------------------------------------------------------

import {
  fetchAvailabilityAndDetails,
  bookTour,
  resetMockBookings,
} from "./apiService.js";

let currentDate = "";
let currentData = [];

export function clearTourData() {
  currentData = [];
}

export function setCurrentDate(date) {
  currentDate = date;
}

export function getCurrentDate() {
  return currentDate;
}

export function getCurrentData() {
  return currentData;
}

// ✅ Map API data to the shape the UI expects
function mapAvailabilityToTourCards(apiData, dateString) {
  return apiData.map((item) => ({
    id: item.tour_id,
    name: item.name,
    description: item.description,
    price: item.price,
    image_url: item.image_url,
    duration: item.duration,
    capacity: item.capacity,
    date: dateString,
    booked_count: item.booked_count,
    available: item.is_bookable,
    remaining: item.seats_available,
  }));
}

// ✅ Render tours list
export async function renderTourAvailability(dateString) {
  const container = document.getElementById("tours-list");
  if (!container) return;

  container.innerHTML = `Loading availability...`;

  try {
    const availabilityData = await fetchAvailabilityAndDetails(dateString);

    // Map to UI structure
    currentData = mapAvailabilityToTourCards(availabilityData, dateString);

    if (currentData.length === 0) {
      container.innerHTML = `<p>No tours available.</p>`;
      return;
    }

    // ✅ Generate card markup
    const html = currentData
      .map(
        (tour) => `
        <div class="tour-card" data-tour-id="${tour.id}">
          <h3>${tour.name}</h3>
          <p>${tour.description}</p>
          <p>Price: $${tour.price}</p>
          <p>Seats Left: ${tour.remaining}</p>
          <button class="tour-book-btn"
            data-tour-id="${tour.id}"
            data-date="${dateString}"
            data-available="${tour.available}">
            ${tour.available ? "Book Now" : "Sold Out"}
          </button>
        </div>
      `
      )
      .join("");

    container.innerHTML = html;

    // ✅ Add dynamic button listeners
    document.querySelectorAll(".tour-book-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tid = btn.getAttribute("data-tour-id");
        const d = btn.getAttribute("data-date");
        const tour = currentData.find((t) => t.id === tid);
        if (tour && tour.available) {
          bookTour(d, tid, 1);
          alert(`Booked tour ${tid} for ${d}`);
        }
      });
    });
  } catch (err) {
    container.innerHTML = `<p>Error loading availability.</p>`;
    console.error(err);
  }
}

// ✅ Used in tests to reset environment
export function resetState() {
  currentDate = "";
  currentData = [];
  if (resetMockBookings) resetMockBookings();
}
