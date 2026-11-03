# Plan — auth registration / login iteration

| Field | Value |
|-------|-------|
| Feature id | `auth-registration-login` |
| Status | DONE |
| Updated | 2026-11-01 |
| Discovery | [`discovery.md`](./discovery.md) |

## Goal

Make public registration collect optional first/last name and required email; allow login via login **or** email through an `identifier` field; surface names on `UserMeDto`; align landing/register/login UI copy and validation.

## Acceptance criteria (feature-level)

1. `POST /auth/register` accepts `login`, `email` (required), `password`, optional `firstName`/`lastName`; persists names; returns session.
2. `POST /auth/login` accepts `identifier` + `password`; resolves user by login **or** email (case-insensitive).
3. `UserMeDto` includes `firstName` and `lastName` (nullable strings).
4. New TypeORM migration adds nullable `first_name` / `last_name` on `users`.
5. Auth unit tests cover register with optional names and login by email and by login.
6. Landing footer/copy, register field order/validation, login label updated per FE15; FE wires `identifier` and name fields.

## Affected packages

| Package | Change |
|---------|--------|
| `packages/contracts` | Extend `UserMeDto` |
| `apps/api` | Entity, migration, DTOs, auth service/controller, mapper, tests; sync workflow-worker User entity |
| `apps/web` | auth-login, auth-register, landing, shared API body types, session login body |

## Decisions (orchestrator-recorded)

| ID | Decision |
|----|----------|
| DEC-A1 | Keep required `User.name` for admin/`UserOut` backward compatibility. On register, derive `name` from trimmed `firstName` + `lastName` (space-joined); if both empty, use `login`. |
| DEC-A2 | Add nullable `firstName` / `lastName` columns (`first_name` / `last_name`). Do **not** drop `name`. |
| DEC-A3 | Public `RegisterDto` drops required `name`; email becomes **required**; `firstName`/`lastName` optional. |
| DEC-A4 | `LoginDto` field renamed `login` → `identifier`. Service resolves against login OR email. |
| DEC-A5 | Do **not** add unique constraint on `email` in this iteration (known ambiguity risk if duplicates exist). |
| DEC-A6 | `UserMeDto` gains `firstName: string \| null` and `lastName: string \| null`. `UserOut` / session user also expose the same fields for FE consistency. |
| DEC-A7 | Mirror User entity change in `apps/workflow-worker` to avoid schema drift. |
| DEC-A8 | Admin `CreateUserDto` / staff create path unchanged in this feature (still uses `name`). |
| DEC-A9 | Human-approved migration plan: additive nullable columns only; no data backfill required beyond defaults null. |

## Cross-cutting risks

- Public auth API shape break (`login` → `identifier`; register without `name`).
- Migration runs automatically (`migrationsRun: true`).
- Non-unique email may match ambiguous rows (`getOne()`).

## Phases

1. **T17** — contracts + backend + migration + tests
2. **FE15** — frontend wiring and copy (depends on T17)

## Sensitive paths

- Auth public API
- TypeORM migration
- `@vises/contracts` UserMeDto
