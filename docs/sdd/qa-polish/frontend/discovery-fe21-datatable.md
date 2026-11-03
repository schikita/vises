# Discovery — FE21 DataTable unification

| Field | Value |
|-------|-------|
| Topic | Unify all frontend tables behind shared `DataTable` |
| Date | 2026-11-02 |
| Confidence | high |
| Explorer | sdd-project-explorer |

## Summary

Seven bespoke `<table>` call sites exist under `apps/web`. No shared `DataTable` today. Shared UI kit lives at `shared/ui/components/<Name>/`. Empty states use shared `Empty` + i18n; pagination is sibling `ListPager` (must stay outside DataTable).

## Complete `<table>` inventory

1. `apps/web/src/pages/users/UsersRender.tsx`
2. `apps/web/src/pages/applications/ApplicationsRender.tsx`
3. `apps/web/src/pages/agents/AgentsRender.tsx`
4. `apps/web/src/entities/client/ui/ClientListTable/ClientListTable.tsx`
5. `apps/web/src/entities/balance/ui/BalanceLedgerTable/BalanceLedgerTable.tsx`
6. `apps/web/src/entities/analytics/ui/AnalyticsStatusBucketsTable/AnalyticsStatusBucketsTable.tsx`
7. `apps/web/src/entities/analytics/ui/AnalyticsClientsPerAgentTable/AnalyticsClientsPerAgentTable.tsx`

## Kit convention

Exemplar: `shared/ui/components/Btn/`, `Empty/`, `ListPager/`, `DateRangePicker/` — folder + `*.types.ts` / `*.constants.ts` / local `index.ts` + barrel via `components/index.ts` and `shared/ui/index.ts`.

## Tests

Only `AnalyticsStatusBucketsTable.spec.tsx` among table components. Verification: `pnpm --filter @vises/web lint|test|build`.

## Open questions resolved in plan

See DEC-FE21-* in `docs/sdd/qa-polish/plan.md`.
