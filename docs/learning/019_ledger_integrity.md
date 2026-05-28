# Learning Series 019: Ledger Integrity & The Ghost Passenger Problem

### 1. The Operational "Source of Truth"

In an adventure business, the 'Manifest' is a legal and operational document. Including people who haven't paid creates 'Ghost Passengers'—wasting seats and confusing the guide at the shoreline.

- **The Shield:** We strictly separate 'Operational Data' (Confirmed) from 'Intent Data' (Pending).

### 2. Dynamic vs. Static Inventory

- **Static Counter (`seats_booked`):** This is the ledger. It only changes when a financial transaction is finalized.
- **Dynamic Check (`effective_booked`):** This is a temporal calculation. It looks at the Ledger + recent Pending holds.
  By calculating availability dynamically in the RPC, we prevent overbooking without cluttering our permanent tables with unverified data.

### 3. High-Signal Notifications

Eduardo's manifest email should be an 'Actionable Order'. If 10 people intend to pay but 0 have paid, the guide should stay home. Hardening the trigger ensures the system only alerts the business when there is verified revenue to fulfill.
