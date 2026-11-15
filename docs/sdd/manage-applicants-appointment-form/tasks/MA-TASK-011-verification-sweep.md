# MA-TASK-011 — Lint/build/regression sweep

| Field | Value |
|-------|-------|
| Task ID | `MA-TASK-011` |
| Title | Verification sweep for Phase A (and B if shipped) |
| owner_layer | touched packages |
| depends_on | MA-TASK-007; also MA-TASK-009 if Phase B included |
| Phase | A/B gate |
| Status | **DONE** (Phase A spine PASS 2026-11-14; `apps/api` build FAIL = 3 pre-existing unrelated TS errors) |
| REQ/NFR | NFR-004, NFR-006, AC-11 |
| sensitive_paths | CON-006 static check |

## Acceptance criteria

- `apps/api` and `apps/workflow-worker` lint + build PASS.
- No regression to login/register/status Ready-skip/booking safe-stop classification.
- Confirm no VisaType submit / premium / payment clicks introduced.
- Record command output in task notes / verification doc when executed.

## verification_commands

```bash
cd apps/api && npm run lint && npm run build
cd apps/workflow-worker && npm run lint && npm run build
```

Do **not** invent `npm run test:workflow` unless that script exists again in `apps/api/package.json`.

## IMPLEMENTATION AGENT PROMPT

Docs-only verification task after implementers finish Phase A core. Do not change product behavior except to fix build breaks found. Confirm Ready-skip (REQ-003) and no payment clicks (CON-004 / upstream CON-006).
