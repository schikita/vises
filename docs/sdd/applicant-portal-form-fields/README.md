# SDD — Applicant portal form fields

| Field | Value |
|-------|-------|
| Feature id | `applicant-portal-form-fields` |
| Status | **DONE** (APF-TASK-001…005 implemented; arch OKAY + code OKAY; FE UI out of scope) |
| Spec SoT | [`02-spec.md`](./02-spec.md) |
| Upstream | `manage-applicants-appointment-form` (Edit Member fill) + `bls-booking-visa-type` (Visa Type Selection prefill) |
| Mirror | `specs/features/applicant-portal-form-fields/` may be **absent**; prefer this folder |
| Discovery | [`00-discovery.md`](./00-discovery.md) |
| Plan | [`04-plan.md`](./04-plan.md) |
| Explorer | `6645dba5` |

## Purpose

Persist every CRM field required so workflow-worker can autofill:

1. **Visa Type Selection** booking (`site_materials/visa_type/`)
2. **Manage Applicants → Edit Member** (`site_materials/manage_applicants_appointments/`)

for the happy path **adult + inviting=company**, without `UNSKIPPABLE_GAP` for portal-required `*` fields that today have typed CRM keys but no Client/Application columns.

**Frontend collection UI is OUT OF SCOPE** this cycle — contracts / API / DB / worker only (DEC-004).

## Document map

| Doc | Role |
|-----|------|
| [`00-discovery.md`](./00-discovery.md) | Explorer inventory + gap matrix |
| [`02-spec.md`](./02-spec.md) | REQ/NFR/CON/DEC/ASSUME/AC |
| [`02-database.md`](./02-database.md) | Additive `clients` + `applications` columns |
| [`04-plan.md`](./04-plan.md) | DAG + human approval log |
| [`05-tasks.md`](./05-tasks.md) | Task index |
| [`tasks/`](./tasks/) | Atomic implementer prompts (APF-TASK-001…005) |

## Phases

| Phase | Focus |
|-------|-------|
| **A** | Contracts + schema + API persist/read |
| **B** | Worker map + booking prefill + status pass-through |
| **C** | BLS start completeness gate for new happy-path keys |

## Next action

1. APF-TASK-001 (`packages/contracts`)  
2. APF-TASK-002 (entities + migration + bootstrap)  
3. APF-TASK-003 (Nest DTO/services)  
4. APF-TASK-004 (workflow-worker wiring)  
5. APF-TASK-005 (completeness gate)
