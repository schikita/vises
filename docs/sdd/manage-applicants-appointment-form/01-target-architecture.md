# Phase 1 — Target architecture

| Field | Value |
|-------|-------|
| Feature id | `manage-applicants-appointment-form` |
| Status | **APPROVED** (OQ-001…007 recorded 2026-11-14) |
| Date | 2026-11-14 |
| Spec | [`02-spec.md`](./02-spec.md) |
| Discovery | [`00-discovery.md`](./00-discovery.md) |

---

## 1. Architecture intent

Extend the existing durable BLS workflow **STATUS_VALIDATE** domain path so Manage Applicants drives branching, full Edit Member fill runs inside the Kendo iframe with durable section checkpoints, and Ready status hands off to **unchanged** BOOK safe-stop (**upstream CON-006** / this-spec **CON-004**).

```
LOGIN / PASSWORD_CHANGE (existing)
        ↓
STATUS_VALIDATE (extend — this feature)
  scrape Manage Applicants → portalStatus (label-first)
  FORM_FILLING → visa modal → iframe → Attention → section fill + checkpoint
  READY_TO_BOOK → success for STATUS_APPLICANT task
        ↓
BOOK (existing TASK-012 safe-stop) → AWAITING_STAFF_BOOKING
```

**No** new Must step key. **No** parallel orchestrator (**DEC-002** / **CON-002**).

---

## 2. Component boundaries

| Component | Package / module | Responsibility |
|-----------|------------------|----------------|
| Orchestrator / runner | `apps/workflow-worker` bls-workflow | Unchanged sequencing STATUS → BOOK; reads task status |
| Status domain client | `bls-clients/status` | Execute per-applicant STATUS_APPLICANT; map CRM → fill input; classify errors |
| Portal status fill | `portal-fill` | Pipeline stages, scrape, edit click, visa modal, iframe fill, dialog, checkpoint helpers |
| Booking client | `bls-clients/booking` | Unchanged handoff after Ready |
| Persistence | `apps/api` + worker mirrored entities | Additive `portal_status` + `portal_checkpoint_json` on tasks (**DEC-003**) |
| Register fill helpers | `portal-fill` datepicker/listbox | **Reuse**; extend field-name maps for Edit Member ids — do not fork calendar |
| Staff SPA | `apps/web` | Phase C **deferred** (OQ-004) |

Domain client ≠ orchestrator (**NFR-005**).

---

## 3. State machine ownership

| Concern | Owner |
|---------|-------|
| Portal step keys (`AUTHENTICATED`…`BOOKING_ENTRY`) | Status pipeline + checkpoint `lastCompletedStep` |
| Workflow step key `STATUS_VALIDATE` | Unchanged graph |
| Portal applicant status enum | Scrape (label-first) → persist `portal_status` on task; align workflow/application status for resume |
| Section progress | `portal_checkpoint_json.fieldProgress` (ids only) |
| BOOK entry | Existing BOOK step after all required applicants Ready |

**Add Family Member (OQ-005 / DEC-004):** only when application already has additional members **before** workflow start → `OPEN_ADD_MEMBER` → same modal→iframe→fill; applicant-scoped checkpoint. If none → never click Add New Member.

---

## 4. Error classification (inherit)

| Class | Use |
|-------|-----|
| `SAFE_TO_REPEAT` | Transient nav, overlays, UNKNOWN, modal/iframe, still Form Filling |
| `VERIFY_THEN_REPEAT` | Ambiguous submit / missed dialog / date verify |
| `NOT_SAFE_TO_REPEAT` | Confirmed bad PII; CON-006 boundary; unskippable portal-required `*` with no CRM source |

Max 5 attempts; backoff 5s…300s (**NFR-001**). Stuck codes: existing `bls_status_*` + proposed `MA_*` from `stuck_state_db_contract.md`.

---

## 5. Data flow (fill)

```
Client / applicant CRM (portal-shaped, pre-start) + application location/visa
  → status client builds EditMemberFillInput (no secrets in logs)
  → pipeline loads prior checkpoint
  → section fillers; skip optional/conditional when CRM empty (OQ-007)
  → after each section: persist fieldProgress (filled|skipped|failed + reason code)
  → Submit + dialog → re-scrape → portalStatus=READY_TO_BOOK
```

**Missing data (OQ-007):** provided → fill; optional/conditional empty → skip; never invent; staff/fail only for portal-required `*` with no source.

**Visa category (OQ-003):** from application pre-start selection; National → verify form live before Schengen-id assumption.

---

## 6. Risks

| Risk | Mitigation |
|------|------------|
| Dual SoT (live scrape vs stored portalStatus) | Live scrape for branch; stored for resume entry only |
| CRM incomplete for required `*` | Skip optional; staff only unskippable required (OQ-007) |
| Iframe/Kendo regressions | Reuse register helpers; frame-first selectors |
| CON-006 bleed | BOOK client untouched; status path never opens payment |
| Reopening closed feature | Separate doc tree; reference TASK-011 as baseline only |

---

## 7. Decisions applied

| DEC | Status |
|-----|--------|
| DEC-001 | Feature id + doc home — accepted |
| DEC-002 | Extend STATUS_VALIDATE — accepted |
| DEC-003 | Task `portal_status` + `portal_checkpoint_json` — **accepted OQ-001** |
| DEC-004 | Add Family Member conditional Must (pre-start members) — **accepted OQ-005** |
| DEC-005 | SPA Phase C deferred — **accepted OQ-004** |
| DEC-006 | Pre-start visa selection; National verify-first — **accepted OQ-003** |
