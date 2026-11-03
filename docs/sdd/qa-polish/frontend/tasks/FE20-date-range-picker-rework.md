# FE20 — Rework DateRangePicker (range UX + year/month navigation)

| Field | Value |
|-------|-------|
| Task ID | `FE20` |
| Title | Completely rework custom DateRangePicker: usable range selection + fast year/month nav |
| Status | **DONE** |
| Architecture | **OKAY** (cycle 1) |
| Code | **OKAY** (cycle 2) |
| Feature | `qa-polish` |
| owner_layer | `apps/web` — `shared/ui` (`DateRangePicker`) + optional i18n touch in `features/analytics-filters` |
| depends_on | FE19 |
| Prerequisites | FE19 complete (Popover + `react-day-picker` `mode="range"` already wired; Analytics Apply gate intact) |
| Dependents | — |
| sensitive_paths | Theme tokens / calendar styling (light + dark); Analytics filter UX (Apply still gates refetch per DEC-P10) |

## Goal

FE19 shipped a themed `DateRangePicker`, but `captionLayout="dropdown"` produces an unusable native year list, and range selection / in-range styling feel incomplete. Rework the shared picker into a modern SaaS-style range calendar: clickable Month/Year header → Year grid → Month grid → Day view; clear range highlighting; quick presets inside the Popover; keep Apply as the Analytics refetch gate.

## Problem (current)

- `DateRangePicker` uses `captionLayout="dropdown"` (`DateRangePicker.tsx`) — huge scrollable year list.
- Year window via `DATE_RANGE_PICKER_YEAR_WINDOW` / `buildDayPickerBounds` feeds that dropdown.
- Range mode is configured, but UX and mid-range visuals need a full polish pass.
- No quick presets (Last 7 days / This Month / This Year).

## Scope — exact implementer contract

### 1. Fix range selection

- Keep `react-day-picker` with `mode="range"`.
- User must click a start date then an end date.
- Days between start and end must show a distinct mid-range background (use design tokens / Tailwind such as accent-subtle / `bg-primary/20`-equivalent via existing `--vises-accent-subtle`).
- Selected start/end must remain clearly contrasted in **both** light and dark themes.

### 2. Custom year/month navigation (required)

- **Do NOT** use `captionLayout="dropdown"` (or any unbounded native year list).
- Implement a **clickable header** pattern:
  1. Day view header shows current Month + Year (e.g. `November 2026`).
  2. Clicking the header opens a **Year Picker Grid** (3×4 / 4×3 or decade window such as 2020–2029).
  3. Clicking a year switches to a **Month Picker Grid** (12 months).
  4. Clicking a month returns to the Day view for that month/year.
- Control displayed month via `month` / `onMonthChange` (or equivalent) — do not rely on default dropdown caption.
- *Fallback allowed only if grid proves too complex:* two compact native `<select>` elements (Month + Year) with a **restricted** year range (e.g. 2020–2030) styled to match the design system. Prefer the clickable header + grids.

### 3. Styling & UX

- Calendar must look like a modern SaaS component (shadcn/ui / Airbnb-class polish).
- Keep Popover wrapping the calendar.
- Add quick **preset buttons inside the popover** (at least):
  - Last 7 days
  - This Month
  - This Year
- Presets update the draft `from`/`to` immediately (via existing `onFromChange` / `onToChange`).
- **DEC-P10:** Analytics refetch still happens only when the user clicks **Apply** outside the picker (do not remove Apply; do not auto-refetch on preset unless an explicit optional callback is added and Analytics opts in — default: draft-only).
- Ensure readable contrast for days, selected days, and range highlights in Light and Dark.

### 4. References

- shadcn-style date range pickers with custom month/year navigation (e.g. `flixlix/shadcn-date-picker` patterns).
- `react-day-picker` docs: `onMonthChange`, custom caption / components API.

### 5. Conventions (mandatory)

- Follow `.cursor/rules/file-separation.mdc`, `react-components.mdc`, `typescript-conventions.mdc`.
- One React component per file; no types/constants/helpers co-located in the component file.
- Split Year grid / Month grid / Caption header / Presets into separate component files under `DateRangePicker/` (or sibling folders) as needed.
- No `enum`, no `function` declarations; use `const` arrow functions with explicit return types.
- FSD: reusable picker stays in `shared/ui`; Analytics wiring stays in `features/analytics-filters`.
- Do not commit. Do not change backend or `@vises/contracts`.

## FSD placement

| Concern | Slice / segment |
|---------|-----------------|
| DateRangePicker rework + caption/year/month/presets UI | `shared/ui/components/DateRangePicker/` |
| Preset date math utils | `shared/ui/components/DateRangePicker/*.util.ts` |
| Types / constants | dedicated `*.types.ts` / `*.constants.ts` |
| Analytics Apply / mode composition | `features/analytics-filters` (only if i18n labels or layout tweak needed) |
| Theme tokens | reuse `apps/web/src/index.css`; change only if a documented token is required |

## Out of scope

- Backend / contracts / migrations
- Changing Apply semantics (still required before Analytics refetch)
- Replacing date inputs on other pages (unless they already consume this shared picker)
- Reintroducing `captionLayout="dropdown"`

## Acceptance criteria

- [x] User can select a date range (start click + end click) with visible mid-range highlight
- [x] Year/month selection is fast — **no** endless scrolling year dropdown (`captionLayout="dropdown"` removed)
- [x] Clickable header → Year grid → Month grid → Day view (or approved compact dual-select fallback with bounded years)
- [x] Presets (Last 7 days, This Month, This Year) appear inside the Popover and update draft `from`/`to`
- [x] Apply button still works; Analytics refetch remains Apply-gated (DEC-P10)
- [x] Styling matches app tokens; readable in Light and Dark
- [x] Lint / tests / build for `@vises/web` pass on touched scope

## Review outcomes

| Gate | Verdict | Notes |
|------|---------|-------|
| Architecture | OKAY (cycle 1) | Non-blocking: year-page constant alignment (fixed in cycle 2); optional a11y i18n props |
| Code | OKAY (cycle 2) | Cycle 1 NEEDS_REVISION: explicit return type + nav interaction test — fixed |
| Verification | pass | `pnpm --filter @vises/web` lint / test (110) / build |

## verification_commands

```bash
pnpm --filter @vises/web lint
pnpm --filter @vises/web test
pnpm --filter @vises/web build
```

## Discovery / prior art

- Current picker: `apps/web/src/shared/ui/components/DateRangePicker/DateRangePicker.tsx` (`captionLayout="dropdown"`, `mode="range"`)
- Styles: `apps/web/src/shared/ui/components/DateRangePicker/date-range-picker.css`
- Analytics integration: `apps/web/src/features/analytics-filters/components/AnalyticsDateRangeFilters/AnalyticsDateRangeFiltersRender.tsx`
- Prior task: [`FE19-analytics-date-range-picker.md`](./FE19-analytics-date-range-picker.md)
- DEC-P10 (qa-polish plan): custom date-range picker with explicit Apply

## Decisions (FE20)

| ID | Decision |
|----|----------|
| DEC-FE20-1 | Remove `captionLayout="dropdown"`; prefer clickable Month/Year header + Year/Month grids. |
| DEC-FE20-2 | Presets update draft ISO `from`/`to` only; Analytics Apply remains the refetch gate (DEC-P10). |
| DEC-FE20-3 | Restricted year window for grids/selects stays reasonable (align with existing bounds util or ~2020–2030+current). |

## IMPLEMENTATION AGENT PROMPT

```text
Implement FE20 for feature qa-polish.

Read: docs/sdd/qa-polish/frontend/tasks/FE20-date-range-picker-rework.md,
docs/sdd/qa-polish/plan.md (DEC-P10, DEC-FE20-*),
.cursor/rules/file-separation.mdc, react-components.mdc, typescript-conventions.mdc.

Rework shared/ui DateRangePicker:
- mode=range with clear mid-range highlight
- NO captionLayout=dropdown
- clickable header → year grid → month grid → day view
- presets inside Popover (Last 7 days, This Month, This Year) update draft from/to
- keep Apply as Analytics refetch gate
Theme-aware light+dark. One concern per file.
Do not commit. Do not change backend/contracts.
```
