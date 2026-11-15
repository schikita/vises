# Phase 0 — Discovery (Manage Applicants appointment form)

| Field | Value |
|-------|-------|
| Feature id | `manage-applicants-appointment-form` |
| Status | **Complete** |
| Date | 2026-11-14 |
| Spec SoT | [`02-spec.md`](./02-spec.md) |
| Explorer | `sdd-project-explorer` (2026-11-14) |
| Upstream | `durable-bls-workflow` (**DONE**) — TASK-011 / TASK-012 |

**Labeling:** **Fact** = verified in-repo / materials. **Assumption** = labeled.

---

## 1. Purpose

Establish evidence for extending STATUS_VALIDATE beyond TASK-011’s minimal empty-field edit fill so Manage Applicants → full Edit Member → Ready To Book → BOOK safe-stop is durable and resumable — without reopening the closed durable-bls-workflow review.

---

## 2. Materials (Facts)

| Source | Role |
|--------|------|
| `site_materials/manage_applicants_appointments/manage_applicants_appointments_agent_brief.md` | Agent SoT: elements, state machine, error/resume, persistence |
| `…/manage_applicants_appointments_flow.md` | Step sequence, field map, data contract, calendar model |
| HTML/fixtures + images 1–12 + `iframe.jpg` | DOM / UX evidence |
| `site_materials/calendar.jpg` + `calendar.html` | Kendo DatePicker calendar |
| `site_materials/possible_site_issues/*` | Stuck codes + DB contract |
| `site_materials/visa_type/` | **Next after Ready** — CON-006 hard stop; not this feature |

---

## 3. Baseline code (Facts)

| Area | Evidence | Gap |
|------|----------|-----|
| STATUS_VALIDATE | `runPortalStatusValidatePipeline`, `BlsStatusClientService`, TASK-011 DONE | Minimal fill only |
| Edit fill | `fillPortalApplicantEditForm` — empty FirstName/LastName/SurName/PlaceOfBirth/PassportNo via top `document.evaluate` | No iframe, Kendo, full required set |
| Visa modal on status path | Booking has location/visa helpers; status edit path does **not** drive `#visaTypeModal` | Missing |
| Attention | `acceptPortalAttentionModal` exists | Reuse |
| Calendar | `setDateField`, `commitDateViaCalendarUi`, `ensureDatepickerDaySelected` | Not wired into status edit |
| Success dialog | Not handled on status submit path | Missing |
| BOOK handoff | `runPortalBookingSafeStopPipeline`, TASK-012 | Reuse; do not expand into payment |
| Portal status enum | `BLS_APPLICANT_PORTAL_STATUS` / labels in worker | **Not** persisted on `bls_workflow_tasks` for mid-form resume |
| Register checkpoint prior art | `portal_autofill_runs.field_progress_json` + `pipeline_stage` | Pattern to mirror for STATUS |
| Add New Member | No `apps/**` implementation; materials marked OOS | User now wants **design** in SDD |
| Frontend | `entities/bls-workflow`, `widgets/bls-workflow-panel` | No portalStatus UI; Phase C optional |
| `packages/contracts` | Schedule/abort/resume envelopes | No Must change for Phase A/B |
| AGENTS.md | Absent | Rules under `.cursor/rules/*.mdc` |

---

## 4. Persistence SoT today (Facts)

`bls_workflow_tasks` columns: id, stepId, taskKey, applicantId, ordinal, status, attemptCount, maxAttempts, lastError*, nextRunAt — **no** `portal_status` / checkpoint jsonb.

---

## 5. Open questions carried to spec

See `02-spec.md` §18 (OQ-001…007): checkpoint column shape, CRM PII expansion, National vs Schengen, SPA Phase C, multi-member release gate, Ready CSS class, missing-data staff policy.

---

## 6. Artifact suggestion (adopted)

`docs/sdd/manage-applicants-appointment-form/` — sibling to `docs/sdd/frontend/`; do **not** rewrite closed `docs/sdd/tasks/TASK-011-status-validate.md`.
