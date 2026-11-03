# FE25 — DataTable row hover visibility (light theme)

| Field | Value |
|-------|-------|
| Task ID | `FE25` |
| Requested as | User asked for `FE24`; that ID is already closed (Agents/clients pagination). This task is `FE25`. |
| Title | Make DataTable row hover clearly visible in light mode |
| Status | **DONE** |
| Architecture | **OKAY** (cycle 1) |
| Code | **OKAY** (cycle 1) |
| Feature | `qa-polish` |
| owner_layer | `apps/web` — `shared/ui/components/DataTable` |
| depends_on | FE21 (shared DataTable exists) |
| Prerequisites | FE21 DONE |
| Dependents | — |
| sensitive_paths | Shared DataTable row styling; visual hover across all staff tables |
| Implementer | sdd-frontend-implementer |

## Goal

Make table row hover clearly visible in light mode. All tables (Users, Clients, Applications, Analytics, Agents, Balance) use the shared DataTable, so one constant change covers them all.

## Spec (approved by user mandate 2026-11-03)

Polish-only UI change. No public API / contracts / migrations / auth / billing. No separate `specs/` feature folder required.

## Scope — exact implementer contract

1. Locate the unified DataTable at `apps/web/src/shared/ui/components/DataTable` (constants live in `data-table.constants.ts`).
2. Current row hover is too subtle in light mode: `hover:bg-slate-50` on a white/near-white background (`DATA_TABLE_TR_CLASS`).
3. Change the row hover style to be more visible:
   - Light theme: use `hover:bg-slate-100` or `hover:bg-slate-200/60`.
   - Dark theme: keep `dark:hover:bg-slate-800/50` or similar, ensuring it remains visible.
4. Do not change table call sites; fixing the shared constant updates all consumers.

## Out of scope

- Backend / contracts / migrations
- Per-table hover overrides
- Changing header, cell padding, borders, or empty state
- Dark-theme redesign beyond keeping hover visible

## Acceptance criteria

- [x] Hovering over a table row in light mode produces a clearly visible background color shift
- [x] Dark theme row hover remains visible (`dark:hover:bg-slate-800/50` or equivalent)
- [x] Change is confined to shared DataTable constants (no per-table forks)
- [x] `@vises/web` lint passes on touched scope

## Implementer completion report (2026-11-03)

### Files changed
- `apps/web/src/shared/ui/components/DataTable/data-table.constants.ts`

### Hover classes
- **Before:** `hover:bg-slate-50 dark:hover:bg-slate-800/50`
- **After:** `hover:bg-slate-100 dark:hover:bg-slate-800/50`

### Verification results
| command | result |
|---------|--------|
| `pnpm --filter @vises/web exec oxlint src/shared/ui/components/DataTable` | pass |
| `pnpm --filter @vises/web lint` | pass |

### Review
- Architecture: OKAY (cycle 1) — sdd-architecture-reviewer
- Code: OKAY (cycle 1) — sdd-code-reviewer

## verification_commands

```bash
pnpm --filter @vises/web exec oxlint src/shared/ui/components/DataTable
pnpm --filter @vises/web lint
```

## sensitive_paths

- `apps/web/src/shared/ui/components/DataTable/**`
- Theme / hover visual regressions across staff lists that consume DataTable

## IMPLEMENTATION AGENT PROMPT

```text
Implement FE25 (qa-polish): fix DataTable row hover visibility in light theme.

Exact instructions:
1. Locate the unified DataTable component at apps/web/src/shared/ui/components/DataTable.
2. The current row hover style is too subtle in light mode (likely hover:bg-slate-50 on a white background) — see DATA_TABLE_TR_CLASS in data-table.constants.ts.
3. Change the row hover style to be more visible:
   - Light theme: use hover:bg-slate-100 or hover:bg-slate-200/60.
   - Dark theme: keep dark:hover:bg-slate-800/50 or similar, ensuring it remains visible.
4. Since all tables use this single component, fixing it here will update Users, Clients, Applications, and Analytics tables simultaneously.

Acceptance criteria:
- Hovering over a table row in light mode produces a clearly visible background color shift.

Do not commit. Follow .cursor/rules file-separation, react-components, typescript-conventions.
Return: files changed, before/after hover class strings, verification command results.
```
