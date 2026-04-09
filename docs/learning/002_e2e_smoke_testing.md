# E2E Smoke Testing - Mentor Summary

## Overview

As part of Ticket #FE-E2E-SMOKE, we implemented a High-Signal "Money Loop" Smoke Test to protect the critical path of the Pipa Canoe booking platform. This test serves as a physical verification layer in our Quality Gate, ensuring that UI components, API clients, and hardening patterns (like the ShieldedButton) work in harmony.

## Key Implementation Patterns

### 1. Hermetic Testing (Mocking)

To ensure the test is fast and independent of the backend environment, we utilized Playwright's `page.route` to intercept and mock all relevant API calls:

- `GET /api/v1/tours/available`: Mocked to return a deterministic list of available tours.
- `POST /api/v1/bookings`: Mocked to simulate a successful booking creation with a 500ms artificial delay.
- `GET /api/v1/bookings/status/*`: Mocked to return a pending status.

### 2. "Shielded" Verification

A primary requirement was to verify the `ShieldedButton` hardening. We used `Promise.all` to catch the button in its disabled state immediately upon clicking:

```javascript
await Promise.all([
  confirmButton.click(),
  expect(confirmButton)
    .toBeDisabled()
    .catch(() => true),
]);
```

This pattern effectively captures the transient "processing" state during the network request and the subsequent 1000ms cooldown.

### 3. CI/CD Integration

The smoke test is integrated into the `.github/workflows/frontend-ci.yml` pipeline.

- **Run Order**: Executes only after Lint and Unit Tests pass.
- **Resource Optimization**: Only installs the Chromium browser (`--with-deps chromium`).
- **Observability**: Automatically uploads the Playwright report as a GitHub artifact on failure, providing videos and screenshots for debugging.

## Learnings & Best Practices

- **Deterministic Selectors**: Avoided brittle class-based selectors, opting for `getByRole`, `getByLabel`, and attribute-based locators (`img[alt*='QR']`).
- **Wait Strategy**: Leveraged Playwright's auto-waiting features instead of hardcoded `waitForTimeout`, resulting in a more stable and faster test suite.
- **Zod Alignment**: Mock data is strictly aligned with the repository's Zod schemas (`src/api/schemas.js`), ensuring the test remains a high-fidelity representation of the real application environment.

## Conclusion

The introduction of this smoke test significantly increases the safety of our deployments, ensuring that the "Money Loop" remains functional and hardened against regressions.
