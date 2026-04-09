# Mentor Learning Summary: Resilience & Recovery (FE-3 & FE-4)

## Work Completed

### Resilience Implementation

- **FE-3: Resilience & Recovery Suite**: Hardened the booking flow against common "Shadow" failures.
  - **State Re-hydration**: Implemented logic in `BookingSystem.jsx` and `useBooking.js` to detect pending bookings in `localStorage` on page refresh. The UI now immediately resumes polling and displays the QR code, ensuring users don't lose their session.
  - **Contract Violation Shield**: Integrated `Zod` validation for `localStorage` data. If the saved session format is invalid (e.g., due to a backend schema change), the frontend now clears the corrupted data and shows a localized "System Update" toast instead of crashing.
  - **Polling Exhaustion**: Added safeguards to prevent infinite polling. The system now stops and shows a "Payment Timeout" screen if polling fails 5 times consecutively or if 10 minutes have passed since the booking was created.
  - **Support Integration**: The timeout screen includes a "Contact Support" button with a pre-filled Portuguese subject line containing the booking UUID for fast resolution.

- **FE-4: Backend Reaper Sync**: Improved synchronization with server-side expiration.
  - Updated the API `request` wrapper to intercept `404 Not Found` or `400 Expired` responses during polling.
  - When a booking is "reaped" by the backend, the frontend automatically clears the local session, shows a "Session Expired" toast, and redirects the user back to the Tour selection page.

## Key Learnings

1. **Defensive Re-hydration**: Restoring state from `localStorage` is powerful but dangerous. Always validate external data (even if we wrote it) using schemas like Zod before trusting it to drive UI state.
2. **Graceful Exhaustion**: Systems shouldn't spin forever. By implementing both time-based and failure-based polling limits, we preserve client resources and provide a clear path forward (Support) when automation fails.
3. **Synchronized State**: The frontend must respect the backend as the source of truth. If the backend deletes a resource (Reaper), the frontend must provide an immediate and logical transition (Redirect + Toast) rather than leaving the user in a broken state.
4. **Testing Async Resilience**: Testing these scenarios requires precise control over time and network. Using `jest.useFakeTimers()` to simulate timeouts and `MSW` to simulate backend reapings ensures our recovery logic is robust without waiting for real-world failures.

✅ **Frontend Hardening Sprint 02 COMPLETED.**
