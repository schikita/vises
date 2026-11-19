# Phase 4 — Execution plan

| Field | Value |
|-------|-------|
| Feature id | `date-range-picker` |
| Status | **READY_FOR_IMPLEMENTATION** |
| Date | 2026-11-17 |
| Spec | [`02-spec.md`](./02-spec.md) (**APPROVED**) |
| Discovery | [`00-discovery.md`](./00-discovery.md) (explorer `3dcfd480-a06e-46b1-9b2e-0f40b9d5c7b8`) |
| Tasks | [`05-tasks.md`](./05-tasks.md) |
| Branch | `feature/first-frontend` |
| Bug screenshot | `assets/image-4294354c-6a9b-4b19-ac00-5b145857714e.png` (Cursor projects path) |

**Human decisions recorded:** DEC-DRP-001…007 approved 2026-11-17. Context gate **pass**.

---

## 1. Goal & measurable acceptance

Present **two separate single-day calendars** side by side (left = start, right = end, end ≥ start), fix corner/selected-day styling so both ends use solid leaf + white text with no black outline, preserve Analytics `from`/`to` + RU presets. Match AC-001…008.

---

## 2. Strategy

1. **Replace product UX** of single `DayPicker mode="range"` with **two** day calendars (prefer two `mode="single"` instances or equivalent that still read as two independent picks — **DEC-DRP-001**). Do **not** ship `numberOfMonths={2}` range mode as the product presentation.
2. **Selection rules:** left updates `from`; right updates `to`; disable end days before start; when start moves after end → **clear end** (**OQ-DRP-002** plan pick).
3. **Chrome:** prefer **independent month display** per calendar (each can navigate its month) reusing existing header/year/month patterns (**OQ-DRP-001** plan pick: independent headers).
4. **Styling:** selected day on each calendar = solid leaf fill + white text; remove `--rdp-selected-border` / `.rdp-selected` outline artifact that caused the Nov 2026 end-corner bug. Continuous mint “range middle” bar is **not** required (**ASSUME-DRP-002**).
5. **Preserve** props + presets; touch Analytics only if tiny adaptation needed.

---

## 3. DAG

```
DRP-TASK-001 (dual single-day calendars + selection invariant)
   └─► DRP-TASK-002 (selected-day / corner CSS parity + tests polish)
```

| Order | ID | Title | Depends | Parallel? |
|------|-----|-------|---------|-----------|
| 1 | DRP-TASK-001 | Dual single-day calendars + end≥start + props/presets | — | No |
| 2 | DRP-TASK-002 | Selected-day CSS parity (no black outline) + unit/CSS assertions | DRP-TASK-001 | No |

**Cross-feature:** Parallel with `demo-seed-volume` backend tasks (`apps/web` vs `apps/api`).

If implementer can deliver both cleanly in one pass, they may complete 001+002 together but must still satisfy both AC sets and verification commands.

---

## 4. Affected packages

| Package | Touch |
|---------|-------|
| `apps/web` `shared/ui/components/DateRangePicker/**` | Primary |
| `apps/web` `pages/analytics/**` | Only if tiny prop adaptation |
| `apps/api` / `packages/contracts` | **None** |

### FSD

- Layer: **`shared/ui`**
- Slice/folder: `components/DateRangePicker`
- No same-layer cross-feature imports; no new `features/analytics-filters` move this cycle

---

## 5. Sensitive paths

| Path | Policy |
|------|--------|
| Analytics `from`/`to` Apply | Preserve contract (**DEC-DRP-005**) |
| Migrations / contracts / auth | Untouched |
| Shared UI public props | Stable for Analytics |

---

## 6. Validation commands

| Scope | Command |
|-------|---------|
| Lint (convention gate) | `pnpm --filter @vises/web run lint` |
| Typecheck/build | `pnpm --filter @vises/web run build` |
| Manual | Admin → `/admin/analytics` → open period picker → two calendars; select start/end; presets; Apply |

Note: `@vises/web` currently has no Jest/Vitest script. Prefer pure util tests only if a runner is already wired; otherwise lint + build + manual AC checks.

---

## 7. Plan-level decisions (resolving open questions)

| ID | Decision |
|----|----------|
| **OQ-DRP-001** | **Independent** month navigation chrome per calendar (reuse today’s header pattern per side). |
| **OQ-DRP-002** | When start moves after current end → **clear end** (`to` → `''`) so invariant holds. |

---

## 8. Human approval log

| Item | Decision | Date |
|------|----------|------|
| DEC-DRP-001 dual single-day | **APPROVED** | 2026-11-17 |
| DEC-DRP-002 end ≥ start | **APPROVED** | 2026-11-17 |
| DEC-DRP-003 corner styling | **APPROVED** | 2026-11-17 |
| DEC-DRP-004…007 | **APPROVED** | 2026-11-17 |

---

## 9. Risks

| Risk | Mitigation |
|------|------------|
| Custom single header fights dual months | Independent headers per calendar |
| CSS var mismatch with RDP v10 | Align tokens with library selected/single styles; assert no dark border |
| Panel width | Side-by-side gap; ensure no Analytics page horizontal scroll (NFR-003) |

---

## 10. Decisions needed from human

**None** for implementation.
