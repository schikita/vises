# Discovery — T23 / FE23 Analytics per-agent pagination

| Field | Value |
|-------|-------|
| Feature | `qa-polish` |
| Topic | Analytics `perAgent` pagination + agent search |
| Updated | 2026-11-03 |
| Confidence | high |

## Summary

T19/T20/FE17/FE18 already introduced `page`/`pageSize`/`q` for `GET /stats/roles-applications` and FE default top-5 + `ListPager` + search. **T23/FE23** are a QA follow-up to close remaining gaps so acceptance criteria are reliably met (strict slice, search cache correctness, no full reload / jump-to-top).

## Prior tasks (DONE)

- **T19** — `perAgent` → `PaginatedList`; query `page`/`pageSize`
- **T20** — strict `pageSize`; optional `q` (filter before paginate)
- **FE18** — default `pageSize: 5`; search `q`; `ListPager` on per-agent + client-side pager for `clientsPerAgent`

## Current code evidence (2026-11-03)

### Backend (`apps/api/src/modules/analytics/`)

- Controller passes `parseAnalyticsPagination({ page, pageSize })` and trimmed `q`.
- `buildAnalyticsDto` filters by `agentQ`, sorts by client count desc (tie-break `agentId`), slices, returns `buildPaginatedList` with `total`.
- Vocabulary is **`page` / `pageSize`** (DEC-P1 / DEC-P14). No `limit` query param.
- API default page size when omitted: shared `DEFAULT_PAGE_SIZE` (20). FE always sends 5.

### Frontend

- `AnalyticsPage`: `ANALYTICS_PER_AGENT_PAGE_SIZE = 5`; page state; search resets page to 1; `keepPreviousData`.
- `AnalyticsReport`: `ListPager` under per-agent section (project standard pager; no separate `Pagination` component).
- **Gap:** `ANALYTICS_QUERY_KEYS.rolesApplications` includes `from`/`to`/`page`/`pageSize` but **omits `q`** → TanStack cache can return wrong agents for different searches.

### Contracts

- `AnalyticsDto.perAgent: PaginatedList<…>`; `AnalyticsQuery` has `page?`, `pageSize?`, `q?`.

## Non-goals

- New `limit` query param (forbidden by DEC-P14).
- API pagination of `clientsPerAgent` / `global` (DEC-P2).
- Migrations / events / billing.

## Open questions resolved for planning

| Question | Decision |
|----------|----------|
| Use `limit` or `pageSize`? | `pageSize` only (DEC-P14); QA “limit=5” ≡ `pageSize=5` |
| New Pagination component? | Reuse existing shared `ListPager` |
| Scope of T23 if T20 DONE? | Harden + regression-test; fix any incomplete uncommitted analytics work |
| Scope of FE23? | Fix query-key `q`; confirm pager/search/scroll behavior; complete any partial FE work |
