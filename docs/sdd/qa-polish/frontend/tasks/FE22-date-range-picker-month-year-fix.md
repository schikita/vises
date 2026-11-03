# FE22 — Fix DateRangePicker range logic, year bounds (−30/+30), Month grid flow

| Field | Value |
|-------|-------|
| Task ID | `FE22` |
| Title | Fix Date Range Picker: range selection, year bounds −30/+30, Month Picker grid |
| Status | **DONE** |
| Architecture | **OKAY** (cycle 1) |
| Code | **OKAY** (cycle 2) |
| Implemented | 2026-11-02 |
| Feature | `qa-polish` |
| owner_layer | `apps/web` — `shared/ui` (`DateRangePicker`) + optional touch in `features/analytics-filters` |
| depends_on | FE20 |
| Prerequisites | FE20 complete (Year/Month grids + presets already present; DEC-P10 Apply gate intact) |
| Dependents | — |
| sensitive_paths | Theme tokens / calendar styling (light + dark); Analytics filter UX (Apply still gates refetch per DEC-P10) |
| Implementer | sdd-frontend-implementer |

## Goal

FE20 shipped clickable Year/Month navigation and presets, but QA still reports broken/incomplete range selection UX, a year window that stops at “today” (only −20 years back), and a Month grid that may be skipped or inconsistent. Harden the shared `DateRangePicker` so range selection, continuous mid-range highlight, Year grid (−30…+30 with decade Prev/Next), and Year → Month → Day flow all work reliably with consistent styling. Keep quick presets.

## Spec (approved by user mandate 2026-11-02)

This task’s functional specification is the user-approved FE22 mandate (restore range selection, expand year bounds −30/+30, implement/confirm Month Picker grid, keep presets). No separate `specs/` feature folder required for this polish-only UI change (no public API / contracts / migrations / auth / billing).

## Problem (current)

- `buildDayPickerBounds` uses `DATE_RANGE_PICKER_YEAR_WINDOW = 20` and `endMonth = endOfYear(today)` — users cannot pick future years, and past window is only 20 years.
- Range mode is configured (`mode="range"`), but mid-range continuous highlight / trigger display must be verified and fixed if broken.
- Month grid exists (`DateRangePickerMonthGrid`) and `handleSelectYear` sets Months view — confirm the 3-step flow always runs (Year → Month → Days) and styles match Year grid.
- Presets must remain.

## Scope — exact implementer contract

### 1. Restore Range Selection

- Ensure `react-day-picker` is configured with `mode="range"`.
- Clicking the first date sets the `from` date. Clicking a second date sets the `to` date.
- Days between `from` and `to` must have a continuous background highlight (token-equivalent of `bg-primary/20` / `--vises-accent-subtle`).
- The trigger input must display the range nicely (e.g. `01.11.2026 - 15.11.2026`) via existing `formatDateRangeDisplay` (or fix if broken).

### 2. Expand Year Range (−30 to +30)

- Year bounds must calculate dynamically from “today”:
  - `startYear` = Current Year − 30
  - `endYear` = Current Year + 30
- Update `DATE_RANGE_PICKER_YEAR_WINDOW` / `buildDayPickerBounds` (or replace with explicit past/future constants) so `startMonth`/`endMonth` cover that full window — not “end at current year only”.
- Users must navigate between decade pages using header **Previous** / **Next** arrows on the Year grid (existing `DATE_RANGE_PICKER_YEAR_PAGE_SIZE` / `yearPageStart` pattern).
- Year cells outside the −30…+30 window stay disabled; within window, all years are selectable.

### 3. Implement / harden Month Picker Grid

- Standard 3-step flow (must work every time):
  1. **Year Grid**: clicking the calendar caption opens the year grid.
  2. **Month Grid**: clicking a year opens a 3×4 or 4×3 grid of months (Jan…Dec).
  3. **Day Grid**: clicking a month opens the standard day calendar for that month/year.
- Do **not** skip Month grid (year click must not jump straight to days).
- Month Grid styling must match Year Grid (shared cell classes: hover, active, disabled, border-radius, padding).

### 4. Keep Quick Presets

- Presets at the bottom (**Last 7 days**, **This Month**, **This Year**) must remain.
- Presets instantly update the selected draft range (`onFromChange` / `onToChange`).
- **DEC-P10 / DEC-FE20-2:** Analytics refetch still happens only on **Apply** outside the picker.

### 5. Conventions (mandatory)

- Follow `.cursor/rules/file-separation.mdc`, `react-components.mdc`, `typescript-conventions.mdc`.
- One React component per file; no types/constants/helpers co-located in the component file.
- No `enum`, no `function` declarations; use `const` arrow functions with explicit return types.
- FSD: reusable picker stays in `shared/ui`; Analytics wiring stays in `features/analytics-filters` (only if i18n/layout needed).
- Do not commit. Do not change backend or `@vises/contracts`.

## FSD placement

| Concern | Slice / segment |
|---------|-----------------|
| DateRangePicker fix + Year/Month/Day flow | `shared/ui/components/DateRangePicker/` |
| Bounds / year-page utils + tests | `shared/ui/components/DateRangePicker/*.util.ts` / `*.spec.ts` |
| Types / constants | dedicated `*.types.ts` / `*.constants.ts` |
| Analytics Apply composition | `features/analytics-filters` (only if needed) |

## Out of scope

- Backend / contracts / migrations
- Changing Apply semantics (still required before Analytics refetch)
- Replacing date inputs on other pages (unless they already consume this shared picker)
- Reintroducing `captionLayout="dropdown"`

## Acceptance criteria

- [x] Users can select a date range (start click + end click) with continuous mid-range highlight
- [x] Trigger displays range as `dd.MM.yyyy - dd.MM.yyyy` when both ends set
- [x] Year grid allows navigating from CurrentYear−30 to CurrentYear+30 via Prev/Next decade pages
- [x] User can pick a month from a grid before seeing the days (Year → Month → Day)
- [x] Styling is consistent across Years, Months, and Days (shared tokens / cell styles)
- [x] Quick presets still update draft `from`/`to` instantly; Apply remains refetch gate
- [x] Lint / tests / build for `@vises/web` pass on touched scope

## Review outcomes

| Gate | Verdict | Notes |
|------|---------|-------|
| Architecture | OKAY (cycle 1) | Non-blocking: CSS header comment — fixed in code cycle 2 |
| Code | OKAY (cycle 2) | Cycle 1 NEEDS_REVISION: flaky November-2026 system-date test — fixed with `vi.setSystemTime` |
| Verification | pass | lint / test (115) / build (cycle 1); cycle 2 re-ran lint + tests |

## verification_commands

```bash
pnpm --filter @vises/web lint
pnpm --filter @vises/web test
pnpm --filter @vises/web build
```

## Discovery / prior art

- Current picker: `apps/web/src/shared/ui/components/DateRangePicker/DateRangePicker.tsx` (`mode="range"`, view modes Days/Months/Years)
- Bounds: `build-day-picker-bounds.util.ts` + `DATE_RANGE_PICKER_YEAR_WINDOW` (today: 20 past, end = current year — **must change**)
- Year grid: `DateRangePickerYearGrid.tsx` + `build-year-grid-years.util.ts` + `build-year-page-start.util.ts`
- Month grid: `DateRangePickerMonthGrid.tsx` + `build-month-grid-items.util.ts`
- Display: `format-date-range-display.util.ts`
- Styles: `date-range-picker.css` (range middle uses `--vises-accent-subtle`)
- Analytics: `features/analytics-filters/components/AnalyticsDateRangeFilters/`
- Prior tasks: [`FE19`](./FE19-analytics-date-range-picker.md), [`FE20`](./FE20-date-range-picker-rework.md)

## Decisions (FE22)

| ID | Decision |
|----|----------|
| DEC-FE22-1 | Year bounds are dynamic: `CurrentYear − 30` … `CurrentYear + 30` (inclusive). Replace FE20’s “past-only window ending at today”. |
| DEC-FE22-2 | Caption → Year grid → Month grid → Day view is mandatory; never skip Month grid after year selection. |
| DEC-FE22-3 | Presets + Apply gate unchanged (DEC-FE20-2 / DEC-P10). |

## IMPLEMENTATION AGENT PROMPT

```text
Implement FE22 for feature qa-polish.

Read: docs/sdd/qa-polish/frontend/tasks/FE22-date-range-picker-month-year-fix.md,
docs/sdd/qa-polish/plan.md (DEC-P10, DEC-FE20-*, DEC-FE22-*),
.cursor/rules/file-separation.mdc, react-components.mdc, typescript-conventions.mdc.

Fix shared/ui DateRangePicker:
1) mode=range; from then to; continuous mid-range highlight; trigger "dd.MM.yyyy - dd.MM.yyyy"
2) Year bounds CurrentYear-30 .. CurrentYear+30; decade Prev/Next
3) Caption → Year grid → Month grid → Day view (do not skip months); style Month like Year
4) Keep Last 7 days / This Month / This Year presets; Apply remains Analytics refetch gate
Theme-aware. One concern per file. Do not commit. Do not change backend/contracts.
```
