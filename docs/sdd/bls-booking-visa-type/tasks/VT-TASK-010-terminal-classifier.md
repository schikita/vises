# VT-TASK-010 — Terminal/advance + classifier finalize

| Field | Value |
|-------|-------|
| Task ID | `VT-TASK-010` |
| Title | BOOK advance/terminal policy + finalize unsafe classifier |
| owner_layer | `apps/workflow-worker` bls-workflow (+ api mirror) |
| depends_on | VT-TASK-009 |
| Phase | B |
| Status | **DONE** |
| REQ/NFR | REQ-016…019, NFR-001, CON-004, DEC-004, OQ-007 |
| sensitive_paths | Terminal cleanup timing; AWAITING_STAFF_BOOKING meaning; api classifier mirror-only (no new public DTO) |

## Acceptance criteria

- BOOK success no longer means “UI open + prefill only”.
- Unknown-next after materials-covered path → staff terminal (`AWAITING_STAFF_BOOKING` or `WAITING_STAFF` per DEC-004/OQ-007 default).
- Premium/payment surfaces → `NOT_SAFE_TO_REPEAT`; no cleanup that deletes mailbox before true terminal if consent may still be needed mid-BOOK (retain until terminal).
- Classifier finalize: Submit allowed; Premium/payment unsafe; document in worker comments referencing DEC-001.
- Events/codes for slots / consent pending remain SAFE_TO_REPEAT where specified.

## verification_commands

```bash
cd apps/workflow-worker && npm run lint && npm run build
cd apps/api && npm run lint && npm run build
```

## IMPLEMENTATION AGENT PROMPT

Update `planBlsWorkflowAdvance` / BOOK success terminal semantics per DEC-004. Finalize `classifyPortalBookingUnsafeAction` mirrors. Ensure terminal cleanup does not run on mid-booking retries. Do not invent COMPLETED calendar booking status. Keep staff SPA handoff meaningful for unknown-next.
