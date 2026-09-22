# SDD — BLS workflow frontend

| Field | Value |
|-------|-------|
| Feature id | `bls-workflow-frontend` |
| Document home | **`docs/sdd/frontend/`** (authoritative) |
| Specs mirror | `specs/features/bls-workflow-frontend/` |
| REQ/NFR/CON SoT | `specs/features/bls-workflow-frontend/02-spec.md` |
| Upstream | `durable-bls-workflow` (**DONE**, ISSUE-003 residual) |
| Status | **READY_FOR_IMPLEMENTATION** |
| Updated | 2026-09-22 |
| Product code | **Not started** (IMPLEMENTING not begun) |

## Purpose

Enhance the staff SPA durable BLS workflow experience on application-detail **«Автозаполнение»**, building on TASK-015 baseline poll UI: clearer REGISTER→BOOK step visualization, per-task observability, events-poll timeline (close ISSUE-003), multi-applicant clarity, CON-006 handoff, and dual-mode primacy — **without** inventing WebSocket/SSE.

## Realtime decision (summary)

| DEC | Decision |
|-----|----------|
| **DEC-001** | **Snapshot poll + events poll** (~3s). **No** WebSocket / SSE / EventSource / socket.io. |

**Rationale (Facts):** repo has no WS/SSE client or Nest gateway deps; events GET already ships (TASK-013); TASK-015 already polls snapshot; upstream DEC-006 / CON-003 preferred HTTP poll. Events poll closes ISSUE-003 at lowest cost.

## Key UX decisions

| Topic | DEC | Choice |
|-------|-----|--------|
| Автозаполнение | **DEC-002** | **Extend dual-mode** — workflow primary, legacy RegisterUser secondary (REQ-014 / CON-008) |
| Targeted retry | **DEC-003** | Small backend snapshot DTO: expose `tasks[].id` (+ `maxAttempts`); SPA targeted retry Should |
| Applicant labels | **DEC-004** | Show `applicantId` Must; resolve name from `form.applicants` when props available |
| CON-006 copy | **DEC-005** | Distinct success handoff banner (RU) — manual booking finish |
| Events UX | **DEC-006** | Compact chronological feed + optional expand; API `limit` paging |

## Document map

| Doc | Role | Status |
|-----|------|--------|
| [`00-request.md`](./00-request.md) | Request / lifecycle | READY_FOR_IMPLEMENTATION |
| [`00-discovery.md`](./00-discovery.md) | Phase 0 discovery | Complete |
| [`01-target-ux.md`](./01-target-ux.md) | Phase 1 Target UX / FE architecture | DESIGNED |
| [`02-api-contract-mapping.md`](./02-api-contract-mapping.md) | Phase 2 API → hooks / poll / cache | DESIGNED |
| [`03-fsd-component-design.md`](./03-fsd-component-design.md) | Phase 3 FSD file layout | DESIGNED |
| [`04-plan.md`](./04-plan.md) | Implementation strategy + DAG | PLANNED |
| [`05-tasks.md`](./05-tasks.md) | FE task index | READY_FOR_IMPLEMENTATION |
| [`tasks/`](./tasks/) | Atomic `FE-TASK-###` prompts | TODO |
| [`HANDOFF.md`](./HANDOFF.md) | Pack for next `/sdd-orchestrator` | Ready |

## Task list (execution order)

1. **FE-TASK-001** — Events entity layer (types, fetch, labels, payloadSafe allowlist)
2. **FE-TASK-002** — Current-task resolution + applicant label utils
3. **FE-TASK-003** — Snapshot DTO: `tasks[].id` + `maxAttempts` (backend scoped) + SPA types
4. **FE-TASK-004** — Dual poll loop (snapshot + events) in panel container
5. **FE-TASK-005** — Step visualization (REGISTER→BOOK)
6. **FE-TASK-006** — Task list/detail + targeted retry
7. **FE-TASK-007** — Events compact timeline + `AUTOFILL_RUN_LINKED` hint
8. **FE-TASK-008** — CON-006 handoff banner + dual-mode tab primacy copy
9. **FE-TASK-009** — a11y live region + empty/error polish
10. **FE-TASK-010** — Web lint + build verification sweep

**First implementer batch:** FE-TASK-001, FE-TASK-002, FE-TASK-003 (parallel after reading HANDOFF).

**Total:** 10 `FE-TASK-###`.

## Validation (FE)

```bash
cd web && npm run lint
cd web && npm run build
```

Backend DTO task (FE-TASK-003): also `cd backend && npm run build`.

## Hard constraints (carry forward)

- No secrets in UI (`lockOwner`, vault, Mail.tm tokens, portal passwords, DEK).
- Roles: JWT **admin \| manager** only.
- CON-006: never claim booking fully automated.
- Reuse existing HTTP contracts; no WS/SSE (DEC-001 / CON-002).
- Russian staff copy (NFR-001).
- Do **not** re-discover unless Facts contradict docs.

## Specs mirror

`specs/features/bls-workflow-frontend/` — `03-design.md` / `04-plan.md` / `05-tasks.md` point here; `02-spec.md` remains identifier SoT.
