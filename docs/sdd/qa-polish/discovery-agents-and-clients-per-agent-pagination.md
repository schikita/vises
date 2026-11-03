# Discovery — Agents list + Analytics clients-per-agent pagination (corrected QA)

| Field | Value |
|-------|-------|
| Feature | `qa-polish` |
| Topic | Agents page table + Analytics “Clients per agent” table (pageSize 5) |
| Updated | 2026-11-03 |
| Confidence | high |
| Screenshots | User-provided Agents list (no visible pager) + Analytics clients table (~19 rows while nearby pager says 1–5) |

## Correction vs T23/FE23

T23/FE23 hardened **per-agent applications by status** (`perAgent` API + FE). That was the **wrong primary target** for the user’s screenshots.

Corrected targets (exactly these two):

1. **Agents page** (`pages/agents`) — long list, pager hidden, want ≤5/page + search.
2. **Analytics “Clients per agent”** — want ≤5 rows matching pager; Next/Prev must change visible rows.

## Root cause (evidence)

| Table | Root cause |
|-------|------------|
| Agents | Already calls `GET /users?role=agent&page&pageSize&q` with `ListPager` + search. Uses shared `STAFF_LIST_PAGE_SIZE = 20`. Seed has 20 agents → `total <= pageSize` → **ListPager returns null** → all rows visible. |
| Clients per agent | Client-side slice already exists (`sliceAnalyticsClientsPage`) but `ANALYTICS_CLIENTS_PER_AGENT_PAGE_SIZE = 20`. With ~20 agents, slice is a no-op and **clients ListPager is hidden**. Screenshot “Page 1 of 4 — showing 1–5” is the **perAgent** pager above this section (pageSize 5), not the clients table. |

## Backend

- **Agents:** No API change required — `GET /users` already paginates with `page`/`pageSize`/`q`.
- **Clients per agent:** No API change — DEC-P2/P15 keep `clientsPerAgent` full at API; FE client-paginates.

## FE fix direction

1. Agents: page-local default page size **5** (do **not** change global `STAFF_LIST_PAGE_SIZE`); keep search; reset page on search; `keepPreviousData` so pager does not flash full reload.
2. Analytics clientsPerAgent: set `ANALYTICS_CLIENTS_PER_AGENT_PAGE_SIZE` to **5**; table already receives sliced rows; ListPager will appear when total > 5.

## Non-goals

- Re-opening perAgent T23/FE23 as primary work.
- API pagination of `clientsPerAgent`.
- Changing Users/Clients/Applications default page sizes.
- Migrations / contracts.
