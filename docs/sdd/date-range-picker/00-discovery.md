# Discovery — Date range picker (dual single-day calendars)

| Field | Value |
|-------|-------|
| Feature id | `date-range-picker` |
| Updated | 2026-11-17 |
| Branch | `feature/first-frontend` |
| Explorer | `3dcfd480-a06e-46b1-9b2e-0f40b9d5c7b8` |
| Artifact home | **`docs/sdd/date-range-picker/`** (not under `docs/sdd/frontend`) |
| Confidence | high |

## Goal (product request)

1. Change the shared date-range popover from a **single-month `mode="range"`** calendar to **two separate calendars** side by side that together define start–end.
2. Fix the **end-date / corner styling bug** (thick black outline, white text on pale mint — unreadable and inconsistent with start).
3. Keep Russian preset labels as supplied by Analytics; preserve the `from` / `to` prop contract.

## Current state (evidence)

### Component location (Fact)

- Root: `apps/web/src/shared/ui/components/DateRangePicker/`
- Public export: `DateRangePicker` via `apps/web/src/shared/ui` barrels
- Concerns already split: `DateRangePicker.tsx`, header / year / month / presets / hidden caption components, `date-range-picker.types.ts`, `date-range-picker.constants.ts`, `date-range-picker.css`, `*.util.ts`, unit specs

### Library / mode (Fact)

- Dependency: `react-day-picker` `^10.0.2` (`apps/web/package.json`)
- Days view uses a single `<DayPicker mode="range" resetOnSelect … />` with one `displayMonth`
- Custom header + year/month grids already exist; DayPicker built-in nav is hidden (`hideNavigation`, hidden month caption)

### Prop contract (Fact)

```ts
from: string
to: string
onFromChange: (value: string) => void
onToChange: (value: string) => void
placeholder?: string
ariaLabel?: string
className?: string
presetLabels?: { last7Days; thisMonth; thisYear }
```

- ISO date strings in / out (`formatIsoDate` / `parseIsoDate`)
- Default preset labels English; consumer may override

### Sole current consumer (Fact)

- Admin Analytics page `/admin/analytics`
- `apps/web/src/pages/analytics/AnalyticsFiltersCard.tsx` passes `from` / `to` / `onFromChange` / `onToChange` and RU `presetLabels`:
  - `7 дней`, `Этот месяц`, `Этот год` (`ANALYTICS_COPY`)
- Apply remains on the filters card (outside the picker); picker only updates `from` / `to` state

### Styling bug (Fact + screenshot)

- CSS: `date-range-picker.css` under `.vises-day-picker.rdp-root`
- Tokens set: `--rdp-selected-border`, `--rdp-range_start-*`, `--rdp-range_end-*`, `--rdp-range_middle-*`
- Rules target `.rdp-selected`, `.rdp-range_start`, `.rdp-range_end`, `.rdp-range_middle`
- Observed defect (Nov 2026 range 12→19): **start (12)** solid leaf + white text; **end (19)** pale mint fill + **white** numeral + **black/dark outline** — contrast failure and endpoint asymmetry
- Screenshot evidence: `C:\Users\PURPLE_USER\.cursor\projects\d-dev-Git-Projects-vises\assets\image-4294354c-6a9b-4b19-ac00-5b145857714e.png` (workspace assets; not checked into product tree)

### Presets (Fact)

- `build-preset-range.util.ts`: `last_7_days` (today−6…today), `this_month`, `this_year`
- Preset row shared under the calendar panel

## Gap matrix

| Area | Today | Target |
|------|-------|--------|
| Calendar chrome | One month, `mode="range"` | Two side-by-side calendars; each picks **exactly one day** (start left, end right) |
| Range composition | Library range selection | Composed `from` + `to` from two single-day picks; end ≥ start |
| Endpoint styling | Start OK; end outline + unreadable | Start and end corners both solid leaf + readable white text; no black outline artifact |
| Preset labels | Defaults EN; Analytics passes RU | Unchanged contract; RU via consumer |
| Consumer API | `from` / `to` callbacks | Preserve; tiny adaptation only if props must change |
| Scope | Shared UI component | Stay in `DateRangePicker/**` (+ Analytics consumer only if needed) |

## Affected areas

- **In scope:** `apps/web/src/shared/ui/components/DateRangePicker/**`
- **Maybe:** `AnalyticsFiltersCard` / analytics copy only if prop surface needs a tiny adaptation
- **Out of scope:** API, contracts, migrations, other admin pages, `docs/sdd/frontend` BLS FE work

## Risks

1. Treating `numberOfMonths={2}` + `mode="range"` as the product UX would violate the approved dual **single-day** intent (see DEC-DRP-001 in spec).
2. CSS variable / selector mismatch with react-day-picker v10 selected vs range_end classes may persist if range-mode endpoint styles remain in use without parity fixes.
3. Dual independent month state increases panel width; mobile/popover layout must stay usable (NFR).

## Artifact home

Authoritative: `docs/sdd/date-range-picker/`  
Do **not** nest under `docs/sdd/frontend` (BLS frontend SDD).
