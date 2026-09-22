# TASK-010 — Password change

| Field | Value |
|-------|-------|
| Task ID | `TASK-010` |
| Title | Forced password change + vault update |
| Status | **DONE** |
| REQ/NFR | REQ-012, REQ-013, REQ-014 |
| DEC | DEC-005 |
| Prerequisites | TASK-005, TASK-009 |
| Dependents | TASK-011 |

## Files / modules

- `bls-clients/password-change/**`
- Fixture: `reset_password.html`
- Orchestrator skip path when UI not presented

## Acceptance criteria

- If forced/expired password UI: generate compliant password, set it, update vault, verify, COMPLETED.
- If not presented: step `SKIPPED` with reason.
- Secrets never in API/logs.

## Verification criteria

- `npm run build` in `backend/` — **PASS** (2026-09-22)

## IMPLEMENTATION AGENT PROMPT

Implement conditional **PASSWORD_CHANGE** client for `durable-bls-workflow` (REQ-012).

Constraints:
- Detect forced change UI using `reset_password.html` cues; else orchestrator marks SKIPPED.
- Generate password ≥8 with upper/lower/digit/special; encrypt new value in vault; never hash.
- Separate domain client from orchestrator.
- No secrets in logs/DTOs.
- types/constants/utils rules.

Deliver: change or skip paths both correct; backend build green.

## Implementation notes (2026-09-22)

- Added `BlsPasswordChangeClientService` + `PortalPasswordChangeFillService` / pipeline: login with vaulted current password → detect `ChangeUserPassword` form → generate compliant password → fill Current/New/Confirm → Update Password → verify form gone → rotate vault `PORTAL_PASSWORD`.
- Not presented → executor result `{ skipped: true }` → dispatcher calls `BlsWorkflowService.skip`; runner records SUCCEEDED attempt and schedules next (no fail/advance).
- Never hash; never log secrets.
