# FE23 — Analytics per-agent pagination + search

| Field | Value |
|-------|-------|
| Task ID | `FE23` |
| Title | Frontend: Analytics per-agent ListPager (pageSize 5) + search cache fix |
| Status | **DONE** (arch OKAY, code OKAY) |
| Feature | `qa-polish` |
| owner_layer | `apps/web` — `pages/analytics`, `entities/analytics` (shared `ListPager` only if needed) |
| depends_on | T23 |
| Prerequisites | T23 DONE (API strict page/pageSize + q) |
| Dependents | — |
| sensitive_paths | Analytics query cache keys; scroll UX on pager |

## Goal

On the Analytics page, under “Per-agent applications by status”, show only **5** agents per page with working prev/next pager and agent search. Pagination must not full-reload the page or jump to top. Searching resets to page 1.

## Context

FE18 already wired default `pageSize: 5`, search `q`, and `ListPager`. Known gap: TanStack query keys omit `q`, so search can hit a stale cache. Prefer completing/correcting existing code. Project standard pager is **`ListPager`** (no new `Pagination` component).

Discovery: [`../../discovery-t23-fe23-analytics-per-agent-pagination.md`](../../discovery-t23-fe23-analytics-per-agent-pagination.md).

## Scope (FSD)

### 1. `entities/analytics`

- Ensure fetch path always sends `page`, `pageSize: ANALYTICS_PER_AGENT_PAGE_SIZE` (5), and `q` when set.
- Fix `ANALYTICS_QUERY_KEYS.rolesApplications` so the key includes `q` (null when absent).
- Keep `AnalyticsReport` rendering `data.perAgent.items` + bottom `ListPager` wired to page change callback.
- Do not mix types/constants/utils into component files.

### 2. `pages/analytics`

- Default fetch `pageSize=5`; page state for per-agent pager.
- Search by agent name/login → pass `q`; **reset page to 1** on search change.
- Pager clicks update React state only (`ListPager` already `type="button"`); no route navigation that remounts the whole page or scrolls to top.
- Avoid unnecessary remounts on page-only changes (do not put page into a remount `key` if that causes jump).
- Use `keepPreviousData` (or equivalent) so pager does not flash empty.

### 3. `features/analytics-filters`

- Touch only if date Apply must continue resetting per-agent page to 1 (already expected); no unrelated datepicker work.

## Out of scope

- Backend / contracts edits (escalate if T23 gaps)
- Replacing `ListPager` with a new Pagination component
- API pagination of `clientsPerAgent` (client-side pager may remain)

## Acceptance criteria

- [x] Per-agent section shows at most 5 agents at a time
- [x] Working prev/next (`ListPager`) fetches next/prev chunk via `page`
- [x] Search by name/login works; searching resets to page 1; query key includes `q`
- [x] Pagination does not full page reload or jump-to-top
- [x] `pnpm --filter @vises/web lint` and scoped analytics tests/build green
- [x] One component per file; no mixed concerns

## verification_commands

```bash
pnpm --filter @vises/web lint
pnpm --filter @vises/web exec vitest run src/entities/analytics
pnpm --filter @vises/web build
```

## IMPLEMENTATION AGENT PROMPT

```text
Implement FE23 for feature qa-polish after T23.

Read:
- docs/sdd/qa-polish/plan.md (DEC-P1, P2, P10, P14, P15)
- docs/sdd/qa-polish/frontend/tasks/FE23-analytics-per-agent-pagination.md
- docs/sdd/qa-polish/discovery-t23-fe23-analytics-per-agent-pagination.md
- .cursor/rules/file-separation.mdc, react-components.mdc, typescript-conventions.mdc

Inspect existing pages/analytics + entities/analytics before rewriting.
Reuse ListPager. Fix query-key q omission. No full reload / scroll jump.
Do not commit. Do not change apps/api or packages/contracts.
```
