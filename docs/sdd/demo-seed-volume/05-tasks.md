# Tasks index — demo-seed-volume

| Field | Value |
|-------|-------|
| Feature id | `demo-seed-volume` |
| Status | **DONE** (arch OKAY + code OKAY; manual AC-006 optional) |
| Date | 2026-11-17 |
| Spec SoT | [`02-spec.md`](./02-spec.md) |
| Plan | [`04-plan.md`](./04-plan.md) |

## Execution order

| ID | Title | Owner | Depends | Status | Arch | Code |
|----|-------|-------|---------|--------|------|------|
| DSV-TASK-001 | Volume constants + agent plans | backend | — | **DONE** | OKAY | OKAY |
| DSV-TASK-002 | BUSINESS adapt + dataset/service rewire | backend | DSV-TASK-001 | **DONE** | OKAY | OKAY |

Preferred serial: **001 → 002**. Parallel with `date-range-picker` frontend tasks only.

## Hard constraints (all tasks)

- One concern per file (`.cursor/rules/file-separation.mdc`)
- Nest seed module structure (`.cursor/rules/nestjs-structure.mdc`)
- TypeScript: no `enum`; explicit return types (`.cursor/rules/typescript-conventions.mdc`)
- No migrations; no settings auth changes; no FR-7 status literals
- Do not invent fixed total client count

---

## DSV-TASK-001 — Volume constants + agent plans

| Field | Value |
|-------|-------|
| **id** | `DSV-TASK-001` |
| **title** | Port volume knobs, `SeedAgentPlan`, ordinal formatter, `buildSeedAgentPlans` + unit tests |
| **owner_layer** | `apps/api` → `src/modules/seed/` (constants, types, utils) |
| **depends_on** | none |
| **sensitive_paths** | none (data constants/utils only; no migration, no auth) |

### Acceptance criteria

- [ ] `demo-seed-volume.constants.ts` exports `SEED_AGENT_COUNT=20`, `SEED_CLIENTS_PER_AGENT_MIN=2`, `SEED_CLIENTS_PER_AGENT_MAX=50`, `SEED_EXTRA_BALANCE_SLOTS_MAX=5`, retains `SEED_RNG_SEED=20_250_920` (**AC-001**)
- [ ] `types/seed-agent-plan.types.ts` (or equivalent) defines `SeedAgentPlan`
- [ ] `format-seed-agent-ordinal.util.ts` + `build-seed-agent-plans.util.ts` ported from second-frontend structure
- [ ] Plans use BUSINESS `APPLICATION_STATUSES` for status draws (not FR-7 five-value) — pool import ready for dataset task
- [ ] Unit tests: length 20; bounds; determinism; `u-agent-01`…`20` / `agent-01@vises.app`… (**AC-002**, **AC-003**, **AC-004**)
- [ ] Agent identity prefixes in `demo-users.constants.ts` match second-frontend (`SEED_AGENT_ID_PREFIX`, etc.); remove hard-coded `SEED_AGENT_A_*` / `SEED_AGENT_B_*` user constants if they block prefix scheme (full dataset rewire may finish in 002)
- [ ] File separation / no `enum`

### Verification commands

```bash
pnpm --filter @vises/api run lint
pnpm --filter @vises/api exec jest --testPathPattern=build-seed-agent-plans --runInBand
```

### Implementation notes

- Source of truth for knobs/plan shape: `git show feature/second-frontend:apps/api/src/modules/seed/...`
- Status pool constant should reference BUSINESS `APPLICATION_STATUSES` from `@vises/contracts` (DEC-DSV-003), even if composition file still has A/B arrays until 002.

---

## DSV-TASK-002 — BUSINESS adapt + dataset/service rewire

| Field | Value |
|-------|-------|
| **id** | `DSV-TASK-002` |
| **title** | Consume agent plans in users/dataset/service; BUSINESS history + heuristics; remove A/B composition |
| **owner_layer** | `apps/api` → `src/modules/seed/` (utils, constants, seed.service) |
| **depends_on** | `DSV-TASK-001` |
| **sensitive_paths** | PII encrypt path (keep); do not touch settings auth; **no migrations** |

### Acceptance criteria

- [ ] `buildSeedUsers` / `buildFr11SeedDataset` / `buildFr11AgentApps` / ledger iterate `buildSeedAgentPlans()` (1 client : 1 app per plan slot) (**REQ-006**)
- [ ] `buildStatusHistoryChain` covers all six BUSINESS finals per **REQ-005**; unit tests matrix-valid (**AC-005**)
- [ ] Agent-app heuristics: booked → visit+paymentPaid; draft/filling → docsCount 0 (**REQ-007**)
- [ ] Mini A/B composition constants removed or unused (**AC-008**)
- [ ] `SeedService` persists plan-driven dataset; completion log includes counts without PII (**AC-009**)
- [ ] No new migration files (**AC-007**)
- [ ] Dataset/users/history specs updated; no assumption of 13-client A/B (**REQ-011**)
- [ ] Empty-DB / reset-demo path still works structurally (manual AC-006 optional if env unavailable — unit coverage required)

### Verification commands

```bash
pnpm --filter @vises/api run lint
pnpm --filter @vises/api exec jest --testPathPattern=modules/seed --runInBand
```

### Implementation notes

- Do **not** port second tip FR-7 history edges (`drafting→pending`, `booked→issued`).
- Settings module: no code changes unless a type-only import break forces a fix (prefer none).
