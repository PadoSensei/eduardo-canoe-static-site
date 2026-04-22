## Summary

- CRITICAL: 4 findings
- HIGH: 7 findings
- MEDIUM: 6 findings
- LOW: 4 findings
- Top 3 files by combined severity score: `src/api.ts`, `src/hooks/useBooking.js`, `src/components/booking/PaymentView.jsx`

## Findings

### [CRITICAL] [security] — Client-side only admin route guard

File: `src/components/admin/AdminLayout.tsx:66-69`
Finding: Admin access is primarily guarded by a client-side check on the `session` object. While Supabase RLS protects the data, the `shouldBypass` logic allows anyone to enter "Bypass Mode" in non-production environments by adding `?bypass=true` to the URL. This bypasses the OTP flow entirely and grants access to the Admin UI, which is a significant risk if staging builds are publicly accessible.
Fix: In `AdminLayout.tsx`, wrap the `shouldBypass` logic with an additional check for `config.isTest` or a specific secret environment variable.

### [CRITICAL] [error-reporting] — Silent payment-related catch blocks

File: `src/hooks/useBooking.js:187-210`
Finding: Errors during payment status polling are caught. While some are handled (AbortError, BOOKING_EXPIRED), others only increment `consecutiveErrors`. If the error is not a 400/401/503/500 (which are handled by the `request` wrapper), the failure is invisible to Sentry. A silent network failure during polling could lead to a user waiting indefinitely without feedback.
Fix: In `src/hooks/useBooking.js`, add `Sentry.captureException(err)` inside the `catch` block on line 187 for any error that isn't an `AbortError` or `BOOKING_EXPIRED`.

### [CRITICAL] [security] — Double-submission risk on re-render in ShieldedButton

File: `src/components/common/ShieldedButton.jsx:15-18`
Finding: The `ShieldedButton` uses local `useState` for `isProcessing` and `isCooldown`. If the parent component re-renders and causes a re-mount of the button, this state resets. In a payment context, a user could potentially click the button multiple times if a re-render happens during the async operation.
Fix: Refactor `ShieldedButton` to use a `ref` for the cooldown timer and ensure the `isProcessing` state is tied to the `isLoading` prop from the parent.

### [CRITICAL] [security] — Hardcoded credentials in supabaseClient.ts

File: `src/supabaseClient.ts:4-6`
Finding: Hardcoded fallback URLs and keys (`https://mock.supabase.co`). While labeled "mock", these provide a fallback that could lead to data being sent to a placeholder service if environment variables are misconfigured in production.
Fix: Remove the default strings and use `throw new Error("Missing Supabase Config")` if the environment variables are not found.

### [HIGH] [type-safety] — Untyped payment components (.jsx)

File: `src/components/booking/BookingForm.jsx:11-26`, `src/components/booking/PaymentView.jsx:6-16`, `src/components/booking/SuccessView.jsx:7-12`
Finding: These core components handle money and user data but are `.jsx` and lack prop-types or TypeScript interfaces. This creates a "dead zone" for type safety exactly where it's needed most—validating the shape of `tour` data and `paymentInfo` before rendering.
Fix: Migrate `BookingForm.jsx`, `PaymentView.jsx`, and `SuccessView.jsx` to `.tsx` and define strict interfaces for their props.

### [HIGH] [type-safety] — Untyped useBooking hook

File: `src/hooks/useBooking.js:5-231`
Finding: The state machine for the entire booking process is untyped. State variables like `currentBooking` and `paymentInfo` flow through the app as `any`, leading to potential runtime errors if the API shape changes (e.g., `uuid` vs `id`).
Fix: Migrate `useBooking.js` to `.tsx` and import `Booking` and `BookingSession` types from `@/api/schemas`.

### [HIGH] [error-reporting] — Silent clipboard failure in PaymentView

File: `src/components/booking/PaymentView.jsx:31-34`
Finding: If copying the PIX QR code to the clipboard fails (common in some mobile browsers or non-secure contexts), it only does a `console.error` and a generic `alert`. This provides no telemetry on how often users are failing to copy the payment key.
Fix: In `src/components/booking/PaymentView.jsx:32`, add `Sentry.captureException(err)` to track clipboard failures.

### [HIGH] [code-smell] — Infrastructure mixed into presentation layer

File: `src/App.jsx:25`, `src/pages/Dashboard.jsx:4`
Finding: `supabaseClient.ts` is imported directly into components to handle auth events. This couples the UI directly to the Supabase SDK, violating the "Iron Shield" architecture where `src/api.ts` should be the canonical surface.
Fix: Centralize auth listeners in `src/api.ts` and expose a `onAuthChange` wrapper that components can subscribe to.

### [HIGH] [type-safety] — Type holes from dateUtils and faqData

File: `src/utils/dateUtils.js:4-21`, `src/data/faqData.js:3-315`
Finding: These files are plain JS but are imported by `.tsx` components (e.g., `BookingSystem.tsx`). This injects `any` types into the typed parts of the system, bypassing TypeScript's protection on date logic which is critical for booking availability.
Fix: Rename `src/utils/dateUtils.js` to `.ts` and `src/data/faqData.js` to `.ts`.

### [HIGH] [type-safety] — Missing .jsx migration prioritized list

Finding: The following files touch payments, bookings, or auth and are still `.jsx`, prioritized by blast radius (Revenue Impact):

1. `src/hooks/useBooking.js` (State Transitions)
2. `src/components/booking/PaymentView.jsx` (PIX UI)
3. `src/components/booking/BookingForm.jsx` (Data Collection)
4. `src/components/booking/SuccessView.jsx` (Confirmation)
5. `src/pages/Dashboard.jsx` (Admin Ops)
6. `src/components/dashboard/DayManifest.jsx` (Check-ins)
7. `src/components/dashboard/manifest/ManualBookingForm.jsx` (Admin Entry)

### [HIGH] [security] — Potential Stored XSS in Email Preview

File: `src/components/admin/EmailPreviewModal.tsx:57`
Finding: The modal uses `srcDoc={htmlContent}` within an `iframe`. While the `sandbox` attribute is present and omits `allow-scripts`, the HTML content itself is not sanitized on the frontend. If an attacker manages to inject malicious HTML into the database-stored templates, it could still be used for phishing or UI redressing within the iframe.
Fix: In `src/api.ts`, apply `DOMPurify.sanitize()` to the HTML content before returning it in the `getEmailPreview` function.

### [MEDIUM] [code-smell] — Mock data in production source tree

File: `src/utils/mockData.js`
Finding: Mock data is located in `src/utils/` instead of `__tests__/` or a dedicated `mocks/` directory. It is imported by `DashboardCalender.test.jsx`. This increases the production bundle size and risks accidental usage in production code.
Fix: Move `src/utils/mockData.js` to `__tests__/mocks/mockData.ts`.

### [MEDIUM] [code-smell] — Mixed extensions in manifest directory

File: `src/components/dashboard/manifest/`
Finding: This directory contains a mix of `.jsx` (`ManualBookingForm`, `PassengerRow`, `TourCard`) and `.tsx` (`ManualBookingSummary`). This inconsistency makes it unclear which files are "legacy" and prevents shared type usage.
Fix: Migrate all `.jsx` files in `src/components/dashboard/manifest/` to `.tsx`.

### [MEDIUM] [test-gap] — Page-by-page test coverage matrix

Finding: Mapping of pages to test coverage:
| Page | Unit Test | E2E Spec | Status |
| --- | --- | --- | --- |
| Home | No | Yes | GAP: Unit Test |
| Tours | No | Yes | GAP: Unit Test |
| FAQ | No | Yes | GAP: Unit Test |
| About | Yes | Yes | OK |
| Privacy | No | Yes | GAP: Unit Test |
| Terms | No | Yes | GAP: Unit Test |
| Dashboard | Yes | Yes | OK |
| ActivityView | No | Yes | GAP: Unit Test |
| EmailsView | No | Yes | GAP: Unit Test |

### [MEDIUM] [error-reporting] — Missing global unhandled rejection handler

File: `src/index.jsx:18`
Finding: Sentry is initialized, but there are no explicit handlers for `window.onunhandledrejection`. In complex async flows like PIX polling, an unhandled promise rejection could happen silently if not caught.
Fix: In `src/index.jsx`, add `window.addEventListener('unhandledrejection', (event) => Sentry.captureException(event.reason))` after Sentry initialization.

### [MEDIUM] [code-smell] — Orphaned root-level files

File: `./testHelper.js`, `./success_view_voucher.png`
Finding: These files sit at the repository root and are not referenced by any source or test file.
Fix: `rm testHelper.js success_view_voucher.png`.

### [LOW] [code-smell] — Duplicated logic in AdminLayout and Dashboard

File: `src/components/admin/AdminLayout.tsx:71-110`, `src/pages/Dashboard.jsx:32-85`
Finding: The logic for recovering sessions and handling auth changes is almost identical in both files.
Fix: Extract session recovery logic into `src/utils/authUtils.ts`.

### [LOW] [type-safety] — Conflict between api.ts and schemas.ts

File: `src/api/schemas.ts:86-89`
Finding: The bypass mode in `getBookingStatus` returns an object that includes `guest_email` and `uuid`, but the `BookingStatusResponseSchema` in `schemas.ts` only defines `status` and `is_confirmed`.
Fix: Add `uuid: z.string().optional()` and `guest_email: z.string().optional()` to `BookingStatusResponseSchema` in `src/api/schemas.ts`.

### [LOW] [test-gap] — E2E tests using inconsistent extensions

File: `tests/e2e/`
Finding: Mix of `.js`, `.mjs`, and `.ts` across spec files.
Fix: Standardize all Playwright specs to `.ts`.

### [LOW] [security] — Lax Netlify Redirects

File: `public/_redirects:1`
Finding: The redirect rule `/* /index.html 200` is present. While correct for a SPA, it doesn't explicitly prevent access to sensitive files if they were to be accidentally included in the `public/` folder.
Fix: Add explicit rules to block access to `.env` or other sensitive patterns before the catch-all.

## Jules task candidates

1. **Telemetry Hardening**: Add a global `unhandledrejection` handler in `src/index.jsx` to report async failures to Sentry.
2. **Artifact Purge**: Delete `testHelper.js` and `success_view_voucher.png` from the repository root.
3. **Mock Data Isolation**: Relocate `src/utils/mockData.js` to `__tests__/mocks/mockData.js` and update dependent test imports.
4. **Clipboard Observability**: Update `handleCopyPix` in `src/components/booking/PaymentView.jsx` to report clipboard failures to Sentry.
5. **Schema Synchronization**: Update `BookingStatusResponseSchema` in `src/api/schemas.ts` to include `uuid` and `guest_email` to match the API's bypass implementation.
