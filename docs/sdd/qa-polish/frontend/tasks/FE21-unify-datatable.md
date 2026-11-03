# FE21 — Unify frontend tables behind shared DataTable

| Field | Value |
|-------|-------|
| Task ID | `FE21` |
| Title | Unify Users/Clients/Applications/Analytics/Agents/Balance tables via shared DataTable |
| Status | **DONE** |
| Architecture | **OKAY** (cycle 2) |
| Code | **OKAY** (cycle 1) |
| Feature | `qa-polish` |
| owner_layer | `apps/web` — `shared/ui` + pages (users, clients, applications, agents, balance) + entities (client, analytics, balance) |
| depends_on | FE17 (table polish baseline); independent of FE20 |
| Prerequisites | FE17 done; inventory in [`discovery-fe21-datatable.md`](../discovery-fe21-datatable.md) |
| Dependents | — |
| sensitive_paths | Shared UI kit barrels; list/table UX across staff pages; Analytics AC-12 percentage tests |
| Implementer | sdd-frontend-implementer |
| Implemented | 2026-11-02 |

## Goal

Replace seven inconsistent custom `<table>` implementations with one generic `DataTable` in `shared/ui`, with identical wrapper/header/row/hover/cell styling and a centralized empty state. Preserve custom cell renders (badges, avatars, actions, links) via column `cell` renderers. Keep `ListPager` as a sibling outside DataTable.

## Spec (approved by user mandate 2026-11-02)

This task’s functional specification is the user-approved FE21 mandate (unify tables + empty state + refactor all listed surfaces). No separate `specs/` feature folder required for this polish-only UI change (no public API / contracts / migrations / auth / billing).

## Scope — exact implementer contract

### 1. Create shared DataTable

- **Location (DEC-FE21-1):** `apps/web/src/shared/ui/components/DataTable/`
  - Files (file-separation mandatory):
    - `DataTable.tsx` — one component
    - `data-table.types.ts` — props, column defs
    - `data-table.constants.ts` — className strings / defaults
    - optional `*.util.ts` if helpers needed
    - `index.ts` barrel
  - Re-export from `shared/ui/components/index.ts` and `shared/ui/index.ts`.
- Generic reusable HTML `<table>` / `<thead>` / `<tbody>` styled with Tailwind.
- Props: at least `columns` (array of column definitions) and `data` (array of row objects). Support:
  - `id` / `accessorKey` / `header` (ReactNode or string)
  - `cell?: (row) => ReactNode` for custom renders
  - `emptyTitle` / `emptyText` (or equivalent) for empty state copy (callers pass i18n)
  - optional `getRowId`, `onRowClick` / row props for interactive rows (Users/Clients/Agents)
  - optional `className` on wrapper if needed for `min-w` dialects
- **Identical styling** (constants file):
  - Wrapper: border, border-radius, overflow hidden; **no extra bottom margin/padding**
  - Header: consistent background, padding, text size, semibold/uppercase as chosen once
  - Body rows: consistent bottom/top borders
  - Row hover: light `hover:bg-slate-50` + dark `hover:bg-slate-800/50` (DEC-FE21-2; may combine with existing `table-row-interactive` only if equivalent)
  - Cell padding: e.g. `px-4 py-3`

### 2. Standardized empty state (centralized)

- When `data.length === 0`, do **not** render a bare empty `<tbody>`.
- Render a dedicated empty-state row / block inside the table chrome: centered muted icon (`FileQuestion` or `Inbox` from `lucide-react`) + message.
- Prefer existing i18n: callers pass translated `emptyTitle`/`emptyText` (existing keys). Optional default chrome key if useful (`chrome.dataTable.*`).
- May compose existing `Empty` inside the empty row **or** a DataTable-local empty presentational component in its own file — do not mix types/constants into the main component file.

### 3. Refactor all existing tables

Replace custom `<table>` markup at **all** of:

| Surface | Path |
|---------|------|
| Users | `pages/users/UsersRender.tsx` |
| Applications | `pages/applications/ApplicationsRender.tsx` |
| Agents | `pages/agents/AgentsRender.tsx` |
| Clients | `entities/client/ui/ClientListTable/ClientListTable.tsx` |
| Balance Ledger | `entities/balance/ui/BalanceLedgerTable/BalanceLedgerTable.tsx` |
| Analytics status buckets | `entities/analytics/ui/AnalyticsStatusBucketsTable/AnalyticsStatusBucketsTable.tsx` |
| Analytics clients-per-agent | `entities/analytics/ui/AnalyticsClientsPerAgentTable/AnalyticsClientsPerAgentTable.tsx` |

Rules:

- Custom cells (StatusBadge, Avatar, action buttons, Links, ClientRouteDisplay, percentages) via column `cell` renderers.
- Sortable headers: keep existing sort buttons/icons inside `header` renderers (do **not** fold `*ListSortIcon` into shared UI in this task).
- Entity wrappers (`ClientListTable`, `BalanceLedgerTable`, analytics tables) may remain as thin adapters that build `columns`/`data` and render `<DataTable />`.
- **Pagination:** `ListPager` stays **outside** DataTable (sibling). Must still work after refactor.
- Preserve row click / keyboard activation where it exists today.
- Preserve Analytics percentage `data-testid`s covered by `AnalyticsStatusBucketsTable.spec.tsx`.

### 4. Testing / verification

- Keep or update `AnalyticsStatusBucketsTable.spec.tsx` so AC-12 still passes.
- Prefer a small `DataTable` empty-state unit/component test if that matches project norms.
- Run verification commands below.

## FSD placement

| Concern | Slice / segment |
|---------|-----------------|
| DataTable kit | `shared/ui/components/DataTable/` |
| Barrel exports | `shared/ui/components/index.ts`, `shared/ui/index.ts` |
| Users / Agents / Applications adapters | `pages/users`, `pages/agents`, `pages/applications` |
| Clients table adapter | `entities/client/ui/ClientListTable` |
| Balance ledger adapter | `entities/balance/ui/BalanceLedgerTable` |
| Analytics table adapters | `entities/analytics/ui/*Table` |
| i18n (only if new chrome default keys) | `shared/i18n` |

## Out of scope

- Backend / contracts / migrations
- Merging duplicated `*ListSortIcon` into shared UI
- Absorbing `ListPager` into DataTable
- Changing Apply / analytics filter behavior
- FE20 DateRangePicker work

## Acceptance criteria

- [x] All listed tables share the same DataTable base styling (headers, borders, hover, cell padding)
- [x] Only one generic table component in `shared/ui` (`DataTable`); no leftover parallel generic Table kits
- [x] Empty states handled centrally by DataTable when `data.length === 0`
- [x] Custom cell content preserved via column `cell` renderers
- [x] Pagination (`ListPager`) still works on all refactored list pages
- [x] `@vises/web` lint / test / build pass on touched scope

## verification_commands

```bash
pnpm --filter @vises/web lint
pnpm --filter @vises/web test
pnpm --filter @vises/web build
```

## Implementer completion report (2026-11-02)

### Files created
- `apps/web/src/shared/ui/components/DataTable/DataTable.tsx`
- `apps/web/src/shared/ui/components/DataTable/DataTableEmpty.tsx`
- `apps/web/src/shared/ui/components/DataTable/data-table.types.ts`
- `apps/web/src/shared/ui/components/DataTable/data-table-empty.types.ts`
- `apps/web/src/shared/ui/components/DataTable/data-table.constants.ts`
- `apps/web/src/shared/ui/components/DataTable/resolve-data-table-cell.util.ts`
- `apps/web/src/shared/ui/components/DataTable/resolve-data-table-row-id.util.ts`
- `apps/web/src/shared/ui/components/DataTable/DataTable.spec.tsx`
- `apps/web/src/shared/ui/components/DataTable/index.ts`

### Files refactored
- `apps/web/src/pages/users/UsersRender.tsx`
- `apps/web/src/pages/applications/ApplicationsRender.tsx`
- `apps/web/src/pages/agents/AgentsRender.tsx`
- `apps/web/src/entities/client/ui/ClientListTable/ClientListTable.tsx`
- `apps/web/src/entities/balance/ui/BalanceLedgerTable/BalanceLedgerTable.tsx`
- `apps/web/src/entities/analytics/ui/AnalyticsStatusBucketsTable/AnalyticsStatusBucketsTable.tsx`
- `apps/web/src/entities/analytics/ui/AnalyticsClientsPerAgentTable/AnalyticsClientsPerAgentTable.tsx`
- `apps/web/src/shared/ui/components/index.ts`
- `apps/web/src/shared/ui/index.ts`

### Grep evidence
- Raw `<table` under `apps/web/src`: only `DataTable.tsx`

### Verification results
| command | result | summary |
|---------|--------|---------|
| `pnpm --filter @vises/web lint` | pass | oxlint exit 0; pre-existing warnings only |
| `pnpm --filter @vises/web test` | pass | 48 files / 110 tests passed |
| `pnpm --filter @vises/web build` | pass | `tsc -b && vite build` succeeded |

### Gaps / non-blocking review follow-ups
- Optional: dedupe `*ListSortIcon` (out of FE21 scope)
- Optional: `DataTable.spec` interactive row click/keyboard coverage
- Optional: `focus-visible` slate treatment on interactive rows; remove unused `.table-row-interactive` if confirmed dead

### Review
- Architecture: OKAY (cycle 2) — sdd-architecture-reviewer
- Code: OKAY (cycle 1) — sdd-code-reviewer

## sensitive_paths

- `apps/web/src/shared/ui/**`
- All seven table call sites listed above
- Analytics status-buckets percentage tests
- Theme / hover visual regressions across staff lists

## IMPLEMENTATION AGENT PROMPT

```text
Implement FE21 (qa-polish): unify all frontend tables behind shared DataTable.

Read:
- docs/sdd/qa-polish/frontend/tasks/FE21-unify-datatable.md (this file — SoT)
- docs/sdd/qa-polish/plan.md (DEC-FE21-*)
- docs/sdd/qa-polish/frontend/discovery-fe21-datatable.md
- .cursor/rules/file-separation.mdc, react-components.mdc, typescript-conventions.mdc

STRICT:
1. Create DataTable under apps/web/src/shared/ui/components/DataTable/ (kit convention; maps requested shared/ui/DataTable/).
2. columns + data API; cell renderers; centralized empty state with lucide icon + i18n-friendly copy.
3. Refactor all 7 <table> call sites; keep ListPager outside; preserve custom cells and row interactions.
4. One concern per file; named const components; no enum; explicit return types.
5. Do not commit. Do not change backend/contracts.
6. Run pnpm --filter @vises/web lint && test && build; report results.
```
