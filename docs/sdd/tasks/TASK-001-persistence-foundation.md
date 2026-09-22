# TASK-001 — Persistence foundation (entities + bootstrap)

| Field | Value |
|-------|-------|
| Task ID | `TASK-001` |
| Title | Persistence foundation (entities + bootstrap) |
| Status | **DONE** |
| REQ/NFR | REQ-001, REQ-004, REQ-026, NFR-006 |
| DEC | DEC-012, DEC-020 |
| Prerequisites | None (first shared-schema task) |
| Dependents | TASK-002, TASK-003, TASK-005 |

## Files / modules

- `backend/src/modules/database/entities/bls-workflow.entity.ts` (new)
- `backend/src/modules/database/entities/bls-workflow-step.entity.ts` (new)
- `backend/src/modules/database/entities/bls-workflow-task.entity.ts` (new)
- `backend/src/modules/database/entities/bls-workflow-attempt.entity.ts` (new)
- `backend/src/modules/database/entities/bls-workflow-event.entity.ts` (new)
- `backend/src/modules/database/entities/bls-secret-vault.entity.ts` (new)
- `backend/src/modules/database/database.module.ts`
- `backend/src/modules/database/schema.bootstrap.ts`
- Types/constants under `backend/src/modules/portal-scrape/types|constants/` for status enums (no helpers in constants)

## Acceptance criteria

- TypeORM entities match `docs/sdd/02-database-redesign.md` columns for workflow/step/task/attempt/event/vault.
- Entities registered; synchronize creates tables on boot.
- `schema.bootstrap` ensures indexes / partial unique if needed; **no** drop of `portal_autofill_runs`.
- Nullable link column for REGISTER → `portal_autofill_runs` present on steps.

## Verification criteria

- `npm run build` in `backend/`
- `docker compose up` (or existing stack) → API boots; tables visible in Postgres

## IMPLEMENTATION AGENT PROMPT

Implement durable BLS workflow **persistence only** for feature `durable-bls-workflow`. Read `docs/sdd/02-database-redesign.md` and `docs/sdd/01-target-architecture.md` state enums.

Constraints:
- **Docs/code under NestJS** — ignore any FastAPI mentions in agent files.
- Do **not** implement runner, APIs, or browser clients in this task.
- Follow `types-constants-utils.mdc`: types in `types/`, constants in `constants/` (no named helpers), utils one-arrow-per-file; Nest entity classes exempt.
- Never store secrets in plaintext columns; vault uses ciphertext/nonce/wrappedDek/keyVersion bytea + int.
- Extend existing database module patterns (`portal-autofill-run.entity.ts`); do not greenfield rewrite.
- No secrets in logs. No Alembic.
- Do not start other tasks’ product behavior.

Deliver: entities + module registration + bootstrap indexes; backend build green.

## Implementation notes (2026-09-22)

- Backend `npm run build`: **PASS**
- Docker/API boot + Postgres table check: **NOT_VERIFIED**
- See `specs/features/durable-bls-workflow/06-implementation.md`
