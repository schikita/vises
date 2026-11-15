# Phase 4 — Execution plan

| Field | Value |
|-------|-------|
| Feature id | `manage-applicants-appointment-form` |
| Status | **VERIFYING** (OQ-001…007 recorded; Phase A+B tasks DONE 2026-11-14; SPA deferred) |
| Date | 2026-11-14 |
| Spec | [`02-spec.md`](./02-spec.md) |
| Architecture | [`01-target-architecture.md`](./01-target-architecture.md) |
| Database | [`02-database.md`](./02-database.md) |
| Tasks | [`05-tasks.md`](./05-tasks.md) + [`tasks/`](./tasks/) |

**Phase 7 unlocked:** OQ-001…007 approved below. MA-TASK-001 may proceed.

---

## 1. Goal & measurable acceptance

Primary Edit path: after AUTHENTICATED, STATUS_VALIDATE scrapes Manage Applicants, completes full Schengen required Edit Member fill (visa modal + iframe + Attention + Kendo), persists portalStatus/`fieldProgress`, reaches `READY_TO_BOOK`, and hands off to existing BOOK safe-stop without CON-006 violations. Matches AC-01…AC-11 in spec §17.

---

## 2. Strategy

1. **Persistence first** — additive task columns (human-approved).
2. **Pipeline shell** — visa modal + iframe + Attention + dialog hooks.
3. **Full fill** — section fillers + CRM map + checkpoints.
4. **Resume / errors** — load fieldProgress; MA_* codes.
5. **Family member** — **conditional Must** when application already has additional members pre-start (OQ-005); stub then fill (008→009).
6. **SPA** — deferred (OQ-004); MA-TASK-010 stays DEFERRED.
7. **Gate** — worker + api builds; no upstream CON-006 / login regressions.

Prefer extending `runPortalStatusValidatePipeline` / `fillPortalApplicantEditForm` over a new orchestrator.

---

## 3. DAG

```
MA-TASK-001 (migration — human gate)
   └─► MA-TASK-002 (checkpoint types + persist)
          ├─► MA-TASK-004 (CRM map + field ids)     ← serial before 003 (same portal-fill package)
          │      └─► MA-TASK-003 (visa modal + iframe + Attention)
          │             └─► MA-TASK-005 (full section fill)
          │                    └─► MA-TASK-006 (submit + Ready + BOOK handoff)
          │                           └─► MA-TASK-007 (resume + MA_* errors)
          └─► MA-TASK-008 (Add Member stub) ──► MA-TASK-009 (Phase B fill)

MA-TASK-010 (Phase C SPA) — after 002; optional
MA-TASK-011 (verification sweep) — after Phase A core (003–007); again after 009
```

| Order | ID | Title | Depends | Phase |
|------|-----|-------|---------|-------|
| 1 | MA-TASK-001 | Task portalStatus + checkpoint columns | **Human OQ-001** | A |
| 2 | MA-TASK-002 | Checkpoint types + load/save | 001 | A |
| 3 | MA-TASK-004 | Edit Member field maps + CRM fill input | 002 | A |
| 4 | MA-TASK-003 | Visa modal + iframe + Attention in status pipeline | 004 | A |
| 5 | MA-TASK-005 | Full required section fill + fieldProgress | 003 | A |
| 6 | MA-TASK-006 | Submit dialog + re-scrape Ready + BOOK handoff | 005 | A |
| 7 | MA-TASK-007 | Resume skip + error/stuck matrix | 006 | A |
| 8 | MA-TASK-008 | Add Family Member branch design + stub | 002 | A design |
| 9 | MA-TASK-009 | Add Family Member fill implementation | 007, 008 | B |
| 10 | MA-TASK-010 | Optional SPA checkpoint summary | 002 | C |
| 11 | MA-TASK-011 | Lint/build/regression sweep | 007 (A gate); 009 if B | A/B |

**First implementer batch (after human gate):** MA-TASK-001 → MA-TASK-002 → MA-TASK-004 → MA-TASK-003 → MA-TASK-005.

**Parallelism note:** Do **not** parallelize MA-TASK-003 with MA-TASK-004 — both own `apps/workflow-worker` `portal-fill`. MA-TASK-008 may run after 002 in parallel with 004→003→005 **only** if it touches distinct stub/constants files (coordinate if shared pipeline entry).

---

## 4. Affected packages

| Package | Touch |
|---------|-------|
| `apps/api` | Entity + migration; optional snapshot DTO (C) |
| `apps/workflow-worker` | portal-fill, bls-clients/status, mirrored entity |
| `apps/web` | Phase C only |
| `packages/*` | No Must for A/B |

---

## 5. Sensitive paths

| Path | Policy |
|------|--------|
| TypeORM migration | **Human-approved plan required** before MA-TASK-001 |
| PII / vault | Never in checkpoint/events |
| CON-006 / payment | BOOK client unchanged |
| Auth | Reuse login; no new scheme |
| Closed durable-bls-workflow review | Do not rewrite TASK-011/012 DONE docs |

---

## 6. Validation commands

| Scope | Command |
|-------|---------|
| API | `cd apps/api && npm run build` |
| Worker | `cd apps/workflow-worker && npm run build` |
| Lint (convention gate) | `cd apps/api && npm run lint` ; `cd apps/workflow-worker && npm run lint` |
| Migration (MA-TASK-001) | After human gate: `cd apps/api && npm run build` then `npm run migration:generate` (if entity-first) **or** hand-authored migration + `npm run build`; apply via `npm run migration:run` only in approved env — record in task notes |
| Web (Phase C only) | `cd apps/web && npm run lint` ; `cd apps/web && npm run build` |

**Note:** `npm run lint` in api/worker is currently a no-op stub — still required as the convention gate; treat green lint as process compliance, not proof of ESLint rules. Do **not** invoke a non-existent `test:workflow` script unless restored.

**CON naming:** This feature’s **CON-006** = Book only when Ready. Upstream durable-bls-workflow / TASK-012 **CON-006** = payment/VisaType hard-stop — referred here as **upstream CON-006** / this-spec **CON-004**.

---

## 7. Human approval log

| Item | Decision | Date / by |
|------|----------|-----------|
| OQ-001 / DEC-proposed-003 migration | **APPROVED** — additive `bls_workflow_tasks.portal_status` + `portal_checkpoint_json`; persist scraped/normalized `FORM_FILLING_IN_PROGRESS` \| `READY_TO_BOOK` \| `UNKNOWN`; map portal Manage Applicants status ↔ workflow/application status for resume | 2026-11-14 / human |
| OQ-002 CRM / field data source | **APPROVED** — fill from data already entered in our system using portal-aligned form shape (site ↔ CRM/applicant); map existing user data → portal `#id`s; **never invent** | 2026-11-14 / human |
| OQ-003 National vs Schengen | **APPROVED** — use user’s **pre-start** location/visa/category selection on the application; do **not** hardcode Schengen-only product rule; if National selected → verify form live / handle carefully | 2026-11-14 / human |
| OQ-004 SPA Phase C | **DEFER** — frontend later; MA-TASK-010 not in this implementation batch | 2026-11-14 / human |
| OQ-005 Add Family Member | **APPROVED (clarified)** — Add New Member **only if** user already added family member(s) on our side **before** workflow start; then same Edit Member form for that member; if none → **do not** click Add New Member. Conditional **Must** when pre-start additional members exist (not optional curiosity Phase B) | 2026-11-14 / human |
| OQ-006 Ready recognition | **RESOLVED** — analyze current scrape; prefer **exact portal label text**; CSS class secondary; no fragile class-only matching | 2026-11-14 / human |
| OQ-007 Missing CRM policy | **APPROVED (clarified)** — if user provided data → fill; if not provided → **skip** optional/conditional fields/sections (leave empty/unchecked); **do not invent**; **do not** staff-gate solely for empty optional CRM; staff/fail only when a **portal-required (`*`)** field has no source and cannot be skipped | 2026-11-14 / human |

---

## 8. Non-goals

- VisaType payment / Premium Lounge automation
- Parallel STATUS orchestrator / new step key
- Reopening durable-bls-workflow review
- Overwriting correct prefilled identity fields
