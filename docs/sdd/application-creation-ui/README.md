# SDD — Application creation UI

| Field | Value |
|-------|-------|
| Feature id | `application-creation-ui` |
| Status | **DONE** (ACU-TASK-001…005 complete; arch+code OKAY) |
| Spec SoT | [`02-spec.md`](./02-spec.md) |
| Discovery | [`00-discovery.md`](./00-discovery.md) |
| Plan | [`04-plan.md`](./04-plan.md) |
| Tasks | [`05-tasks.md`](./05-tasks.md) |
| Branch under study | `feature/second-frontend` |
| Document home | **`docs/sdd/application-creation-ui/`** |
| Upstream / closest closed | [`specs/roles-and-applications/`](../../../specs/roles-and-applications/), [`specs/roles-and-applications-frontend/`](../../../specs/roles-and-applications-frontend/) (**CLOSED**) |
| Related | [`../portal-form-data-collection/`](../portal-form-data-collection/) (OQ-FE-001 soft-disable kept via DEC-ACU-008) |
| Updated | 2026-11-18 |

## Purpose

Deliver **hybrid** application creation UX in `apps/web`: agents keep **client-first** Path A (`POST /clients`); admin/superadmin get a dedicated **app-first** create UI via Path B (`POST /apps` upsert). Align FE with SoT API/contracts without expanding Path A ACL.

## Document map

| Doc | Role |
|-----|------|
| [`00-discovery.md`](./00-discovery.md) | Phase 0 evidence, ACL comparison, stamped DEC-ACU-*, resolved OQs |
| [`02-spec.md`](./02-spec.md) | REQ / NFR / CON / AC — **PENDING_HUMAN_APPROVAL** |
| [`04-plan.md`](./04-plan.md) | Execution plan — **PENDING_HUMAN_APPROVAL** |
| [`05-tasks.md`](./05-tasks.md) | ACU-TASK-001…005 — **PENDING_HUMAN_APPROVAL** |

## Decision summary (stamped 2026-11-18)

| ID | Decision | Lock |
|----|----------|------|
| **DEC-ACU-001** | Hybrid by role: agents Path A; staff Path B + partial FE5 reopen (`/admin/apps/new` only) | PROPOSED_DEFAULT |
| **DEC-ACU-002** | Human: agent + admin + superadmin capable of creating applications | **HUMAN_LOCKED** |
| **DEC-ACU-003** | Role-split client-first (agents) / app-first (staff); **no** `POST /clients` ACL expand | PROPOSED_DEFAULT |
| **DEC-ACU-004** | SPA create UX stays 1:1; no “add another app” in v1; API 1:N out of SPA create scope | PROPOSED_DEFAULT |
| **DEC-ACU-005** | Create always **draft**; no staff-chosen initial status in v1 | PROPOSED_DEFAULT |
| **DEC-ACU-006** | Show one-time credentials when upsert returns `issuedClientAccess` | PROPOSED_DEFAULT |
| **DEC-ACU-007** | Covered by DEC-ACU-001 (staff `/admin/apps/new` only) | PROPOSED_DEFAULT |
| **DEC-ACU-008** | Keep portal-form soft-disable; post-create navigate to detail (staff) or client-detail (agent) | PROPOSED_DEFAULT |

**Backend ACL change required?** **No** for stamped hybrid (staff Path B). **Yes** only if product later insists admins create via `POST /clients`.

ACL re-verified 2026-11-18 on `feature/second-frontend`: Path A `@Roles(AGENT_ROLE)` only; Path B upsert JWT with no `@Roles`.

## Next action

Implementation complete on `feature/second-frontend`. Superadmin Path B: `/admin/apps/new` via empty-state CTA **Create application** or direct URL. No further SDD tasks unless product opens a follow-up (non-empty list CTA, ACL expand, etc.).
