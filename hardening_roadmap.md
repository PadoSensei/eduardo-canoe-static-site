# Pipa Canoe Frontend — Hardening Roadmap

## Source: Jules audit — 4 CRITICAL, 7 HIGH, 6 MEDIUM, 4 LOW

## Top files by severity: src/api.ts · src/hooks/useBooking.js · src/components/booking/PaymentView.jsx

---

## Reading this document

Each sprint is a single Jules session. Sprints are hard-sequenced —
Sprint 2 imports types created in Sprint 1, Sprint 3 consumes the
centralised auth created in Sprint 2. Do not reorder.

Findings are tagged [CRITICAL] [HIGH] [MEDIUM] [LOW] with exact file:line from audit.

---

## Sprint 1 — Safe autonomy (this session)

**Jules task file**: `jules_sprint1_quick_wins.md`
**Scope**: Changes Jules can make with zero architectural ambiguity.
All 5 of Jules' own task candidates, plus two LOW findings.
**Estimated time**: 30–45 min
**Risk if skipped**: Orphaned artefacts, invisible async failures,
schema mismatch causing bypass mode bugs.

| #   | Finding                                              | File                     | Severity |
| --- | ---------------------------------------------------- | ------------------------ | -------- |
| 1.1 | Add unhandledrejection handler                       | src/index.jsx:18         | MEDIUM   |
| 1.2 | Delete testHelper.js + success_view_voucher.png      | repo root                | MEDIUM   |
| 1.3 | Move mockData.js → **tests**/mocks/                  | src/utils/mockData.js    | MEDIUM   |
| 1.4 | Add Sentry to clipboard catch in PaymentView         | PaymentView.jsx:31-34    | HIGH     |
| 1.5 | Fix BookingStatusResponseSchema (uuid + guest_email) | src/api/schemas.ts:86-89 | LOW      |
| 1.6 | Standardise E2E spec extensions to .ts               | tests/e2e/               | LOW      |
| 1.7 | Add .env block rule to \_redirects                   | public/\_redirects:1     | LOW      |

---

## Sprint 2 — Security (week 1, after Sprint 1)

**Jules task file**: `jules_sprint2_security.md`
**Scope**: Three CRITICAL security findings. Each is a contained fix
in a known file with a clear resolution.
**Estimated time**: 1.5–2 hours
**Risk if skipped**: Admin bypass accessible on staging URL,
double payment possible on re-render, hardcoded fallback credentials.

| #   | Finding                                                 | File                      | Severity |
| --- | ------------------------------------------------------- | ------------------------- | -------- |
| 2.1 | Wrap bypass logic in config.isTest or secret env var    | AdminLayout.tsx:66-69     | CRITICAL |
| 2.2 | Remove hardcoded fallback in supabaseClient.ts          | src/supabaseClient.ts:4-6 | CRITICAL |
| 2.3 | Refactor ShieldedButton to useRef                       | ShieldedButton.jsx:15-18  | CRITICAL |
| 2.4 | Add DOMPurify to email preview (iframe srcDoc)          | EmailPreviewModal.tsx:57  | HIGH     |
| 2.5 | Block .env patterns in \_redirects (follow-on from 1.7) | public/\_redirects        | LOW      |

**Sprint 2 decisions needed from you before Jules starts**:

- 2.1: What is the correct guard replacement? Options:
  (a) `config.isTest && process.env.BYPASS_SECRET === params.get('bypass')`
  (b) Remove bypass mode entirely from non-localhost builds
  (c) Keep bypass but require a secret token in the URL param
- 2.3: ShieldedButton — confirm the three usage sites (Pay, WeatherCancel, ManualBookingForm)
  should all use the same ref-based pattern, or does WeatherCancel need different behaviour?

---

## Sprint 3 — TypeScript migration, money path first (week 2)

**Jules task file**: `jules_sprint3_typescript.md`
**Scope**: Every file on the revenue path migrated to .tsx with strict interfaces.
Order is load-bearing: hook types must exist before component types import them.
**Estimated time**: 3–4 hours
**Risk if skipped**: API shape changes (uuid vs id) cause silent runtime errors,
date logic injects any into typed components.

Migration order (dependency-sequenced):

| #   | File                                                      | Finding ref           | Severity        |
| --- | --------------------------------------------------------- | --------------------- | --------------- |
| 3.1 | src/utils/dateUtils.js → .ts                              | dateUtils.js:4-21     | HIGH            |
| 3.2 | src/data/faqData.js → .ts                                 | faqData.js:3-315      | HIGH            |
| 3.3 | src/hooks/useBooking.js → .ts (import types from schemas) | useBooking.js:5-231   | CRITICAL (HIGH) |
| 3.4 | src/components/booking/PaymentView.jsx → .tsx             | PaymentView.jsx:6-16  | HIGH            |
| 3.5 | src/components/booking/BookingForm.jsx → .tsx             | BookingForm.jsx:11-26 | HIGH            |
| 3.6 | src/components/booking/SuccessView.jsx → .tsx             | SuccessView.jsx:7-12  | HIGH            |
| 3.7 | manifest/ManualBookingForm.jsx → .tsx                     | manifest/             | MEDIUM          |
| 3.8 | manifest/PassengerRow.jsx → .tsx                          | manifest/             | MEDIUM          |
| 3.9 | manifest/TourCard.jsx → .tsx                              | manifest/             | MEDIUM          |

**Type interfaces to create** (Jules generates these from current prop usage):

- `PaymentStatus` union type (idle | generating_qr | awaiting_payment | processing | completed | failed | timeout)
- `PixPayload` (qrCode, qrCodeText, expiresAt, correlationId)
- `BookingPayload` (guestName, guestEmail, guestPhone, seats, totalAmount, tourInstanceId, language)
- `PassengerRowProps` (name, seat, status, checkInTime?)
- `UseBookingReturn` (import Booking + BookingSession from @/api/schemas — already typed there)

**Sprint 3 gate**: `npx tsc --noEmit` must exit 0 before Sprint 4 starts.

---

## Sprint 4 — API layer consolidation + auth centralisation (week 2–3)

**Jules task file**: `jules_sprint4_architecture.md`
**Scope**: Two HIGH architectural smells. These require import graph surgery —
Jules touches multiple files per fix.
**Estimated time**: 2–3 hours

| #   | Finding                                             | Files                                       | Severity |
| --- | --------------------------------------------------- | ------------------------------------------- | -------- |
| 4.1 | Centralise supabase auth listeners → src/api.ts     | App.jsx:25, Dashboard.jsx:4                 | HIGH     |
| 4.2 | Extract session recovery → src/utils/authUtils.ts   | AdminLayout.tsx:71-110, Dashboard.jsx:32-85 | LOW      |
| 4.3 | Ensure no component imports supabaseClient directly | grep -r "supabaseClient" src/components     | HIGH     |

**For 4.1** — Jules should:

- Create `onAuthChange(callback)` wrapper in `src/api.ts`
- Replace `supabase.auth.onAuthStateChange(...)` calls in App.jsx and Dashboard.jsx
  with the new wrapper
- Confirm supabaseClient is then only imported by api.ts and api/schemas.ts

**For 4.2** — Jules should:

- Create `src/utils/authUtils.ts` with `recoverSession()` and `clearSession()` exports
- Replace duplicated logic in AdminLayout.tsx:71-110 and Dashboard.jsx:32-85

**Sprint 4 gate**: `grep -r "supabaseClient" src/components` returns no results.

---

## Sprint 5 — Silent error hardening (week 3)

**Jules task file**: `jules_sprint5_errors.md`
**Scope**: Payment polling catch blocks that are partially handled but
not fully visible to Sentry.
**Estimated time**: 1 hour

| #   | Finding                                                             | File                  | Severity |
| --- | ------------------------------------------------------------------- | --------------------- | -------- |
| 5.1 | Add Sentry capture to polling catch (non-Abort, non-EXPIRED errors) | useBooking.js:187-210 | CRITICAL |
| 5.2 | Verify Sentry init position (before createRoot)                     | src/index.jsx         | MEDIUM   |
| 5.3 | Confirm unhandledrejection handler added (Sprint 1 follow-on)       | src/index.jsx:18      | MEDIUM   |

**Context for 5.1**: The audit found that `AbortError` and `BOOKING_EXPIRED` are
handled correctly. The gap is any other error type in the catch at line 187 —
network failures, malformed responses, unexpected status codes — these only
increment `consecutiveErrors` without Sentry capture. Jules adds:

```javascript
if (!(err.name === "AbortError") && err.code !== "BOOKING_EXPIRED") {
  Sentry.captureException(err, {
    extra: { context: "pix_polling", consecutiveErrors, bookingId },
  });
}
```

---

## Sprint 6 — Test coverage gaps (week 4)

**Jules task file**: `jules_sprint6_tests.md`
**Scope**: Fill unit test gaps on pages with E2E coverage only.
Priority order: admin views first (revenue impact), then legal pages.
**Estimated time**: 2–3 hours

Pages with no unit test (from audit coverage matrix):

| Priority | Page         | E2E exists | Gap       |
| -------- | ------------ | ---------- | --------- |
| 1        | ActivityView | Yes        | Unit test |
| 2        | EmailsView   | Yes        | Unit test |
| 3        | Home         | Yes        | Unit test |
| 4        | Tours        | Yes        | Unit test |
| 5        | FAQ          | Yes        | Unit test |
| 6        | Privacy      | Yes        | Unit test |
| 7        | Terms        | Yes        | Unit test |

**Jules should generate**: Shallow render tests confirming the page mounts,
critical content is present, and no console errors fire. Not snapshot tests —
behaviour assertions.

---

## Completion gates (all sprints done)

- [ ] `npx tsc --noEmit` exits 0, strict mode on
- [ ] `npx jest` exits 0, no skipped tests
- [ ] `npx vite build` exits 0, no mockData in bundle
- [ ] `grep -r "supabaseClient" src/components` → no results
- [ ] `grep -r "console.error" src/hooks/useBooking` → only inside AbortError branch
- [ ] `grep -r "dangerouslySetInnerHTML" src/` → only EmailPreviewModal, wrapped in DOMPurify
- [ ] Sentry dashboard shows events firing from payment flow in dev
- [ ] All 9 pages have at least one unit test

---

## What Jules cannot decide — your calls before Sprint 2

1. **Bypass mode strategy** (Sprint 2.1): remove entirely, secret token, or env-gated?
2. **ShieldedButton on WeatherCancel** (Sprint 2.3): same ref pattern as Pay button, or different reset trigger?
3. **Auth centralisation scope** (Sprint 4.1): should `onAuthChange` live in api.ts or a new src/auth.ts module?
