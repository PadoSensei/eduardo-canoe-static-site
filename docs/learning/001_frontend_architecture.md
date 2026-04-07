# Frontend Architecture & Data Flow

## Current Data Flow

1. **UI Layer**: React components (`BookingSystem`, `BookingForm`) capture user input.
2. **Hook Layer**: `useBooking` manages the complex polling state for payment confirmation.
3. **API Layer**: `api.js` uses `fetch` to communicate with the backend via a centralized `API_BASE_URL`.
4. **Backend**: Processes requests and returns structured JSON responses.

## The "Shield" Architecture

To harden our architecture, we are moving towards a "Shielded" approach:

### 1. API Shields (Zod)

We will introduce Zod schemas for every API endpoint.

- **Validation**: Ensure the backend response matches our expectations.
- **Transformation**: Map backend's snake_case to frontend's camelCase consistently.
- **Fail-Fast**: If the contract is broken, the API layer will throw a clear error before it reaches the UI components.

### 2. UI Shields (Shielded Button)

A standardized component for actions that trigger network requests.

- **Debouncing**: Prevent multiple clicks within a short window.
- **Loading State**: Automatically show a spinner and "Processing..." text.
- **Disabled State**: Lock the button while `isSubmitting` is true.

### 3. Error Shields (Centralized Handling)

Standardized error mapping:

- **Client Error (4xx)**: Map to user-friendly "Safe" messages.
- **Server Error (5xx)**: Map to a generic "Systemic" error toast.
- **Network Error**: Trigger a "Connection Issue" alert.
