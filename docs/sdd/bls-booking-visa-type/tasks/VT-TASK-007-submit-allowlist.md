# VT-TASK-007 — VisaType Submit + classifier allowlist

| Field | Value |
|-------|-------|
| Task ID | `VT-TASK-007` |
| Title | Automate `#btnSubmit` / `OnSubmitVisaType`; allowlist in classifier |
| owner_layer | `apps/workflow-worker` portal-fill + bls-workflow (+ api classifier mirror) |
| depends_on | VT-TASK-006, **Human DEC-001** |
| Phase | B |
| Status | **DONE** |
| REQ/NFR | REQ-012, REQ-019, CON-005, CON-004 |
| sensitive_paths | CON-006 policy revision; Premium/payment still forbidden |

## Acceptance criteria

- After form ready, click `#btnSubmit` / invoke documented Submit path (`OnSubmitVisaType`).
- `classifyPortalBookingUnsafeAction` (worker + api mirror if present): **remove** Submit / `on_submit_visa_type` from unsafe set; keep `premium_lounge_accept` + `payment_confirm` as `NOT_SAFE_TO_REPEAT`.
- Forbid cues for Premium/payment remain for detection.
- Checkpoint `SUBMITTED` after successful click initiation (or verified navigation start).
- **Stop** implementation if DEC-001 still `_pending_` in `04-plan.md` §7.

## verification_commands

```bash
cd apps/workflow-worker && npm run lint && npm run build
cd apps/api && npm run lint && npm run build
```

## IMPLEMENTATION AGENT PROMPT

Implement VisaType Submit automation per DEC-001 / CON-005. Update unsafe classifier allowlist. Evolve `runPortalBookingSafeStopPipeline` into continue pipeline (rename OK if callers updated). **Never** Premium Accept / payment. Document policy supersession in code comments pointing to this feature DEC — do not rewrite closed TASK-012 DONE doc.
