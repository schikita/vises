# VT-TASK-006 — Wire email consent before booking entry

| Field | Value |
|-------|-------|
| Task ID | `VT-TASK-006` |
| Title | BOOK client: DP consent gate then booking UI open/fill |
| owner_layer | `apps/workflow-worker` bls-clients/booking + portal-fill |
| depends_on | VT-TASK-003, VT-TASK-005 |
| Phase | A |
| Status | DONE |
| REQ/NFR | REQ-001…REQ-009, DEC-002 |
| sensitive_paths | Mail retain; never disagree CTA |

## Acceptance criteria

- Booking continue pipeline order: Ready gate → email DP consent → persist consent checkpoint → `clickPortalBookNewAppointment` → wait UI → Attention → fill.
- Uses vaulted retained mailbox credentials (TASK-006); no second mail stack.
- Opens consent href (tracking redirect OK); does not click disagree.
- Never doorstep.
- Still does **not** Submit until VT-TASK-007 (safe interim: stop after fill if DEC-001 pending).

## verification_commands

```bash
cd apps/workflow-worker && npm run lint && npm run build
```

## IMPLEMENTATION AGENT PROMPT

Wire VT-TASK-003 extractors into `BlsBookingClientService` / booking fill pipeline **before** booking entry. Persist `EMAIL_CONSENT_DONE`. Compose Attention + extended fill from VT-TASK-004/005. Domain client ≠ orchestrator. No secrets in logs. Do not Submit until DEC-001 / VT-TASK-007.
