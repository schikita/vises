# MA-TASK-007 — Resume + MA_* error matrix

| Field | Value |
|-------|-------|
| Task ID | `MA-TASK-007` |
| Title | Resume entry from checkpoint + stuck/error code alignment |
| owner_layer | `apps/workflow-worker` portal-fill + bls-clients/status |
| depends_on | MA-TASK-006 |
| Phase | A |
| Status | **DONE** (arch OKAY cycle 2 + code OKAY, 2026-11-14) |
| REQ/NFR | REQ-004, REQ-017, REQ-028, NFR-001, spec §9 |
| sensitive_paths | Error codes / events payload_safe |

## Acceptance criteria

- On retry, choose resume entry from `lastCompletedStep` + live scrape preference (spec §5/§9).
- Skip completed `fieldProgress` sections when re-entering FORM_FILLING.
- Map failures to SAFE/VERIFY/NOT_SAFE; max 5 + backoff unchanged.
- Prefer existing `bls_status_*`; add proposed `MA_*` codes from stuck contract only where missing.
- Emit safe events / task lastError* without PII values.
- UNKNOWN never success.

## verification_commands

```bash
cd apps/workflow-worker && npm run lint && npm run build
```

## IMPLEMENTATION AGENT PROMPT

Align with `stuck_state_db_contract.md` and agent brief §5. Constants in dedicated files. Do not lower attempt/backoff guarantees.
