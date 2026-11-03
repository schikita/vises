# Discovery — QA polish (pagination + UX)

| Field | Value |
|-------|-------|
| Feature id | `qa-polish` |
| Updated | 2026-11-02 |
| Source | QA feedback after roles-and-applications / auth UI polish |

## Evidence (read-only)

### Analytics — `GET /stats/roles-applications`

- Controller: `apps/api/src/modules/analytics/analytics.controller.ts`
- Query DTO: `AnalyticsQueryDto` (`from`, `to` only)
- Contract: `AnalyticsDto` with full `perAgent[]` (sorted by `agentId` localeCompare today)
- `clientsPerAgent` already has per-agent `count` (usable as `clientCount` for sort)
- No pagination on `perAgent`

### Clients — `GET /clients`

- Controller: `apps/api/src/modules/clients/clients.controller.ts` — returns `ClientListDto[]`
- Contract: `packages/contracts/src/types/client.types.ts` (`ClientListDto`)
- No `page` / `pageSize` / `search` / `sortBy` today
- FE table: `entities/client/ui/ClientListTable` — passport column + "Open" link

### Balance ledger — `GET /agents/:agentId/balance/transactions`

- Controller: `apps/api/src/modules/balance/balance.controller.ts` — returns `BalanceTransactionDto[]`
- Service: `listTransactions` — newest-first, no pagination

### Users list — `GET /users`

- Already supports opt-in pagination (`page`/`pageSize`/`q`/`role`/`sort`/`sortDir`) via shared `PaginatedList`
- List item: `UserListItemOut` = `UserOut` + `latestAppId`
- Missing: `clientsCount`, `currentBalance` for agents
- Bug: `latestAppId` resolved by matching `Application.clientEmail` to user email/login (`resolve-latest-app-id-for-user-identity.util.ts`). Agent-owned apps are linked via `Client.agentId` → application, so agents with clients/apps get `latestAppId: null` → FE shows "No applications yet"

### Existing pagination pattern (prefer reuse)

- `apps/api/src/shared/types/paginated-list.types.ts`: `{ items, total, page, pageSize }`
- Helpers: `buildPaginatedList`, `isPaginationRequested`, `normalizePageSize`
- Used by users + apps lists — **not** yet in `@vises/contracts`

### Frontend surfaces

| Page | Path / slice |
|------|----------------|
| Users | `pages/users`, shell badge via `widgets/shell` (`kind=admin` → always "Admin") |
| Agents | `pages/agents` |
| Analytics | `pages/analytics` |
| Clients | `pages/clients` + `entities/client` |
| Agent balance | `pages/agents/AgentBalance*` |
| Theme / borders | shared UI tokens (`border-border`, `.field`) |

## Open questions (orchestrator decisions recorded in plan)

1. Query param name: QA said `limit`; codebase uses `pageSize` → **reuse `pageSize`**.
2. Clients table passport/Agent/Route item was listed under "Users" in QA → **apply to Clients list** (only table with passport + Open).
3. Migrations: none expected (read-path / query / DTO only).
