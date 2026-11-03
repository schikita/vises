# FE24 — Agents list + Analytics clients-per-agent pageSize 5

| Field | Value |
|-------|-------|
| Task ID | `FE24` |
| Title | Frontend: Agents ≤5/page + search UX; Clients-per-agent ≤5 rows |
| Status | **DONE** (arch OKAY, code OKAY) |
| Feature | `qa-polish` |
| owner_layer | `apps/web` — `pages/agents`, `entities/analytics` (constants); optional tiny shared only if needed |
| depends_on | — (backend already sufficient; T23/FE23 unrelated primary) |
| Prerequisites | Discovery [`../../discovery-agents-and-clients-per-agent-pagination.md`](../../discovery-agents-and-clients-per-agent-pagination.md) |
| Dependents | — |
| sensitive_paths | Shared `STAFF_LIST_PAGE_SIZE` must **not** be globally lowered |

## Goal

Fix the two tables from QA screenshots:

1. **Agents page** — show ≤5 agents per page by default with working `ListPager` and search by name/login (reset page to 1); page changes must not feel like full reload / jump-to-top.
2. **Analytics “Clients per agent”** — show ≤5 rows per page matching pager text; Next/Prev changes visible rows; no full reload.

## Root cause (do not misdiagnose)

- Agents: `STAFF_LIST_PAGE_SIZE=20` + seed 20 agents → ListPager hidden.
- Clients per agent: `ANALYTICS_CLIENTS_PER_AGENT_PAGE_SIZE=20` → same hide / full table. Nearby “1–5” text is the **perAgent** pager, not a broken slice at size 5.

## Scope (FSD)

### 1. `pages/agents` (+ local constant)

- Introduce an **Agents-only** page size constant `5` (e.g. under `pages/agents/constants/` or `entities/user` if already patterned for agents — prefer page/entity-local; **do not** change `STAFF_LIST_PAGE_SIZE`).
- Pass `pageSize: 5` to `fetchUsersPage` / query key.
- Keep existing search + `ListPager`; ensure search resets to page 1.
- Add `keepPreviousData` (or equivalent) so pager refetch does not replace the table with a blank loading Empty (match Analytics / AgentBalance pattern).
- No route remount / scroll-to-top on page change.

### 2. `entities/analytics`

- Set `ANALYTICS_CLIENTS_PER_AGENT_PAGE_SIZE` to **5**.
- Confirm `AnalyticsReport` still slices via `sliceAnalyticsClientsPage` and passes **sliced** rows to `AnalyticsClientsPerAgentTable`; ListPager under that section uses the same pageSize/total.
- Add/adjust a small unit test on the constant or slice util if cheap (optional but preferred).

## Out of scope

- Backend / contracts / migrations
- Changing global staff list page size for Users/Clients/Applications
- Re-working “Per-agent applications by status” (already T23/FE23)
- Drive-by refactors

## Acceptance criteria

- [x] Agents table shows ≤5 rows by default; ListPager visible when total > 5
- [x] Agents search by name/login works; resets to page 1; no full reload on page change
- [x] Analytics “Clients per agent” shows ≤5 rows on page 1; pager text matches row count; Next/Prev changes rows
- [x] No change to `STAFF_LIST_PAGE_SIZE` global default
- [x] `pnpm --filter @vises/web lint` + scoped tests + build green
- [x] One concern per file; no enum / function decls / omitted return types

## verification_commands

```bash
pnpm --filter @vises/web lint
pnpm --filter @vises/web exec vitest run src/entities/analytics src/pages/agents
pnpm --filter @vises/web build
```

## IMPLEMENTATION AGENT PROMPT

```text
Implement FE24 for qa-polish corrected pagination scope.

Read:
- docs/sdd/qa-polish/discovery-agents-and-clients-per-agent-pagination.md
- docs/sdd/qa-polish/frontend/tasks/FE24-agents-and-clients-per-agent-pagination.md
- docs/sdd/qa-polish/plan.md (DEC-P2, P15; new DEC-P24-*)
- .cursor/rules/file-separation.mdc, react-components.mdc, typescript-conventions.mdc

Agents: page-local pageSize 5 + keepPreviousData; do NOT change STAFF_LIST_PAGE_SIZE.
Analytics clientsPerAgent: set ANALYTICS_CLIENTS_PER_AGENT_PAGE_SIZE=5.
Reuse ListPager. No apps/api or contracts edits. Do not commit.
```
