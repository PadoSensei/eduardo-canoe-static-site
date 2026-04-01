Based on everything I've seen across the codebase, here's what's missing and why each matters:

Jest — Unit & Integration
Booking edge cases (BookingSystem.test.jsx)

Date input set to today shows available tours, yesterday shows "past date" error — isPastDate logic is currently untested via the UI
Guest submits form with whitespace-only name — the validation only checks truthiness so " " would pass
Tour capacity reaches zero mid-session — the remaining: 0 / isBookable: false path after another guest books

useBooking hook (**tests**/hooks/useBooking.test.js)

This hook is completely untested in isolation. Key paths to cover:

Polling stops immediately when isConfirmed flips true
clearBooking removes pending_booking from localStorage
Component unmounts mid-poll — AbortError is swallowed silently
consecutiveErrors >= 5 sets hasConnectionIssue: true

DayManifest.test.jsx gaps

The manual booking form (ManualBookingForm) has zero test coverage — it's a separate payment path Eduardo uses at the lagoon
Weather cancellation confirmation dialog — window.confirm returning false should abort the cancellation

api.js missing coverage

fetchMonthlySchedule — never tested, handles the admin calendar data
adminCreateBooking — the manual booking endpoint
cancelTourForWeather — critical admin action with no unit test
All three return null on abort — that contract should be verified

dateUtils.js

isPastDate with timezone edge cases — a guest in UTC-3 (Brazil) booking at 11pm when the server is UTC could produce unexpected results
getTodayLocalDate returning the correct format yyyy-MM-dd

Language system

LanguageContext switching mid-session — verify all booking form strings update immediately without a page reload, not just the top-level nav strings that LanguageContinuity.test.jsx already covers

Integration
Payment failure paths (**tests**/integration/PaymentFailures.test.jsx)
Looking at what's there, I'd add:

Backend returns expired on first poll — should show expiredTitle immediately without waiting for a second poll
Backend returns failed — shows failedTitle and retry button
Countdown timer reaches zero while status is still pending_payment — verify the UI degrades gracefully rather than showing a negative timer

Full booking compliance with language toggle

Guest starts booking in English, switches to Portuguese mid-form — verify acceptedTerms checkbox label updates and the error message errorTerms fires in Portuguese

Admin bypass vs real auth

?bypass=true sets a fake session — verify that navigating to /admin without bypass and without a real session redirects to the login form (currently no test enforces this security boundary)

Playwright E2E
Resilience spec (resilience.spec.mjs)

Railway goes offline mid-booking — simulate with page.route returning 503 after the booking is created but before the webhook fires — verify the guest sees a connection warning rather than a blank screen
Guest navigates away during payment countdown and returns — pending_booking in localStorage should restore the PaymentView

Mobile booking flow

The guest-mobile-safari project currently runs the same tests as guest-chromium — add a test specifically for the date input on iOS Safari, which handles input[type="date"] differently and is where the React synthetic event fix we applied is most likely to regress

Admin manifest actions

Complete the weather cancellation E2E loop — currently the admin spec mocks the endpoint, but there's no test that fires the real Railway cancellation endpoint and verifies all passengers receive the notification (or at minimum that the booking status updates)
Manual booking form — Eduardo adds walk-in guests at the lagoon without going through the PIX flow, this path has no E2E coverage at all

Full moon tour booking

The workflow test always books the first tour returned (Full Moon Celebration on April 2nd). Add a second workflow run that explicitly targets Sunset Tour by name — ensures the bookedTourName matching in the manifest drill-down works for both tour types, not just whichever happens to be first

Booking cleanup

The test database on Railway now has 30+ E2E test passengers from this debugging session. Add a test.afterAll to the workflow spec that hits a Railway cleanup endpoint (or directly via the admin API) to cancel bookings where guest_name starts with E2E-TEST- — keeps the admin manifest clean for Eduardo's real operations

Highest priority order

useBooking hook isolation — it drives the entire payment lifecycle and has zero direct unit tests
isPastDate timezone edge case — Brazilian guests are UTC-3, a wrong date here blocks real bookings
Manual booking form E2E — Eduardo uses this daily at the lagoon
Weather cancellation real endpoint test — admin-critical action currently only mocked
Test data cleanup in workflow.spec.mjs — already overdue given the 30+ ghost passengers in Railway
