# Senior Frontend Architectural Audit - Sprint 01

## 1. Executive Summary
This audit focuses on identifying reliability gaps, UX risks, and architectural smells within the "Money Loop" (Booking -> Payment -> Confirmation flow). The goal is to harden the frontend for production readiness.

## 2. High Priority Risks

### 2.1 The Double-Submit Problem (Money Loop)
- **Finding**: While `BookingSystem.jsx` uses `bookingTourId` to disable the submit button, it doesn't implement a global debouncing or "Shielded Button" pattern.
- **Risk**: Rapid clicks or network latency could allow multiple booking requests to be fired before the state updates, leading to duplicate charges or overbooked tours.
- **Recommendation**: Implement a `ShieldedButton` component with built-in debouncing and visual "Processing" state.

### 2.2 The Masked Error Problem
- **Finding**: `api.js` catches errors and often returns generic messages like `error.message` or `t("alertError")`. It doesn't distinguish between "Safe" backend errors (e.g., `PaymentInitiationError`) and systemic failures.
- **Risk**: Users receive unhelpful feedback when actionable errors occur, leading to abandonment. Systemic errors might not be clearly distinguished from user-driven errors.
- **Recommendation**: Standardize the `apiClient` to parse structured backend errors and pass through "Safe" messages. Implement a Global Toast system for systemic errors.

### 2.3 Lack of Automated Quality Gates
- **Finding**: No `.eslintrc.json` or `.prettierrc` exists. CI exists for Playwright but doesn't enforce linting or unit tests.
- **Risk**: Inconsistent code quality and potential "spaghetti code" introduction.
- **Recommendation**: Initialize ESLint/Prettier and set up a blocking CI gate (Ticket #FE-CI).

## 3. Medium Priority Risks

### 3.1 Contract Fragility (Data Flow)
- **Finding**: The UI directly consumes API responses without validation.
- **Risk**: Changes in the backend response format can cause the frontend to crash with "cannot read property of undefined" errors.
- **Recommendation**: Introduce Zod schemas at the API layer to validate and transform data, providing a "Shield" against backend changes.

### 3.2 Shadow States in Booking Flow
- **Finding**: `useBooking.js` handles polling but has potential "Shadows" during network hiccups. If `getBookingStatus` fails 5 times, `hasConnectionIssue` is set, but the UI transition might leave the user in a confusing state if not handled prominently.
- **Risk**: User confusion during intermittent connectivity.

## 4. Low Priority Risks

### 4.1 LocalStorage Persistence
- **Finding**: Pending bookings are stored in `localStorage`.
- **Risk**: While useful for recovery, it could lead to stale data if not properly cleared or if the browser environment is shared.
- **Recommendation**: Implement expiration for persisted booking metadata.
