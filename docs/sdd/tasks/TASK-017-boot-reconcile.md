# TASK-017 — Boot reconcile extend

| Field | Value |
|-------|-------|
| Task ID | `TASK-017` |
| Title | Boot reconcile for workflow locks / due work |
| Status | **DONE** |
| REQ/NFR | REQ-005, REQ-006, REQ-023 |
| DEC | DEC-018, DEC-003 |
| Prerequisites | TASK-003, TASK-004 |
| Dependents | None |

## Files / modules

- Extend `portal-autofill-resume.reconciler.ts` and/or new `bls-workflow.reconciler.ts`
- `OnModuleInit` in portal-scrape module

## Acceptance criteria

- On boot: clear stale workflow locks; leave eligible due work for runner (`nextRunAt`).
- Do not assume browser/DOM continuity.
- Compatible with existing autofill reconciler behavior.

## Verification criteria

- `npm run build` in `backend/`
- API boot without error in compose/local

## IMPLEMENTATION AGENT PROMPT

Extend **boot reconciliation** for durable workflows (DEC-018).

Constraints:
- Clear stale locks (120s TTL); do not auto-launch Patchright inside reconciler — runner claims due work.
- Preserve existing autofill reconciler semantics for `portal_autofill_runs`.
- Nest lifecycle hooks OK (class methods exempt from arrow mandate).
- No secrets in logs.
- types/constants/utils for any new helpers.

Deliver: safe boot reconcile; backend build green.

## Implementation notes (2026-09-22)

- Added `BlsWorkflowReconciler` (`OnModuleInit`): scans `bls_workflows` with `lock_owner` set; clears stale locks via `BLS_WORKFLOW_LOCK_STALE_MS` (120s); does **not** mutate `nextRunAt` / status; never launches Patchright.
- `PortalAutofillResumeReconciler` unchanged for `portal_autofill_runs`.
- Wired as Nest provider in `portal-scrape.module.ts` (alongside autofill reconciler + runner).
- `npm run build` in `backend/` **PASS**.
- See `specs/features/durable-bls-workflow/06-implementation.md` § TASK-017.
