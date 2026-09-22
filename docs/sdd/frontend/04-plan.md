# Phase 4 — Implementation plan

| Field | Value |
|-------|-------|
| Feature id | `bls-workflow-frontend` |
| Status | **PLANNED** |
| Date | 2026-09-22 |
| Spec SoT | `specs/features/bls-workflow-frontend/02-spec.md` |
| Tasks | [`05-tasks.md`](./05-tasks.md) + [`tasks/`](./tasks/) |

---

## 1. Strategy

Vertical slices on the **existing** TASK-015 panel:

1. **Foundation** — events entity + current-task/applicant utils + scoped snapshot DTO (`id`, `maxAttempts`).
2. **Realtime** — dual poll loop (DEC-001) without WS.
3. **Visualization** — step rail + task detail + events feed + CON-006 banner.
4. **Integration** — dual-mode copy, optional run deep-link, a11y.
5. **Gate** — `web` lint + build; backend build for DTO task.

Prefer small PRs / task commits over a single mega-diff. Preserve silent poll and eligibility behavior unless a task explicitly changes it.

---

## 2. DAG (execution order)

```
FE-TASK-001 ──┐
FE-TASK-002 ──┼──► FE-TASK-004 ──► FE-TASK-005 ──┐
FE-TASK-003 ──┘         │                       ├──► FE-TASK-008 ──► FE-TASK-009 ──► FE-TASK-010
                        ├──► FE-TASK-006 ───────┤
                        └──► FE-TASK-007 ───────┘
```

| Order | ID | Title | Depends on |
|------|-----|-------|------------|
| 1 | FE-TASK-001 | Events entity layer | — |
| 2 | FE-TASK-002 | Current-task + applicant utils | — (parallel with 001) |
| 3 | FE-TASK-003 | Snapshot DTO `id` / `maxAttempts` | — (parallel; backend+SPA types) |
| 4 | FE-TASK-004 | Dual poll loop in panel | 001 |
| 5 | FE-TASK-005 | Step visualization | 004 (or soft: after types) |
| 6 | FE-TASK-006 | Task list + targeted retry | 002, 003, 004 |
| 7 | FE-TASK-007 | Events timeline + run link hint | 001, 004 |
| 8 | FE-TASK-008 | CON-006 banner + dual-mode copy | 005 (soft), page wiring |
| 9 | FE-TASK-009 | a11y + empty/error polish | 004, 008 |
| 10 | FE-TASK-010 | Lint/build verification sweep | all prior |

**First batch:** FE-TASK-001, FE-TASK-002, FE-TASK-003 in parallel.

---

## 3. Rollout / compatibility

- Additive backend fields only (DEC-003) — old SPA ignoring `id` remains safe during partial deploy.
- Dual-mode Autofill unchanged in capability (DEC-002).
- Poll interval unchanged (3s).
- Terminal semantics unchanged (`AWAITING_STAFF_BOOKING` = success terminal).
- No feature flag required (**Assumption:** staff-only surface; safe to ship when lint/build green).

---

## 4. Validation

| Scope | Commands |
|-------|----------|
| Frontend (every FE task touching `web/`) | `cd web && npm run lint` ; `cd web && npm run build` |
| Backend (FE-TASK-003) | `cd backend && npm run build` |
| Optional stack | `docker compose up` + manual staff click-through — **not** a Must gate for this FE feature (NFR-002) |

**Do not invent:** backend `npm test` as FE gate; Playwright e2e unless separately requested.

Manual smoke (implementer / verifier):

- Start workflow → see steps advance via poll
- Events feed grows
- Multi-applicant labels
- Targeted retry when ids present
- Reach `AWAITING_STAFF_BOOKING` (or mock snapshot in Story-less env via API) → handoff banner; poll stopped
- Legacy RegisterUser still visible

---

## 5. Non-goals (implementation approach)

- WebSocket / SSE / socket.io
- Replacing Automатическое RegisterUser evidence widget
- Automating booking past CON-006
- Client-role access
- Rewriting CRM shell / FSD wholesale
- Re-opening durable-bls-workflow DONE history except ISSUE-003 closure via SPA events use
- Giant redesign of Tailwind tokens

---

## 6. Open / deferred

| Item | Disposition |
|------|-------------|
| OQ-001–006 | **Resolved** via DEC-001…006 in [`01-target-ux.md`](./01-target-ux.md) |
| Live portal E2E | Upstream ISSUE-001 — **out of scope** |
| Compose table proof | Upstream ISSUE-002 — **out of scope** |

**Blockers for IMPLEMENTING:** None architectural. Implementer needs staff JWT env and running API for manual smoke (**Assumption**).

---

## 7. Phase gate

Status: **PLANNED**. Tasks decomposed → **READY_FOR_IMPLEMENTATION** when [`05-tasks.md`](./05-tasks.md) + atomic prompts exist. Product code **not** started.
