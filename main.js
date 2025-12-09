// 1. IMPORT the data
import { translations } from "./translations.js";

document.addEventListener("DOMContentLoaded", () => {
  // --- Mobile Menu Logic (Moved here to keep HTML clean) ---
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }

  // --- Translation Logic ---

  function updateContent() {
    // Get language from URL hash (e.g., #pt) or default to 'en'
    const hash = window.location.hash.substring(1);
    const lang = hash === "pt" || hash === "es" ? hash : "en";

    // Get the specific dictionary for that language
    const currentLangData = translations[lang];

    // Find all elements that need translating
    const elements = document.querySelectorAll("[data-key]");

    elements.forEach((el) => {
      const key = el.getAttribute("data-key");
      const text = currentLangData[key];

      if (text) {
        // If it's an input or textarea, change the placeholder
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          el.placeholder = text;
        }
        // Otherwise change the text content
        else {
          el.textContent = text;
        }
      }
    });
  }

  // Listen for hash changes (clicking the EN/PT/ES buttons)
  window.addEventListener("hashchange", updateContent);

  // Run once on load
  updateContent();
});
