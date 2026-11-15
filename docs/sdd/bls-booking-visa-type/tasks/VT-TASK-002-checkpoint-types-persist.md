# VT-TASK-002 — Checkpoint types + load/save

| Field | Value |
|-------|-------|
| Task ID | `VT-TASK-002` |
| Title | Booking continue checkpoint types + persist helpers |
| owner_layer | `apps/workflow-worker` portal-fill / bls-workflow types |
| depends_on | VT-TASK-001 |
| Phase | A |
| Status | **DONE** |
| REQ/NFR | REQ-006, REQ-018, NFR-002, NFR-003 |
| sensitive_paths | Checkpoint must not hold secrets |

## Acceptance criteria

- Dedicated `*.types.ts` for booking checkpoint shape (`lastCompletedStep`, `dataProtectionConsentDone`, optional `dataProtectionMessageId`, fieldProgress, lastOutcome, stuckCode).
- Load/save helpers in `*.utils.ts` (or existing checkpoint module pattern); no values of form fields.
- Constants for step ids in `*.constants.ts`.

## verification_commands

```bash
cd apps/workflow-worker && npm run lint && npm run build
```

## Implementation notes

**Outcome: DONE** — booking checkpoint types/constants/utils mirrored from MA `portal-status-checkpoint` pattern under `portal-fill`.

### Delivered

| Concern | Path |
|---------|------|
| Step ids | `constants/portal-booking-checkpoint-step.constants.ts` |
| Outcomes | `constants/portal-booking-checkpoint-outcome.constants.ts` |
| Stuck codes | `constants/portal-booking-checkpoint-stuck-code.constants.ts` |
| Field progress status | `constants/portal-booking-field-progress-status.constants.ts` |
| Types | `types/portal-booking-checkpoint.types.ts` |
| Load/save + parse/serialize/merge | `utils/load-portal-booking-checkpoint.util.ts`, `save-…`, `parse-…`, `serialize-…`, `merge-…`, `create-initial-…`, `format-…-log-summary.util.ts` |

Allowlisted serialize/parse — no email HTML, consent `data=` tokens, or CRM field values. Reuses Option A columns (`portal_checkpoint_json`).

### Commands

| Command | Result |
|---------|--------|
| `cd apps/workflow-worker && npm run lint` | PASS (noop exit 0) |
| `cd apps/workflow-worker && npm run build` | PASS |

## IMPLEMENTATION AGENT PROMPT

Add booking-continue checkpoint types and persist helpers per `02-database.md` shape. One concern per file. Never persist email HTML, consent `data=` tokens, or CRM field values. Align naming with MA checkpoint patterns if present.
