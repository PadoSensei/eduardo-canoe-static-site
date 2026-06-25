# Frontend Capability Audit
Generated: 2025-05-14

## 1. Tourist-Facing UI Capabilities
As a tourist, I can:
- **View Home Page**: Experience a high-impact cinematic video background with brand messaging and direct calls to action [src/pages/Home.jsx].
- **Switch Language**: Toggle between English, Portuguese, Spanish, and French via the persistent header [src/components/Header.jsx, src/context/LanguageContext.jsx].
- **Explore Tours**: Browse a gallery of tour templates (Sunrise, Sunset, Full Moon) with short descriptions and starting prices [src/pages/Tours.tsx].
- **View Detailed Itineraries**: Open a modal for any tour to see full descriptions, inclusions, requirements, duration, and specific meeting times [src/components/TourModal.jsx].
- **Check Real-Time Availability**: Select a date on a calendar to see exactly which tours are bookable and how many seats remain [src/components/BookingSystem.tsx].
- **Discovery Specialty Events**: See a persistent "Next Full Moon" banner that encourages booking the next available specialty tour [src/components/booking/NextFullMoonBanner.jsx].
- **Reserve Seats**: Fill out a booking form with my name, email, and guest count, including acceptance of Terms and Privacy Policy [src/components/booking/BookingForm.jsx].
- **Pay via Pix**: Complete payment using a dynamic QR code and "Copy Pix" string, with a 15-minute countdown timer [src/components/booking/PaymentView.jsx, src/hooks/useBooking.js].
- **Receive Digital Voucher**: View a success screen with a unique Reservation ID, meeting time, and a link to the Google Maps meeting point [src/components/booking/SuccessView.jsx, src/components/common/LocationLink.jsx].
- **Self-Serve Info**: Access a searchable FAQ that dynamically injects current meeting times from the backend [src/pages/FAQ.jsx].
- **Verify Legal Compliance**: Read localized Terms of Service and Privacy Policy pages [src/pages/Terms.jsx, src/pages/Privacy.jsx].

## 2. Admin-Facing UI Capabilities
As an admin (Eduardo), I can:
- **Secure Authentication**: Log in via Magic Link or use an environment-specific Bypass Mode for rapid field access [src/components/admin/AdminLayout.tsx, src/pages/Dashboard.jsx].
- **Monitor Operations**: View a monthly calendar with occupancy heatmaps (Empty/Low/Busy/Full) and real-time revenue tallies [src/components/dashboard/DashboardCalendar.jsx].
- **Manage Day Manifests**: View a list of all tour instances for a specific day, including headcount progress (Boarded / Total) [src/components/dashboard/DayManifest.jsx].
- **Mobile Check-In**: Toggle a "On Board" status for passengers at the lagoon using a touch-optimized interface [src/components/dashboard/manifest/PassengerRow.jsx].
- **Manual Booking**: Add guests manually to a tour instance, bypassing the public payment flow [src/components/dashboard/manifest/ManualBookingForm.jsx].
- **Handle Cancellations**: Cancel individual passenger bookings (releasing seats) or cancel an entire tour due to weather (triggering automated guest notifications) [src/components/dashboard/WeatherCancelModal.jsx, src/components/dashboard/manifest/PassengerRow.jsx].
- **Control Logistics**: Toggle the `is_special_event` flag for specific tour instances to trigger Moon-themed UI [src/components/dashboard/LogisticsModal.jsx].
- **Instantiate Tours**: Manually create new Sunset or Full Moon tour instances for any date [src/components/dashboard/DayManifest.jsx].
- **Monitor System Activity**: View a live feed of all payments, communications, and booking events with high-contrast category tags [src/pages/admin/ActivityView.tsx].
- **Manage Communications**: Enable/disable automated emails (tickets, reminders, reviews) and set their scheduled delivery times [src/pages/admin/EmailsView.tsx].
- **Preview Templates**: Inspect exactly how automated emails will appear to guests [src/components/admin/EmailPreviewModal.tsx].
- **Set Global Truth**: Manage global standard and Full Moon meeting times that propagate across the entire guest-facing UI [src/pages/admin/EmailsView.tsx].

## 3. API Surface Coverage

| Function Name | HTTP Method + Endpoint | Component(s) Using It | Working UI? |
|---------------|------------------------|-----------------------|------------|
| `createTourInstance` | POST `/admin/tours` | `DayManifest.jsx` | Yes |
| `fetchLogisticsMetadata` | GET `/tours/templates` | `FAQ.jsx` | Yes |
| `getNextSpecialtyTour` | GET `/tours/specialty/next` | `BookingSystem.tsx`, `TourModal.jsx` | Yes |
| `getActivityLog` | GET `/admin/activity-log` | `ActivityView.tsx` | Yes |
| `patchTourLogistics` | PATCH `/admin/tours/{id}/logistics` | `DayManifest.jsx` | Yes |
| `getEmailPreview` | GET `/admin/emails/preview/{slug}` | `EmailsView.tsx` | Yes |
| `getEmailSettings` | GET `/admin/settings/emails` | `EmailsView.tsx` | Yes |
| `updateEmailSetting` | PATCH `/admin/settings/emails/{slug}` | `EmailsView.tsx` | Yes |
| `getSystemSettings` | GET `/admin/settings/system` | `EmailsView.tsx`, `FAQ.jsx` | Yes |
| `updateSystemSettings` | PATCH `/admin/settings/system` | `EmailsView.tsx` | Yes |
| `getAvailableTours` | GET `/tours/available` | `BookingSystem.tsx`, `useBooking.js` | Yes |
| `createBooking` | POST `/bookings` | `BookingSystem.tsx` | Yes |
| `getBookingStatus` | GET `/bookings/status/{uuid}` | `useBooking.js` | Yes |
| `getTourTemplates` | GET `/tour-templates` | `Tours.tsx` | Yes |
| `fetchMonthlySchedule` | GET `/admin/schedule` | `DashboardCalendar.jsx` | Yes |
| `fetchDayManifest` | GET `/admin/manifest/{date}` | `DayManifest.jsx` | Yes |
| `patchCheckIn` | PATCH `/admin/bookings/{id}/check-in` | `DayManifest.jsx` | Yes |
| `cancelBooking` | POST `/admin/bookings/{id}/cancel` | `DayManifest.jsx` | Yes |
| `adminCreateBooking` | POST `/admin/bookings` | `ManualBookingForm.jsx` | Yes |
| `cancelTourForWeather` | POST `/admin/tours/{id}/weather-cancel` | `DayManifest.jsx` | Yes |

## 4. Translation Coverage (i18n Gaps)
The following hardcoded strings bypass the `t()` translation function and will not respond to language switching:

### Guest-Facing Gaps
- **`src/components/BookingSystem.tsx`**:
    - `"Monthly Special Event"` (Line 282) — Specialty badge label.
    - `"Total"` (Line 315) — Price breakdown header (should use `label_total`).
- **`src/components/booking/BookingForm.jsx`**:
    - `(Max {tour.remaining})` (Line 131) — Capacity hint.
- **`src/components/Header.jsx`**:
    - `"Select Language"` (Line 160) — Mobile menu section header.
- **`src/components/Footer.jsx`**:
    - `"Aloha Spirit"` (Line 168) — Brand tagline at the bottom.
- **`src/pages/FAQ.jsx`**:
    - `"Search for questions (e.g. 'swim', 'price', 'moon')..."` (Line 169) — Search placeholder.
    - `"All Questions"` (Line 182) — Category filter button.
    - `"No questions found matching"` (Line 213) — Empty search state.
    - `"Clear all filters"` (Line 222) — Search reset button.

### Admin-Facing Gaps (Entirely unlocalized)
- **`src/pages/Dashboard.jsx`**:
    - `"LOCAL DEV"` (Line 192) — Environment indicator.
    - `"Operations"` (Line 203) — Page title.
    - `"Logged in as"` (Line 206) — Session info.
    - `"Admin Access"`, `"Send Magic Link"`, `"Check your email!"` (Lines 168-185) — Legacy login form.
- **`src/components/dashboard/DayManifest.jsx`**:
    - `"Loading Manifest..."` (Line 253) — Loading state.
    - `"Boarding Status"`, `"Operational Manifest"`, `"Cancelled / Inactive"` (Lines 294, 347, 375) — Section headers.
    - `"is on board"`, `"passengers are on board"` (Lines 131-133) — Check-in toasts.
    - `"Daily Schedule"`, `"No tours scheduled for this date."` (Lines 408, 418).
- **`src/pages/admin/EmailsView.tsx`**:
    - `"Configuração"` (Line 104) — Fallback toggle label.
    - `"Customer"`, `"Internal"` (Lines 183, 197) — Setting group headers.
    - `"Global Tour Logistics"`, `"Standard Meeting Time"`, `"Full Moon Meeting Time"` (Lines 245-276).
- **`src/pages/admin/ActivityView.tsx`**:
    - `"Live Monitoring"` (Line 206) — Status indicator.
    - `"Events"` (Line 203) — Feed counter.
    - `"Synchronizing..."` (Line 217) — Loading state.
- **`src/components/dashboard/LogisticsModal.jsx`**:
    - `"Set Logistics"`, `"Special Event"`, `"Enable Full Moon UI/Banner"`, `"Save Logistics"` (Lines 52-94).

## 5. Frontend-Backend Sync Gaps
- **Dead code**: None. Every exported function in `src/api.ts` is imported and used in at least one component.
- **Broken call**: None identified. All UI flows correctly target existing `api.ts` wrappers. However, `patchCheckIn` in `DayManifest.jsx` includes a defensive check for `typeof bookingId === 'number'`, suggesting a potential type mismatch between local UUIDs and expected backend primary keys.

## 6. State & Session Edge Cases
- **LocalStorage Keys**:
  - `pending_booking`: Stores current booking and payment metadata. Properly cleaned up on successful payment, timeout, or manual "Clear Booking" action.
  - `language`: Persists user language preference.
  - `fired_checkout_{uuid}` / `fired_purchase_{uuid}`: Prevents redundant GA4 event firing.
  - `is_testing`: Used to force auto-confirmation in `api.ts`.
- **Edge Case Analysis**:
  - **Payment Timeout**: `useBooking.js` handles this via `isTimedOut`. `localStorage` is NOT cleared automatically, allowing the user to see the timeout screen and contact support.
  - **Page Refresh**: `BookingSystem.tsx` recovers active booking sessions from `localStorage` on mount, ensuring the Pix QR code is restored.
  - **Auth Session Expiry**: Handled by `AdminLayout.tsx` which triggers a redirect to the login form upon `onAuthStateChange`.
  - **Network Failure**: Form submission in `BookingSystem.tsx` handles errors gracefully, displaying a localized `alertError` toast or message.
  - **Webhook Race Condition**: `useBooking.js` polls immediately upon creation, mitigating issues where a webhook arrives before the client starts polling.
  - **Language Switch mid-booking**: Form state is held in `BookingSystem.tsx` level; switching languages re-renders children but preserves the values in the parent state.

## 7. Missing or Incomplete UI
- **Commented-out Features**:
  - `src/components/booking/BookingForm.jsx`: Special Notes input field is commented out (Lines 216-235).
  - `src/components/dashboard/manifest/ManualBookingForm.jsx`: Special Notes input is commented out (Lines 118-132).
  - `src/components/booking/SuccessView.jsx`: Display of guest's Special Notes on the voucher is commented out (Lines 134-150).
- **Architecture Gaps**:
  - `src/pages/Dashboard.jsx`: Contains redundant login logic marked with `@todo` (Line 158); it should rely entirely on `AdminLayout.tsx`.
- **UI Logic Incompleteness**:
  - `src/components/dashboard/LogisticsModal.jsx`: The UI allows setting the `is_special_event` flag, but unlike `EmailsView.tsx`, it does not currently support overriding meeting times for that specific instance.
- **Visual Polish**:
  - `src/pages/Home.jsx`: Intermediate sections are commented out, leaving only the Hero section.
