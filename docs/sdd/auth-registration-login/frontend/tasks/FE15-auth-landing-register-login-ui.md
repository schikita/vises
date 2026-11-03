# FE15 — Landing / register / login UI + API wire

| Field | Value |
|-------|-------|
| Task ID | `FE15` |
| Title | Landing copy, register fields, login identifier wire |
| Status | **DONE** |
| Feature | `auth-registration-login` |
| owner_layer | `apps/web` — pages/landing, pages/register, features/auth-login, features/auth-register, shared/api, entities/session |
| depends_on | T17 |
| Prerequisites | T17 |
| Dependents | — |
| sensitive_paths | Public auth client bodies; landing marketing copy |

## Goal

Align UI copy/validation with T17 contracts and wire `identifier` + optional names.

## Scope

### Landing (`pages/landing`)

- Footer: remove "Главная" link; keep only "© 2026 Vises" and "Регистрация".
- Login form subtitle: replace admin-credentials hint with "Войдите, чтобы управлять заявками и клиентами."
- Link text: "Нет аккаунта? Зарегистрироваться" (replace English "No account? Register as agent").

### Register (`features/auth-register` + `pages/register`)

- Field order: Имя (optional), Фамилия (optional), Логин, Email (required), Пароль.
- Validation: firstName/lastName optional; email required + valid; login required; password required.
- Remove "optional" from email label.
- API body: `{ login, email, password, firstName?, lastName? }` (no `name`).

### Login (`features/auth-login` + session)

- Label "Логин" → "Логин или Email".
- Request body uses `identifier` (not `login`) per T17.

### Session / UserMe

- Types and `toSessionFromMe` (if needed) accept `firstName`/`lastName` from me/session.

## FSD placement

| Concern | Slice / segment |
|---------|-----------------|
| Landing footer/copy | `pages/landing` constants + components |
| Login form/schema/messages | `features/auth-login` |
| Register form/schema/messages | `features/auth-register` |
| API body types + post utils | `shared/api` |
| Session login wiring | `entities/session` |
| Register page submit | `pages/register` |

## Acceptance criteria

- [ ] Landing footer and copy match scope
- [ ] Register field order + validation match scope; wires firstName/lastName
- [ ] Login label + `identifier` wire
- [ ] Lint/tests for touched web packages pass

## verification_commands

```bash
pnpm --filter web lint
pnpm --filter web test
pnpm --filter web build
```

(Adjust filter name to workspace package name if different.)

## IMPLEMENTATION AGENT PROMPT

```text
Implement FE15 for auth-registration-login after T17.

Read: docs/sdd/auth-registration-login/plan.md, this task, T17 outcomes,
.cursor/rules/file-separation.mdc, react-components.mdc, typescript-conventions.mdc.

Wire frontend to identifier + firstName/lastName. One component per file;
constants/types/utils in separate files. Russian copy as specified. Do not commit.
```
