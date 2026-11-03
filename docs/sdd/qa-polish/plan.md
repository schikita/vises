# Plan — QA polish (pagination + UX)

| Field | Value |
|-------|-------|
| Feature id | `qa-polish` |
| Status | DONE (FE25 closed) |
| Updated | 2026-11-03 |
| Discovery | [`discovery.md`](./discovery.md); FE21: [`frontend/discovery-fe21-datatable.md`](./frontend/discovery-fe21-datatable.md); T23/FE23: [`discovery-t23-fe23-analytics-per-agent-pagination.md`](./discovery-t23-fe23-analytics-per-agent-pagination.md); FE24: [`discovery-agents-and-clients-per-agent-pagination.md`](./discovery-agents-and-clients-per-agent-pagination.md); FE25: [`frontend/tasks/FE25-datatable-row-hover-light.md`](./frontend/tasks/FE25-datatable-row-hover-light.md) |

## Goal

Ship a polish phase: paginate/filter key list APIs, fix agent applications mapping bug, enrich agent list metrics, and wire frontend tables/modals/datepicker/visual fixes per QA — then a second polish pass for list enrichment fields and remaining UX QA items — then a third pass hardening Analytics `perAgent` pagination + search so QA acceptance holds end-to-end.

## Acceptance criteria (feature-level)

### Phase 1 (T19 / FE17) — DONE

1. `GET /stats/roles-applications` paginates `perAgent` (sorted by client count desc) with `{ total, page, pageSize }` metadata.
2. `GET /clients` supports `page`, `pageSize`, `search`, `sortBy` (+ sort direction if already patterned) and returns a paginated envelope.
3. `GET /agents/:id/balance/transactions` supports `page`/`pageSize` and returns a paginated envelope.
4. `GET /users` list items include `clientsCount` and `currentBalance` for agents (null/0 for non-agents as appropriate).
5. Agent row activation finds a real application via client ownership (`Client.agentId`), not email identity match alone.
6. Contracts in `@vises/contracts` reflect new query/response shapes.
7. FE17: borders/hover, shell badge, users copy + confirm modals, agents columns, analytics pagination + date range Apply, clients search/sort/pagination + table layout, balance ledger pagination.

### Phase 2 (T20 / FE18) — DONE

8. `GET /clients` list rows include `agentName` and route cities (`routeFrom` / `routeTo` from application `submitCity` → `destination`).
9. `GET /users` agent rows include `totalRevenue` (decimal string): sum of absolute amounts of `client_creation_debit` ledger rows for that agent.
10. Analytics `perAgent` pagination strictly respects `pageSize` (QA “limit=5” ≡ `pageSize=5`); FE default top 5.
11. FE18: specific user confirm copy + action tooltips; agent balance pager no full reload/scroll jump; clients show agent name + route arrow + column sort UI; applications filter sizing + dark pill contrast; analytics top-5 + agent search + bottom table pager; agents Total Revenue column + sort UI.

### Phase 3 (T23 / FE23) — DONE

12. Backend T23: `GET /stats/roles-applications` returns correctly sliced `perAgent.items` for `page`/`pageSize`, with `total` = filtered agent count; `q` filters then paginates (DEC-P14/P15).
13. Frontend FE23: Analytics “Per-agent applications by status” shows ≤5 agents, working `ListPager`, search resets to page 1, query cache keys include `q`, pager does not full-reload or jump-to-top.

### Phase 4 (FE24) — DONE (corrected QA screenshots)

14. **Agents page:** ≤5 agents per page by default, visible `ListPager`, search by name/login resets to page 1, page change does not full-reload / jump-to-top. Uses existing `GET /users` pagination (no backend task).
15. **Analytics “Clients per agent”:** ≤5 rows per page via client-side slice (`ANALYTICS_CLIENTS_PER_AGENT_PAGE_SIZE=5`); pager text matches visible rows; Next/Prev changes chunk; no full reload. API `clientsPerAgent` remains unpaginated (DEC-P2).

### Phase 5 (FE25) — DONE

16. Shared DataTable light-theme row hover is clearly visible (`hover:bg-slate-100`); dark hover remains `dark:hover:bg-slate-800/50`. One constant change covers all DataTable consumers. (User requested as FE24; remapped to FE25 because FE24 is closed.)

## Affected packages

| Package | Change |
|---------|--------|
| `packages/contracts` | ClientListDto enrichment; UserListItemDto `totalRevenue`; ClientsListSortBy expand; Analytics optional `q` (agent search) |
| `apps/api` | clients list joins; users revenue aggregation; analytics pageSize + optional `q` |
| `apps/web` | users/agents/clients/applications/analytics/balance pages + entities |

## Decisions (orchestrator-recorded)

| ID | Decision |
|----|----------|
| DEC-P1 | Reuse existing API pagination vocabulary: `page` + `pageSize` (not `limit`). Envelope: `{ items, total, page, pageSize }` matching `PaginatedList`. Promote shared paginated type into `@vises/contracts` if consumers need it. |
| DEC-P2 | Analytics: keep `global` and `clientsPerAgent` unpaginated at API; paginate only `perAgent`. Sort agents by **client count descending** (tie-break `agentId`). Add optional `page`/`pageSize` query params (defaults when omitted: page 1, default page size). Response includes paginated `perAgent` + meta (prefer `perAgent: PaginatedList<AnalyticsPerAgentDto>`). |
| DEC-P3 | Clients list becomes paginated envelope (breaking for FE; FE17 updates same cycle). `search` matches name and masked/raw passport fields available without decrypting PII beyond existing list mask. `sortBy` allowlist: at least `createdAt`, `firstName` (map to columns used today). |
| DEC-P4 | Balance transactions: paginated envelope; preserve newest-first default sort. |
| DEC-P5 | `UserListItem` gains `clientsCount: number \| null` and `currentBalance: string \| null` (decimal string). Populate for `role === 'agent'`; other roles may use `null`. |
| DEC-P6 | Fix `latestAppId` for agents: resolve latest application through `Client` where `agentId = user.id` (then application by client). Keep email/login identity match for admin/staff if still useful. |
| DEC-P7 | No TypeORM migration in this feature (query/DTO only). |
| DEC-P8 | FE table “remove passport / add Agent + Route / clickable rows / remove Open” applies to **Clients** list (`entities/client` + `pages/clients`), not Users columns (Users has no passport). Users scope: badge, subtitle, action icon+confirm modals, agent apps navigation. |
| DEC-P9 | Shell badge: show Superadmin for `superadmin`; hide badge for agents; keep Admin for admin. |
| DEC-P10 | Analytics date range: custom date-range picker with explicit **Применить** before refetch. |
| DEC-P11 | **Route fields:** Application has `submitCity` + `destination` (no `cityFrom`/`cityTo` columns). Expose on `ClientListDto` as `routeFrom: string \| null` (= `submitCity` or null when empty) and `routeTo: string \| null` (= `destination` or null when empty). FE renders `From → To` with arrow icon; both empty → `—`. |
| DEC-P12 | **agentName:** Prefer non-empty `User.name`; else `login`. Do not invent first+last composition beyond existing `name` (already the display name). |
| DEC-P13 | **totalRevenue:** Decimal string sum of `ABS(amount)` for ledger rows where `type = 'client_creation_debit'` and agent is the ledger owner. Non-agents: `null`. Empty debits → `"0.00"`. |
| DEC-P14 | QA “limit” ≡ existing `pageSize` (DEC-P1). No new `limit` query param. FE18 default `pageSize: 5` for analytics `perAgent`. |
| DEC-P15 | **Analytics agent search:** Optional query `q` filters the pre-pagination `perAgent` universe by agent display name / login / id (case-insensitive contains). When `q` set, still sort by client count desc then paginate. Bottom `clientsPerAgent` table remains API-unpaginated (DEC-P2); FE18 may client-paginate that table. |
| DEC-P16 | **Clients sort expand:** Extend `ClientsListSortBy` allowlist with `agentName`, `route`, `status` (plus existing `createdAt`, `firstName`). Sort direction: reuse existing clients pattern if present; else add `sortDir` consistently with users list (`asc`/`desc`). |
| DEC-P17 | **Agents sort:** Prefer API `sort`/`sortDir` allowlist extensions for agent metrics (`name`/`user`, `currentBalance`, `clientsCount`, `totalRevenue`) when listing `role=agent`. If server-side sort of aggregates is costly, document in-task and implement server-side for correctness across pages. |
| DEC-FE20-1 | DateRangePicker: remove `captionLayout="dropdown"`; prefer clickable Month/Year header + Year/Month grids. |
| DEC-FE20-2 | DateRangePicker presets update draft ISO `from`/`to` only; Analytics Apply remains the refetch gate (DEC-P10). |
| DEC-FE20-3 | Year window for grids/selects stays bounded (align with existing bounds util or ~2020–current+buffer). |
| DEC-FE21-1 | DataTable lives at `apps/web/src/shared/ui/components/DataTable/` (existing kit convention). User-proposed `shared/ui/DataTable/` maps to this path; barrel-export like peers. |
| DEC-FE21-2 | DataTable owns thead/tbody chrome + centralized empty state. `ListPager` remains a sibling outside DataTable. Row hover: light originally `hover:bg-slate-50`, **superseded by FE25** to `hover:bg-slate-100`; dark `hover:bg-slate-800/50`. Cell padding unified (e.g. `px-4 py-3`). |
| DEC-FE21-3 | FE21 scope = seven `<table>` call sites (Users, Applications, Agents, ClientListTable, BalanceLedgerTable, AnalyticsStatusBucketsTable, AnalyticsClientsPerAgentTable). Sort-icon dedupe and Applications legacy token cleanup are out of scope unless required for DataTable adoption. |
| DEC-FE21-4 | FE21 may run in parallel with FE20 (disjoint packages/files). Spec approval = user FE21 mandate 2026-11-02 (polish-only; no contracts/migrations). |
| DEC-FE22-1 | DateRangePicker year bounds are dynamic: CurrentYear−30 … CurrentYear+30 (inclusive). Replaces FE20 past-only window ending at today. |
| DEC-FE22-2 | Caption → Year grid → Month grid → Day view is mandatory; year selection must not skip Month grid. |
| DEC-FE22-3 | Presets + Apply gate unchanged (DEC-FE20-2 / DEC-P10). Spec approval = user FE22 mandate 2026-11-02 (polish-only; no contracts/migrations). |
| DEC-P24-1 | Corrected QA scope (2026-11-03 screenshots): paginate **Agents page** + Analytics **Clients per agent** only. T23/FE23 perAgent work stays DONE but is not the primary fix for these screenshots. |
| DEC-P24-2 | Agents default page size **5** is page-local; do **not** change global `STAFF_LIST_PAGE_SIZE` (Users/Clients/etc. stay 20). Reuse `GET /users` `page`/`pageSize`/`q`. |
| DEC-P24-3 | Analytics `clientsPerAgent` FE page size **5** (constant change); keep API unpaginated (DEC-P2/P15). No new backend task for Phase 4. |
| DEC-P24-4 | Agents list uses `keepPreviousData` (or equivalent) so pager refetch does not blank the table / feel like full reload. |

## Cross-cutting risks

- Breaking response shapes for clients list and balance ledger (array → paginated) — phase 1.
- Analytics contract shape change for `perAgent` — phase 1.
- Agent `latestAppId` semantics change (desired) — phase 1.
- Auth/PII: client search must not return plaintext passport beyond existing mask.
- Phase 2: clients list N+1 if agent join naïve — batch-load agents by `agentId`.
- Phase 2: `totalRevenue` aggregation must not load full ledgers per row in a loop — batch SQL `GROUP BY`.
- Phase 2: FE balance “reload” may be React Query refetch + scroll restoration, not form submit (ListPager already `type="button"`).

## Phases

1. **T19** — contracts then backend — **DONE**
2. **FE17** — frontend (depends on T19) — **DONE**
3. **T20** — contracts then backend (enrichment + analytics `q` / pageSize) — **DONE**
4. **FE18** — frontend (depends on T20) — **DONE**
5. **FE19** — frontend-only: replace Analytics native date inputs with themed `DateRangePicker` (`react-day-picker`); keeps DEC-P10 Apply gate — **DONE** (independent of T20/FE18; arch OKAY, code OKAY)
6. **FE20** — frontend-only: rework `DateRangePicker` UX — remove `captionLayout="dropdown"`, add clickable Month/Year → Year/Month grids, mid-range highlight polish, Popover presets; keep DEC-P10 Apply gate — **DONE** (arch OKAY, code OKAY)
7. **FE21** — frontend-only: shared `DataTable` + refactor all seven staff/analytics/balance tables; centralized empty state; `ListPager` stays sibling — **DONE** (arch OKAY, code OKAY)
8. **FE22** — frontend-only: fix `DateRangePicker` range selection + continuous mid-range highlight; expand year bounds to CurrentYear−30…CurrentYear+30 with decade Prev/Next; harden Year → Month → Day flow; keep presets + DEC-P10 Apply gate — **DONE** (arch OKAY, code OKAY)
9. **T23** — backend harden: analytics `perAgent` strict `page`/`pageSize` + `q` filter-then-paginate — **DONE** (arch OKAY, code OKAY)
10. **FE23** — frontend: Analytics ListPager + search query-key fix (depends on T23) — **DONE** (arch OKAY, code OKAY)
11. **FE24** — frontend: Agents pageSize 5 + Analytics clientsPerAgent pageSize 5 (screenshot correction) — **DONE** (arch OKAY, code OKAY; no backend companion)

### DEC-P10 follow-up (FE19)

FE17 shipped the Apply-gated date range UX but still used `<input type="date">` (native calendar breaks dark theme). FE19 completes DEC-P10 visually: custom Popover + `react-day-picker` `mode="range"`, theme tokens for light/dark, no native date inputs.

### DEC-P10 follow-up (FE20)

FE19’s native year dropdown (`captionLayout="dropdown"`) is unusable for fast year jumps. FE20 replaces it with clickable header + Year/Month grids (or bounded dual-select fallback), strengthens range mid-highlight, and adds Last 7 days / This Month / This Year presets inside the Popover. Presets update draft `from`/`to` only; Apply remains the refetch gate.

### DEC-P10 follow-up (FE22)

FE20 left year bounds as ~past-20 ending at current year and QA still saw range / Month-grid gaps. FE22 expands bounds to CurrentYear−30…CurrentYear+30, restores reliable `mode="range"` selection with continuous mid-range highlight and `dd.MM.yyyy - dd.MM.yyyy` trigger text, and enforces Caption → Year → Month → Day without skipping the Month grid. Presets and Apply gate unchanged.

## Sensitive paths

- Public REST list contracts
- Users list navigation / applications ownership
- Shared theme tokens (visual regression)
- Ledger aggregation / billing-adjacent totals (`totalRevenue`)

## Discovery reference

Prior evidence: [`discovery.md`](./discovery.md). Phase 2 builds on post-T19 code: clients already load applications in `list()`; analytics already slices `perAgent` by `page`/`pageSize`; users already expose `clientsCount`/`currentBalance`.
