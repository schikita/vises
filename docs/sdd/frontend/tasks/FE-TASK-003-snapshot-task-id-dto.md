# FE-TASK-003 — Snapshot task id + maxAttempts DTO

| Field | Value |
|-------|-------|
| Task ID | `FE-TASK-003` |
| Title | Expose `tasks[].id` and `maxAttempts` on snapshot (scoped backend + SPA types) |
| Status | **TODO** |
| Feature | `bls-workflow-frontend` |
| REQ/NFR | REQ-010, CON-003 |
| DEC | DEC-003 |
| Prerequisites | None (parallel) |
| Dependents | FE-TASK-006 |
| Files | `backend/src/modules/portal-scrape/types/bls-workflow-api.types.ts`, snapshot mapper/service, `web/src/entities/bls-workflow/types/bls-workflow.types.ts`; optional note in `docs/sdd/03-workflow-api.md` |

## Goal

Additive DTO fields so SPA can send `retry` body `{ taskId }` and show attempt budget — **no greenfield API**.

## Acceptance criteria

- Backend `BlsWorkflowTaskOut` includes `id: string` and `maxAttempts: number`.
- Snapshot builder populates both from persisted task rows / policy constant (no secrets).
- SPA `BlsWorkflowTask` mirrors fields (required after this task ships together).
- Existing clients that ignore new fields remain valid (additive JSON).
- `cd backend && npm run build` PASS; `cd web && npm run lint && npm run build` PASS if SPA types updated.

## Verification

- Backend build.
- Spot-check GET snapshot JSON includes task ids.
- Confirm retry endpoint still accepts `taskId`.

## IMPLEMENTATION AGENT PROMPT

```text
You are the implementer for bls-workflow-frontend FE-TASK-003 (DEC-003).

Read:
- specs/features/bls-workflow-frontend/02-spec.md REQ-010, CON-003
- docs/sdd/frontend/01-target-ux.md DEC-003
- docs/sdd/frontend/02-api-contract-mapping.md §4
- docs/sdd/03-workflow-api.md §2.2
- backend portal-scrape bls-workflow snapshot mapping + BlsWorkflowTaskOut
- web entities bls-workflow.types.ts

Scope (ONLY):
1. Add id + maxAttempts to backend task snapshot DTO and mapping
2. Mirror on SPA BlsWorkflowTask type
3. Optionally update docs/sdd/03-workflow-api.md snapshot shape note (additive)

Do NOT:
- Redesign runner / vault / new endpoints
- Implement targeted retry UI (FE-TASK-006)
- Add WS

Validate:
- cd backend && npm run build
- cd web && npm run lint && npm run build
```

## Test notes

Backend build + web lint/build. Manual GET snapshot when API available.
