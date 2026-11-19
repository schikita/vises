# SDD — Admin Система / Analytics UX

| Field | Value |
|-------|-------|
| Feature id | `admin-system-analytics-ux` |
| Status | **DONE** (implementation + arch/code OKAY; DEC-ASAU-001…009 PROPOSED_DEFAULT) |
| Spec SoT | [`02-spec.md`](./02-spec.md) |
| Plan | [`04-plan.md`](./04-plan.md) |
| Tasks | [`05-tasks.md`](./05-tasks.md) |
| Upstream | Admin home `/admin` (Система), Analytics `/admin/analytics`, Users, Application detail, Visits |
| Document home | **`docs/sdd/admin-system-analytics-ux/`** (authoritative; **not** under `specs/` — tree absent) |
| Discovery | [`00-discovery.md`](./00-discovery.md) |
| Explorer | `2c9cd70c-66b6-4ad4-83ee-b39f33d293bd` |

## Purpose

Differentiate **Система** (operational command center) from **Analytics** (period-filtered analytical workspace); enrich agent performance metrics with **balance / registered / paid**; clean Users row actions; fix agent→applications false-empty; tighten application delete + payment-docs RBAC to admin|superadmin; compact Visits search/city controls.

## Document map

| Doc | Role |
|-----|------|
| [`00-discovery.md`](./00-discovery.md) | Explorer inventory + gap matrix + evidence paths |
| [`02-spec.md`](./02-spec.md) | **APPROVED_WITH_PROPOSED_DEFAULTS** REQ/NFR/CON/DEC/AC SoT |
| [`04-plan.md`](./04-plan.md) | Execution plan + OQ picks + DAG |
| [`05-tasks.md`](./05-tasks.md) | Implementable task contracts |

## Key decisions (2026-11-17)

- **DEC-ASAU-001…007** locked as **PROPOSED_DEFAULT**.
- **DEC-ASAU-008** — agent §5.1 variants deferred.
- **DEC-ASAU-009** — locked §5.1 `AnalyticsDto` field names.
- Human override rights retained.

## Next action

Manual smoke on `/admin`, `/admin/analytics`, Users, Application detail, Visits. Human may override any PROPOSED_DEFAULT DEC. No commit unless requested.
