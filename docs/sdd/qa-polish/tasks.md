# Tasks — qa-polish

| Field | Value |
|-------|-------|
| Feature id | `qa-polish` |
| Status | DONE (FE25 closed) |
| Plan | [`plan.md`](./plan.md) |

## Execution order

| ID | Title | Owner | Depends | Status | Architecture | Code |
|----|-------|-------|---------|--------|--------------|------|
| [T19](./tasks/T19-list-pagination-agent-metrics.md) | List pagination + agent metrics + apps mapping | contracts → backend | — | DONE | OKAY | OKAY |
| [FE17](./frontend/tasks/FE17-qa-ux-polish.md) | QA UX polish (tables, modals, datepicker, borders) | frontend | T19 | DONE | OKAY | OKAY |
| [T20](./tasks/T20-list-enrichment-analytics-limit.md) | Clients agent/route + agent revenue + analytics limit/q | contracts → backend | T19 | DONE | OKAY | OKAY |
| [FE18](./frontend/tasks/FE18-qa-ux-followup.md) | QA UX follow-up (modals, tables, analytics top-5) | frontend | T20 | DONE | OKAY | OKAY |
| [FE19](./frontend/tasks/FE19-analytics-date-range-picker.md) | Custom Analytics DateRangePicker (replace native date inputs) | frontend | FE17 | DONE | OKAY | OKAY |
| [FE20](./frontend/tasks/FE20-date-range-picker-rework.md) | Rework DateRangePicker (range UX + year/month grids + presets) | frontend | FE19 | DONE | OKAY | OKAY |
| [FE21](./frontend/tasks/FE21-unify-datatable.md) | Unify all tables behind shared DataTable | frontend | FE17 | DONE | OKAY | OKAY |
| [FE22](./frontend/tasks/FE22-date-range-picker-month-year-fix.md) | Fix DateRangePicker range + year −30/+30 + Month grid | frontend | FE20 | DONE | OKAY | OKAY |
| [T23](./tasks/T23-analytics-per-agent-pagination.md) | Analytics perAgent strict page/pageSize + q | backend | T20 | DONE | OKAY | OKAY |
| [FE23](./frontend/tasks/FE23-analytics-per-agent-pagination.md) | Analytics per-agent ListPager + search cache fix | frontend | T23 | DONE | OKAY | OKAY |
| [FE24](./frontend/tasks/FE24-agents-and-clients-per-agent-pagination.md) | Agents ≤5/page + clients-per-agent ≤5 rows | frontend | — | DONE | OKAY | OKAY |
| [FE25](./frontend/tasks/FE25-datatable-row-hover-light.md) | DataTable light-theme row hover visibility | frontend | FE21 | DONE | OKAY | OKAY |

## Parallelism

- Phase 1: T19 must complete before FE17.
- Phase 2: **T20 must complete fully** (contracts + backend + tests + reviews OKAY) **before FE18 starts**.
- Within T20: **contracts first**, then NestJS API modules.
- Do not run FE18 in parallel with T20.
- FE19 is frontend-only and may run independently of T20/FE18 once FE17 is done.
- FE20 is frontend-only and depends on FE19; do not reintroduce `captionLayout="dropdown"`.
- FE21 is frontend-only (shared DataTable + table refactors); may run in parallel with FE20 (disjoint surface: tables vs DateRangePicker). Depends on FE17 baseline only.
- FE22 is frontend-only and depends on FE20; expands year bounds to CurrentYear−30…CurrentYear+30 and hardens range + Month grid flow.
- Phase 3: **T23 must complete** (backend analytics pagination harden + reviews OKAY) **before FE23 starts**.
- Do not run FE23 in parallel with T23.
- Phase 4: **FE24** is frontend-only (Agents pageSize 5 + Analytics clientsPerAgent pageSize 5). **No companion backend task** — `GET /users` already paginates; `clientsPerAgent` stays API-full (DEC-P2).
- Phase 5: **FE25** is frontend-only (DataTable `DATA_TABLE_TR_CLASS` light hover). Depends on FE21. Requested as FE24 by user; remapped because FE24 is closed.
