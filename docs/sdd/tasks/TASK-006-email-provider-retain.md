# TASK-006 — TemporaryEmailProvider + retain mailbox

| Field | Value |
|-------|-------|
| Task ID | `TASK-006` |
| Title | Email provider abstraction + retain mailbox |
| Status | **DONE** |
| REQ/NFR | REQ-015, REQ-016, NFR-002 |
| DEC | DEC-007 |
| Prerequisites | TASK-005 |
| Dependents | TASK-008, TASK-018 |

## Files / modules

- `backend/src/modules/mailtm/interfaces/` — evolve/rename toward `TemporaryEmailProvider`
- `backend/src/modules/mailtm/mailtm.service.ts`
- Autofill finally paths that `deleteAccount` after OTP — **stop deleting on OTP success** when workflow retention armed
- Vault purposes `MAILTM_PASSWORD` / `MAILTM_TOKEN`

## Acceptance criteria

- Disposable email accessed via TemporaryEmailProvider port; Mail.tm default adapter.
- Registration OTP path **retains** mailbox; credentials encrypted.
- Delete only via terminal cleanup / explicit admin (TASK-018 may finish wiring).
- No tokens in logs/API.

## Verification criteria

- `npm run build` in `backend/`
- Code review: no delete-after-OTP on workflow success path

## IMPLEMENTATION AGENT PROMPT

Change Mail.tm integration for `durable-bls-workflow`: introduce/alias **TemporaryEmailProvider**, and **retain** mailboxes until terminal (REQ-016 / DEC-007).

Constraints:
- Extend `mailtm` module; keep Nest DI token pattern.
- Store mailbox secrets via TASK-005 vault — never plaintext DB columns outside vault ciphertext.
- Remove/stop delete-after-OTP in portal-scrape autofill `finally` for workflow-driven runs (feature flag or always-retain when vaulting).
- No secrets in Winston logs (existing formatters must not print tokens).
- types/constants/utils rules.

Deliver: provider interface + retain behavior + vault persistence hooks; backend build green.

## Implementation notes (DONE)

- `TemporaryEmailProvider` port + `IDisposableEmail` alias; DI `TEMPORARY_EMAIL_PROVIDER` (+ legacy `DISPOSABLE_EMAIL`).
- `createAccount` returns `password` on handle for vault retain only (never logged).
- Autofill: retain when `emailOtpOk === true`; vault `MAILTM_PASSWORD` / `MAILTM_TOKEN` when `workflowId` set; legacy sync without workflow still retains (no delete, no vault).
- Delete remains on OTP/failure paths, portalFormEmail persist hard-fail, and finally backup when cleanup handle still set.
- Terminal cleanup deferred to TASK-018.

### Commands

| Command | cwd | Result |
|---------|-----|--------|
| `npm run build` | `backend/` | **PASS** |
