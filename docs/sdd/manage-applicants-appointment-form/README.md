# SDD — Manage Applicants appointment form

| Field | Value |
|-------|-------|
| Feature id | `manage-applicants-appointment-form` |
| Status | **VERIFYING** (Phase A+B tasks DONE; MA-TASK-010 SPA deferred; live E2E pending) |
| Spec SoT | [`02-spec.md`](./02-spec.md) |
| Upstream | `durable-bls-workflow` (**DONE**) — extend STATUS_VALIDATE; do not reopen review |
| Mirror | `specs/features/manage-applicants-appointment-form/` may be **absent**; prefer this folder |
| Discovery | [`00-discovery.md`](./00-discovery.md) |
| Plan | [`04-plan.md`](./04-plan.md) |

## Purpose

Follow-on to TASK-011 minimal edit fill: full Manage Applicants → Edit Member form automation (visa modal, iframe, Attention, required fields, checkpoint resume) → Ready To Book → existing BOOK safe-stop (TASK-012 / **upstream CON-006** = this-spec **CON-004**; this-spec **CON-006** = Book only when Ready).

**Add Family Member:** conditional Must when pre-start family members exist (OQ-005); else never click Add.

## Document map

| Doc | Role |
|-----|------|
| [`00-discovery.md`](./00-discovery.md) | Explorer evidence |
| [`01-target-architecture.md`](./01-target-architecture.md) | Boundaries + state machine ownership |
| [`02-database.md`](./02-database.md) | Checkpoint schema (**OQ-001 approved**) |
| [`03-api-and-integrations.md`](./03-api-and-integrations.md) | API + portal integrations |
| [`02-spec.md`](./02-spec.md) | REQ/NFR/CON/DEC/OQ/AC |
| [`04-plan.md`](./04-plan.md) | DAG + human approval log §7 |
| [`05-tasks.md`](./05-tasks.md) | Task index |
| [`tasks/`](./tasks/) | Atomic implementer prompts (MA-TASK-001…011) |

## Phases

| Phase | Focus |
|-------|-------|
| **A** | Primary Edit path + portalStatus / fieldProgress + BOOK handoff |
| **B** | Add New Member when pre-start family members exist |
| **C** | SPA checkpoint exposure — **deferred** (OQ-004) |

## Next action

1. ~~Phase A+B~~ — MA-TASK-001…009 + 011 **DONE** (2026-11-14)  
2. MA-TASK-010 remains **DEFERRED** (SPA / OQ-004)  
3. **VERIFYING:** live portal E2E (login → Manage Applicants → Edit/Add → Ready → BOOK safe-stop)  
4. Residual: multi-applicant CRM (Add path dormant under 1:1 Client↔applicant); unrelated `apps/api` TS build debt  



