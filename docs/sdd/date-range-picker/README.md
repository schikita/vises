# SDD — Date range picker (dual single-day calendars)

| Field | Value |
|-------|-------|
| Feature id | `date-range-picker` |
| Status | **DONE** (DRP-TASK-001…002 arch OKAY + code OKAY) |
| Spec SoT | [`02-spec.md`](./02-spec.md) |
| Plan | [`04-plan.md`](./04-plan.md) |
| Tasks | [`05-tasks.md`](./05-tasks.md) |
| Upstream | Admin Analytics filters (`/admin/analytics` → `AnalyticsFiltersCard`) |
| Document home | **`docs/sdd/date-range-picker/`** (authoritative; **not** under `docs/sdd/frontend`) |
| Discovery | [`00-discovery.md`](./00-discovery.md) |
| Explorer | `3dcfd480-a06e-46b1-9b2e-0f40b9d5c7b8` |
| Bug evidence | Screenshot Nov 2026 end-date corner (path in discovery) |

## Purpose

Improve the shared `DateRangePicker` so the popover shows **two separate calendars** side by side (left = start day, right = end day), fix the **end-corner styling bug** (black outline / unreadable white text on mint), and keep the existing `from` / `to` string contract for Analytics presets and Apply.

## Document map

| Doc | Role |
|-----|------|
| [`00-discovery.md`](./00-discovery.md) | Explorer inventory + bug evidence + gap matrix |
| [`02-spec.md`](./02-spec.md) | **APPROVED** REQ/NFR/CON/DEC/AC SoT |
| [`04-plan.md`](./04-plan.md) | Implementation plan |
| [`05-tasks.md`](./05-tasks.md) | Task index (DRP-TASK-001…002) |

## Key approvals (2026-11-17)

- **DEC-DRP-001…007** approved (dual single-day calendars compose the range; corner styling parity; RU presets via consumer; preserve `from`/`to`; FSD shared-ui scope).
- Residual OQs in [`02-spec.md`](./02-spec.md) §14 are non-blocking for the accepted REQs.

## Next action

Manual click-test: Admin → `/admin/analytics` → open period picker (two calendars, start/end, presets, Apply).
