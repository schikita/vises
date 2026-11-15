# VT-TASK-009 — Slots unavailable + Try Again

| Field | Value |
|-------|-------|
| Task ID | `VT-TASK-009` |
| Title | Detect slots-unavailable banner; Try Again recovery |
| owner_layer | `apps/workflow-worker` portal-fill + bls-clients/booking |
| depends_on | VT-TASK-008 |
| Phase | B |
| Status | **DONE** |
| REQ/NFR | REQ-014, REQ-015, NFR-001, DEC-008 |
| sensitive_paths | Avoid portal hammering — backoff |

## Acceptance criteria

- Detector for exact text `Appointment slots are not available` (materials `5.jpg` / `slots-not-available.html`).
- First-class outcome `SLOTS_UNAVAILABLE` + stuck code `BOOK_SLOTS_UNAVAILABLE`.
- Click Try Again (`a.btn.btn-primary` text `Try Again` → `newappointment`) then `waitForPortalBookingSelectionUi`.
- Classify `SAFE_TO_REPEAT` with backoff; respect maxAttempts; staff after exhaustion (OQ-002 default).
- Inherit durable-bls retry budgets (**NFR-001**: max 5 auto attempts; exponential backoff 5s…cap 300s) unless OQ-002 overrides.
- Do **not** invent calendar success path.

## verification_commands

```bash
cd apps/workflow-worker && npm run lint && npm run build
```

## IMPLEMENTATION AGENT PROMPT

Implement slots-unavailable branch per brief §1.6 / flow Step 9. Constants for banner text + Try Again. Persist checkpoint. SAFE_TO_REPEAT + backoff. No calendar invention. Prefer text wait over brittle CSS alone.
