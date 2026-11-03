# T19 — List pagination, agent metrics, applications mapping

| Field | Value |
|-------|-------|
| Task ID | `T19` |
| Title | Backend & contracts: pagination/filtering + agent list metrics + latestAppId fix |
| Status | **DONE** |
| Feature | `qa-polish` |
| owner_layer | `packages/contracts` + `apps/api` (analytics, clients, balance, users) |
| depends_on | — |
| Prerequisites | None |
| Dependents | FE17 |
| sensitive_paths | REST list contracts; users→applications ownership; client search/PII mask |

## Goal

Update shared contracts and NestJS APIs so list endpoints paginate/filter correctly, agent user rows expose metrics, and agent application navigation resolves via clients.

## Scope

### Contracts (`packages/contracts`) — run first

1. Shared paginated list type if not already exported: `{ items, total, page, pageSize }`.
2. **Analytics**: paginated `perAgent` shape; query params documented (`page`, `pageSize` alongside `from`/`to`). Sort contract note: by client count desc.
3. **Clients**: query types (`page`, `pageSize`, `search`, `sortBy`); response becomes paginated `ClientListDto` items.
4. **Balance**: paginated `BalanceTransactionDto` list response; query `page`/`pageSize`.
5. **Users list item**: add `clientsCount` and `currentBalance` (nullable as per DEC-P5). Ensure FE-facing types in contracts or document API-local types that web will mirror — prefer contracts if user list types live there; otherwise extend API types and web entity types consistently.

### Backend (`apps/api`) — after contracts

1. **Analytics** `GET /stats/roles-applications`
   - Accept `page`/`pageSize`.
   - Sort agents by client count descending; paginate `perAgent`.
   - Return pagination metadata per DEC-P2.
2. **Clients** `GET /clients`
   - Support `page`, `pageSize`, `search` (name / masked passport), `sortBy` (`createdAt`, `firstName` allowlist).
   - Return paginated envelope.
3. **Balance** `GET /agents/:agentId/balance/transactions`
   - Support `page`/`pageSize`; return paginated envelope; keep newest-first.
4. **Users** `GET /users` (paged list)
   - Include `clientsCount` and `currentBalance` for agents.
5. **Bug fix** `latestAppId`
   - For agents: map via `Client.agentId` → applications (latest by updated/created).
   - Do not leave agents with clients/apps as `null` solely because email≠clientEmail.

### Tests

- Update/add unit tests for analytics build/pagination, clients list query, balance list pagination, users list metrics + latestAppId agent path.

## Out of scope

- Frontend (FE17)
- Migrations
- Changing create/update client or balance mutation APIs

## Acceptance criteria

- [ ] APIs return paginated responses for analytics `perAgent`, clients, and balance transactions
- [ ] Users list includes agent metrics (`clientsCount`, `currentBalance`)
- [ ] Agent `latestAppId` resolves via client ownership when apps exist
- [ ] `@vises/contracts` updated and built
- [ ] Scoped lint/build/tests green for contracts + api

## verification_commands

```bash
pnpm --filter @vises/contracts build
pnpm --filter api test -- --testPathPattern="analytics|clients|balance|users"
pnpm --filter api build
```

(Adjust filter names to workspace package names if needed. Always run convention-enforcing lint for touched packages.)

## IMPLEMENTATION AGENT PROMPT

```text
Implement T19 for feature qa-polish.

Read: docs/sdd/qa-polish/plan.md (DEC-P1…P7), this task file,
docs/sdd/qa-polish/discovery.md,
.cursor/rules/file-separation.mdc, nestjs-structure.mdc, typescript-conventions.mdc.

Contracts first, then apps/api. Reuse shared PaginatedList page/pageSize pattern.
No enum / function declarations / omitted return types. One concern per file.
Do not commit. Do not change frontend (FE17).
```
