# TASK-016 — Link REGISTER to portal_autofill_runs

| Field | Value |
|-------|-------|
| Task ID | `TASK-016` |
| Title | Link legacy portal_autofill_runs (nullable FK) |
| Status | **DONE** |
| REQ/NFR | REQ-026, NFR-006 |
| DEC | DEC-012 |
| Prerequisites | TASK-001, TASK-008 |
| Dependents | None |

## Files / modules

- REGISTER client / autofill integration writing `portal_autofill_run_id` on step
- Events payloadSafe may include `runId`
- No destructive migration of old runs

## Acceptance criteria

- REGISTER may create/update a linked `portal_autofill_runs` row for evidence/checkpoints continuity.
- Workflow tables remain SoT for multi-stage status.
- Legacy in-flight runs at deploy left untouched.

## Verification criteria

- `npm run build` in `backend/` — **PASS** (2026-09-22)

## IMPLEMENTATION AGENT PROMPT

Wire **nullable link** from REGISTER step to `portal_autofill_runs` for `durable-bls-workflow` (REQ-026 / DEC-012).

Constraints:
- Soft/nullable link only; do not drop or force-migrate historical runs.
- Workflow SoT stays `bls_*` tables; never COMPLETED from run row alone without portal verify.
- Extend existing autofill persistence helpers.
- No secrets on run rows (existing DEC).
- types/constants/utils rules.

Deliver: linked run id on REGISTER when applicable; backend build green.

## Implementation notes

- `PortalAutofillRunPersistenceService`: create/reclaim linked run, checkpoints, heartbeat, terminal persist (shared with HTTP autofill terminal path).
- `BlsRegisterClientService`: ensure link before fill; screenshot + checkpoint sinks; terminalize after outcome; `AUTOFILL_RUN_LINKED` event with `payloadSafe.runId`.
- Soft link only on `bls_workflow_steps.portal_autofill_run_id`; does **not** query/mutate unrelated legacy staff runs.
- Workflow COMPLETED still requires `verifiedExternalState` on bls_* (REQ-007).
- See `specs/features/durable-bls-workflow/06-implementation.md` § TASK-016.
