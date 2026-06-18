### Logistics Dependency Audit: Forensic Report of the Hardcoding Geography

This report identifies hardcoded references to tour logistics, times, and "Full Moon" logic that prevent Eduardo from managing operations autonomously through the database.

---

#### 1. "Full Moon" Logic (Major Dependency)
These references use brittle strings to identify special events, meaning if the tour name changes in the database, the logic breaks.
- **`src/components/BookingSystem.tsx` (Line 110):** Explicitly calls `getNextSpecialtyTour("full_moon_party")`.
- **`src/components/TourModal.jsx` (Line 17):** Triggers specialized fetching if `tourType === "full_moon_party"` or name includes "full moon".
- **`src/components/TourModal.jsx` (Line 74):** Uses a hardcoded ternary `tourType === "full_moon" ? "Monthly Event" : "Daily Tour"` for UI labeling.
- **`src/api.ts` (Line 251):** The `getNextSpecialtyTour` function is hardcoded to expect a `type` parameter that matches a specific backend string.

#### 2. Meeting Point Information (Logistical Debt)
The meeting point is "baked" into the code and translations, requiring a developer to change the physical location.
- **`src/data/translations.js`:** "Sunset Stairs" (and translations) is hardcoded in `tour_full_moon_detail` and `logistics_meeting` for all 4 languages.
- **`src/data/faqData.js`:** The meeting point and description are hardcoded in the `logistics` category for all languages (e.g., Lines 92, 195, 297, 399).
- **`src/components/TourModal.jsx` (Line 92):** Hardcoded `<span>Sunset Stairs</span>` inside the logistics icon strip.
- **`src/core/config.ts` (Line 16):** The Google Maps location `googleMapsUrl` is a static configuration variable.

#### 3. Tour Type Mappings (Glue Code Dependency)
The frontend "guesses" what a tour is based on backend slugs to determine which icons or translation keys to show.
- **`src/components/BookingSystem.tsx` (Lines 71-80):** `getTourName` maps slugs like `sunrise`, `sunset`, `full_day` to hardcoded frontend translation keys (`card1Title`, etc.).
- **`src/api.ts` (Line 362 & 482):** Hardcoded "2h" fallback for durations if the API field is null.
- **`src/api/schemas.ts` (Line 10):** Zod schema hardcodes a default capacity of `10`.

#### 4. Operational Times (Business Time Debt)
Times that vary by tide or season are trapped inside translation strings.
- **`src/data/translations.js` (Line 245/545/848/1154):** "2:40 PM" / "14:40" is part of the long-form description for the Full Moon tour.
- **`src/data/faqData.js` (Line 59/161):** "3:00 PM" and "6:00 PM" are hardcoded as the start/end times for the Sunset Tour.

#### 5. Un-translated UI Labels (i18n Debt)
Critical pricing and count labels are hardcoded in English, bypassing the i18n system entirely.
- **`src/components/booking/BookingForm.jsx` (Line 75):** Hardcoded "Price per person:".
- **`src/components/booking/BookingForm.jsx` (Line 79):** Hardcoded "Total:".
- **`src/components/booking/BookingForm.jsx` (Line 89):** Hardcoded "Number of Guests (Max {tour.remaining})".
- **`src/components/booking/SuccessView.jsx` (Lines 34, 45):** GA4 analytics hardcodes the item name as "Canoe Tour".

#### 6. Capacities & Logistics
- **`src/data/faqData.js` (Line 62):** Capacity of "30 people" is hardcoded in the answer to "How many people can join?".

---

**Summary of Impact:** Currently, Eduardo cannot change a tour's start time, move the meeting point, or rename a "Full Moon" event without a code deployment. The frontend also lacks a mechanism to dynamically render labels for new tour types added to the database.
