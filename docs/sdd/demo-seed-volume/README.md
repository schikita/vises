# SDD — Demo seed volume

| Field | Value |
|-------|-------|
| Feature id | `demo-seed-volume` |
| Status | **DONE** (DSV-TASK-001…002 arch OKAY + code OKAY) |
| Spec SoT | [`02-spec.md`](./02-spec.md) |
| Plan | [`04-plan.md`](./04-plan.md) |
| Tasks | [`05-tasks.md`](./05-tasks.md) |
| Upstream | Mini FR-11 seed on `feature/first-frontend`; volume source tip `feature/second-frontend` |
| Discovery | [`00-discovery.md`](./00-discovery.md) |
| Explorer | `54880534-98f9-4d04-8e86-0b2a2090c7c3` |

## Purpose

Scale non-prod demo seed from the current mini FR-11 composition (**2 agents + 13 clients**) to the second-frontend volume model: **exactly 20 agents**, each with a deterministic client count in **[2, 50]**, while keeping first-frontend **BUSINESS** application statuses and the existing seed-if-empty / `POST /api/settings/reset-demo` invocation.

## Document map

| Doc | Role |
|-----|------|
| [`00-discovery.md`](./00-discovery.md) | Explorer inventory + gap vs second-frontend tip |
| [`02-spec.md`](./02-spec.md) | **APPROVED** REQ/NFR/CON/DEC/AC SoT |
| [`04-plan.md`](./04-plan.md) | Implementation plan |
| [`05-tasks.md`](./05-tasks.md) | Task index (DSV-TASK-001…002) |

## Key approvals (2026-11-17)

- **DEC-DSV-001…005** approved (volume constants as-is; `u-agent-01`…`20` identities; BUSINESS six-status pool/history; invocation unchanged; data-only / no migration).
- Do **not** invent a fixed ~100 total client count; per-agent bounds are normative.

## Next action

Manual AC-006 (optional): non-prod empty DB boot or `POST /api/settings/reset-demo` → assert 20 agents. Optional cleanup: rename ledger spec fixtures `u-agent-a/b` → ordinal ids.
