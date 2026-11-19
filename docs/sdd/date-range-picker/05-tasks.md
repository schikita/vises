# Tasks index — date-range-picker

| Field | Value |
|-------|-------|
| Feature id | `date-range-picker` |
| Status | **DONE** (arch OKAY + code OKAY; manual click-test recommended) |
| Date | 2026-11-17 |
| Spec SoT | [`02-spec.md`](./02-spec.md) |
| Plan | [`04-plan.md`](./04-plan.md) |

## Execution order

| ID | Title | Owner | Depends | Status | Arch | Code |
|----|-------|-------|---------|--------|------|------|
| DRP-TASK-001 | Dual single-day calendars + selection rules | frontend | — | **DONE** | OKAY | OKAY |
| DRP-TASK-002 | Selected-day / corner CSS parity + tests | frontend | DRP-TASK-001 | **DONE** | OKAY | OKAY |

Preferred serial: **001 → 002**. Parallel with `demo-seed-volume` backend only.

## Hard constraints (all tasks)

- One concern per file; one component per `.tsx` (`.cursor/rules/file-separation.mdc`, `react-components.mdc`)
- No `enum`; explicit return types (`.cursor/rules/typescript-conventions.mdc`)
- Do **not** present product UX as `numberOfMonths={2}` range mode (**DEC-DRP-001**)
- Preserve `from` / `to` / `onFromChange` / `onToChange` / `presetLabels`
- No API / contracts / migration changes

---

## DRP-TASK-001 — Dual single-day calendars + selection rules

| Field | Value |
|-------|-------|
| **id** | `DRP-TASK-001` |
| **title** | Two side-by-side single-day calendars; start left / end right; end ≥ start |
| **owner_layer** | `apps/web` → FSD `shared/ui` → `components/DateRangePicker` |
| **depends_on** | none |
| **sensitive_paths** | Shared UI public props (preserve Analytics contract) |

### Acceptance criteria

- [ ] Days view shows **two** calendars side by side (**AC-001**)
- [ ] Left calendar: single-day start → `onFromChange` (**AC-002**)
- [ ] Right calendar: single-day end → `onToChange`; days before start not selectable (**AC-003**)
- [ ] Start moved after end → clear `to` (**plan OQ-DRP-002**); no committed `to` < `from` (**AC-004**)
- [ ] Same-day start=end allowed
- [ ] Presets still set both ends; Analytics RU labels via `presetLabels` still work (**AC-006** partial)
- [ ] Prop contract preserved (**AC-007** structural)
- [ ] Independent month chrome per calendar (plan OQ-DRP-001)
- [ ] File separation / one component per file for any new pieces (**AC-008**)

### Verification commands

```bash
pnpm --filter @vises/web run lint
pnpm --filter @vises/web run build
```

### Implementation notes

- Prefer two `DayPicker` `mode="single"` (or equivalent) instances over range-mode dual month.
- Extract helpers to `*.util.ts`; new presentational pieces get their own `.tsx` files.
- Touch `pages/analytics` only if tiny prop adaptation is required.
- `@vises/web` has no Jest/Vitest script today — do not add a new test runner in this task; rely on lint + build + manual AC checks.

---

## DRP-TASK-002 — Selected-day / corner CSS parity + tests

| Field | Value |
|-------|-------|
| **id** | `DRP-TASK-002` |
| **title** | Solid leaf selected styling on both calendars; remove black outline artifact |
| **owner_layer** | `apps/web` → FSD `shared/ui` → `components/DateRangePicker` (CSS + related) |
| **depends_on** | `DRP-TASK-001` |
| **sensitive_paths** | none beyond shared CSS affecting future consumers |

### Acceptance criteria

- [ ] Selected start and end days both use **solid leaf fill + readable white text** (**AC-005**)
- [ ] No thick black/dark outline on selected corner days (regression of screenshot defect)
- [ ] Obsolete range_middle chrome may be removed if unused; must not break selected readability
- [ ] Lint + build clean on touched files (**AC-008**)

### Verification commands

```bash
pnpm --filter @vises/web run lint
pnpm --filter @vises/web run build
```

### Implementation notes

- Align CSS variables with react-day-picker v10 selected/single styles; remove conflicting `--rdp-selected-border` / `.rdp-selected` outline that painted the end corner.
- Manual check: `/admin/analytics` period picker.
