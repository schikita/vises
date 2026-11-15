# Tasks index — bls-booking-visa-type

| Field | Value |
|-------|-------|
| Feature id | `bls-booking-visa-type` |
| Status | **READY_FOR_REVIEW** (Phase A/B complete; Phase C VT-TASK-011 DEFERRED) |
| Date | 2026-11-14 |
| Spec SoT | [`02-spec.md`](./02-spec.md) |
| Plan | [`04-plan.md`](./04-plan.md) |
| Atomic prompts | [`tasks/`](./tasks/) |

## Execution order

| ID | Title | REQ | Depends | Phase | Status |
|----|-------|-----|---------|-------|--------|
| [VT-TASK-001](./tasks/VT-TASK-001-booking-checkpoint-persistence.md) | Checkpoint persistence (reuse/migrate) | REQ-018, CON-007 | Human DEC-003 | A | **DONE** |
| [VT-TASK-002](./tasks/VT-TASK-002-checkpoint-types-persist.md) | Checkpoint types + load/save | REQ-006,018 | 001 | A | **DONE** |
| [VT-TASK-003](./tasks/VT-TASK-003-mail-dp-consent-extract.md) | Mail subject + DP consent href | REQ-003…005, CON-001 | 002 | A | **DONE** |
| [VT-TASK-004](./tasks/VT-TASK-004-selectors-attention-family.md) | Selectors + Attention + Family | REQ-008…010 | 002 | A | **DONE** |
| [VT-TASK-005](./tasks/VT-TASK-005-extended-visa-type-fill.md) | Extended form fill Prefer Normal | REQ-010…011,020 | 004 | A | **DONE** |
| [VT-TASK-006](./tasks/VT-TASK-006-wire-email-consent-book.md) | Wire consent before booking entry | REQ-001…007 | 003, 005 | A | **DONE** |
| [VT-TASK-007](./tasks/VT-TASK-007-submit-allowlist.md) | Submit + classifier allowlist | REQ-012,019, CON-005 | 006, DEC-001 | B | **DONE** |
| [VT-TASK-008](./tasks/VT-TASK-008-booking-captcha-probe.md) | Captcha probe/solve after submit | REQ-013 | 007 | B | **DONE** |
| [VT-TASK-009](./tasks/VT-TASK-009-slots-unavailable.md) | Slots unavailable + Try Again | REQ-014…015, NFR-001 | 008 | B | **DONE** |
| [VT-TASK-010](./tasks/VT-TASK-010-terminal-classifier.md) | Terminal/advance + classifier finalize | REQ-016…019, NFR-001, CON-004 | 009 | B | **DONE** |
| [VT-TASK-011](./tasks/VT-TASK-011-spa-mid-booking-summary.md) | SPA mid-booking summary | Phase C | 002 | C | DEFERRED |
| [VT-TASK-012](./tasks/VT-TASK-012-verification-sweep.md) | Lint/build/regression sweep | NFR-005…006, AC-10 | 010 | B | **DONE** |

## First batch (after human DEC-003 / DEC-001 gates as noted)

1. VT-TASK-001 (if migration needed)  
2. VT-TASK-002  
3. VT-TASK-003 ∥ VT-TASK-004 (disjoint packages)  
4. VT-TASK-005 → VT-TASK-006  

**VT-TASK-007 DONE** (DEC-001 approved 2026-11-14). **VT-TASK-008 DONE**. **VT-TASK-009 DONE** (DEC-008 / OQ-002). **VT-TASK-010 DONE** (DEC-004 / OQ-007). **VT-TASK-012 DONE** (verification sweep 2026-11-14). Phase A/B complete; **VT-TASK-011** remains DEFERRED (Phase C).

## Hard constraints (all tasks)

- One concern per file (`.cursor/rules/file-separation.mdc`)
- TypeScript conventions (no `enum`; typed returns; const objects)
- Extend BOOK / booking client — no parallel orchestrator
- No raw email bodies / tokens / field values in checkpoint/events/logs
- **VisaType Submit in scope (after DEC-001); Premium Accept / payment still forbidden**
- Do not rewrite closed `docs/sdd/tasks/TASK-012*` as DONE history — reference DEC supersession
- Never doorstep; never Manage `#visaTypeModal` as this form
