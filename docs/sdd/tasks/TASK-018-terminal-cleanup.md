# TASK-018 — Terminal mailbox cleanup

| Field | Value |
|-------|-------|
| Task ID | `TASK-018` |
| Title | Terminal Mail.tm / vault cleanup |
| Status | **DONE** |
| REQ/NFR | REQ-016 |
| DEC | DEC-007, DEC-020 |
| Prerequisites | TASK-006, TASK-012 (terminal statuses exist) |
| Dependents | None |

## Files / modules

- Cleanup service invoked on terminal transition + optional admin endpoint (Should)
- `mailtm` `deleteAccount` only here / admin
- Event retention cleanup job (best-effort tick)

## Acceptance criteria

- On terminal (`AWAITING_STAFF_BOOKING` / `FAILED` / `CANCELLED` / `ABANDONED`): mailbox delete per policy; vault rows purged or marked.
- Not deleted on REGISTER success alone.
- Events older than retention after terminal eligible for delete.

## Verification criteria

- `npm run build` in `backend/`

## IMPLEMENTATION AGENT PROMPT

Implement **terminal cleanup** for retained Mail.tm accounts and vault secrets (`durable-bls-workflow`, REQ-016 / DEC-007).

Constraints:
- Delete mailbox only after workflow terminal (or explicit admin) — never after OTP alone.
- Never log tokens/passwords during delete.
- Soft-fail delete like today’s Mail.tm delete semantics where applicable.
- Optional events TTL cleanup (DEC-020).
- types/constants/utils; extend mailtm + workflow modules.

Deliver: cleanup wired to terminal transitions; backend build green.

## Implementation notes (DONE)

- `BlsWorkflowTerminalCleanupService`: soft-fail Mail.tm delete via vaulted `MAILTM_TOKEN` (GET `/me`) or `portalFormEmail` + `MAILTM_PASSWORD` login; then `purgeSecretsForWorkflow` (all purposes). Never throws; never logs tokens.
- Wired from `BlsWorkflowService` on `AWAITING_STAFF_BOOKING` (BOOK advance), `FAILED` (terminal fail), `CANCELLED` (cancel), `ABANDONED` (abandon/supersede). Not on REGISTER/OTP success alone.
- Mail.tm: soft-fail `loginAccount` + `resolveAccountIdFromToken`; `deleteAccount` unchanged.
- Events TTL: runner tick calls `purgeExpiredEvents` (terminal workflows with `updated_at` older than `BLS_WORKFLOW_EVENT_RETENTION_DAYS`, batch 500).
- Optional admin cleanup endpoint left as Should (not required for Must path).

### Commands

| Command | cwd | Result |
|---------|-----|--------|
| `npm run build` | `backend/` | **PASS** |

### Key files

- `backend/src/modules/portal-scrape/bls-workflow-terminal-cleanup.service.ts`
- `backend/src/modules/portal-scrape/workflow/bls-workflow.service.ts`
- `backend/src/modules/portal-scrape/workflow/bls-workflow.runner.ts`
- `backend/src/modules/portal-scrape/bls-secret-vault.service.ts`
- `backend/src/modules/mailtm/mailtm.service.ts`
