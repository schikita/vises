# FE16 — Register / login copy polish

| Field | Value |
|-------|-------|
| Task ID | `FE16` |
| Title | Register subtitle + landing header hint copy |
| Status | **DONE** |
| Feature | `auth-registration-login` |
| owner_layer | `apps/web` — pages/landing, features/auth-register |
| depends_on | FE15 |
| Prerequisites | FE15 |
| Dependents | — |
| sensitive_paths | Public auth marketing / form copy only (no API contract changes) |

## Goal

Apply two copy-only UI text fixes on register and landing login. No layout redesign.

## Scope (copy-only; no layout changes)

### Registration Page (`/register`) — `features/auth-register`

- Subtitle: change  
  `Создайте аккаунт агента, чтобы управлять клиентами и заявками.`  
  →  
  `Создайте аккаунт, чтобы управлять клиентами и заявками.`  
  (remove the word «агента»).
- Ensure the main heading remains exactly `Регистрация`.

Likely constant: `AUTH_REGISTER_MESSAGES` in  
`apps/web/src/features/auth-register/constants/auth-register-messages.constants.ts`.

### Login Page (Landing) — `pages/landing`

- Remove the top-right header text  
  `Вход по логину или по ссылке от админа/менеджера`  
  completely.
- Prefer: empty top-right area, or remove the hint element if that is cleaner without changing overall layout structure.
- Do **not** introduce new marketing blocks or redesign the header. A generic link such as «Помощь» is optional only if removing the hint leaves a broken empty chrome that looks worse; default is remove the hint text/constant usage.

Likely constant: `LANDING_COPY.sessionHint` in  
`apps/web/src/pages/landing/constants/landing-copy.constants.ts`  
and its render site in `LandingRender.tsx` (or equivalent header component).

### Tests

- Update any tests/queries that assert the old strings so they pass after the copy change.

## Out of scope

- Layout, spacing, visual redesign, new components beyond removing unused hint markup/constant.
- API, session, validation, or form field changes.
- Other landing/register marketing copy not listed above.

## FSD placement

| Concern | Slice / segment |
|---------|-----------------|
| Register title/subtitle strings | `features/auth-register` constants |
| Landing header session hint | `pages/landing` constants + render |

## Acceptance criteria

- [x] Register subtitle is `Создайте аккаунт, чтобы управлять клиентами и заявками.`
- [x] Register heading is `Регистрация`
- [x] Landing header no longer shows `Вход по логину или по ссылке от админа/менеджера`
- [x] No intentional layout redesign beyond removing unused hint text/markup
- [x] Lint/tests for touched web package pass (including updated text assertions if any)

## verification_commands

```bash
pnpm --filter web lint
pnpm --filter web test
pnpm --filter web build
```

(Adjust filter name to workspace package name if different.)

## IMPLEMENTATION AGENT PROMPT

```text
Implement FE16 for auth-registration-login (copy-only).

Read: docs/sdd/auth-registration-login/frontend/tasks/FE16-auth-register-login-copy-polish.md,
.cursor/rules/file-separation.mdc, react-components.mdc, typescript-conventions.mdc.

1) Register: subtitle without «агента»; title stays «Регистрация».
2) Landing: remove sessionHint «Вход по логину или по ссылке от админа/менеджера» from header.
No layout redesign. Update tests that assert old copy. Do not commit.
```
