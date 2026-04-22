# Jules Task — Sprint 1: Quick Wins

## Project: Pipa Canoe Adventures — Frontend

## Prerequisite: None. All tasks are self-contained with no architectural decisions.

## Source: Jules audit findings — 5 task candidates + 2 LOW findings

Run all 7 tasks in sequence. Commit after each one passes verification.
Do not batch commits.

---

## Task 1 — Add global unhandledrejection handler

**Finding**: `src/index.jsx:18` — Sentry is initialised but async promise
rejections in PIX polling can slip through without capture.

**Change**:

- Open `src/index.jsx`
- Locate `Sentry.init({...})` — confirm it appears before `ReactDOM.createRoot`
- Immediately after `Sentry.init(...)`, add:

```javascript
window.addEventListener("unhandledrejection", (event) => {
  Sentry.captureException(event.reason, {
    extra: {
      context: "unhandled_promise_rejection",
      type: event.type,
    },
  });
});
```

- Do not move `Sentry.init` — only add the listener after it.

**Verification**: Open `src/index.jsx` and confirm the listener is present
after `Sentry.init` and before `createRoot`. Run `npx jest` — all tests pass.

**Commit**: `fix(observability): add global unhandledrejection handler to Sentry`

---

## Task 2 — Delete orphaned root artefacts

**Finding**: `./testHelper.js` and `./success_view_voucher.png` sit at repo root,
are not referenced by any source or test file.

**Change**:

- Run: `grep -r "testHelper" src/ __tests__/` — if any result appears, stop
  and report the import path instead of deleting.
- If no results: `rm testHelper.js`
- Run: `grep -r "success_view_voucher" src/ __tests__ public/` — if any result
  appears, stop and report instead of deleting.
- If no results: `rm success_view_voucher.png`
- Add to `.gitignore` (append, do not overwrite existing entries):
  ```
  # Playwright output
  playwright-report/
  test-results/
  # Root-level QA screenshots
  /*.png
  /*.jpg
  ```

**Verification**: `git status` shows both files deleted. `npx jest` passes.
`git ls-files playwright-report/ test-results/` returns empty.

**Commit**: `chore: remove orphaned root artefacts and gitignore playwright output`

---

## Task 3 — Move mockData out of production source tree

**Finding**: `src/utils/mockData.js` is in the production source tree.
Audit confirmed it is imported by `DashboardCalender.test.jsx`.

**Change**:

1. Create directory `__tests__/mocks/` if it does not exist
2. Move `src/utils/mockData.js` → `__tests__/mocks/mockData.js`
3. Find all files importing it:
   ```
   grep -r "mockData" src/ __tests__/
   ```
4. Update every import path found. The new path from `__tests__/` files is:
   `./mocks/mockData` or `../mocks/mockData` depending on depth.
5. Confirm no import of mockData remains in `src/`:
   ```
   grep -r "mockData" src/
   ```
   This must return empty.
6. Run `npx vite build` — confirm build succeeds and mockData does not appear
   in the output bundle.

**Verification**: `grep -r "mockData" src/` → empty. `npx vite build` → exits 0.
`npx jest` → exits 0.

**Commit**: `fix(build): move mockData out of production source tree`

---

## Task 4 — Add Sentry capture to clipboard failure in PaymentView

**Finding**: `src/components/booking/PaymentView.jsx:31-34` — clipboard copy
failure is caught but only calls `console.error` and a generic alert.
No telemetry on how often mobile users fail to copy the PIX key.

**Change**:

- Open `src/components/booking/PaymentView.jsx`
- Find `handleCopyPix` (or equivalent clipboard handler around line 31)
- The current catch looks approximately like:
  ```javascript
  } catch (err) {
    console.error('Failed to copy', err);
    alert('...');
  }
  ```
- Replace with:
  ```javascript
  } catch (err) {
    console.error('Failed to copy PIX key', err);
    Sentry.captureException(err, {
      extra: {
        context: 'pix_clipboard_copy',
        userAgent: navigator.userAgent,
        isSecureContext: window.isSecureContext,
      },
    });
    alert('...');   // keep existing user-facing message unchanged
  }
  ```
- Confirm `Sentry` is already imported at the top of the file. If not, add:
  `import * as Sentry from '@sentry/react';`

**Verification**: `npx jest --testPathPattern=PaymentView` passes.

**Commit**: `fix(observability): capture clipboard failures to Sentry in PaymentView`

---

## Task 5 — Fix BookingStatusResponseSchema to match bypass implementation

**Finding**: `src/api/schemas.ts:86-89` — the schema only defines `status`
and `is_confirmed`, but the bypass mode in `getBookingStatus` returns an
object that also includes `uuid` and `guest_email`, causing a type mismatch.

**Change**:

- Open `src/api/schemas.ts`
- Find `BookingStatusResponseSchema` (around line 86)
- Current definition approximately:
  ```typescript
  export const BookingStatusResponseSchema = z.object({
    status: z.string(),
    is_confirmed: z.boolean(),
  });
  ```
- Add optional fields:
  ```typescript
  export const BookingStatusResponseSchema = z.object({
    status: z.string(),
    is_confirmed: z.boolean(),
    uuid: z.string().uuid().optional(),
    guest_email: z.string().email().optional(),
  });
  ```
- Re-export the inferred type if a `BookingStatusResponse` type alias exists —
  update it to reflect the new fields.

**Verification**: `npx tsc --noEmit` passes. `npx jest --testPathPattern=api_schemas`
passes.

**Commit**: `fix(types): add uuid and guest_email to BookingStatusResponseSchema`

---

## Task 6 — Standardise E2E spec extensions to .ts

**Finding**: `tests/e2e/` — mix of `.js`, `.mjs`, `.ts` written by different
authors at different times.

**Change**:

1. Open `playwright.config.mjs` — check the `testMatch` or `testDir` glob pattern.
   Record which extensions it currently picks up.
2. Rename all `.js` and `.mjs` spec files to `.ts`:
   - `booking-flow.spec.js` → `booking-flow.spec.ts`
   - `admin.spec.mjs` → `admin.spec.ts`
   - `auth.setup.mjs` → `auth.setup.ts`
   - `booking.spec.mjs` → `booking.spec.ts`
   - `resilience.spec.mjs` → `resilience.spec.ts`
   - `payment.spec.mjs` → `payment.spec.ts`
   - `workflow.spec.mjs` → `workflow.spec.ts`
3. Update `playwright.config.mjs` `testMatch` glob to `**/*.spec.ts` and
   `setup` glob for `auth.setup.ts` if it references the old extension.
4. Do not change any test logic — rename only.

**Verification**: `npx playwright test --list` shows all 15 specs listed
with no missing files. Do not run the full suite — listing is sufficient.

**Commit**: `chore(e2e): standardise all Playwright specs to .spec.ts`

---

## Task 7 — Harden \_redirects against sensitive file exposure

**Finding**: `public/_redirects:1` — the SPA catch-all `/* /index.html 200`
is correct but has no explicit block rules above it. If a `.env` file
were accidentally added to `public/`, it would be served.

**Change**:

- Open `public/_redirects`
- Add explicit block rules BEFORE the existing catch-all:

  ```
  # Block sensitive file patterns
  /.env*          /index.html  404
  /.env           /index.html  404
  /*.env.*        /index.html  404
  /config.js      /index.html  404

  # SPA catch-all (must remain last)
  /*              /index.html  200
  ```

- Do not remove or modify the existing catch-all — only prepend the block rules.

**Verification**: File saved. Confirm the catch-all is still the last line.

**Commit**: `fix(security): add sensitive file block rules to _redirects`

---

## Sprint 1 completion checklist

Jules confirms all of the following before closing:

- [ ] `npx jest` exits 0 — no failures, no skipped tests
- [ ] `npx vite build` exits 0 — no mockData in bundle output
- [ ] `grep -r "mockData" src/` → returns empty
- [ ] `grep -r "testHelper" src/ __tests__/` → returns empty (or was found and reported)
- [ ] `git log --oneline -7` shows all 7 commits present
- [ ] `public/_redirects` has block rules before the catch-all
- [ ] `src/index.jsx` has unhandledrejection listener after Sentry.init
- [ ] `src/api/schemas.ts` BookingStatusResponseSchema includes uuid and guest_email
