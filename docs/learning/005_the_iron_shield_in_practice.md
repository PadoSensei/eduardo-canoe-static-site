# Learning 005: The Iron Shield in Practice

## Context: The April 18th Mystery

During a routine data audit, we discovered that tours for April 18th were failing to render in the UI, despite the API returning a `200 OK` response. The UI simply displayed our "No tours available" empty state.

## The Diagnosis

The issue was traced back to our **Iron Shield**—the Zod validation layer in `src/api.ts`.

The backend had started sending a field named `seats_booked` instead of the expected `seats_available` for that specific date's tour instances. Because our `TourSchema` in `src/api/schemas.ts` marked `seats_available` as a required number, Zod rejected the entire array of tours when it encountered the missing field.

## The Iron Shield's Behavior

Zod's default behavior is to fail fast and hard. If a single item in an array fails validation, the entire array is typically rejected by the `.parse()` method.

**Is this a bug or a feature?**
It is a **feature**. By blocking the data, Zod prevented the UI from attempting to render tours with `undefined` or `NaN` available seats. It is far better to show a clean "No Tours" screen (a graceful fallback) than a broken page with crashing components or misleading "NaN seats left" messages.

## The Fix: Resilient Mapping

To resolve this while maintaining the integrity of our data contract, we implemented a more resilient mapping strategy:

1.  **Schema Relaxation**: We updated `TourSchema` to make both `seats_available` and `seats_booked` optional.
    ```typescript
    seats_available: z.number().optional(),
    seats_booked: z.number().optional(),
    ```
2.  **Intelligent Mapping**: In the API request wrapper (`src/api.ts`), we added logic to calculate the remaining seats if the primary field is missing.
    ```typescript
    remaining: tour.seats_available ?? Math.max(0, (tour.capacity || 10) - (tour.seats_booked || 0)),
    ```

## Key Takeaways

1.  **Fail-Safe UI**: The "No Tours" screen was the Iron Shield doing its job—protecting the user from a broken experience.
2.  **Contract Awareness**: When the backend shifts its schema (even slightly), the frontend's validation layer will catch it.
3.  **Graceful Evolution**: We can maintain safety while adding resilience by using `.optional()` and providing fallback logic during the mapping phase.

This incident reinforces why we use strict typing and validation: it turns silent, unpredictable crashes into predictable, manageable states.
