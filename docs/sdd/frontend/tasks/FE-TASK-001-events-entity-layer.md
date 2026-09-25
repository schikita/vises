# FE-TASK-001 — Events entity layer

| Field | Value |
|-------|-------|
| Task ID | `FE-TASK-001` |
| Title | Events entity types, fetch util, labels, payloadSafe allowlist |
| Status | **DONE** |
| Feature | `bls-workflow-frontend` |
| REQ/NFR | REQ-007, REQ-016, REQ-017, REQ-019, NFR-001, NFR-007 |
| DEC | DEC-001, DEC-006 |
| Prerequisites | None |
| Dependents | FE-TASK-004, FE-TASK-007 |
| Files | `web/src/entities/bls-workflow/types/*`, `constants/*`, `utils/*`, barrels |

## Goal

Add SPA entity support for `GET …/bls-workflow/:workflowId/events` so ISSUE-003 can be closed by later poll/UI tasks — **no panel UI required in this task**.

## Acceptance criteria

- Types for events response + event rows live in `types/` (not in util files).
- `fetchBlsWorkflowEvents(applicationId, workflowId, { sinceEventId, limit? })` uses `@/shared/api`.
- RU labels for known `eventType` values; unknown → raw key.
- `pickBlsWorkflowPayloadSafeDisplay` allowlists keys (at least `runId`); never dumps full object.
- Constants for default/max event limit aligned with backend (100/200).
- Barrel exports updated.
- `cd web && npm run lint` and `npm run build` PASS.

## Verification

- Lint + build in `web/`.
- Grep: no WebSocket/EventSource added.

## IMPLEMENTATION AGENT PROMPT

```text
You are the implementer for bls-workflow-frontend FE-TASK-001.

Read first (do not re-discover unless contradicted):
- specs/features/bls-workflow-frontend/02-spec.md (REQ-007, REQ-017)
- docs/sdd/frontend/01-target-ux.md (DEC-001, DEC-006)
- docs/sdd/frontend/02-api-contract-mapping.md
- docs/sdd/frontend/03-fsd-component-design.md
- docs/sdd/03-workflow-api.md §2.3
- Existing web/src/entities/bls-workflow/ patterns (one util arrow per file)

Implement ONLY the entity layer for workflow events:
1. types/bls-workflow-events.types.ts + payload-safe types
2. constants for event RU labels, payloadSafe allowlist keys, events limits
3. utils/fetch-bls-workflow-events.util.ts
4. utils/pick-bls-workflow-payload-safe-display.util.ts
5. Update barrels

Hard constraints:
- No panel/UI changes in this task
- No WS/SSE dependencies
- Never display secrets; allowlist payloadSafe
- Russian labels
- types ≠ functions in same file; one util per file; arrow exports

Validate: cd web && npm run lint && npm run build

Stop when acceptance criteria met. Do not start FE-TASK-004 UI poll wiring unless asked.
```

## Test notes

Lint + build only. No automated unit test script required.
