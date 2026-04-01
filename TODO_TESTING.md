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

#######

The report from the other LLM is excellent and covers the standard technical "blind spots" very well. As a Senior Architect, I have analyzed your current state and found four high-risk areas that were not explicitly detailed in that list.

To make your project truly "Live Money" ready, I suggest adding these specific items to your roadmap:

1. Backend: Financial "Penny" Precision (Unit Test)

The previous report mentions amount validation, but it misses the Float-to-Integer math risk.

    The Gap: In PaymentService.py, we use int(round(total_price * 100)).

    The Risk: Python floats can be imprecise (e.g., 19.99 * 100 can sometimes result in 1998.9999999999998). If the rounding is off by even 1 cent, the Woovi signature will fail or the user will underpay.

    The Test: A unit test in test_payment_service.py that iterates through 100 "tricky" prices (like 19.99, 250.05, 100.10) to ensure they result in the exact integer cent value Eduardo expects.

2. Security: The "Direct Link" PII Leak (Integration Test)

   The Gap: We refactored the BookingStatusResponse to strip out Name and Email.

   The Risk: A regression here is a major legal liability (LGPD).

   The Test: A specific "Penetration Test" in test_bookings_api.py. It should call the GET /status/{uuid} endpoint and strictly assert: assert "guest_name" not in response.json(). This acts as a permanent "Guardrail" so no future developer accidentally re-adds PII to that public endpoint.

3. Frontend: The "Double-Tap" Prevention (UX Test)

   The Gap: In BookingForm.jsx and the Admin ManualBookingForm, users often double-click buttons if they are anxious or the network is slow.

   The Risk: Two bookings created for the same person, or Eduardo accidentally adding a guest twice because the UI didn't visually "lock" fast enough.

   The Test: A Playwright test that clicks "Confirm" twice in rapid succession.

   The Requirement: The UI should immediately disable the button and show a "Submitting..." state (which we have, but we need to prove it blocks the second click).

4. Observability: Sentry Breadcrumb Verification

   The Gap: We integrated Sentry, but we don't know if the Context is actually working.

   The Risk: If a payment fails in production, and Sentry doesn't tell us the booking_id or the error_detail from Woovi, the tool is useless.

   The Test: A unit test in api.test.js that mocks a failed fetch and verifies that captureApiError was called with the correct metadata object.
