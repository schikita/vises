# Discovery — auth registration / login iteration

| Field | Value |
|-------|-------|
| Feature id | `auth-registration-login` |
| Date | 2026-11-01 |
| Status | Complete |
| Explorer | sdd-project-explorer |

## Summary

Quick iteration on public auth: optional `firstName`/`lastName` on User + register; login accepts `identifier` (login OR email); UserMeDto gains name fields; landing/register/login UI copy and field order.

## Evidence highlights

- User entity: `apps/api/src/modules/database/entities/user.entity.ts` — required `name`, unique `login`, non-unique `email`; no first/last.
- Login already OR-matches login/email on the `login` body field (`auth.service.ts`).
- RegisterDto still requires `name`; email optional (defaults to login).
- `UserMeDto` (`packages/contracts`) has no name fields.
- Frontend login sends `{ login, password }`; register sends `{ name, login, password, email? }`.
- Highest closed spine IDs elsewhere: TASK-020 / FE-TASK-010 (different features). This feature uses **T17** / **FE15** as requested.

## Open questions → recorded decisions

See [`plan.md`](./plan.md) § Decisions.
