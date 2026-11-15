# SDD — BLS booking Visa Type continue

| Field | Value |
|-------|-------|
| Feature id | `bls-booking-visa-type` |
| Status | **READY_FOR_REVIEW** (Phase A/B IMPLEMENTING complete 2026-11-14; Phase C VT-TASK-011 DEFERRED) |
| Spec SoT | [`02-spec.md`](./02-spec.md) |
| Upstream | `durable-bls-workflow` (**DONE**, TASK-012) + `manage-applicants-appointment-form` (Ready → BOOK handoff) |
| Mirror | `specs/features/bls-booking-visa-type/` may be **absent**; prefer this folder |
| Discovery | [`00-discovery.md`](./00-discovery.md) |

## Purpose

Continue the durable BLS booking path **after** Manage Applicants reaches **Ready To Book Appointment**:

1. **Email data-protection consent** (mandatory gate) using retained Mail.tm / TemporaryEmailProvider.
2. Open **Book New Appointment** / Visa Type Selection (reuse booking helpers; never doorstep).
3. Fill Visa Type Selection (Location, Visa Type, Sub Type, Appointment For, Members, Category).
4. **Click VisaType Submit** (`#btnSubmit` / `OnSubmitVisaType`) — **revises** TASK-012 / CON-006 safe-stop **only** for Submit (+ captcha / slots).
5. Always probe **captcha**; reuse existing BLS captcha pipeline.
6. Classify **slots unavailable** (`Appointment slots are not available` + Try Again) as a first-class branch.
7. **Still forbid** Premium Lounge Accept / payment confirmation.

## Document map

| Doc | Role |
|-----|------|
| [`00-discovery.md`](./00-discovery.md) | Explorer evidence |
| [`01-target-architecture.md`](./01-target-architecture.md) | Boundaries + state machine ownership |
| [`02-database.md`](./02-database.md) | Checkpoint / status persistence (**human migration gate** if additive) |
| [`03-api-and-integrations.md`](./03-api-and-integrations.md) | Mail, captcha, booking client, staff UI impact |
| [`02-spec.md`](./02-spec.md) | REQ/NFR/CON/DEC/OQ/AC |
| [`04-plan.md`](./04-plan.md) | DAG + human approval log |
| [`05-tasks.md`](./05-tasks.md) | Task index |
| [`tasks/`](./tasks/) | Atomic implementer prompts (VT-TASK-001…012) |

## Phases

| Phase | Focus |
|-------|-------|
| **A** | Email consent gate + BOOK continue pipeline shell (Attention, extended selectors, fill) |
| **B** | VisaType Submit + captcha probe + slots-unavailable branch + classifier/terminal policy |
| **C** | Optional SPA / staff UX for mid-booking stuck points |

## Key materials

- `site_materials/email_data_protection/mail.html` (+ `image.png`)
- `site_materials/visa_type/visa_type_agent_brief.md`
- `site_materials/visa_type/visa_type_flow.md`
- HTML: `book_new_appointment.html`, `book-appoinntment-captcha.html`, `slots-not-available.html`
- Screenshots: `1.png`…`5.jpg`
- Stuck: `site_materials/possible_site_issues/stuck_state_db_contract.md`, `visa_type_booking_issues.md`

## Policy callout (Must)

| Action | Policy |
|--------|--------|
| Email green consent CTA | **Automate** |
| Email red disagree CTA | **Forbidden** |
| VisaType `#btnSubmit` / `OnSubmitVisaType` | **In scope** (this feature; supersedes TASK-012 stop for Submit only) |
| Captcha solve/verify on booking surface | **In scope** |
| Slots unavailable + Try Again | **In scope** (SAFE_TO_REPEAT + backoff; OQ on staff timing) |
| Premium Lounge Accept / payment | **Still forbidden** |
| Calendar / post-slots success screens | **Out of scope** until materials |

## Review

- Plan review (2026-11-14): **APPROVE_WITH_ISSUES** → planner fixes applied (NFR-001 map, DEC id collision, captcha script paths, Option B rollback, Option A default).
- DEC/OQ stamped 2026-11-14 (`product owner continue`); Phase 7 A/B complete.

## Next action

1. Phase A/B complete (**VT-TASK-001…010**, **012** DONE; **011** DEFERRED). Feature is **READY_FOR_REVIEW**.
2. Optional Phase C: **VT-TASK-011** SPA mid-booking summary when product unblocks.
3. Do **not** casually reopen closed `durable-bls-workflow` review — DEC-001 supersedes TASK-012 Submit stop only.
4. Known out-of-scope: `apps/api` build fails on analytics/auth/clients DTO contract drift (see VT-TASK-012 results).
