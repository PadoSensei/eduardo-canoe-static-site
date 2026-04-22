# Master Functional Guide: Pipa Canoa Havaiana

This guide provides a comprehensive overview of the Pipa Canoa Havaiana booking system, detailing the guest experience, administrative controls, and system resilience.

---

## 1. The Guest Booking Flow

The guest booking flow is designed to be a "frictionless loop," ensuring guests can safely and quickly secure their seats on the water.

### 1.1 Validation Rules

To ensure data integrity and prevent errors, the booking form enforces the following rules:

- **Number of Guests:** Constrained between 1 and the remaining capacity of the tour instance.
- **Guest Name:** Required field.
- **Guest Email:** Required field; must follow standard email format (validated via HTML5 `type="email"` and Zod schema).
- **Accepted Terms:** Guests must click the checkbox confirming they have read the Terms and Privacy Policy before the "Confirm" button is enabled.

_Tech Note: Ref: `src/components/booking/BookingForm.jsx` and `src/api/schemas.ts` (BookingSchema)._

### 1.2 Inventory Display

The system dynamically updates tour availability:

- **Available:** Tours with `is_bookable: true` and `seats_available > 0` are shown in the selection list.
- **Sold Out:** If a tour reaches capacity, it is automatically removed from the public "Bookable" list or marked as unavailable.
- **Closed:** Tours can be marked as "Closed" or "Cancelled" in the Admin Suite, which immediately prevents further bookings.

_Tech Note: Ref: `src/components/BookingSystem.tsx` (renderTourList logic)._

### 1.3 Success View (The Digital Voucher)

Once payment is confirmed, guests receive a digital voucher:

- **Visual Identity:** Features an emerald-themed "Ticket" design with a monospaced 8-character Display ID (e.g., `#PC-A1B2`).
- **Functionality:** Includes a one-click "Copy ID" button and a direct link to the meeting point at "Escadaria do Pôr do Sol."
- **Persistence Note:** The success page is the final step of the session. If a guest refreshes the page _after_ this view appears, the local session is cleared for security. Guests are encouraged to copy their ID or check their email for the automated confirmation.

_Tech Note: Ref: `src/components/booking/SuccessView.jsx`._

---

## 2. The Admin Command Center (Eduardo’s Cockpit)

The Admin Suite is Eduardo's primary tool for managing daily operations and system monitoring.

### 2.1 The Emerald Manifest

Named for its high-contrast emerald theme, the manifest is the source of truth for the day's headcount.

- **Persistent Check-in:** When Eduardo checks a guest in on his phone, the status is immediately synced to the backend. This means his laptop or any other device will reflect the change instantly.
- **Live Headcount:** A sticky top bar displays the "Boarding Status" (e.g., 8 / 12 on board) and a percentage completion.
- **Manual Bookings:** Eduardo can add guests manually (e.g., walk-ins) directly from the manifest view.

_Tech Note: Ref: `src/components/dashboard/DayManifest.jsx` and `patchCheckIn` in `src/api.ts`._

### 2.2 Activity Feed (System Notifications)

The "Notifications" tab provides a live audit trail of everything happening in the system.

- **Server-Side Filters:** Eduardo can filter the feed by:
  - **Payments:** Confirmations and Pix events.
  - **Communications:** Emails sent to guests or admins.
  - **Bookings:** New reservations and cancellations.
  - **System:** Technical logs and setting changes.
- **Search:** A 500ms debounced search allows finding specific guests by name or Display ID.
- **Polling:** The feed refreshes automatically every 30 seconds to provide "Live Monitoring."

_Tech Note: Ref: `src/pages/admin/ActivityView.tsx`._

### 2.3 Notification Switchboard

The "E-mails" tab allows Eduardo to control the automated communication engine.

- **Instant Toggles:** Eduardo can turn the following emails on/off instantly:
  - **Guest Facing:** Confirmation Ticket, 24h Reminder, Weather Cancellation, and Review Request.
  - **Internal (Admin):** New Booking Notification, Daily Manifest (Morning), Refund List, and Monthly Summary.
- **Time Controls:** For scheduled emails (like the 24h reminder), Eduardo can adjust the exact time they are sent.

_Tech Note: Ref: `src/pages/admin/EmailsView.tsx`._

---

## 3. Recovery & Edge Cases

The system is "Hardened" to handle the realities of mobile internet and interrupted payments.

### 3.1 15-Minute Recovery Loop

If a guest accidentally closes their browser or loses connection while the Pix QR code is on screen:

- **Persistence:** The system stores the pending booking in the browser's `localStorage`.
- **Return to Pay:** If the guest returns to the site within 15 minutes, the system will automatically "Recover" the session and show the QR code again.
- **Seat Release:** After 15 minutes, if no payment is detected, the backend "Reaper" releases the seats, and the frontend will inform the guest that the session has expired.

_Tech Note: Ref: `src/hooks/useBooking.js`._

### 3.2 Payment Failure UX

If something goes wrong during the "Money Loop":

- **Bank Rejection:** If the Woovi API reports a failed transaction, the guest sees a clear "Payment Failed" screen.
- **System Timeout:** If the polling takes too long (over 15 minutes), the guest is prompted to contact support via a direct email link.
- **API Downtime:** If the backend is unreachable, a "Connection Issue" warning pulses on the screen, but the guest can stay on the page until the connection recovers.

_Tech Note: Ref: `src/components/booking/PaymentView.jsx`._

### 3.3 Mobile-First Design (High-Contrast)

The Admin Manifest is designed for the shoreline:

- **Sunlight Readability:** Uses high-contrast Emerald-900 text on Emerald-50 backgrounds.
- **Fat-Finger Friendly:** Check-in toggles are large, circular buttons that are easy to tap while holding a paddle or moving on sand.

---

## 4. Content & Compliance

### 4.1 Legal & Privacy

Current versions of legal documents (located in the footer):

- **Terms & Conditions (v1.0):** Defines the 24-hour cancellation window and the safety-first policy for weather.
- **Privacy Policy (v1.0):** LGPD-compliant. Data (Name/Email) is collected solely for contract execution and stored securely in Supabase.

### 4.2 Display IDs (The Professional Touch)

The 8-character alphanumeric IDs (e.g., `PC-A1B2`) are generated by the backend to ensure uniqueness.

- **Logic:** These IDs avoid confusing characters (like '0' vs 'O') where possible and serve as the primary reference for Eduardo when a guest arrives at the lagoon.

---

## 5. Daily Operations Summary

### Morning: The Emerald Manifest

1. Log into the Admin Suite.
2. Select today's date on the Calendar.
3. Review the "Emerald Manifest" for the total headcount and special notes.

### Midday: Automated Manifest

- If enabled in the Switchboard, Eduardo receives a PDF/List of the next day's passengers automatically via email.

### Incidents: Weather Cancellation

1. Go to the Manifest for the affected date.
2. Click the **"Cancel"** icon on the tour card.
3. **Confirm** in the modal.
   - _Result:_ The system stops new bookings, notifies all guests via email (if enabled), and logs the event in the Activity Feed.

### Verification: The Audit Feed

- If a guest claims they didn't receive an email, Eduardo can check the **Activity Feed**, filter by "Communications," and find the specific "Email Sent" log for that guest's Display ID.
