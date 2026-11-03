# FE19 — Replace native Analytics datepicker with custom DateRangePicker

| Field | Value |
|-------|-------|
| Task ID | `FE19` |
| Title | Custom theme-aware DateRangePicker for Analytics (replace native date inputs) |
| Status | **DONE** |
| Architecture | **OKAY** (cycle 2) |
| Code | **OKAY** (cycle 1) |
| Feature | `qa-polish` |
| owner_layer | `apps/web` — `shared/ui` (DateRangePicker + Popover if needed) + `features/analytics-filters` |
| depends_on | FE17 |
| Prerequisites | FE17 complete (Analytics date-range panel + Apply already wired) |
| Dependents | — |
| sensitive_paths | Theme tokens / calendar styling (light + dark); Analytics filter UX (Apply still gates refetch) |

## Goal

Replace the Analytics page native `<input type="date">` controls (browser calendar breaks dark theme) with a fully custom, theme-aware range calendar built on `react-day-picker` + `date-fns`, opened from a button via Popover. Keep **Apply / Применить** as the only refetch trigger.

## Scope — exact implementer contract

### 1. Library

- Install `react-day-picker` and `date-fns` in the `apps/web` workspace (`@vises/web`).
- Do not add unrelated UI libraries unless required for a minimal Popover (prefer a small local Popover matching existing `Dialog`/`Btn` patterns — there is **no** existing Popover today).

### 2. Component — `apps/web/src/shared/ui/`

Create a reusable `DateRangePicker` under `shared/ui/components/DateRangePicker/` (one concern per file: component, types, constants, utils as needed).

Requirements:

- Do **NOT** use native `<input type="date">`.
- Render a **button** showing the currently selected date range in `DD.MM.YYYY - DD.MM.YYYY` form (e.g. `01.11.2026 - 15.11.2026`). Empty/partial selection may show a clear placeholder (use i18n or a shared constant — match existing Analytics filter i18n style where possible).
- Clicking the button opens a **Popover** containing `react-day-picker` with `mode="range"`.
- Use `captionLayout="dropdown"` so month/year dropdowns are available; style them to match theme colors (light + dark).
- Selected start/end days: clear primary/accent background; in-range days: subtle accent background; good day hover states.
- Export from `shared/ui` public barrels (`components/index.ts`, `shared/ui/index.ts`).

If a Popover primitive is required, add `shared/ui/components/Popover/` following the same file-separation and Dialog-adjacent overlay patterns (Escape to close, outside click to close, anchored near trigger — not a full-screen modal).

### 3. Styling

- Tailwind + existing design tokens from `apps/web/src/index.css` (`accent`, `accent-subtle`, `surface`, `border`, `text-primary`, `text-secondary`, radii, elevated shadow).
- Beautiful and intuitive in **both** light and dark modes (`.dark` / `color-scheme`).
- Import `react-day-picker` CSS only as needed; override with Tailwind/token classes so the calendar does not look like the default library chrome.

### 4. Integration — `features/analytics-filters`

- File today: `AnalyticsDateRangeFiltersRender.tsx` uses two native date inputs + Apply.
- Replace the two native inputs with one `DateRangePicker`.
- Keep the **Apply** button next to / below the picker. Draft `from`/`to` (or range) may update as the user selects; **data must only refetch when the user clicks Apply** (existing `onApply` contract).
- Preserve Current totals vs Date range mode toggle behavior.
- Keep ISO/`YYYY-MM-DD` (or existing string) values flowing through `from` / `to` props so the Analytics query path does not break — convert display format only inside the picker/utils.

### 5. Conventions (mandatory)

- Follow `.cursor/rules/file-separation.mdc`, `react-components.mdc`, `typescript-conventions.mdc`.
- One React component per file; no types/constants/helpers co-located in the component file.
- No `enum`, no `function` declarations; use `const` arrow functions with explicit return types.
- FSD: reusable picker in `shared/ui`; Analytics wiring stays in `features/analytics-filters` (compose, do not pull feature logic into shared).
- Do not commit. Do not change backend or `@vises/contracts`.

## FSD placement

| Concern | Slice / segment |
|---------|-----------------|
| DateRangePicker (+ Popover if needed) | `shared/ui/components/*` |
| Format / parse range helpers | `shared/ui/...` utils or feature-local utils if Analytics-only |
| Analytics filter composition | `features/analytics-filters` |
| Theme tokens | reuse `apps/web/src/index.css` (change only if calendar needs a documented token; prefer existing accent tokens) |

## Out of scope

- Backend / contracts / migrations
- Changing Apply semantics (still required before refetch)
- Replacing other pages’ date inputs (Analytics only for this task)
- Full redesign of Analytics layout beyond the date controls

## Acceptance criteria

- [x] No native browser calendar (`<input type="date">`) remains on the Analytics date-range filter UI
- [x] Custom range calendar opens on button click (Popover + `react-day-picker` `mode="range"`)
- [x] Button label shows selected range as `DD.MM.YYYY - DD.MM.YYYY` when both ends are set
- [x] Month/year dropdowns (`captionLayout="dropdown"`) are theme-matched (light + dark)
- [x] Start/end and in-range day styles are clearly visible; hover states work
- [x] Apply button remains; refetch only on Apply
- [x] Lint / tests / build for `@vises/web` pass on touched scope

## Review outcomes

| Gate | Verdict | Notes |
|------|---------|-------|
| Architecture | OKAY (cycle 2) | Cycle 1: move `DayPickerBounds` out of util file — fixed |
| Code | OKAY (cycle 1) | Non-blocking: hardcoded `#ffffff` selected text; unused from/to i18n keys; optional ISO util specs |
| Verification | pass | `pnpm --filter @vises/web` lint / test / build |

## verification_commands

```bash
pnpm --filter @vises/web lint
pnpm --filter @vises/web test
pnpm --filter @vises/web build
```

## Discovery / prior art

- Current native inputs: `apps/web/src/features/analytics-filters/components/AnalyticsDateRangeFilters/AnalyticsDateRangeFiltersRender.tsx`
- DEC-P10 (qa-polish plan): custom date-range picker with explicit Apply — FE17 left native inputs; FE19 completes the visual part
- Overlay pattern reference: `apps/web/src/shared/ui/components/Dialog/Dialog.tsx` (no Popover yet)
- Theme tokens: `apps/web/src/index.css`

## IMPLEMENTATION AGENT PROMPT

```text
Implement FE19 for feature qa-polish.

Read: docs/sdd/qa-polish/frontend/tasks/FE19-analytics-date-range-picker.md,
docs/sdd/qa-polish/plan.md (DEC-P10),
.cursor/rules/file-separation.mdc, react-components.mdc, typescript-conventions.mdc.

Install react-day-picker + date-fns in @vises/web.
Create shared/ui DateRangePicker (Popover if needed) — no native type=date.
Wire features/analytics-filters; keep Apply as sole refetch gate.
Theme-aware Tailwind for light+dark; captionLayout=dropdown; mode=range.
Do not commit. Do not change backend/contracts.
```
