# MA-TASK-002 — Checkpoint types + load/save

| Field | Value |
|-------|-------|
| Task ID | `MA-TASK-002` |
| Title | Checkpoint types + load/save helpers (no values) |
| owner_layer | `apps/workflow-worker` portal-fill / portal-core types + status client persist hooks |
| depends_on | MA-TASK-001 |
| Phase | A |
| Status | **DONE** (arch OKAY + code OKAY, 2026-11-14) |
| REQ/NFR | REQ-015–017, CON-003, NFR-002 |
| sensitive_paths | None beyond task columns |

## Acceptance criteria

- Dedicated `*.types.ts` for checkpoint bag (`lastCompletedStep`, location/visa ids, `fieldProgress` filled/skipped/failed ids+reason codes, applicantId, optional `memberBranch`).
- Dedicated constants for step keys matching agent brief §2.
- Load/save utils update `bls_workflow_tasks.portal_status` + `portal_checkpoint_json` without logging values.
- Mirror register field-progress semantics (summarize counts ok).

## verification_commands

```bash
cd apps/workflow-worker && npm run lint && npm run build
cd apps/api && npm run lint && npm run build
```

## IMPLEMENTATION AGENT PROMPT

Add checkpoint types/constants/utils as **separate files**. Wire status client / pipeline to load prior checkpoint at start and save after transitions. Never persist raw PII. Reuse register progress shape ideas without coupling STATUS SoT to `portal_autofill_runs`.
