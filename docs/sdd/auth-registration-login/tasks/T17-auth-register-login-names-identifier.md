# T17 — Auth register/login names + identifier + migration

| Field | Value |
|-------|-------|
| Task ID | `T17` |
| Title | User firstName/lastName, register/login contract, migration |
| Status | **DONE** |
| Feature | `auth-registration-login` |
| owner_layer | `packages/contracts` + `apps/api` (+ workflow-worker entity mirror) |
| depends_on | — |
| Prerequisites | None |
| Dependents | FE15 |
| sensitive_paths | `packages/contracts` UserMeDto; `POST /auth/*`; TypeORM migrations; User entity |

## Goal

Backend and shared contracts for optional user names and login-by-identifier.

## Scope

1. `User` entity: add `firstName` / `lastName` (string, nullable; DB `first_name` / `last_name`). Keep existing `name`.
2. New migration adding those columns (additive, nullable).
3. `POST /auth/register`: body `login`, `email` (required), `password`, optional `firstName`, `lastName`. Derive `name` per DEC-A1. Persist optional names.
4. `POST /auth/login`: body `identifier` + `password`; resolve by login OR email (existing OR query).
5. `UserMeDto` (+ `UserOut` / me mapping): include `firstName`, `lastName` (nullable).
6. Mirror User entity in `apps/workflow-worker`.
7. Update `auth.service.spec.ts`: register with/without names; login by login and by email.

## Out of scope

- Admin create-user UI/API `name` changes
- Unique email constraint
- Frontend (FE15)

## Acceptance criteria

- [ ] Login works with email AND login via `identifier`
- [ ] Registration saves optional first/last names; email required
- [ ] `UserMeDto` includes `firstName` / `lastName`
- [ ] New migration present and consistent with entity
- [ ] Auth unit tests updated and passing
- [ ] Scoped lint/build/test green for contracts + api

## verification_commands

```bash
pnpm --filter @vises/contracts build
pnpm --filter api test -- auth.service.spec
pnpm --filter api build
```

(If package names differ, use workspace scripts from nearest `package.json`. Always run the project convention lint for touched packages.)

## IMPLEMENTATION AGENT PROMPT

```text
Implement T17 for feature auth-registration-login.

Read: docs/sdd/auth-registration-login/plan.md (DEC-A1…A9), this task file,
.cursor/rules/file-separation.mdc, nestjs-structure.mdc, typescript-conventions.mdc.

Contracts first (@vises/contracts UserMeDto), then apps/api entity + migration +
DTOs + auth.service/controller + mappers + tests; mirror workflow-worker User entity.

Do not commit. Do not change frontend (FE15).
No enum / function declarations / omitted return types per typescript-conventions.
One concern per file.
```
