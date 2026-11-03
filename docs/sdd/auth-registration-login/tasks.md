# Tasks — auth-registration-login

| Field | Value |
|-------|-------|
| Feature id | `auth-registration-login` |
| Status | DONE |
| Plan | [`plan.md`](./plan.md) |

## Execution order

| ID | Title | Owner | Depends | Status | Architecture | Code |
|----|-------|-------|---------|--------|--------------|------|
| [T17](./tasks/T17-auth-register-login-names-identifier.md) | Auth register/login names + identifier + migration | contracts → backend | — | DONE | OKAY | OKAY |
| [FE15](./frontend/tasks/FE15-auth-landing-register-login-ui.md) | Landing/register/login UI + API wire | frontend | T17 | DONE | OKAY | OKAY |
| [FE16](./frontend/tasks/FE16-auth-register-login-copy-polish.md) | Register subtitle + landing header hint copy | frontend | FE15 | DONE | — (quick copy; review not requested) | — (quick copy; review not requested) |

## Parallelism

- T17 must complete (contracts + backend + tests green) before FE15.
- Within T17: contracts first (or with backend), then migration/entity/service/tests.
- FE16 is copy-only after FE15; no backend/contracts dependency.
