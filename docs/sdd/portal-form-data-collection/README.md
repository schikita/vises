# SDD — Portal form data collection (frontend)

| Field | Value |
|-------|-------|
| Feature id | `portal-form-data-collection` |
| Status | **DONE** (spec APPROVED; PFDC-TASK-001…007 implemented + reviewed 2026-11-15) |
| Spec SoT | [`02-spec.md`](./02-spec.md) |
| Upstream | `applicant-portal-form-fields` (**DONE**; DEC-004 FE deferred — this feature implements it) |
| Contracts | `@vises/contracts` `ClientPortalForm*` + `Application` / upsert `visaSubType` |
| Materials | `site_materials/manage_applicants_appointments/manage_applicant(form).html` (primary), images 1–12, `select_lolcation_and_visa_type.html`, `visa_type/book_new_appointment.html`, agent briefs/flows |
| Mirror | [`specs/portal-form-data-collection/spec.md`](../../../specs/portal-form-data-collection/spec.md) → points here |
| Updated | 2026-11-15 |

## Purpose

One staff page in `apps/web` to enter **all** applicant CRM data needed to fill BLS portal forms (**Edit Member** + booking visa-type fields), with UI that visually/structurally matches the portal Edit Member form from `site_materials`.

Backend persistence, worker wiring, and completeness gate already shipped under [`../applicant-portal-form-fields/`](../applicant-portal-form-fields/).

## Document map

| Doc | Role |
|-----|------|
| [`02-spec.md`](./02-spec.md) | REQ-FE / NFR / CON / DEC-FE / AC / inventory matrix |
| [`00-discovery.md`](./00-discovery.md) | Phase 0 evidence |
| [`04-plan.md`](./04-plan.md) | Execution plan / DAG |
| [`05-tasks.md`](./05-tasks.md) | PFDC-TASK-001…007 |

## Decisions (stamped 2026-11-15)

| ID | Decision |
|----|----------|
| **DEC-FE-001** | One dedicated page route under clients for full portal data entry |
| **DEC-FE-002** | Collect ALL fields including optional + conditionals; completeness still only requires happy-path keys |
| **DEC-FE-003** | Match Edit Member layout from `site_materials` as primary visual SoT |
| **DEC-FE-004** | No backend contract changes unless a clear FE typing gap (prefer consuming `@vises/contracts`) |
| **DEC-FE-005** | Persist journey CRM fields onto Client (existing portal-form / client paths); do **not** rely on `apps.applicants` in-memory |
| **DEC-FE-006** | Appointment For / members count remains derived (APF ASSUME-003) |
| **DEC-FE-007** | Auth register/login analysis only; not part of this page |

## Delivered

- Page: `/app|admin/clients/:clientId/portal-form` (`ClientPortalFormPage`)
- Feature: `apps/web/src/features/client-portal-form-edit`
- DEC-FE-008: journey/phone on portal-form contracts + Nest

## Residual gaps (non-blocking)

- OQ-FE-003: HTML conditionals keys not in contracts bag (not inventable)
- OQ-FE-002: destination/travel dates remain on application-detail
- Dual passport UI: client-detail passport editor kept alongside this page
