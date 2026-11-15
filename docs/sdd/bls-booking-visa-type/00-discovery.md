# Phase 0 — Discovery (BLS booking Visa Type continue)

| Field | Value |
|-------|-------|
| Feature id | `bls-booking-visa-type` |
| Status | **Complete** |
| Date | 2026-11-14 |
| Spec SoT | [`02-spec.md`](./02-spec.md) |
| Explorer | `sdd-project-explorer` (2026-11-14) — agent `f5aeefb5-1104-41e0-bdc9-a6431cf62d1d` |
| Upstream | `durable-bls-workflow` (**DONE**) TASK-012; `manage-applicants-appointment-form` (PLANNED Ready→BOOK) |

**Labeling:** **Fact** = verified in-repo / materials. **Assumption** = labeled.

---

## 1. Purpose

Establish evidence for continuing BOOK past Ready To Book: mandatory email data-protection consent → Visa Type Selection fill → Submit → captcha? → slots-unavailable | unknown-next — without inventing calendar steps or payment automation, and without casually reopening the closed durable-bls-workflow review.

---

## 2. Materials (Facts)

| Source | Role |
|--------|------|
| `site_materials/email_data_protection/mail.html` | Subject `BLS - Data Protection Information`; green consent + red disagree CTAs; AWS-tracked href → `/global/appointment/dataprotectionemailaccept?data=…` |
| `site_materials/email_data_protection/image.png` | Visual of consent buttons |
| `site_materials/visa_type/visa_type_agent_brief.md` | Agent SoT: elements, state machine, selectors, CON-006 notes |
| `site_materials/visa_type/visa_type_flow.md` | Step sequence, fields, captcha, slots |
| `book_new_appointment.html`, `book-appoinntment-captcha.html`, `slots-not-available.html` | DOM fixtures (captcha filename typo on disk) |
| `1.png`…`5.jpg` | Attention → form → Family → Members → slots unavailable |
| `site_materials/possible_site_issues/visa_type_booking_issues.md` | Proposed stuck codes |
| `site_materials/possible_site_issues/stuck_state_db_contract.md` | DB evidence bag + `BOOK_CAPTCHA_PENDING` / `BOOK_SLOTS_UNAVAILABLE` proposed |

---

## 3. Baseline code (Facts)

| Area | Evidence | Gap |
|------|----------|-----|
| BOOK client | `BlsBookingClientService.execute` → `PortalBookingFillService.fillBookingSafeStop` → `runPortalBookingSafeStopPipeline` | Stops before `#btnSubmit` |
| Entry helpers | `clickPortalBookNewAppointment`, `waitForPortalBookingSelectionUi`, `isPortalBookingSelectionUiVisible` | Reuse |
| Prefill | `prefillPortalBookingSelectionFields` — Location / Visa Type / Individual only | No Sub Type / Members / Category; Family → ambiguous |
| Attention | `acceptPortalAttentionModal` (`#scamAlert`) | Used on status path; **not** wired in booking safe-stop |
| Captcha | `solvePortalBlsCaptcha`, `clickPortalCaptchaVerifyControl`, `runPortalCaptchaVerifiedLoop` | Login/register only; **not** booking post-submit |
| CON-006 classifier | `classifyPortalBookingUnsafeAction` — `visa_type_submit` \| `on_submit_visa_type` \| `premium_lounge_accept` \| `payment_confirm` → `NOT_SAFE_TO_REPEAT` | Must revise for Submit allowlist |
| Terminal | BOOK success → `AWAITING_STAFF_BOOKING` via `planBlsWorkflowAdvance` / `BlsWorkflowService.advance` | Extending BOOK changes terminal meaning |
| Email | `TemporaryEmailProvider`: `waitLatestMessage`, `extractOtp`, `extractPortalPassword` | **No** subject filter; **no** HTML consent-link extract; result has `{ messageId, body }` only |
| Browser mail | Inbox rows expose `subjectPreview` | Wait API does not filter/return subject to callers |
| Contracts | `packages/contracts` workflow control messages only | No Must booking payload types |
| MA handoff | MA-TASK-006 PLANNED: Ready → existing safe-stop; visa_type OOS | This feature owns visa_type continue |
| Checkpoint columns | `portal_status` + `portal_checkpoint_json` already on `bls_workflow_tasks` (api+worker) when MA persistence landed | VT-TASK-001 verifies **Option A reuse**; migrate only on drift |
| Frontend | `BlsWorkflowBookingHandoffRender` for `AWAITING_STAFF_BOOKING` | Mid-booking states may need Phase C |

---

## 4. Dual UI warning (Fact)

| UI | Selectors | Owner |
|----|-----------|-------|
| Manage Applicants `#visaTypeModal` | `#LocationId` / `#VisaType` + Proceed | `manage-applicants-appointment-form` |
| Full-page Visa Type Selection | Heading `Book New Appointment - Visa Type Selection`; form action `/Global/Appointment/VisaType`; obfuscated ids | **This feature** |

`waitForPortalBookingSelectionUi` currently accepts **either** — implementers must prefer heading + form action for this flow.

---

## 5. Open questions carried to spec

See `02-spec.md` § OQ: consent email timing, Try Again staff vs auto, Family v1 scope, BOOK terminal / mid-states, migration for booking checkpoints, MA Phase A dependency, unknown-next after slots success.

---

## 6. Artifact suggestion (adopted)

`docs/sdd/bls-booking-visa-type/` — sibling to `manage-applicants-appointment-form/`. Do **not** rewrite closed `docs/sdd/tasks/TASK-012-booking-safe-stop.md`; supersede via DEC in this tree.
