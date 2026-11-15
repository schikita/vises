# Spec — Manage Applicants appointment form (follow-on)

| Field | Value |
|-------|-------|
| Feature id | `manage-applicants-appointment-form` |
| Document home | **`docs/sdd/manage-applicants-appointment-form/`** (authoritative) |
| Spec SoT | [`02-spec.md`](./02-spec.md) (this file) |
| Spec path | `docs/sdd/manage-applicants-appointment-form/02-spec.md` |
| Mirror | `specs/features/manage-applicants-appointment-form/` — **may be absent** in this checkout; prefer docs under `docs/sdd/` |
| Status | **APPROVED** — OQ-001…007 recorded 2026-11-14; feature **IMPLEMENTING** |
| Updated | 2026-11-14 |
| Upstream baseline | `durable-bls-workflow` (**DONE** / `APPROVE_WITH_ISSUES`) — **do not reopen review** |
| Materials | `site_materials/manage_applicants_appointments/*`, `site_materials/calendar.jpg`, `site_materials/calendar.html` |
| Agent brief | `site_materials/manage_applicants_appointments/manage_applicants_appointments_agent_brief.md` |
| Flow companion | `site_materials/manage_applicants_appointments/manage_applicants_appointments_flow.md` |
| Stuck catalog | `site_materials/possible_site_issues/manage_applicants_appointments_issues.md` |
| DB stuck contract | `site_materials/possible_site_issues/stuck_state_db_contract.md` |

---

## 1. Goal and scope

### 1.1 Goal

After portal **LOGIN** (and conditional password change), the durable BLS workflow’s **STATUS_VALIDATE** path must treat **Manage Applicants** as the source of truth for branching: complete the **Edit Member / ManageApplicant** form when status is **Form Filling In-Progress**, persist a durable mid-form checkpoint, reach **Ready To Book Appointment**, then hand off to the existing **BOOK** safe-stop pipeline (**TASK-012** / **CON-006**). Replace today’s **minimal empty-field edit fill** (TASK-011) with a full required-field fill inside `iframe.k-content-frame`, including `#visaTypeModal`, Attention Accept, Kendo controls, success dialog, and resume via `fieldProgress` (register prior art).

### 1.2 In scope

- Continue after authenticated session → Manage Applicants scrape → branch.
- Full Schengen happy-path required field map + sanctioned fill interactions (text, Kendo dropdown, Kendo datepicker/calendar).
- Issue / overlay / iframe / validation / dialog / UNKNOWN / network / CON-006 handling matrix with DB resume.
- Persist `portalStatus` ∈ `FORM_FILLING_IN_PROGRESS` \| `READY_TO_BOOK` \| `UNKNOWN` plus checkpoint metadata **without raw field secrets**.
- Button/branch: Edit, Proceed, Accept, Submit, success dialog; **Book New Appointment** only when Ready; Cancel/Close avoided on happy path.
- **Add New Member / family** — **conditional Must** when the application already has additional members entered **before** workflow start (OQ-005); same Edit Member form after portal add; never click Add New Member if no pre-start family members.
- Extend **STATUS_VALIDATE** / status client / edit pipeline — **not** a parallel orchestrator or new Must step key.

### 1.3 Non-goals (explicit)

| Non-goal | Rationale |
|----------|-----------|
| VisaType payment / Premium Lounge / `#btnSubmit` / `OnSubmitVisaType` | **CON-006**; materials under `site_materials/visa_type/` are **next after Ready**, out of this feature |
| Any CON-006 forbidden click | Inherited hard stop from TASK-012 |
| Reopening `durable-bls-workflow` review / ISSUE-001–003 as this feature’s work | Baseline is closed DONE; extend only STATUS_VALIDATE behavior |
| Greenfield orchestrator or new step key replacing STATUS_VALIDATE | Prefer extend existing pipeline (**DEC-proposed-002**) |
| Automating Delete applicant, Cancel Appointment, or modal Cancel on happy path | Materials + brief §7.8 |
| Captcha/OTP on Edit Member | Not evidenced; if login wall reappears, re-enter login pipeline |
| SPA checkpoint UX as Must for v1 | Worker-only Phase A/B; SPA optional Phase C (**DEC-proposed-005**) |
| Hardcoding Schengen-only as product rule | Visa category from **pre-start** application selection (OQ-003); National = verify-first before same-id assumption (**DEC-006**) |

---

## 2. Actors and roles

| Actor | Role |
|-------|------|
| Workflow runner / `apps/workflow-worker` | Executes STATUS_VALIDATE → edit fill → scrape → BOOK handoff |
| Status domain client (`bls-clients/status`) | Page actions for Manage Applicants / edit; ≠ orchestrator |
| Portal BLS site | External system of truth for row status labels and form validation |
| Staff operator | Retries, staff gate, and booking takeover after CON-006 stop |
| CRM Client / application applicants | Supply PII and itinerary data for fill (data-contract gaps → OQ) |
| Staff SPA (optional Phase C) | May surface safe checkpoint summary on workflow snapshot — not required for A/B |

---

## 3. Baseline and traceability

| Artifact | Relation |
|----------|----------|
| TASK-011 (DONE) | STATUS_VALIDATE exists; scrape/normalize enum; **minimal** empty text fill; Attention path; gates BOOK |
| TASK-012 (DONE) | BOOK safe-stop; **CON-006**; terminal `AWAITING_STAFF_BOOKING` |
| `runPortalStatusValidatePipeline` | Extend — add visa modal, iframe context, full fill, dialog, checkpoints |
| `fillPortalApplicantEditForm` | Replace/extend — today top-document empty names/passport/place only; no Kendo/iframe |
| Register `portal_autofill_runs.field_progress_json` + `pipeline_stage` | **Mirror pattern** for STATUS fieldProgress / lastCompletedStep — do not store values |
| `BLS_APPLICANT_PORTAL_STATUS` / `PORTAL_APPLICANT_STATUS_LABELS` | Reuse; **persist to workflow task checkpoint** (today enum exists in worker, not DB mid-form resume) |
| Agent brief §2 state machine | Normative flow after AUTHENTICATED |
| Flow.md data contract + field tables | Normative required field map (reference; do not paste entire HTML) |
| Calendar materials | Reuse `commitDateViaCalendarUi` / `ensureDatepickerDaySelected`; no fork |

---

## 4. State machine (after AUTHENTICATED)

Persist `portalStatus` + `lastCompletedStep` after every successful transition (REQ-010).

```
AUTHENTICATED
  → goto Manage Applicants
  → STATUS_SCRAPED
  → ready: waitForPortalManageApplicantsPage

STATUS_SCRAPED
  → if READY_TO_BOOK → BOOKING_ENTRY
  → if FORM_FILLING_IN_PROGRESS → OPEN_EDIT
  → if UNKNOWN → FAIL_RETRY (SAFE_TO_REPEAT)

OPEN_EDIT
  → click Edit/Complete
  → VISA_TYPE_MODAL
  → ready: #visaTypeModal visible

VISA_TYPE_MODAL
  → select #LocationId, #VisaType; click Proceed
  → EDIT_FRAME_READY
  → ready: iframe.k-content-frame + #myForm ManageApplicant + #FirstName

EDIT_FRAME_READY
  → accept #scamAlert
  → FORM_FILLING
  → ready: #scamAlert hidden

FORM_FILLING
  → fill required sections; checkpoint per section / fieldProgress
  → FORM_READY_TO_SUBMIT
  → ready: required controls set (no --Select-- / empty required)

FORM_READY_TO_SUBMIT
  → click Submit; accept success dialog
  → POST_SUBMIT_RELOAD
  → ready: dialog text OR navigation started

POST_SUBMIT_RELOAD
  → wait Manage Applicants; re-scrape
  → STATUS_SCRAPED
  → expect READY_TO_BOOK (else FAIL_RETRY)

BOOKING_ENTRY
  → click Book New Appointment (existing safe-stop pipeline)
  → BOOKING_UI (external TASK-012)
  → HARD STOP before VisaType submit / premium / payment (CON-006)
```

**Add Family Member branch (OQ-005):** only when application already has additional member(s) pre-start → `OPEN_ADD_MEMBER` (`ManageApplicant('')` / Add New Member) → same VISA_TYPE_MODAL → EDIT_FRAME_READY → FORM_FILLING for that member (applicant-scoped checkpoint); does not bypass Ready gate for BOOK. If no pre-start family members → **never** click Add New Member.

### Status transitions (portal)

| From | To | Trigger |
|------|----|---------|
| (unknown / after login) | `FORM_FILLING_IN_PROGRESS` | Scrape red status |
| `FORM_FILLING_IN_PROGRESS` | `READY_TO_BOOK` | Successful Edit submit + scrape green status |
| `READY_TO_BOOK` | (BOOK step) | Book New Appointment click |
| any | `UNKNOWN` | Unrecognized status text — never treat as Ready |

---

## 5. Status model and persistence write times

| Status (persist) | Portal label | Branch |
|------------------|--------------|--------|
| `FORM_FILLING_IN_PROGRESS` | `Form Filling In-Progress` | → edit / fill |
| `READY_TO_BOOK` | `Ready To Book Appointment` | → Book New Appointment / skip fill |
| `UNKNOWN` | anything else | retry / escalate — **never** success |

**Write times (Must):**

1. After every successful Manage Applicants scrape.
2. After confirmed post-submit re-scrape.
3. After each successful state-machine step transition (`lastCompletedStep`).
4. During FORM_FILLING, after each completed section (or field batch) → update `fieldProgress` (filled/skipped/failed **ids only**, no values).

**SoT for branching:** live scrape preferred; stored status chooses resume entry only when page unreachable mid-retry.

**Alignment:** `PORTAL_APPLICANT_STATUS_LABELS`, `BLS_APPLICANT_PORTAL_STATUS`; workflow tables `bls_workflows` / `bls_workflow_steps` / `bls_workflow_tasks` / `bls_workflow_attempts` + events with `payload_safe` only.

---

## 6. Functional requirements

### Continuity and branching

| ID | Requirement | Priority |
|----|-------------|----------|
| **REQ-001** | After AUTHENTICATED (login/password pipelines), STATUS_VALIDATE **Must** navigate to Manage Applicants via existing resolve/wait helpers and treat scraped row status as SoT for branching. | Must |
| **REQ-002** | When scraped status is `FORM_FILLING_IN_PROGRESS` and Edit action exists, pipeline **Must** open Edit → `#visaTypeModal` → Proceed → iframe form (not skip modal). | Must |
| **REQ-003** | When scraped status is `READY_TO_BOOK`, pipeline **Must** skip form fill and proceed to BOOKING_ENTRY / existing BOOK client. | Must |
| **REQ-004** | When scraped status is `UNKNOWN`, pipeline **Must not** treat as Ready; classify `SAFE_TO_REPEAT` / escalate per existing status codes (`bls_status_unknown`). | Must |

### Full form fill

| ID | Requirement | Priority |
|----|-------------|----------|
| **REQ-005** | STATUS edit path **Must** operate form selectors inside `iframe.k-content-frame` after Proceed (frame-first). | Must |
| **REQ-006** | Pipeline **Must** accept `#scamAlert` Attention via existing Accept helper before fill; wait until hidden. | Must |
| **REQ-007** | Pipeline **Must** fill the **full Schengen happy-path required field set** (§8) from CRM / prior workflow / location & visa config — not the current minimal empty-text subset. | Must |
| **REQ-008** | Text fields **Must** use sanctioned fill + read-back; English/ASCII per `validateEnglish`; prefer leave already-correct prefilled identity fields unchanged. | Must |
| **REQ-009** | Kendo dropdowns **Must** use listbox UI / widget helpers (`commitDropdownViaListboxUi` / equivalent); **Must not** rely on invisible `<select>` alone. | Must |
| **REQ-010** | Kendo datepickers **Must** use widget API first, calendar UI fallback (`commitDateViaCalendarUi`); **never** type/paste into readonly inputs; respect min/max; match days via 0-based `data-value`. | Must |
| **REQ-011** | Conditional sections (minor, other residence, previous visa, fingerprint date when radio=`0`, inviting blocks by radio) **Must** be filled only when applicant data requires; otherwise left unchecked/empty. | Must |
| **REQ-012** | Radios `PreviousFingerPrintStatus` / `BlsInvitingAuthority` **Must** use `name`+`value` selectors (duplicate ids). Defaults: fingerprint `2`, inviting `0` (company) unless data says otherwise. | Must |
| **REQ-013** | Before Submit: Submit enabled; validation summary absent/empty; then click Submit; dialog listener registered **before** Submit; accept `Edited family member successfully.` | Must |
| **REQ-014** | After submit, pipeline **Must** settle, re-scrape Manage Applicants, and require `READY_TO_BOOK` before BOOK handoff; still Form Filling → `SAFE_TO_REPEAT` / `bls_status_not_ready`. | Must |

### Persistence and resume

| ID | Requirement | Priority |
|----|-------------|----------|
| **REQ-015** | System **Must** persist per-applicant checkpoint: at minimum `{ portalStatus, lastCompletedStep, locationId?, visaTypeId?, fieldProgressJson?, applicantId }` with **no raw field values / secrets**. | Must |
| **REQ-016** | Checkpoint storage **Must** align with `bls_workflow_tasks` (and attempt/`payload_safe` patterns); mirror register `field_progress_json` semantics (filled/skipped/failed reasons without values). **DEC-proposed-003**. | Must |
| **REQ-017** | On resume into FORM_FILLING, pipeline **Must** load prior `fieldProgress` and skip completed sections when safe. | Must |
| **REQ-018** | Persist `portalStatus` write times per §5; column or jsonb field on task **Must** expose `portalStatus` for mid-form resume (**DEC-proposed-003**). | Must |

### Data contract (CRM)

| ID | Requirement | Priority |
|----|-------------|----------|
| **REQ-019** | Product **Must** define a complete data contract mapping CRM Client / applicant / application config → every required portal field in §8. | Must |
| **REQ-020** | Map portal fields from data already entered in our system (portal-aligned CRM/applicant form shape — OQ-002). **Never invent** values. Optional/conditional sections with no CRM data → **skip** (leave empty/unchecked). Staff/fail only when a **portal-required (`*`)** field has no source and cannot be skipped (OQ-007). | Must |

### Buttons / branches

| ID | Requirement | Priority |
|----|-------------|----------|
| **REQ-021** | **Edit/Complete** — click when Form Filling; open visa modal path. | Must |
| **REQ-022** | **Proceed** — only after Location\* and Visa Type\* selected via Kendo UI. | Must |
| **REQ-023** | **Accept** — Attention gate; **Submit** — persist form; **Cancel** / **Close** — not clicked on happy path. | Must |
| **REQ-024** | **Book New Appointment** — **only** when `READY_TO_BOOK`; use existing `clickPortalBookNewAppointment` / safe-stop. | Must |
| **REQ-025** | **Add New Member / family** — **conditional Must** when the application already has additional member(s) entered before workflow start (OQ-005 / **DEC-004**). Click Add New Member only then; after portal add, run the same Edit Member fill for that member (applicant-scoped checkpoint). If no pre-start family members → **Must not** click Add New Member. Phase A may stub detection; Phase B implements fill (MA-TASK-008/009). | Must (when pre-start members exist) |

### Handoff

| ID | Requirement | Priority |
|----|-------------|----------|
| **REQ-026** | On `READY_TO_BOOK`, STATUS_VALIDATE success for that applicant **Must** hand off to existing BOOK step / `runPortalBookingSafeStopPipeline` without automating VisaType payment. | Must |
| **REQ-027** | Feature **Must** extend STATUS_VALIDATE pipeline / status client / edit fill — **not** invent a parallel Must orchestrator or replace step key `STATUS_VALIDATE` (**DEC-proposed-002**). | Must |

### Observability

| ID | Requirement | Priority |
|----|-------------|----------|
| **REQ-028** | Major transitions and stuck codes **Must** emit safe workflow events / task error fields (`lastErrorClass`, `lastErrorCode`, message ≤500) without PII values. | Must |
| **REQ-029** | SPA exposure of checkpoint summary on snapshot **May** ship as Phase C; Phase A/B are worker-complete without SPA (**DEC-proposed-005**). | Should (Phase C) |

---

## 7. Non-functional requirements

| ID | Requirement |
|----|-------------|
| **NFR-001** | Retry: preserve `SAFE_TO_REPEAT` / `VERIFY_THEN_REPEAT` / `NOT_SAFE_TO_REPEAT`; max **5** auto attempts; backoff base **5_000ms**, cap **300_000ms** (durable-bls-workflow DEC-014). |
| **NFR-002** | Secrets/PII: never log or persist raw form values in checkpoint, events `payload_safe`, or API DTOs; vault patterns unchanged. |
| **NFR-003** | Readiness: do not proceed on wall-clock alone; use wait helpers / selectors; overlays `.preloader` / `#global-overlay` cleared; Manage Applicants wait `PORTAL_STATUS_PAGE_WAIT_MS` (30s). |
| **NFR-004** | Backwards compatibility: BOOK CON-006 behavior and terminal `AWAITING_STAFF_BOOKING` unchanged; register/login pipelines not regressed. |
| **NFR-005** | Domain client ≠ orchestrator (inherited DEC-008). |
| **NFR-006** | Build/lint for touched `portal-fill` / `bls-clients` packages Must pass; types/constants/utils file-separation rules apply. |
| **NFR-007** | Migrations for new task columns/jsonb Must be additive; no destructive drop of `portal_autofill_runs` or closed workflow schema intent. |
| **NFR-008** | Visa category from application **pre-start** selection (OQ-003 / **DEC-006**). If National selected, re-verify form sections live before assuming Schengen field ids. Do not hardcode Schengen-only. |

---

## 8. Required field map (reference)

Authoritative detail: flow.md §§5–10 and agent brief §1.4. **Do not** paste entire HTML fixtures into implementer code comments.

### 8.1 Visa modal (top document)

| Field | Selector | Required | Source |
|-------|----------|----------|--------|
| Location | `#LocationId` | Yes | App / appointment location |
| Visa Type | `#VisaType` | Yes | Application pre-start visa/category selection (OQ-003) |

### 8.2 Edit Member — happy path (adult, no optional sections, inviting = company)

**Personal:** `FirstName`, `SurName`, `SurnameAtBirth`, `DateOfBirth`, `PlaceOfBirth`, `CountryOfBirthId`, `NationalityId`, `NationalityAtBirthId`, `GenderId`, `MaritalStatusId`  
**Passport:** `PassportType`, `PassportNo`, `IssueDate`, `ExpiryDate`, `IssuePlace`, `IssueCountryId`, `TravelDate`  
**Address:** `HomeAddressLine1`, `HomeAddressCountryId`, `HomeAddressCity`, `HomeAddressPostalCode`, `HomeAddressContactNumber`  
**Employer:** `EmployerName`, `EmployerPhone`, `EmployerAddress`, `CurrentOccupationId`  
**Travel:** `PurposeOfJourneyId`, `MemberStateDestinationId`, `MemberStateFirstEntryId`, `NumberOfEntriesRequested`, `IntendedStayDuration`, `IntendedDateOfArrival`, `IntendedDateOfDeparture`  
**Fingerprint:** `PreviousFingerPrintStatus` (radio)  
**Inviting (company `0`):** inviting authority set + contact person set (ids in flow.md §10)  
**Cost:** `CostCoveredById`, `MeansOfSupportId`

**Optional / conditional (when flags true):** LastName; NationalIdentityNumber; HomeAddressLine2; MemberStateSecondDestinationId (HTML: **not** required); minor parent block; other residence; previous visa; fingerprint date; entry-permit dates; EU family §13–14.

### 8.3 Date constraints

| Fields | Rule |
|--------|------|
| `TravelDate`, `IntendedDateOfArrival`, `IntendedDateOfDeparture` | `min: tomorrow` |
| `DateOfBirth`, `OtherCitizenDateOfBirth` | `max: yesterday` |
| `PreviousFingerPrintDate` | `max: today`; only when fingerprint = `0` |
| Issue/Expiry | format + issue ≤ expiry when data implies |

---

## 9. Error / resume matrix

| Failure | Detection | Retry class | Checkpoint | Resume | Escalate |
|---------|-----------|-------------|------------|--------|----------|
| Nav / network | timeout / context destroyed | SAFE_TO_REPEAT | last good step | Re-login if needed → Manage Applicants | Attempts exhausted |
| MA page not ready / overlay | wait fail; preloader stuck | SAFE_TO_REPEAT | status unknown | STATUS_SCRAPED | Exhausted |
| Applicant row missing | scrape empty / no match | SAFE_TO_REPEAT → staff | — | STATUS_SCRAPED | After 2–3 → staff |
| UNKNOWN status | normalize → UNKNOWN | SAFE_TO_REPEAT | persist UNKNOWN | STATUS_SCRAPED | New label → human/spec |
| Visa modal missing | `#visaTypeModal` timeout | SAFE_TO_REPEAT | OPEN_EDIT | Click Edit again | Exhausted |
| Location/Visa empty | listbox empty | SAFE_TO_REPEAT | VISA_TYPE_MODAL | Re-open modal | Exhausted / outage |
| Iframe not ready | form visibility false | SAFE_TO_REPEAT | VISA_TYPE_MODAL done? | Proceed / re-edit | Exhausted |
| Attention Accept fail | modal stuck | SAFE_TO_REPEAT | EDIT_FRAME_READY | Re-open edit | Exhausted |
| Field validation / English | read-back / summary | Fix or SAFE_TO_REPEAT | fieldProgress failed | FORM_FILLING at section | Bad PII → staff / NOT_SAFE |
| Datepicker fail | dateview / day / `0001-01-01` | SAFE_TO_REPEAT then VERIFY | failed field id | FORM_FILLING date section | Outside min/max → staff |
| Submit AJAX error | success=false / ShowError | VERIFY_THEN_REPEAT if ambiguous | FORM_READY_TO_SUBMIT | Re-scrape first | Exhausted |
| Success dialog missed | no dialog but reload | VERIFY_THEN_REPEAT | POST_SUBMIT | STATUS_SCRAPED | — |
| Still Form Filling after submit | scrape | SAFE_TO_REPEAT (`bls_status_not_ready`) | FORM_FILLING | OPEN_EDIT | Exhausted → staff |
| Ready but Book CTA missing | click helper fail | SAFE_TO_REPEAT | READY_TO_BOOK | BOOKING_ENTRY | Exhausted |
| Mid-booking CON-006 surface | premium/pay/submit cues | **Stop** NOT_SAFE | READY_TO_BOOK + safe-stop done | Staff booking | Immediate |
| Login wall mid-flow | login form / session lost | SAFE_TO_REPEAT | last good | LOGIN pipeline | Exhausted |

Stuck codes: prefer existing `bls_status_*` / `bls_booking_*`; proposed `MA_*` from issues catalog only where missing — align `stuck_state_db_contract.md`.

---

## 10. Data model impact

| Change | Notes |
|--------|-------|
| `bls_workflow_tasks` | **DEC-proposed-003:** add `portal_status` (varchar) + `portal_checkpoint_json` (jsonb) — or equivalent task-level jsonb embedding both; **no raw field values** |
| `bls_workflow_attempts` | May mirror safe checkpoint snippet in notes/`payload_safe`-like fields if already used; no secrets |
| `bls_workflow_events` | Transition events with safe payload only |
| `bls_workflows` / steps | No new Must step key; STATUS_VALIDATE remains |
| `portal_autofill_runs` | Pattern reference only; do not overload as STATUS SoT |
| `clients` / applicant input | **REQ-019/020** — map existing portal-shaped CRM/applicant data (OQ-002); expand schema only if product form already collects a field we cannot map |
| Sensitive fields | Passport/PII remain vault/encrypted Client columns; checkpoint never copies plaintext values |

Migration: additive only (**NFR-007**). Columns **approved** (OQ-001 / DEC-003): `portal_status` + `portal_checkpoint_json` on `bls_workflow_tasks`.

---

## 11. API surface

| Surface | Phase A/B | Phase C (optional) |
|---------|-----------|--------------------|
| Worker internal status client / pipeline | Extend inputs for full fill + checkpoint load/save | — |
| Workflow snapshot GET | Unchanged Must | May include safe `portalStatus` + fieldProgress **summary** (counts/ids, no values) |
| Staff control APIs | Existing retry/resume | No new public contract required for A/B |
| Contracts package | Update only if snapshot DTO gains checkpoint summary (Phase C) | |

Auth: existing staff application workflow auth unchanged. Errors: existing Russian `{ detail }` / errorClass patterns; no secret leakage (**NFR-002**).

---

## 12. Constraints

| ID | Constraint |
|----|------------|
| **CON-001** | Do **not** reopen or rewrite closed `durable-bls-workflow` review artifacts as part of this feature. |
| **CON-002** | Do **not** invent a parallel orchestrator or replace step key `STATUS_VALIDATE`. |
| **CON-003** | Do **not** store raw portal field values, passwords, or OTPs in checkpoint JSON, events, or logs. |
| **CON-004** | Do **not** click VisaType `#btnSubmit` / `OnSubmitVisaType`, Premium Lounge Accept, or payment controls (**inherits CON-006** from durable-bls-workflow / TASK-012). |
| **CON-005** | Do **not** click Cancel (visa modal) or Close (`OnWinClose`) on the happy path. |
| **CON-006** | Book New Appointment **only** when scraped/persisted status is `READY_TO_BOOK`. |
| **CON-007** | Do **not** hardcode ephemeral Kendo calendar widget ids; resolve `#{FieldId}_dateview` in the datepicker’s frame first. |
| **CON-008** | National Visa: do not assume Schengen field map without live verification when National is pre-selected (**DEC-006** / OQ-003). |
| **CON-009** | Add New Member only when pre-start family members exist (OQ-005); Phase A stubs must not break primary Edit; never click Add if none. |

---

## 13. Decisions (proposed — human may override)

| ID | Decision | Default |
|----|----------|---------|
| **DEC-proposed-001** | Feature id = `manage-applicants-appointment-form`; docs under `docs/sdd/manage-applicants-appointment-form/`. | Accept |
| **DEC-proposed-002** | Extend STATUS_VALIDATE / status client / edit pipeline; no new Must step key. | Accept |
| **DEC-003** | Checkpoint: task-level `portal_status` + `portal_checkpoint_json` on `bls_workflow_tasks` (no raw values); map portal status ↔ workflow for resume. | **Accepted** (OQ-001, 2026-11-14) |
| **DEC-004** | Add Family Member **conditional Must** when pre-start additional members exist; else never click Add; Phase A stub / Phase B fill. | **Accepted** (OQ-005, 2026-11-14) |
| **DEC-005** | SPA checkpoint exposure = Phase C later; A/B worker-only. | **Accepted** (OQ-004, 2026-11-14) |
| **DEC-006** | Visa category from pre-start application selection; National = verify-first; no Schengen-only hardcode. | **Accepted** (OQ-003, 2026-11-14) |

---

## 14. Implementation phases (spec-level)

| Phase | Scope | Exit |
|-------|-------|------|
| **A** | Extend STATUS_VALIDATE: visa modal, iframe, Attention, full Schengen required fill, dialog, portalStatus + checkpoint persistence, error/resume matrix, BOOK handoff | Primary Edit path reaches Ready → safe-stop |
| **B** | Add New Member when pre-start family members exist: portal add + same Edit fill + multi-row Ready | Each pre-start member reaches Ready without regressing primary Edit |
| **C** | SPA later (deferred): safe checkpoint / portalStatus on snapshot | Deferred per OQ-004 |

---

## 15. Edge cases (selected)

- Prefill vs overwrite: do not clobber correct FirstName/SurName/PassportNo; still set empty required dropdowns/dates.
- Portal defaults (Spain member states, Ordinary Passport, Belarus issue country): verify visible text before changing.
- Success dialog race vs top reload: VERIFY_THEN_REPEAT; settle `PORTAL_STATUS_EDIT_SETTLE_MS` before scrape.
- Image vs HTML: Member State Second Destination **optional** per HTML; Surname At Birth **required** per HTML.
- Ready green class may be `text-success` — match **exact label text** first (confirm live).
- Duplicate radio ids; Kendo window id may increment — prefer title + `iframe.k-content-frame`.

---

## 16. Out of scope (recap)

- VisaType payment / premium / CON-006 forbidden clicks (`site_materials/visa_type/` follow-on).
- Delete applicant; Cancel Appointment; happy-path Cancel/Close.
- Reopening durable-bls-workflow review cycle.
- Parallel STATUS orchestrator / new step key.
- Captcha restore wiring unless captcha appears on this path.
- SPA Must for Phase A/B.
- Inventing National field map without live verify.

---

## 17. Acceptance criteria

| AC | Maps to | Testable statement |
|----|---------|-------------------|
| AC-01 | REQ-001–004 | Login → Manage Applicants within readiness budget; branch Form Filling vs Ready vs UNKNOWN correctly. |
| AC-02 | REQ-002,005,006 | Edit → Location\* + Visa\* + Proceed → iframe `#myForm` + Attention Accept. |
| AC-03 | REQ-007–012 | All Schengen happy-path required fields set via sanctioned helpers; conditionals gated by data. |
| AC-04 | REQ-010 | Dates: widget or calendar UI; 0-based `data-value`; min/max; no typing into readonly. |
| AC-05 | REQ-013–014 | Submit → dialog OK (or verified reload) → scraped `READY_TO_BOOK` persisted. |
| AC-06 | REQ-015–018 | Checkpoint survives retry; resume skips filled sections; no raw values in DB/logs. |
| AC-07 | REQ-024,026, CON-004/006 | Book New Appointment only when Ready; CON-006 hard-stops respected; handoff to TASK-012 path. |
| AC-08 | REQ-004, §9, NFR-001 | Transient failures classified SAFE/VERIFY; ≤5 attempts; UNKNOWN never success. |
| AC-09 | REQ-025, DEC-004 | When pre-start family members exist → Add + Edit fill to Ready; when none → never click Add; no primary-Edit regression. |
| AC-10 | REQ-019–020, OQ-007 | Map existing CRM → portal ids; skip empty optional/conditional; never invent; staff only for unskippable required `*` with no source. |
| AC-11 | NFR-006 | Scoped build/lint for touched packages pass. |

---

## 18. Open questions — **RESOLVED** (2026-11-14)

| ID | Resolution |
|----|------------|
| **OQ-001** | **APPROVED** DEC-003: `portal_status` + `portal_checkpoint_json` on `bls_workflow_tasks`; portal ↔ workflow status for resume |
| **OQ-002** | Fill from our-system data with portal-aligned form shape; map → `#id`s; never invent |
| **OQ-003** | Visa/location from **pre-start** application selection; National = verify-first; no Schengen-only hardcode |
| **OQ-004** | SPA **later**; MA-TASK-010 deferred |
| **OQ-005** | Add Family Member **only if** pre-start family members exist; else never click Add; then same Edit form |
| **OQ-006** | Label-first Ready recognition (exact portal text); CSS secondary; analyze current scrape |
| **OQ-007** | Provided → fill; missing optional/conditional → **skip**; never invent; staff only for unskippable portal-required `*` with no source |

Full text: [`04-plan.md`](./04-plan.md) §7.

---

## 19. Sensitive paths

| Path | Handling policy |
|------|-----------------|
| Auth / session | Reuse login pipelines; mid-flow login wall → re-enter LOGIN; no new auth scheme |
| Roles | Staff workflow APIs unchanged; worker executes under existing runner identity |
| Migrations | Additive task columns/jsonb only; review in plan/tasks — not this spec’s code |
| PII | Encrypted Client columns / vault; checkpoint **ids/status only**; no values in events |
| Event schemas | `payload_safe` only; fieldProgress without values |
| Public contracts | Phase A/B no Must API break; Phase C snapshot additive optional fields |
| CON-006 / payment | Hard stop unchanged; never automate VisaType submit |

---

## 20. Traceability summary

| Source | Encoded as |
|--------|------------|
| Agent brief §1–§6 | REQ-001–018, §4–§9, CON-* |
| Flow.md field/data contract | §8, REQ-007, REQ-019 |
| Calendar materials | REQ-010, CON-007 |
| TASK-011 | Baseline extend; AC replaces minimal fill |
| TASK-012 / CON-006 | REQ-026, CON-004, CON-006, handoff |
| Explorer gaps (visa modal, iframe, dialog, fieldProgress, DB portalStatus) | REQ-002,005,013,015–018 |
| User Add Family Member ask | REQ-025, DEC-proposed-004, Phase B |
| Register field_progress prior art | REQ-016–017 |

---

## 21. Counts (this revision)

| Kind | Count |
|------|-------|
| REQ | **29** (REQ-001…029) |
| NFR | **8** (NFR-001…008) |
| CON | **9** (CON-001…009) |
| DEC-proposed | **6** (DEC-proposed-001…006) |
| Open questions | **7 resolved** (OQ-001…007, 2026-11-14) |
| Acceptance criteria | **11** (AC-01…11) |
