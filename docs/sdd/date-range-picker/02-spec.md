# Spec — Date range picker (dual single-day calendars)

| Field | Value |
|-------|-------|
| Feature id | `date-range-picker` |
| Document home | **`docs/sdd/date-range-picker/`** (authoritative) |
| Spec SoT | [`02-spec.md`](./02-spec.md) (this file) |
| Status | **APPROVED** |
| Human approval date | **2026-11-17** |
| Updated | 2026-11-17 |
| Branch | `feature/first-frontend` |
| Discovery | [`00-discovery.md`](./00-discovery.md) (explorer `3dcfd480-a06e-46b1-9b2e-0f40b9d5c7b8`) |
| Bug screenshot | `C:\Users\PURPLE_USER\.cursor\projects\d-dev-Git-Projects-vises\assets\image-4294354c-6a9b-4b19-ac00-5b145857714e.png` |

> **APPROVED** on 2026-11-17. **DEC-DRP-001…007** are locked. Implement against this SoT. Plan/tasks are deferred and must not be invented from this file alone.

---

## 1. Summary

The shared Admin `DateRangePicker` must present **two separate calendars** side by side so the operator picks a **start day** on the left and an **end day** on the right (end on/after start). The known **end-corner styling bug** (black outline, white text on mint) must be fixed so start and end corners both use solid leaf fill with readable white text. The public `from` / `to` string contract and Analytics Russian presets remain intact.

---

## 2. Actors and roles

| Actor | Role |
|-------|------|
| Staff / admin (Analytics) | Opens the range picker on `/admin/analytics`, chooses start/end (or a preset), then Apply on the filters card |
| `DateRangePicker` (shared UI) | Collects and emits ISO `from` / `to` via callbacks |
| `AnalyticsFiltersCard` | Sole current consumer; owns RU preset labels and Apply action |
| `apps/api` Analytics endpoints | Unchanged consumers of `from` / `to` query params after Apply — **no API change in this feature** |

---

## 3. Goal and scope

### 3.1 Goal

Make period selection clearer and visually correct: two independent single-day calendars compose one period, with consistent corner styling and working presets.

### 3.2 In scope

- Dual-calendar UX and selection rules (**DEC-DRP-001**, **DEC-DRP-002**).
- Corner / endpoint styling parity and removal of the black-outline artifact (**DEC-DRP-003**).
- Preserve `from` / `to` / callback / `presetLabels` contract for Analytics (**DEC-DRP-004**, **DEC-DRP-005**).
- Changes confined to `apps/web/src/shared/ui/components/DateRangePicker/**`, plus Analytics consumer only if a tiny prop adaptation is required (**DEC-DRP-006**).
- One concern per file; React/TypeScript project conventions (**DEC-DRP-007**, **REQ-010**).

### 3.3 Non-goals (explicit)

| Non-goal | Rationale |
|----------|-----------|
| Shipping a dual-month UX that is only `numberOfMonths={2}` in library **range mode** as the product presentation | **DEC-DRP-001** — product intent is two single-day picks |
| New Analytics API / contracts / migrations | Filters already send `from` / `to` |
| Localizing default English preset strings inside the shared component | RU via consumer (`presetLabels`) |
| Replacing Popover / Field / Analytics Apply flow | Outside picker |
| Broad redesign of year/month drill-down chrome | Keep existing header / year / month grids unless dual layout forces a minimal adaptation |
| Work under `docs/sdd/frontend` or BLS portal FE | Separate SDD tree |

---

## 4. Baseline and traceability

| Artifact | Relation |
|----------|----------|
| `DateRangePicker.tsx` + folder | Current single `DayPicker mode="range"` implementation |
| `date-range-picker.css` | Bug surface (`--rdp-selected-border`, `.rdp-selected`, range_start/end) |
| `AnalyticsFiltersCard.tsx` | Sole consumer; RU presets; Apply |
| Screenshot (Nov 2026, range 12–19) | Defect evidence for end corner |
| Explorer `3dcfd480-a06e-46b1-9b2e-0f40b9d5c7b8` | Discovery inventory |

---

## 5. Functional requirements

| ID | Statement | Priority | Status |
|----|-----------|----------|--------|
| **REQ-001** | When the days view is open, the popover shows **two calendars side by side** (first/left and second/right). | Must | **Accepted** (**DEC-DRP-001**) |
| **REQ-002** | The left/first calendar selects **exactly one day** as the **start** date and updates `from` via `onFromChange` (ISO string). | Must | **Accepted** (**DEC-DRP-001**) |
| **REQ-003** | The right/second calendar selects **exactly one day** as the **end** date and updates `to` via `onToChange` (ISO string). End must be **on or after** start when both are set. | Must | **Accepted** (**DEC-DRP-001**, **DEC-DRP-002**) |
| **REQ-004** | Together, the two selected days form the start–end period exposed as the existing `from` / `to` values (empty string allowed when unset, same as today). | Must | **Accepted** |
| **REQ-005** | Product presentation must remain **two independent single-day picks**. A single react-day-picker instance with `numberOfMonths={2}` in **range** mode must **not** be the product UX unless it is the only clean way to achieve the same presentation of two independent day picks — and even then the operator-facing behavior must match **DEC-DRP-001** (left = start day, right = end day). | Must | **Accepted** (**DEC-DRP-001**) |
| **REQ-006** | Start and end **corner** days must both render with **solid leaf fill** and **readable white text**. No black/dark outline artifact on the end (or start) corner. Intermediate in-range styling (if still shown) must not break corner readability. | Must | **Accepted** (**DEC-DRP-003**) |
| **REQ-007** | Preset buttons remain (`last_7_days`, `this_month`, `this_year`). Default labels may stay English. Consumers may pass `presetLabels` (Analytics already passes `7 дней`, `Этот месяц`, `Этот год`). Selecting a preset sets both `from` and `to` consistently with today’s preset math. | Must | **Accepted** (**DEC-DRP-004**) |
| **REQ-008** | Public prop contract for Analytics remains: `from`, `to`, `onFromChange`, `onToChange`, optional `placeholder`, `ariaLabel`, `className`, `presetLabels`. Breaking renames are out of scope. | Must | **Accepted** (**DEC-DRP-005**) |
| **REQ-009** | After the operator chooses a range (manual or preset) and clicks Analytics **Применить**, the page continues to send the same `from` / `to` values it holds in state (picker does not own Apply). | Must | **Accepted** |
| **REQ-010** | Follow FSD shared-ui placement, **one concern per file**, one React component per `.tsx` file, no `enum` keyword (unions / `as const`), explicit return types on exported functions/components. Types in `*.types.ts`, constants in `*.constants.ts`, helpers in `*.util.ts`. | Must | **Accepted** (**DEC-DRP-006**, **DEC-DRP-007**) |

---

## 6. Non-functional requirements

| ID | Statement |
|----|-----------|
| **NFR-001** | Accessibility: both calendars and presets remain keyboard operable; selected start/end announced appropriately (aria on trigger / panel as today or improved without regressing). |
| **NFR-002** | Contrast: selected corner text on leaf fill meets readable contrast (no white-on-mint endpoint). |
| **NFR-003** | Layout: dual calendars usable in the existing Popover on typical admin desktop widths; no horizontal page scroll of the Analytics page solely because the panel opened. |
| **NFR-004** | Performance: opening the popover and switching months/years remains snappy with two day grids (no new network). |
| **NFR-005** | Security / PII: date-only ISO strings; no new PII surfaces; no logging of secrets. |
| **NFR-006** | Backwards compatibility: existing Analytics wiring keeps working without mandatory consumer changes unless a tiny prop adaptation is required and documented in plan. |
| **NFR-007** | Observability: no new backend metrics; FE unit tests cover selection rules and presets; visual corner regression covered by test and/or explicit CSS assertions where practical. |
| **NFR-008** | Lint/build gates for touched `apps/web` files. |

---

## 7. Constraints

| ID | Statement |
|----|-----------|
| **CON-001** | No API, contract, DB, or migration changes. |
| **CON-002** | Do not move this feature’s SDD under `docs/sdd/frontend`. |
| **CON-003** | Do not break the Analytics `from` / `to` Apply path. |
| **CON-004** | Do not hardcode Russian preset strings as the shared-component defaults (consumer override remains the localization path). |
| **CON-005** | Scope stays in `DateRangePicker/**` (+ Analytics consumer only if tiny adaptation needed). |
| **CON-006** | file-separation / react-components / typescript-conventions rules apply to all new or edited TS/TSX in this feature. |

### Convention notes (normative for implementers)

- **file-separation:** Do not mix types, constants, utilities, and components in one file. Split new dual-calendar pieces the same way the folder already does.
- **react-components:** One component per `.tsx` file; no helper functions defined inside component files — extract to `*.util.ts` or hooks.
- **typescript-conventions:** No TypeScript `enum`; use string unions or `as const` objects (as `DATE_RANGE_PICKER_VIEW_MODE` / `DATE_RANGE_PICKER_PRESET` already do); explicit return types.

---

## 8. Decisions and assumptions

### 8.1 Approved decisions

| ID | Decision | Status |
|----|----------|--------|
| **DEC-DRP-001** | **Dual calendars compose the range via two single-day selections**, not via a product UX of one range-mode dual-month picker. Show **two separate calendars** side by side (reuse the same calendar UI family that exists today). Left/first = **exactly one** start day; right/second = **exactly one** end day. Using a single `DayPicker` with `numberOfMonths={2}` in range mode is **not** the preferred product presentation; it is allowed only if it is the only clean implementation path **and** the UI still behaves as two independent day picks (start left, end right) for the operator. | **APPROVED** (2026-11-17) |
| **DEC-DRP-002** | End date must be **on or after** start when both are set. Days before start on the end calendar are not selectable as end (disable or equivalent guard). | **APPROVED** (2026-11-17) |
| **DEC-DRP-003** | Fix corner/end-date period styling: eliminate thick black / dark outline artifact and white-on-mint unreadability. Start and end corners both use **solid leaf** fill + **readable white** text. | **APPROVED** (2026-11-17) |
| **DEC-DRP-004** | Keep Russian preset labels via consumer `presetLabels`. Shared defaults may remain English. | **APPROVED** (2026-11-17) |
| **DEC-DRP-005** | Sole current consumer is Admin Analytics via `AnalyticsFiltersCard`. Preserve `from` / `to` prop + callback contract so Apply continues to send the held range. | **APPROVED** (2026-11-17) |
| **DEC-DRP-006** | FSD: changes live in `apps/web/src/shared/ui/components/DateRangePicker/**`; touch Analytics consumer only for a tiny prop adaptation if required. | **APPROVED** (2026-11-17) |
| **DEC-DRP-007** | One concern per file; match existing DateRangePicker folder patterns and project React/TS rules. | **APPROVED** (2026-11-17) |

### 8.2 Assumptions (non-blocking)

| ID | Assumption |
|----|------------|
| **ASSUME-DRP-001** | Existing year/month drill-down can be adapted so each calendar (or a shared chrome) can still change displayed month/year without inventing a new navigation product. |
| **ASSUME-DRP-002** | Continuous mint “range middle” bar across many days is **not** required for acceptance if dual single-day mode makes that chrome obsolete; corner parity and clear start/end selection are required. |
| **ASSUME-DRP-003** | Preset math in `build-preset-range.util.ts` remains the SoT for the three presets unless plan explicitly changes inclusive-day rules (not requested here). |

---

## 9. Data model impact

None. No entities, migrations, or sensitive fields. Values remain ISO date strings in FE state and existing Analytics query params after Apply.

---

## 10. API surface

No backend API changes.

| Surface | Change |
|---------|--------|
| Nest / contracts | None |
| FE component props | Preserve `DateRangePickerProps` (`from`, `to`, `onFromChange`, `onToChange`, optional display/preset props) |
| Analytics Apply | Unchanged: parent sends current `from` / `to` |

Error handling remains client-side selection guards (end ≥ start); no new HTTP error contracts.

---

## 11. Edge cases and error handling

| Case | Expected behavior |
|------|-------------------|
| Only start selected | `from` set; `to` empty until end picked (or unchanged until user picks end) |
| Only end attempted before start | Operator cannot complete an end-before-start pair; end calendar enforces on/after start once start exists (**DEC-DRP-002**) |
| Start moved to after current end | End must not remain before start: clear end, clamp, or force re-pick so invariant `end >= start` holds when both set |
| Same day start and end | Allowed (single-day period) |
| Preset click | Sets both ends; both calendars reflect the new period; RU labels still shown for Analytics |
| Outside year bounds | Existing ±30 year window bounds still apply |
| Popover closed/reopened | Restores display from current `from` / `to` (or today) without wiping committed values |

---

## 12. Out of scope

- Plan.md / tasks.md (deferred)
- Production code in this documentation step
- API/DB/contracts
- New consumers beyond Analytics
- Hardcoded RU defaults in the shared component
- Full mobile redesign of Analytics filters
- BLS portal / `docs/sdd/frontend` work

---

## 13. Acceptance criteria

| ID | Criterion | Maps to |
|----|-----------|---------|
| **AC-001** | Opening the picker days view shows **two** calendars visible side by side. | REQ-001, DEC-DRP-001 |
| **AC-002** | Clicking a day on the **left** calendar sets start only (`onFromChange`); left selection is a single day. | REQ-002, DEC-DRP-001 |
| **AC-003** | Clicking a day on the **right** calendar sets end only (`onToChange`); right selection is a single day; end is on/after start. | REQ-003, DEC-DRP-002 |
| **AC-004** | Operator cannot leave a committed pair with `to` before `from`. | REQ-003, DEC-DRP-002 |
| **AC-005** | Start and end corner days both show solid leaf fill + readable white text; no black/dark outline artifact on the end corner (regression of the Nov 2026 screenshot defect). | REQ-006, DEC-DRP-003 |
| **AC-006** | Presets still work; with Analytics `presetLabels`, buttons read `7 дней`, `Этот месяц`, `Этот год` and set both dates. | REQ-007, DEC-DRP-004 |
| **AC-007** | Analytics Apply still sends the current `from` / `to` from filters state after picker changes (manual or preset). | REQ-008, REQ-009, DEC-DRP-005 |
| **AC-008** | Changes stay under `DateRangePicker/**` (and Analytics only if tiny prop adaptation); new files obey one-concern-per-file / component / TS conventions. | REQ-010, DEC-DRP-006, DEC-DRP-007 |

---

## 14. Open questions

Residual / non-blocking for accepted REQs:

| ID | Question | Notes |
|----|----------|-------|
| **OQ-DRP-001** | Exact month-navigation chrome with two calendars: fully independent headers per calendar vs shared header — prefer reuse of today’s header pattern; final layout is plan-level if product does not care. | Does not reopen DEC-DRP-001 |
| **OQ-DRP-002** | When start moves after end, prefer clear-end vs auto-clamp end to start — both satisfy invariant; plan may pick one. | Bound by DEC-DRP-002 |

No accepted REQ depends on unresolved product blockers. Critical UX DECs are locked.

---

## 15. Sensitive paths

| Path | Handling |
|------|----------|
| Auth / roles | Unchanged — Analytics remains staff/admin as today; this feature does not alter ACL |
| Roles / statuses | No new status unions |
| Migrations | None |
| PII | Date-only ISO strings; no new PII fields; do not log passport/identity |
| Event schemas | None |
| Public contracts (`packages/contracts`) | Untouched |
| Shared UI public props | Preserve `from` / `to` contract (**DEC-DRP-005**); treat as a stable FE contract for Analytics |

---

## 16. Traceability matrix (summary)

| DEC | REQs | ACs |
|-----|------|-----|
| DEC-DRP-001 | REQ-001…005 | AC-001…003 |
| DEC-DRP-002 | REQ-003 | AC-003, AC-004 |
| DEC-DRP-003 | REQ-006 | AC-005 |
| DEC-DRP-004 | REQ-007 | AC-006 |
| DEC-DRP-005 | REQ-008, REQ-009 | AC-007 |
| DEC-DRP-006 / 007 | REQ-010 | AC-008 |
