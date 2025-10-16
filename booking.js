// booking.js

// Ensure the script runs only after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // --- Mobile Menu Toggle Functionality ---
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");

  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  } else {
    console.warn("Mobile menu button or mobile menu element not found.");
  }

  // --- Simulated Booking Availability Logic ---

  // --- Data ---
  const tours = [
    { id: "dolphin", name: "Daybreak Dolphin Bay Encounter", type: "morning" },
    { id: "coastal", name: "Coastal Exploration", type: "all-day" },
    { id: "sunset", name: "Sunset Lagoon Paddle", type: "evening" },
  ];

  let bookings = {};
  const STORAGE_KEY = "pipaCanoeSimulatedBookings";

  // --- DOM Elements ---
  const datePicker = document.getElementById("availability-date");
  const availabilitySlotsDiv = document.getElementById("availability-slots");
  const resetBookingsBtn = document.getElementById("reset-bookings-btn");

  // --- Local Storage Functions ---
  function loadBookings() {
    const storedBookings = localStorage.getItem(STORAGE_KEY);
    if (storedBookings) {
      try {
        bookings = JSON.parse(storedBookings);
      } catch (e) {
        console.error("Error parsing bookings from localStorage:", e);
        bookings = {};
      }
    }
  }

  function saveBookings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  }

  // --- Render Availability ---
  function renderAvailabilityForDate(dateString) {
    if (!bookings[dateString]) {
      bookings[dateString] = {};
    }

    const dayBookings = bookings[dateString];

    // Determine state for each tour
    const states = {};
    const coastalBooked = dayBookings["coastal"] === "booked";
    const morningBooked = dayBookings["dolphin"] === "booked";
    const eveningBooked = dayBookings["sunset"] === "booked";

    tours.forEach((tour) => {
      let state = "available";

      if (dayBookings[tour.id] === "booked") {
        state = "booked";
      } else if (tour.id === "coastal") {
        if (morningBooked || eveningBooked) state = "unavailable";
      } else if (tour.id === "dolphin" || tour.id === "sunset") {
        if (coastalBooked) state = "unavailable";
      }

      states[tour.id] = state;
    });

    // Render HTML
    const formattedDate = new Date(dateString).toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    let html = `<h3 data-key="availabilityHeading" class="text-2xl font-bold text-center mb-8 text-gray-800">Bookings for ${formattedDate}</h3>`;

    if (tours.length === 0) {
      html += '<p class="text-center text-gray-500">No tours available.</p>';
    } else {
      html += '<div class="space-y-4">';
      tours.forEach((tour) => {
        const state = states[tour.id];
        let buttonClass = "";
        let buttonText = "";

        switch (state) {
          case "booked":
            buttonClass = "bg-gray-400 cursor-not-allowed";
            buttonText = "Booked";
            break;
          case "unavailable":
            buttonClass = "bg-gray-200 cursor-not-allowed text-gray-600";
            buttonText = "Unavailable";
            break;
          default:
            buttonClass = "bg-[#FF6B6B] hover:bg-[#FF5252]";
            buttonText = "Book Now";
        }

        html += `
            <div class="flex flex-col sm:flex-row justify-between items-center p-4 border border-gray-200 rounded-lg">
              <span class="font-medium text-lg mb-2 sm:mb-0">${tour.name}</span>
              <button
                data-date="${dateString}"
                data-tour-id="${tour.id}"
                class="book-slot-btn px-6 py-3 rounded-lg font-bold text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] transition-all duration-200 ${buttonClass}"
                ${state !== "available" ? "disabled" : ""}
              >
                ${buttonText}
              </button>
            </div>
          `;
      });
      html += "</div>";
    }

    availabilitySlotsDiv.innerHTML = html;

    document.querySelectorAll(".book-slot-btn").forEach((button) => {
      button.addEventListener("click", handleBookingClick);
    });
  }

  // --- Handle Booking Click ---
  function handleBookingClick(event) {
    const button = event.target;
    const date = button.getAttribute("data-date");
    const tourId = button.getAttribute("data-tour-id");

    if (date && tourId) {
      if (!bookings[date]) bookings[date] = {};
      bookings[date][tourId] = "booked";
      saveBookings();
      renderAvailabilityForDate(date);

      alert(
        `You have booked the "${
          tours.find((t) => t.id === tourId).name
        }" tour for ${new Date(date).toLocaleDateString()}!`
      );
    }
  }

  // --- Reset Bookings ---
  function resetAllBookings() {
    if (
      confirm(
        "Are you sure you want to reset all simulated bookings? This cannot be undone for this session."
      )
    ) {
      bookings = {};
      localStorage.removeItem(STORAGE_KEY);

      const currentDate = new Date();
      const defaultDateString = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

      if (datePicker) {
        datePicker.value = defaultDateString;
        renderAvailabilityForDate(defaultDateString);
      }
    }
  }

  // --- Initialization ---
  const today = new Date();
  const defaultDateString = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  if (datePicker && availabilitySlotsDiv) {
    datePicker.value = defaultDateString;
    loadBookings();
    renderAvailabilityForDate(defaultDateString);
  } else {
    console.error("Required DOM elements for booking availability not found.");
  }

  // --- Event Listeners ---
  if (datePicker) {
    datePicker.addEventListener("change", (event) => {
      renderAvailabilityForDate(event.target.value);
    });
  }

  if (resetBookingsBtn) {
    resetBookingsBtn.addEventListener("click", resetAllBookings);
  }
});
