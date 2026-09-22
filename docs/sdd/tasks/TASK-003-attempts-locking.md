# TASK-003 — Attempts + locking

| Field | Value |
|-------|-------|
| Task ID | `TASK-003` |
| Title | Attempts + locking |
| Status | **DONE** |
| REQ/NFR | REQ-004, REQ-005 |
| DEC | DEC-003 |
| Prerequisites | TASK-001, TASK-002 |
| Dependents | TASK-004, TASK-017 |

## Files / modules

- Workflow lock helpers under `portal-scrape/workflow/` + `utils/`
- Reuse patterns from:
  - `portal-autofill-run-lifecycle.constants.ts` (30s / 120s)
  - `is-portal-autofill-lock-stale.util.ts`, `has-portal-autofill-live-non-stale-lock.util.ts`
- Attempt persistence via `bls_workflow_attempts`

## Acceptance criteria

- Acquire/release/heartbeat workflow lock; stale reclaim after 120s; heartbeat interval 30s.
- Concurrent claim → safe reject (no corrupt state); 409-ready error signal for HTTP layer.
- Each task execution creates an attempt row with outcome, error class, timestamps, evidence path — **never** secrets.
- Mirror Proxy6-style `FOR UPDATE SKIP LOCKED` where claiming due workflows.

## Verification criteria

- `npm run build` in `backend/`

## IMPLEMENTATION AGENT PROMPT

Implement **workflow locking + attempt recording** for `durable-bls-workflow`.

Constraints:
- Reuse autofill lock TTL constants pattern (30s heartbeat / 120s stale) — DEC-003.
- Nest class methods OK; standalone helpers = arrow, one per util file.
- No secrets in attempt rows or logs.
- Extend portal-scrape; do not invent Redis locks.
- Do not build full runner tick yet (TASK-004), but expose `claimDueWorkflow` / `heartbeat` / `recordAttempt` suitable for it.

Deliver: lock-safe claim + attempt persistence; backend build green.

## Implementation notes (2026-09-22)

- Backend `npm run build`: **PASS**
- Added `BlsWorkflowLockService`: `acquireLock` / `releaseLock` / `heartbeat` / `claimDueWorkflow` (FOR UPDATE SKIP LOCKED) / `recordAttempt`.
- Lock TTLs: heartbeat 30s / stale 120s (DEC-003); live concurrent claim → typed `BlsWorkflowLockError` (409-ready, Russian detail).
- Attempt rows: outcome, error class, timestamps, evidence path — never secrets.
- See `specs/features/durable-bls-workflow/06-implementation.md`
