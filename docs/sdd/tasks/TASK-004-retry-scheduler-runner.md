# TASK-004 — Retry scheduler / DB runner

| Field | Value |
|-------|-------|
| Task ID | `TASK-004` |
| Title | Retry scheduler / DB runner |
| Status | **DONE** |
| REQ/NFR | REQ-006, REQ-008, REQ-023, NFR-003, NFR-008 |
| DEC | DEC-002, DEC-004, DEC-014, DEC-018 |
| Prerequisites | TASK-002, TASK-003 |
| Dependents | TASK-008…TASK-012 (domain work), TASK-017 |

## Files / modules

- `backend/src/modules/portal-scrape/workflow/bls-workflow.runner.ts` (or equivalent Nest injectable)
- Constants: max attempts 5, exponential backoff cap 5 min, poll tick interval
- Wire in `portal-scrape.module.ts` (`OnModuleInit` / interval)
- Classification utils for SAFE / VERIFY_THEN / NOT_SAFE

## Acceptance criteria

- In-process runner polls due workflows (`nextRunAt`), claims lock, executes **one** task via injected executor port (stub OK until clients land).
- Schedules `nextRunAt` on `SAFE_TO_REPEAT` / `VERIFY_THEN_REPEAT`; never auto-retries `NOT_SAFE_TO_REPEAT` (→ `WAITING_STAFF`).
- Max auto attempts 5 then human gate.
- Control path remains short — runner owns long browser work.
- No Bull/Redis.

## Verification criteria

- `npm run build` in `backend/`
- With stub executor: start workflow row → runner advances or schedules retry without hanging HTTP

## IMPLEMENTATION AGENT PROMPT

Implement the **Nest in-process DB-backed workflow runner** for `durable-bls-workflow` (DEC-002).

Constraints:
- No Bull/Redis/cron packages.
- Retry classes per REQ-008 / DEC-004; defaults DEC-014.
- Inject a task executor interface; domain clients may still be stubs that no-op/fail safely until later tasks.
- Heartbeat during long work; release lock when idle.
- Never log secrets.
- Extend portal-scrape module; do not greenfield a new app.
- types/constants/utils rules apply.

Deliver: runner tick + backoff scheduling + classification hooks; backend build green.

## Implementation notes (2026-09-22)

- `BlsWorkflowRunner` uses `OnModuleInit` + `setInterval` (`BLS_WORKFLOW_RUNNER_TICK_MS=5000`); no Bull/Redis/cron.
- Injects `BLS_WORKFLOW_TASK_EXECUTOR` → `StubBlsWorkflowTaskExecutor` (SAFE_TO_REPEAT structured fail until TASK-007+).
- Tick: `claimDueWorkflow` → one task → heartbeat → `recordAttempt` → advance / WAITING_RETRY backoff / WAITING_STAFF → `releaseLock`.
- Backoff: `5s × 2^(n-1)` capped at 5 min; max 5 auto attempts (DEC-014).
- `npm run build` in `backend/` **PASS**.
