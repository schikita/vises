# TASK-002 — State machine + repositories

| Field | Value |
|-------|-------|
| Task ID | `TASK-002` |
| Title | State machine + repositories |
| Status | **DONE** |
| REQ/NFR | REQ-001, REQ-002, REQ-003, REQ-007 |
| DEC | DEC-009, DEC-010, DEC-013 |
| Prerequisites | TASK-001 |
| Dependents | TASK-003, TASK-004, TASK-014 |

## Files / modules

- `backend/src/modules/portal-scrape/workflow/` (new services/repos)
- `backend/src/modules/portal-scrape/constants/` — workflow/step/task status literals
- `backend/src/modules/portal-scrape/types/` — workflow domain types
- `backend/src/modules/portal-scrape/utils/` — pure transitions / eligibility (one fn per file)
- `backend/src/modules/portal-scrape/portal-scrape.module.ts`

## Acceptance criteria

- Create workflow graph for an application: steps `REGISTER`→`LOGIN`→`PASSWORD_CHANGE`→`STATUS_VALIDATE`→`BOOK` with sequential tasks (incl. per-applicant placeholders for status).
- Enforce one active workflow per application (service-level + DB index).
- Transitions refuse COMPLETED without an explicit verify flag/result from caller (gate helper).
- Supersede marks prior `ABANDONED`.
- BOOK success terminal naming uses `AWAITING_STAFF_BOOKING` (DEC-010).

## Verification criteria

- `npm run build` in `backend/`
- Manual or unit exercise of transition helpers if tests exist later (TASK-020)

## IMPLEMENTATION AGENT PROMPT

Implement **workflow state machine helpers + repositories** for `durable-bls-workflow` on top of TASK-001 entities.

Constraints:
- NestJS + TypeORM only. Extend `portal-scrape`; do not rewrite autofill pipelines.
- Types ≠ functions files; arrow utils; one util per file.
- Status literals as named constants — no magic strings in services.
- Never log or return secrets.
- Do not implement HTTP controllers, runner loop, or encryption yet.
- Multi-applicant tasks sequential (REQ-021 / DEC-009).

Deliver: create/load/advance/skip/fail/abandon APIs used by later runner/controllers; backend build green.

## Implementation notes (2026-09-22)

- Backend `npm run build`: **PASS**
- Added `workflow/` Nest providers: `BlsWorkflowRepository` + `BlsWorkflowService` (create/load/advance/skip/fail/abandon).
- Graph: REGISTER→LOGIN→PASSWORD_CHANGE→STATUS_VALIDATE→BOOK; per-applicant `STATUS_APPLICANT` tasks; BOOK success → `AWAITING_STAFF_BOOKING`.
- Pure utils: verify gate, graph draft, advance plan, eligibility/status helpers (one arrow per file).
- See `specs/features/durable-bls-workflow/06-implementation.md`
