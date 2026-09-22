# TASK-005 — Encryption service (AES-GCM + wrapped DEK)

| Field | Value |
|-------|-------|
| Task ID | `TASK-005` |
| Title | Encryption service |
| Status | **DONE** |
| REQ/NFR | REQ-013, REQ-014, NFR-002, NFR-005 |
| DEC | DEC-005 |
| Prerequisites | TASK-001 |
| Dependents | TASK-006, TASK-008, TASK-009, TASK-010, TASK-020 |

## Files / modules

- Crypto service under `portal-scrape` or colocated secrets provider
- Env: `VISES_SECRETS_MASTER_KEY` in `app-env.schema.ts` + `.env.*.example`
- Persist/load via `bls_secret_vault` entity
- Password generator util (portal rules ≥8 upper/lower/digit/special)

## Acceptance criteria

- `encryptSecret` / `decryptSecret` envelope API works with AES-256-GCM + wrapped DEK.
- Master key from env base64 32 bytes; missing key fail-closed.
- Portal passwords never hashed/bcrypt’d.
- Ciphertext columns only; no secret in logs.

## Verification criteria

- `npm run build` in `backend/`
- Prefer unit test in TASK-020; interim: local script or temporary assert in build-safe unit if added early

## IMPLEMENTATION AGENT PROMPT

Implement **envelope encryption** for portal/mailbox secrets (`durable-bls-workflow`, DEC-005 / REQ-014).

Constraints:
- Algorithm: AES-GCM + per-secret DEK wrapped by `VISES_SECRETS_MASTER_KEY` (base64 32-byte MK).
- Never hash portal passwords. Never log plaintext, DEK, or tokens.
- Nest patterns; types in `types/`; one util per file for helpers (e.g. generate password).
- Do not expose secrets on any HTTP DTO in this task (no controllers required).
- Update env examples only (not real `.env` secrets).

Deliver: SecretsCryptoService + vault save/load helpers; backend build green.

## Implementation notes (2026-09-22)

- Backend `npm run build`: **PASS**
- Unit suite (TASK-020): deferred — interim AES-GCM wrap roundtrip sanity OK
- See `specs/features/durable-bls-workflow/06-implementation.md`
