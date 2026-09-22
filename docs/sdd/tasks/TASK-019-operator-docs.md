# TASK-019 — Operator docs + env samples

| Field | Value |
|-------|-------|
| Task ID | `TASK-019` |
| Title | Operator documentation updates |
| Status | **DONE** |
| REQ/NFR | NFR-009 |
| DEC | DEC-005 |
| Prerequisites | TASK-014, TASK-015 (API/UI known) |
| Dependents | None |

## Files / modules

- `backend/docs/modules/portal-scrape.md` (and mailtm/proxy6 as needed)
- `backend/.env.dev.example`, `.env.dev.local.example`, `.env.prod.example` — `VISES_SECRETS_MASTER_KEY`
- `docs/sdd/README.md` note if operator pointers needed (no secrets)

## Acceptance criteria

- Operators know how to set master key, start workflow, poll UI, booking stop meaning.
- No real secrets committed.

## Verification criteria

- Docs review; examples contain placeholder only

## IMPLEMENTATION AGENT PROMPT

Update **operator docs and env examples** for `durable-bls-workflow` (NFR-009).

Constraints:
- Document `VISES_SECRETS_MASTER_KEY`, workflow APIs overview, retain-mail behavior, CON-006 booking stop, poll UI.
- Never commit real keys.
- Update `backend/docs/modules/` relevant files; keep Russian/English consistent with existing module docs style.
- Do not change product behavior except doc/env samples.

Deliver: docs + env sample keys; no backend behavior regressions.

## Implementation notes (DONE 2026-09-22)

- Operator docs: durable BLS workflow section in `portal-scrape.md` (master key, start/poll SPA, CON-006 → `AWAITING_STAFF_BOOKING`, retain-mail until terminal, API table).
- `mailtm.md` retain/terminal table; `proxy6.md` notes workflow lease; `config.md` documents `VISES_SECRETS_MASTER_KEY`.
- `backend/docs/README.md` route index includes bls-workflow + login-prep.
- `.env.dev.example`, `.env.dev.local.example`, `.env.prod.example` already had empty `VISES_SECRETS_MASTER_KEY=` placeholder + generate comment — left empty (no real secrets).
- No product code / behavior changes.

### Verification

| Check | Result |
|-------|--------|
| Docs review (NFR-009 topics present) | **PASS** |
| Env samples placeholder-only | **PASS** (`VISES_SECRETS_MASTER_KEY=` empty) |
