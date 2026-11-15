# Spec — BLS booking Visa Type continue

| Field | Value |
|-------|-------|
| Feature id | `bls-booking-visa-type` |
| Document home | **`docs/sdd/bls-booking-visa-type/`** (authoritative) |
| Spec SoT | [`02-spec.md`](./02-spec.md) (this file) |
| Status | **APPROVED** / **IMPLEMENTING** (DEC/OQ stamped 2026-11-14 — product owner continue) |
| Updated | 2026-11-14 |
| Upstream | `durable-bls-workflow` (**DONE**) TASK-012 / CON-006; `manage-applicants-appointment-form` Ready→BOOK handoff |
| Materials | `site_materials/email_data_protection/*`, `site_materials/visa_type/*` |
| Agent brief | `site_materials/visa_type/visa_type_agent_brief.md` |
| Flow companion | `site_materials/visa_type/visa_type_flow.md` |

---

## 1. Goal and scope

### 1.1 Goal

After an applicant is in a successful **Ready To Book** state, the durable BLS workflow **BOOK** path must: (1) complete **email data-protection consent** via the retained mailbox, (2) open Visa Type Selection, (3) fill documented fields, (4) **Submit**, (5) always probe/solve **captcha** when present, (6) recognize **slots unavailable** and recover per policy — stopping for staff on unknown-next or forbidden Premium/payment surfaces.

### 1.2 In scope

- Prerequisite: Ready To Book (STATUS_VALIDATE / manage-applicants handoff). Do **not** rebuild Manage Applicants form fill.
- Email DP consent gate (subject + green CTA only).
- Booking entry helpers reuse (`clickPortalBookNewAppointment`, wait/prefill, Attention).
- Visa Type Selection fill: Location, Visa Type, Visa Sub Type, Appointment For, Number Of Members (Family), Category (Prefer Normal).
- Family `#familyDisclaimer` Accept allowed.
- VisaType `#btnSubmit` / `OnSubmitVisaType` automation (**policy revision**).
- Captcha probe + existing solve/verify pipeline.
- Slots-unavailable detection + Try Again recovery classification.
- Checkpoint: consent completed before booking entry; mid-booking lastCompletedStep.
- Classifier update: Submit allowlisted; Premium/payment remain `NOT_SAFE`.

### 1.3 Non-goals (explicit)

| Non-goal | Rationale |
|----------|-----------|
| Manage Applicants Edit Member / `#visaTypeModal` rebuild | Upstream feature |
| Premium Lounge Accept / `#PremiumTypeModel` / payment confirm | Hard stop remains |
| Calendar / post-slots success steps | Not in materials — do not invent |
| Doorstep `doorstepservice` Book Now | Forbidden entry |
| Second mail provider stack | Reuse TemporaryEmailProvider |
| Casually reopening durable-bls-workflow review | Supersede via DEC only for Submit stop |
| Rabbit new Must events | Default no (**DEC-proposed-005**) |

---

## 2. Actors

| Actor | Role |
|-------|------|
| Workflow runner | Executes BOOK continue |
| Booking domain client | Page actions; ≠ orchestrator |
| TemporaryEmailProvider | Consent email find + link extract |
| CapMonster / captcha utils | Booking captcha |
| Staff | Unknown-next, Premium required, exhaustion |
| Portal BLS | External SoT for UI outcomes |

---

## 3. Baseline and traceability

| Artifact | Relation |
|----------|----------|
| TASK-012 (DONE) | Safe-stop before Submit — **partially superseded** by this feature’s DEC for Submit/captcha/slots |
| TASK-006 (DONE) | Mail retain — extend for subject/link |
| MA-TASK-006 | Leaves Ready → BOOK; this feature owns visa_type continue |
| `runPortalBookingSafeStopPipeline` | Evolve into continue pipeline |
| `classifyPortalBookingUnsafeAction` | Update Submit allowlist |
| Agent brief §2 | Normative logical state machine (updated for Submit) |

---

## 4. State machine (authoritative)

```
READY_TO_BOOK (prerequisite)
  → EMAIL_CONSENT_PENDING
      action: wait DP email by subject; extract green consent href; open link
      forbid: red disagree CTA
      persist: DATA_PROTECTION_CONSENT_DONE
  → EMAIL_CONSENT_DONE
  → BOOKING_ENTRY
      action: clickPortalBookNewAppointment (href*=newappointment; never doorstep)
  → BOOKING_UI_OPEN
      ready: waitForPortalBookingSelectionUi (prefer heading + VisaType form action)
  → ATTENTION (if #scamAlert)
      action: acceptPortalAttentionModal
  → FORM_READY → FORM_FILLED
      fields: Location, Visa Type, Visa Sub Type, Appointment For,
              Number Of Members (if Family + Family Accept), Category (Prefer Normal)
      if Premium category required by CRM → PREMIUM_STOP (staff; do not Accept)
  → SUBMITTED
      action: click #btnSubmit / OnSubmitVisaType
  → CAPTCHA_PENDING? (always probe)
      action: reuse captcha solve + #btnVerify
  → OUTCOME
      SLOTS_UNAVAILABLE → Try Again → BOOKING_UI_OPEN (SAFE_TO_REPEAT + backoff)
      UNKNOWN_NEXT → staff terminal (AWAITING_STAFF_BOOKING / WAITING_STAFF)
      PREMIUM_OR_PAYMENT → NOT_SAFE hard stop
```

---

## 5. Requirements (REQ)

| ID | Requirement |
|----|-------------|
| **REQ-001** | BOOK continue starts only when applicant(s) are Ready To Book (existing gate). |
| **REQ-002** | Before booking entry, complete email DP consent using retained TemporaryEmailProvider mailbox. |
| **REQ-003** | Locate message with subject containing `BLS - Data Protection Information`. |
| **REQ-004** | Follow only the green consent CTA whose text contains: `I have read and understood the information on data protection and I explicitly consent to the data treatment`. |
| **REQ-005** | Never click/follow `I disagree and don't give my consent`. |
| **REQ-006** | Persist checkpoint `dataProtectionConsentDone` / `EMAIL_CONSENT_DONE` before Book New Appointment click. |
| **REQ-007** | Enter booking via `newappointment` helpers; never doorstep. |
| **REQ-008** | Wait for full-page Visa Type Selection cues; do not drive Manage `#visaTypeModal` as this form. |
| **REQ-009** | Dismiss Attention `#scamAlert` via existing Accept helper when shown. |
| **REQ-010** | Fill Location, Visa Type, Visa Sub Type, Appointment For; Family → Accept `#familyDisclaimer` then Number Of Members; Category Prefer Normal. |
| **REQ-011** | Use label/listbox strategies; never hardcode obfuscated dump ids. |
| **REQ-012** | Click VisaType Submit (`#btnSubmit` / `OnSubmitVisaType`) after form ready. |
| **REQ-013** | Always probe for captcha surface after submit (and whenever DOM shows); solve/verify with existing pipeline; do not assume always present. |
| **REQ-014** | Detect exact banner `Appointment slots are not available`; classify first-class `SLOTS_UNAVAILABLE`; Try Again → re-enter selection wait. |
| **REQ-015** | Slots branch: `SAFE_TO_REPEAT` with backoff (subject to OQ-002 staff timing). |
| **REQ-016** | Never Accept Premium Lounge / payment confirm; classify `NOT_SAFE_TO_REPEAT`. |
| **REQ-017** | Do not invent calendar or post-slots success steps beyond materials. |
| **REQ-018** | Persist lastCompletedStep after each successful transition (ids/codes only). |
| **REQ-019** | Update unsafe-action classifier: Submit allowlisted; Premium/payment remain unsafe. |
| **REQ-020** | Ambiguous CRM prefill → staff gate; no guessing (especially Family/Premium). |

---

## 6. Non-functional (NFR)

| ID | Requirement |
|----|-------------|
| **NFR-001** | Retry classes inherit durable workflow budgets (max 5; backoff 5s…300s) unless OQ overrides slots. |
| **NFR-002** | No secrets / email bodies / consent tokens in logs or API. |
| **NFR-003** | File-separation + TypeScript conventions (no `enum`; typed returns; const objects). |
| **NFR-004** | Domain client ≠ orchestrator. |
| **NFR-005** | Do not regress register/login/status pipelines or mail retain-until-terminal. |
| **NFR-006** | Worker lint + build green for touched packages. |

---

## 7. Constraints (CON)

| ID | Constraint |
|----|------------|
| **CON-001** | Reuse TemporaryEmailProvider; no second mail stack. |
| **CON-002** | No parallel BOOK orchestrator outside bls-workflow / booking client. |
| **CON-003** | Do not rewrite closed TASK-012 markdown as DONE history; supersede via DEC. |
| **CON-004** | **Payment / Premium Accept remain forbidden** (unchanged hard stop). |
| **CON-005** | **VisaType Submit is in scope** for this feature (revises prior CON-006 Submit ban). |
| **CON-006** (this feature) | Captcha Verify is allowed; payment/Premium Accept cues must not be clicked. **Do not confuse** with upstream durable-bls **TASK-012 / CON-006** (historical Submit+payment ban) — Submit ban is superseded here by **CON-005** / **DEC-001**. |
| **CON-007** | Migrations require human-approved plan. |
| **CON-008** | Never use Manage Applicants `#LocationId`/`#VisaType` modal as Visa Type Selection. |

### Policy revision note (Must document)

Prior durable-bls-workflow **CON-006** / TASK-012 forbade VisaType `#btnSubmit`, Premium Accept, and payment. **This feature revises that policy as follows:**

- **Now allowed:** VisaType Submit, post-submit captcha solve/verify, slots-unavailable detection + Try Again.
- **Still forbidden:** Premium Lounge Accept, payment confirmation, inventing calendar/payment steps.
- Upstream manage-applicants **CON-004** (no VisaType submit) applies to that feature’s handoff only; once control is in this BOOK continue feature, CON-005 applies.

---

## 8. Decisions (APPROVED 2026-11-14 — product owner continue)

| ID | Decision | Status |
|----|----------|--------|
| **DEC-001** | VisaType Submit + captcha + slots **in scope**; Premium Lounge Accept / payment **still forbidden** | **approved** 2026-11-14 — product owner continue |
| **DEC-002** | Email DP consent **mandatory** before Book New Appointment | **approved** 2026-11-14 — product owner continue |
| **DEC-003** | Checkpoint **Option A reuse** (no migration unless VT-TASK-001 proves columns missing → stop+report) | **approved** 2026-11-14 — product owner continue |
| **DEC-004** | Do **not** terminal `AWAITING_STAFF_BOOKING` on open-UI-only; terminal on unknown-next / staff / exhaustion | **approved** 2026-11-14 — product owner continue |
| **DEC-005** | No Must Rabbit/contracts changes | **approved** 2026-11-14 — product owner continue |
| **DEC-006** | Prefer **Normal** category; Premium required → staff | **approved** 2026-11-14 — product owner continue |
| **DEC-007** | Family path **in scope** (Accept + Number Of Members) | **approved** 2026-11-14 — product owner continue |
| **DEC-008** | Slots unavailable → SAFE_TO_REPEAT + Try Again + backoff (auto) | **approved** 2026-11-14 — product owner continue |

---

## 9. Open questions (OQ) — accepted defaults 2026-11-14

| ID | Question | Accepted default |
|----|----------|------------------|
| **OQ-001** | DP email timing vs Book | Wait/poll mailbox before Book; skip if already consented |
| **OQ-002** | Slots Try Again policy | Auto retry (align DEC-008); staff after exhaustion |
| **OQ-003** | Family in v1? | Family in v1 (align DEC-007) |
| **OQ-004** | New workflow statuses? | Reuse existing statuses/checkpoints; add only if TASK-001/002 need |
| **OQ-005** | MA Phase A hard dependency? | No — MA not hard dependency for BOOK continue |
| **OQ-006** | Mail API shape | Implementer freedom within TemporaryEmailProvider |
| **OQ-007** | Unknown-next after captcha | Staff gate (`AWAITING_STAFF_BOOKING` / WAITING_STAFF) |

---

## 10. Acceptance criteria (AC)

| ID | Covers | Criterion |
|----|--------|-----------|
| **AC-01** | REQ-002…006 | From Ready, DP email found; green consent followed; disagree never used; consent checkpoint set before booking click |
| **AC-02** | REQ-007…009 | Booking UI opens via newappointment; Attention accepted when shown; no doorstep |
| **AC-03** | REQ-010…011 | Fields filled via labels; Sub Type/Members/Category covered; Prefer Normal |
| **AC-04** | REQ-012, CON-005 | `#btnSubmit` clicked when form ready |
| **AC-05** | REQ-013 | Captcha probed; when present, solve+verify path invoked |
| **AC-06** | REQ-014…015 | Slots banner exact text detected; Try Again recovery path; SAFE_TO_REPEAT classification |
| **AC-07** | REQ-016, CON-004 | No Premium Accept / payment clicks; classifier marks them NOT_SAFE |
| **AC-08** | REQ-017 | No calendar invention |
| **AC-09** | REQ-018…019 | Checkpoints + classifier updated |
| **AC-10** | NFR-005…006 | Lint/build worker (+ api if touched); no login/mail retain regression |

---

## 11. Error / resume matrix (summary)

| Situation | Class | Resume |
|-----------|-------|--------|
| DP email not yet present | SAFE_TO_REPEAT | Wait / backoff |
| Consent link missing / ambiguous | VERIFY_THEN_REPEAT → staff | Re-read mail; never disagree |
| Overlay / Attention stuck | SAFE_TO_REPEAT | Retry Accept / re-enter |
| Ambiguous field / CRM gap | NOT_SAFE / staff | No guess |
| Captcha fail | SAFE_TO_REPEAT | Captcha budgets |
| Slots unavailable | SAFE_TO_REPEAT | Try Again + backoff |
| Premium / payment UI | NOT_SAFE | Staff |
| Unknown post-submit page | Staff terminal | AWAITING_STAFF_BOOKING |

---

## 12. Sensitive paths

| Path | Gate |
|------|------|
| CON-006 / payment | Human DEC-001; static review no payment clicks |
| TypeORM migration | Human OQ/DEC-003 |
| Mail body / tokens | NFR-002 |
| Closed durable-bls review | CON-003 |

---

## 13. Out of scope reminders

- Calendar booking after slots success.
- Payment / Premium Accept.
- Manage Applicants form automation.
- SPA Phase C unless scheduled.
