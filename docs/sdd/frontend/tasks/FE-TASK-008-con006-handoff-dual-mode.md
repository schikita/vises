# FE-TASK-008 — CON-006 handoff + dual-mode Autofill copy

| Field | Value |
|-------|-------|
| Task ID | `FE-TASK-008` |
| Title | AWAITING_STAFF_BOOKING handoff banner + dual-mode primacy copy |
| Status | **TODO** |
| Feature | `bls-workflow-frontend` |
| REQ/NFR | REQ-013, REQ-014, CON-006, CON-008, CON-009, NFR-001 |
| DEC | DEC-002, DEC-005 |
| Prerequisites | FE-TASK-005 (soft: panel composition) |
| Dependents | FE-TASK-009 |
| Files | `BlsWorkflowBookingHandoffRender.tsx`, panel copy constants, `ApplicationDetailRender.tsx` secondary heading |

## Goal

Distinct success/handoff UX for `AWAITING_STAFF_BOOKING` using DEC-005 Russian copy; clarify workflow primary vs RegisterUser secondary on Автозаполнение tab without removing legacy widget.

## Acceptance criteria

- Banner appears only for `AWAITING_STAFF_BOOKING`.
- Copy matches DEC-005 intent (manual booking finish; not full automation).
- Success-oriented styling (not failure-red alone).
- Poll already stopped via terminal helper (do not restart).
- Dual-mode: workflow panel remains above; secondary RU heading for legacy evidence section.
- Primacy hint near workflow header.
- Lint + build PASS.

## Verification

- Copy review against DEC-005.
- `cd web && npm run lint && npm run build`

## IMPLEMENTATION AGENT PROMPT

```text
You are the implementer for bls-workflow-frontend FE-TASK-008.

Read:
- REQ-013, REQ-014, CON-006
- docs/sdd/frontend/01-target-ux.md DEC-002, DEC-005 (exact RU handoff copy)

Add BlsWorkflowBookingHandoffRender; wire into panel when status is AWAITING_STAFF_BOOKING.
Extend panel + application-detail autofill tab copy for dual-mode primacy (workflow primary, RegisterUser diagnostic).
Do NOT remove PortalAutofillEvidenceSection.
Do NOT claim booking is fully automated.

Validate: cd web && npm run lint && npm run build
```

## Test notes

Lint + build. Manual or mocked terminal snapshot preferred.
