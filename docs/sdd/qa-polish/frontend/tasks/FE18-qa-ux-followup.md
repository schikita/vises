# FE18 — QA UX follow-up

| Field | Value |
|-------|-------|
| Task ID | `FE18` |
| Title | Frontend QA follow-up: modals, ledger pager, clients/agents columns, analytics top-5 |
| Status | **DONE** |
| Feature | `qa-polish` |
| owner_layer | `apps/web` (pages/users, pages/agents, pages/clients, pages/applications, pages/analytics, entities/client, entities/analytics, entities/user, shared/ui or i18n as needed) |
| depends_on | T20 |
| Prerequisites | T20 DONE (contracts + API available) |
| Dependents | — |
| sensitive_paths | Theme/contrast tokens; users destructive confirms; billing-adjacent revenue display |

## Goal

Consume T20 enrichment fields and finish remaining QA UX items across Users, Agent Balance, Clients, Applications, Analytics, and Agents pages.

## Scope (FSD)

### 1. Users — `pages/users`

- Tooltips on action icons: Change password / Disable / Delete (`title` or existing tooltip pattern).
- Confirm dialogs specific: e.g. `Delete user {{name}}?`, `Change password for {{name}}?`, disable/enable variants — not generic “Are you sure?”.
- Keep file separation: i18n keys in locale constants; dialog copy helpers if needed in `pages/users/utils`.

### 2. Agent Balance — `pages/agents` (+ `shared/ui` ListPager if root cause)

- Bug: page 2 causes full reload / scroll-to-top.
- Fix: ensure pager does not submit enclosing forms; prefer React state page change without remounting route; preserve scroll if possible (`scroll: false` navigation if URL params involved).
- Investigate `BalanceTopUpForm` / layout wrapping before changing ListPager globally.

### 3. Clients — `entities/client` + `pages/clients`

- Show `agentName` (not short `u-agent-…` id).
- Show route `routeFrom → routeTo` with arrow icon; both empty → `—`.
- Sorting UI for columns: Name, Agent, Route, Status, Created — wire to T20 `sortBy`/`sortDir`.

### 4. Applications — `pages/applications`

- Match Search + City filter control height/width to Clients page patterns (shared field classes / layout).
- Dark mode: status filter pills must have readable contrast (light pills → dark text in dark mode). Prefer theme tokens over hard-coded one-offs when tokens exist.

### 5. Analytics — `pages/analytics` + `entities/analytics`

- Default `perAgent` `pageSize: 5` (DEC-P14); keep ListPager.
- Add search bar; pass `q` to analytics query (DEC-P15); reset page on search.
- Bottom table (`clientsPerAgent`): add client-side `ListPager` (API remains full list per DEC-P2/P15).

### 6. Agents — `pages/agents`

- Add **Total Revenue** column from `totalRevenue`.
- Sorting UI for Agent Name, Balance, Clients Count, Total Revenue — use T20/users list sort params.

## Out of scope

- Backend/contract edits (escalate to orchestrator if T20 gaps found)
- Migrations
- Unrelated visual redesign

## Acceptance criteria

- [ ] User action icons have tooltips; confirms name the user and action
- [ ] Agent balance ledger page change does not full-reload / jump to top unexpectedly
- [ ] Clients table shows agent name + route arrow / em dash; all listed columns sortable
- [ ] Applications filters match Clients sizing; dark-mode pill contrast fixed
- [ ] Analytics shows top 5 per-agent by default, supports agent search, bottom table paginated in UI
- [ ] Agents table shows Total Revenue and sortable metric columns
- [ ] `pnpm --filter @vises/web lint` and scoped tests/build green
- [ ] One component per file; no mixed types/constants/utils in component files

## verification_commands

```bash
pnpm --filter @vises/web lint
pnpm --filter @vises/web test
pnpm --filter @vises/web build
```

## IMPLEMENTATION AGENT PROMPT

```text
Implement FE18 for feature qa-polish after T20.

Read: docs/sdd/qa-polish/plan.md (DEC-P8…P17), this task,
docs/sdd/qa-polish/tasks/T20-list-enrichment-analytics-limit.md (contracts delivered),
.cursor/rules/file-separation.mdc, react-components.mdc, typescript-conventions.mdc.

FSD: pages + entities only as listed; shared i18n/ui when necessary.
No enum / function declarations / omitted return types. One concern per file.
Do not commit. Do not change apps/api or packages/contracts unless orchestrator reopens T20.
```
