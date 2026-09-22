# TASK-012 — Booking safe stop (CON-006)

| Field | Value |
|-------|-------|
| Task ID | `TASK-012` |
| Title | Booking UI open + CON-006 stop |
| Status | **DONE** |
| REQ/NFR | REQ-020, REQ-030, CON-006 |
| DEC | DEC-010, DEC-011 |
| Prerequisites | TASK-011 |
| Dependents | TASK-018 |
| Completed | 2026-09-22 |

## Files / modules

- `bls-clients/booking/bls-booking-client.service.ts` (live; stub deprecated)
- `portal-booking-fill.service.ts`
- `utils/run-portal-booking-safe-stop-pipeline.util.ts` (+ click / wait / prefill / CON-006 classify)
- `constants/portal-booking.constants.ts`, `types/portal-booking.types.ts`
- Fixtures: `ready_book_status.html`, `slect_location_visa_type.html`, `book_new_appointment.html`

## Acceptance criteria

- Opens booking / location-visa selection UI when ready.
- Should prefill unambiguous CRM fields; if ambiguous → stop for staff (no guessing).
- **Must not** automate Premium Lounge Accept, payment, or VisaType `#btnSubmit` / `OnSubmitVisaType`.
- Workflow terminal success status: **`AWAITING_STAFF_BOOKING`**.
- Advancing past VisaType submit classified `NOT_SAFE_TO_REPEAT` if ever attempted incorrectly.

## Verification criteria

- `npm run build` in `backend/` — **PASS** (2026-09-22)
- Code review against CON-006 hard stop — no click automation of Premium Lounge / payConfirm / OnSubmitVisaType / VisaType `#btnSubmit` (names appear only as forbid cues / comments)

## IMPLEMENTATION AGENT PROMPT

Implement **BOOK** safe-stop client for `durable-bls-workflow` (REQ-020 / CON-006 / DEC-010 / DEC-011).

Constraints:
- Stop once booking selection UI reachable and optionally filled — **before** VisaType submit.
- Never click payment / Premium Lounge accept.
- Terminal status `AWAITING_STAFF_BOOKING` (not inventing full COMPLETED booking).
- Fixture spellings: `slect_location_visa_type.html`, etc.
- Domain client ≠ orchestrator; no secrets in logs.
- types/constants/utils rules.

Deliver: BOOK reaches staff takeover terminal safely; backend build green.
