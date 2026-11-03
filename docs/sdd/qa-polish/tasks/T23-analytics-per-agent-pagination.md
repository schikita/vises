# T23 — Analytics perAgent pagination + search harden

| Field | Value |
|-------|-------|
| Task ID | `T23` |
| Title | Backend: strict `perAgent` page/pageSize + q filter-then-paginate |
| Status | **DONE** (arch OKAY, code OKAY) |
| Feature | `qa-polish` |
| owner_layer | `apps/api` (`src/modules/analytics/`) — contracts only if regression found |
| depends_on | T20 |
| Prerequisites | T20 DONE; inspect uncommitted analytics work before rewriting |
| Dependents | FE23 |
| sensitive_paths | Public REST `GET /stats/roles-applications` response shape |

## Goal

Ensure `GET /stats/roles-applications` **strictly** respects `page` and `pageSize` for the `perAgent` array (QA “limit” ≡ `pageSize`), returns total agent count in the paginated envelope, and applies optional `q` (agent name/login/id) **before** pagination.

## Context

T19/T20 already introduced pagination + `q`. Working-tree and QA still report missing/incorrect limits. Prefer **complete or correct** existing analytics module code over duplicating. Do **not** introduce a `limit` query param (DEC-P1 / DEC-P14).

Discovery: [`../discovery-t23-fe23-analytics-per-agent-pagination.md`](../discovery-t23-fe23-analytics-per-agent-pagination.md).

## Scope

### Backend (`apps/api/src/modules/analytics/`)

1. Confirm controller wires `page`, `pageSize`, and trimmed `q` into the service / `buildAnalyticsDto` path.
2. Enforce filter → sort (client count desc, tie-break `agentId`) → slice:
   - `pageSize=5` & `page=1` ⇒ `perAgent.items.length` is exactly 5, or fewer if fewer agents remain after filter.
   - `total` = count of agents in the filtered universe (pre-slice).
3. Keep `global` and `clientsPerAgent` unpaginated / unfiltered by `q` (DEC-P2 / DEC-P15).
4. Add or strengthen unit tests proving strict slice + `q` + page 2 offsets.
5. If contracts already match `PaginatedList` + `AnalyticsQuery.q`, do **not** change `@vises/contracts` unless a real gap is found (then escalate note in task status).

## Out of scope

- Frontend (FE23)
- Migrations / RabbitMQ / auth role changes
- New `limit` alias param
- Paginating `clientsPerAgent` at API

## Acceptance criteria

- [x] `pageSize=5`, `page=1` → `perAgent.items.length <= 5` and equals min(5, total)
- [x] `perAgent.total` reflects filtered agent count; `page` / `pageSize` echoed in envelope
- [x] `q` filters by agent id / login / name (case-insensitive contains) then paginates
- [x] Existing analytics unit tests green; new/updated cases cover strict pagination + search
- [x] One concern per file; no `enum` / `function` declarations / omitted return types

## verification_commands

```bash
pnpm --filter @vises/api test -- --testPathPatterns="analytics"
pnpm --filter @vises/api lint
pnpm --filter @vises/api build
```

## IMPLEMENTATION AGENT PROMPT

```text
Implement T23 for feature qa-polish.

Read:
- docs/sdd/qa-polish/plan.md (DEC-P1, P2, P14, P15)
- docs/sdd/qa-polish/tasks/T23-analytics-per-agent-pagination.md
- docs/sdd/qa-polish/discovery-t23-fe23-analytics-per-agent-pagination.md
- .cursor/rules/file-separation.mdc, nestjs-structure.mdc, typescript-conventions.mdc

Inspect existing apps/api/src/modules/analytics/ before rewriting.
page/pageSize only — no new limit param. Filter by q then paginate.
Do not commit. Do not change frontend (FE23).
```
