# 00 — Request

| Field | Value |
|-------|-------|
| Feature id | `bls-workflow-frontend` |
| Status | **READY_FOR_IMPLEMENTATION** |
| Date | 2026-09-22 |
| Primary docs | `docs/sdd/frontend/` (authoritative for this initiative) |
| Specs mirror | `specs/features/bls-workflow-frontend/` |
| Spec SoT (REQ/NFR/CON) | `specs/features/bls-workflow-frontend/02-spec.md` |
| Discovery (Phase 0) | [`00-discovery.md`](./00-discovery.md) |
| Design / plan / tasks | [`01-target-ux.md`](./01-target-ux.md) … [`05-tasks.md`](./05-tasks.md) + [`tasks/`](./tasks/) |
| Handoff | [`HANDOFF.md`](./HANDOFF.md) |
| Upstream | `durable-bls-workflow` (**DONE**, `APPROVE_WITH_ISSUES`) |
| Product implementation | **Not started** |

## Raw request

Analyze the current frontend and all backend durable BLS workflow changes, then **design and prepare documentation for frontend updates**. Do **not** implement product/UI code in the architect phase.

Deliver an enhanced frontend workflow package that another `/sdd-orchestrator` (or implementer) can pick up later.

## Intent

Staff-facing SPA enhancements for durable BLS workflow visualization, controls, and timely updates — building on **TASK-015** baseline poll UI — through **READY_FOR_IMPLEMENTATION**.

## Known residuals (upstream)

- **ISSUE-003:** SPA polls snapshot GET only; events endpoint unused — **addressed by design DEC-001 / REQ-007** (events poll in FE-TASK-001/004/007).
- Prior **DEC-006** (upstream) preferred poll ~3s — **reconfirmed** for this feature as DEC-001 (snapshot + events; no WS).

## Out of scope (docs cycle — complete)

- Product/UI implementation under `backend/` or `web/` until IMPLEMENTING
- Backend greenfield redesign
- Inventing WebSocket/SSE

## Phase gate

| Artifact | Status |
|----------|--------|
| `00-request.md` | **READY_FOR_IMPLEMENTATION** |
| `00-discovery.md` | **Complete** |
| Spec `02-spec.md` | **SPECIFIED** (SoT) |
| `01`–`03` design docs | **DESIGNED** |
| `04-plan.md` | **PLANNED** |
| `05-tasks.md` + `tasks/FE-TASK-*` | **READY_FOR_IMPLEMENTATION** |
| `HANDOFF.md` | Ready for orchestrator |
| IMPLEMENTING | **Not started** |
