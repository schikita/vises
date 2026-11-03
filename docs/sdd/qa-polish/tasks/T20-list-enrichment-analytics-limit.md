# T20 — List enrichment + analytics pageSize/q

| Field | Value |
|-------|-------|
| Task ID | `T20` |
| Title | Backend & contracts: clients agent/route, agent totalRevenue, analytics pageSize + q |
| Status | **DONE** |
| Feature | `qa-polish` |
| owner_layer | `packages/contracts` + `apps/api` (clients, users, analytics, balance read) |
| depends_on | T19 |
| Prerequisites | T19 DONE |
| Dependents | FE18 |
| sensitive_paths | REST list contracts; ledger aggregation (`totalRevenue`); client list joins |

## Goal

Enrich clients and agents list APIs for QA display needs, and ensure analytics `perAgent` pagination/`q` support top-5 + search without returning unbounded agent lists.

## Scope

### Contracts (`packages/contracts`) — run first

1. **ClientListDto** — add:
   - `agentName: string` (DEC-P12)
   - `routeFrom: string | null`
   - `routeTo: string | null` (DEC-P11)
2. **ClientsListSortBy** — extend allowlist: `createdAt`, `firstName`, `agentName`, `route`, `status` (DEC-P16). Add `sortDir` to clients list query types if not already present (`asc` | `desc`).
3. **UserListItemDto** — add `totalRevenue: string | null` (DEC-P13).
4. **AnalyticsQuery** — document that QA “limit” is `pageSize` (DEC-P14); add optional `q?: string` for agent filter (DEC-P15).
5. Export any new types via package barrels.

### Backend (`apps/api`) — after contracts

1. **Clients** `GET /clients` (`src/modules/clients/`)
   - Batch-load agent `User` rows for listed `agentId`s; set `agentName` per DEC-P12.
   - From already-loaded applications, map `routeFrom`/`routeTo` from `submitCity`/`destination` (empty string → `null`).
   - Honor expanded `sortBy` (+ `sortDir` if added). Update map/sort/filter utils + specs.
2. **Users** `GET /users` (`src/modules/users/`)
   - For agent rows, set `totalRevenue` via batched aggregation of `client_creation_debit` amounts (`ABS` sum → decimal string). Non-agents: `null`.
   - Extend sort allowlist for agent metric sorts when needed by FE18 (DEC-P17): at least support sorting agents by name, balance, clientsCount, totalRevenue when `role=agent` (or document equivalent query params).
3. **Analytics** `GET /stats/roles-applications` (`src/modules/analytics/`)
   - Confirm `pageSize` slice is strict (e.g. `pageSize=5` ⇒ ≤5 `perAgent.items`).
   - Accept optional `q`; filter agent universe before pagination (match agent id / login / name via user lookup as needed).
   - Keep `clientsPerAgent` + `global` behavior per DEC-P2 (unpaginated).
4. **Tests** — update/add unit tests for DTO mapping, revenue aggregation, analytics pageSize + `q`.

## Out of scope

- Frontend (FE18)
- Migrations
- Changing mutation APIs
- Paginating `clientsPerAgent` at API (FE may client-paginate)

## Acceptance criteria

- [ ] Clients list items include `agentName`, `routeFrom`, `routeTo`
- [ ] Clients sort allowlist covers Name/Agent/Route/Status/Created fields used by FE
- [ ] Agent user list items include `totalRevenue` decimal string; non-agents `null`
- [ ] Analytics `perAgent.items.length <= pageSize` when pageSize provided; `q` filters agents
- [ ] `@vises/contracts` built; api tests for touched modules green
- [ ] One concern per file; no `enum` / `function` declarations / omitted return types

## verification_commands

```bash
pnpm --filter @vises/contracts build
pnpm --filter @vises/contracts lint
pnpm --filter @vises/api test -- --testPathPattern="analytics|clients|users|balance"
pnpm --filter @vises/api lint
pnpm --filter @vises/api build
```

## IMPLEMENTATION AGENT PROMPT

```text
Implement T20 for feature qa-polish.

Read: docs/sdd/qa-polish/plan.md (DEC-P11…P17; keep DEC-P1…P10),
docs/sdd/qa-polish/tasks/T20-list-enrichment-analytics-limit.md,
docs/sdd/qa-polish/discovery.md,
.cursor/rules/file-separation.mdc, nestjs-structure.mdc, typescript-conventions.mdc.

Contracts first (`packages/contracts`), then `apps/api` modules clients → users → analytics.
Reuse PaginatedList page/pageSize. No new `limit` param.
No enum / function declarations / omitted return types. One concern per file.
Do not commit. Do not change frontend (FE18).
```
