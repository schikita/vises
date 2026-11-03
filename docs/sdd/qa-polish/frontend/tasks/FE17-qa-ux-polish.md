# FE17 — QA UX polish (tables, modals, datepicker, borders)

| Field | Value |
|-------|-------|
| Task ID | `FE17` |
| Title | Frontend QA polish: visuals, users/agents/analytics/clients/balance |
| Status | **DONE** |
| Feature | `qa-polish` |
| owner_layer | `apps/web` — shared/ui + theme, widgets/shell, pages/users, pages/agents, pages/analytics, pages/clients, entities/client, pages/agents balance |
| depends_on | T19 |
| Prerequisites | T19 complete (contracts + APIs) |
| Dependents | — |
| sensitive_paths | Theme tokens; shell role badge; confirm dialogs for user disable/delete/reissue |

## Goal

Wire frontend to T19 APIs and fix QA UX issues: borders/hover, shell badge, users actions/copy, agents metrics columns, analytics pagination + Apply datepicker, clients search/sort/pagination + table layout, balance ledger pagination.

## Scope

### 1. Global visual fixes (`shared/ui` / theme CSS)

- Increase border visibility for table rows and inputs in Light and Dark (esp. light: white inputs vs white background).
- Subtle row hover background on clickable tables.

### 2. Shell badge (`widgets/shell` + app routing)

- Show **Superadmin** for superadmins (not Admin).
- Hide badge entirely for agents.
- Keep Admin for admin role.

### 3. Users page (`pages/users`)

- Subtitle: replace English/old copy with **«Управление пользователями ({{total}})»** (or equivalent i18n: title/subtitle + total; RU preferred where specified).
- Actions (reissue/disable/delete): icon buttons with hover; open confirmation modal **«Вы уверены?»** with **Отмена / Применить**.
- Wire agent row navigation to T19 `latestAppId` fix (no false “No applications yet” when apps exist).
- Do **not** invent passport/route columns on Users (see Clients / DEC-P8).

### 4. Agents page (`pages/agents`)

- Add columns **Clients Count** and **Current Balance** from T19 user/agent list fields.
- Make rows clickable (navigate to agent balance/detail as today).

### 5. Analytics page (`pages/analytics`)

- Paginate “Per-agent applications by status” using T19 API (top agents by client count by default).
- Custom date-range picker with explicit **Применить** before fetch.

### 6. Clients page (`pages/clients` + `entities/client`)

- Pagination, search, sorting UI → T19 `GET /clients`.
- Table layout (DEC-P8): remove passport column; add **Agent** (admin view) and **Route** (From → To); entire row clickable; remove **Open** button.

### 7. Agent Balance (`pages/agents` balance / ledger)

- Paginate ledger table via T19 transactions API.

## FSD placement

| Concern | Slice / segment |
|---------|-----------------|
| Borders / hover / field tokens | `shared/ui` (+ theme CSS if present) |
| Shell badge by role | `widgets/shell`, possibly `app` Shell wiring |
| Users copy / modals / actions | `pages/users` + i18n constants |
| Agents columns | `pages/agents` |
| Analytics pager + datepicker | `pages/analytics` (+ small UI pieces under page or shared/ui if reusable) |
| Clients table + query | `entities/client`, `pages/clients` |
| Balance ledger pager | `pages/agents` / `pages/balance` as applicable |
| API client types | `shared/api` / entity fetch utils aligned to T19 contracts |

## Out of scope

- Backend/contracts changes (T19)
- Auth register/login copy (already FE15/FE16)

## Acceptance criteria

- [ ] Tables have pagination / sorting / filtering where specified
- [ ] Confirm modals work for user actions
- [ ] Datepicker has Apply (**Применить**)
- [ ] Visual border/hover bugs fixed
- [ ] Shell badge correct for superadmin / hidden for agent
- [ ] Agent apps empty-state bug gone when apps exist
- [ ] Lint/tests/build for web pass on touched scope

## verification_commands

```bash
pnpm --filter web lint
pnpm --filter web test
pnpm --filter web build
```

(Adjust filter name to workspace package name if different.)

## IMPLEMENTATION AGENT PROMPT

```text
Implement FE17 for feature qa-polish after T19.

Read: docs/sdd/qa-polish/plan.md (DEC-P8…P10), this task, T19 outcomes/contracts,
.cursor/rules/file-separation.mdc, react-components.mdc, typescript-conventions.mdc.

One component per file; constants/types/utils separated. Russian copy where specified.
Do not commit. Do not change backend.
```
