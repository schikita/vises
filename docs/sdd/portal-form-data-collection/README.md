# SDD — Portal form data collection

| Field | Value |
|-------|-------|
| Feature id | `portal-form-data-collection` |
| Status | **DONE** (implementation complete 2026-11-15; DEC-PF-011 approved) |
| Spec SoT | [`02-spec.md`](./02-spec.md) |
| Upstream | `docs/sdd/applicant-portal-form-fields/` (APF — FE deferred by **DEC-004**; this feature is that FE) |
| Mirror pointer | [`specs/portal-form-data-collection/spec.md`](../../../specs/portal-form-data-collection/spec.md) |
| Discovery | [`00-discovery.md`](./00-discovery.md) |
| Explorer | `dc731253-0312-41ef-90b2-ed91ea2aca19` |

## Purpose

Give **staff/agents** one page in `apps/web` to enter **all** CRM data needed for workflow-worker to fill BLS portal forms (full Edit Member coverage + booking Location / Visa Type / Sub Type / Category), with UI that mirrors `site_materials` including site-like inviting and other conditionals.

**v1 is staff/agent only.** Client self-serve is deferred. Persistence uses Client portal-form / passport + apps upsert — not `applicants[]` jsonb.

## Document map

| Doc | Role |
|-----|------|
| [`00-discovery.md`](./00-discovery.md) | Explorer inventory + gap matrix |
| [`02-spec.md`](./02-spec.md) | **APPROVED** REQ/NFR/CON/DEC/AC SoT |
| [`02-spec.DRAFT.md`](./02-spec.DRAFT.md) | Superseded draft (historical) |
| [`04-plan.md`](./04-plan.md) | Implementation plan (when present) |
| [`05-tasks.md`](./05-tasks.md) | Task index (when present) |

## Key approvals (2026-11-15)

- **DEC-PF-001…010** approved (006/007 as amended: site-like inviting + first-class conditionals).
- **OQ-PF-001…007** resolved (portal-form journey/phone extension in scope; dual Travel/Arrival → `travelDate`; staff-only; Save all; FE validation Done bar).

## Next action

Implement against [`02-spec.md`](./02-spec.md). Prefer plan/tasks under this folder when they exist; do not treat the draft as SoT.
