# FE tasks index — bls-workflow-frontend

| Field | Value |
|-------|-------|
| Feature id | `bls-workflow-frontend` |
| Status | **READY_FOR_IMPLEMENTATION** |
| Date | 2026-09-22 |
| Spec SoT | `specs/features/bls-workflow-frontend/02-spec.md` |
| Plan | [`04-plan.md`](./04-plan.md) |
| Atomic prompts | [`tasks/`](./tasks/) |
| Product code | **Not started** |

## Execution order

| ID | Title | REQ/NFR | Depends | Status |
|----|-------|---------|---------|--------|
| [FE-TASK-001](./tasks/FE-TASK-001-events-entity-layer.md) | Events entity layer | REQ-007, REQ-017, REQ-019, NFR-001, NFR-007 | — | TODO |
| [FE-TASK-002](./tasks/FE-TASK-002-current-task-applicant-utils.md) | Current-task + applicant utils | REQ-011, REQ-012 | — | TODO |
| [FE-TASK-003](./tasks/FE-TASK-003-snapshot-task-id-dto.md) | Snapshot DTO `id` / `maxAttempts` | REQ-010, CON-003 | — | TODO |
| [FE-TASK-004](./tasks/FE-TASK-004-dual-poll-loop.md) | Dual poll loop | REQ-005–007, NFR-003, NFR-005, DEC-001 | 001 | TODO |
| [FE-TASK-005](./tasks/FE-TASK-005-step-visualization.md) | Step visualization | REQ-002, NFR-001 | 004 | TODO |
| [FE-TASK-006](./tasks/FE-TASK-006-task-detail-targeted-retry.md) | Task detail + targeted retry | REQ-003, REQ-009–011 | 002, 003, 004 | TODO |
| [FE-TASK-007](./tasks/FE-TASK-007-events-timeline-run-link.md) | Events timeline + run link | REQ-007, REQ-017, REQ-018, NFR-007 | 001, 004 | TODO |
| [FE-TASK-008](./tasks/FE-TASK-008-con006-handoff-dual-mode.md) | CON-006 + dual-mode copy | REQ-013, REQ-014, CON-006, DEC-002, DEC-005 | 005 | TODO |
| [FE-TASK-009](./tasks/FE-TASK-009-a11y-empty-error-polish.md) | a11y + empty/error polish | REQ-015, NFR-004, REQ-016 | 004, 008 | TODO |
| [FE-TASK-010](./tasks/FE-TASK-010-lint-build-sweep.md) | Lint/build verification sweep | NFR-002, NFR-006, AC-009 | all | TODO |

## First implementer batch

1. FE-TASK-001  
2. FE-TASK-002  
3. FE-TASK-003  

Then FE-TASK-004.

## Totals

- **10** atomic `FE-TASK-###`
- All status **TODO**
- Every task references ≥1 REQ/NFR

## Hard constraints (all tasks)

- Docs/decisions in `docs/sdd/frontend/` + spec SoT — do not re-discover unless contradicted
- No WS/SSE (DEC-001)
- No secrets in UI
- Russian staff copy
- admin \| manager only
- CON-006 handoff semantics
