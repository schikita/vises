# Tasks index — manage-applicants-appointment-form

| Field | Value |
|-------|-------|
| Feature id | `manage-applicants-appointment-form` |
| Status | **VERIFYING** (Phase A+B code complete; MA-TASK-010 SPA deferred) |
| Date | 2026-11-14 |
| Spec SoT | [`02-spec.md`](./02-spec.md) |
| Plan | [`04-plan.md`](./04-plan.md) |
| Atomic prompts | [`tasks/`](./tasks/) |

## Execution order

| ID | Title | REQ | Depends | Phase | Status |
|----|-------|-----|---------|-------|--------|
| [MA-TASK-001](./tasks/MA-TASK-001-portal-checkpoint-persistence.md) | Task portalStatus + checkpoint columns | REQ-015–018, NFR-007 | OQ-001 approved | A | **DONE** |
| [MA-TASK-002](./tasks/MA-TASK-002-checkpoint-types-persist.md) | Checkpoint types + load/save | REQ-015–017 | 001 | A | **DONE** |
| [MA-TASK-004](./tasks/MA-TASK-004-field-maps-crm-input.md) | Field maps + CRM fill input | REQ-007,019–020, OQ-002/007 | 002 | A | **DONE** |
| [MA-TASK-003](./tasks/MA-TASK-003-visa-modal-iframe-attention.md) | Visa modal + iframe + Attention | REQ-001–002,005–006,021–023,027 | 004 | A | **DONE** |
| [MA-TASK-005](./tasks/MA-TASK-005-full-section-fill.md) | Full required section fill | REQ-007–012,017,027, OQ-007 | 003 | A | **DONE** |
| [MA-TASK-006](./tasks/MA-TASK-006-submit-ready-book-handoff.md) | Submit + Ready + BOOK handoff | REQ-001,003,013–014,024,026–027, OQ-006 | 005 | A | **DONE** |
| [MA-TASK-007](./tasks/MA-TASK-007-resume-error-matrix.md) | Resume + MA_* error matrix | REQ-004,028, §9 | 006 | A | **DONE** |
| [MA-TASK-008](./tasks/MA-TASK-008-add-member-stub.md) | Add Family Member gate stub | REQ-025, OQ-005 | 002 | A | **DONE** |
| [MA-TASK-009](./tasks/MA-TASK-009-add-member-fill.md) | Add Family Member fill | REQ-025, OQ-005 | 007, 008 | B | **DONE** |
| [MA-TASK-010](./tasks/MA-TASK-010-spa-checkpoint-summary.md) | SPA checkpoint summary | REQ-029 | 002 | C | **DEFERRED** (OQ-004) |
| [MA-TASK-011](./tasks/MA-TASK-011-verification-sweep.md) | Lint/build/regression sweep | NFR-004,006, AC-11 | 007 (+009 if B) | A/B | **DONE** (Phase A spine PASS; api build residual pre-existing) |

## First batch (after human migration gate)

1. MA-TASK-001  
2. MA-TASK-002  
3. MA-TASK-004  
4. MA-TASK-003  
5. MA-TASK-005  

Do **not** parallelize 003∥004 (same `portal-fill` package).

## Hard constraints (all tasks)

- One concern per file (`.cursor/rules/file-separation.mdc`)
- Nest structure / TypeScript conventions (no `enum`, typed returns, const objects)
- Extend STATUS_VALIDATE — no parallel orchestrator
- No raw field values in checkpoint/events/logs
- CON-006: never VisaType submit / premium / payment
- Do not rewrite closed `docs/sdd/tasks/TASK-011*` / `TASK-012*`
