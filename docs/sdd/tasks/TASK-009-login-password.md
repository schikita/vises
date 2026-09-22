# TASK-009 — Login (password)

| Field | Value |
|-------|-------|
| Task ID | `TASK-009` |
| Title | Login with vaulted password |
| Status | **DONE** |
| REQ/NFR | REQ-011, REQ-014 |
| DEC | DEC-008, DEC-016 |
| Prerequisites | TASK-007, TASK-008 |
| Dependents | TASK-010, TASK-011 |

## Files / modules

- Extend `portal-login-prep.*` + `run-portal-login-prep-pipeline.util.ts` past email+verify stop
- `bls-clients/login/**`
- Fixtures: `login.html`, `login_captcha.html`

## Acceptance criteria

- LOGIN discovers/fills email, verify/captcha as needed, submits vaulted password, verifies authenticated landing.
- Secrets never logged or returned.
- Prior login-prep-only stop superseded for workflow path.

## Verification criteria

- `npm run build` in `backend/` — **PASS** (2026-09-22)

## IMPLEMENTATION AGENT PROMPT

Implement **LOGIN** for `durable-bls-workflow` by extending login-prep past the email+`#btnVerify` stop (REQ-011).

Constraints:
- Decrypt portal password only in-memory for the submit; never persist plaintext.
- Extend existing login-prep code; domain client separate from orchestrator.
- Fixtures: `login.html`, `login_captcha.html` (on-disk names).
- VERIFY_THEN_REPEAT for ambiguous password submit.
- No storageState Must (DEC-016).
- types/constants/utils; no secrets in logs.

Deliver: LOGIN task COMPLETED only after auth verify; backend build green.
