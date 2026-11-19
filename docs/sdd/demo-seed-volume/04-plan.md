# Phase 4 — Execution plan

| Field | Value |
|-------|-------|
| Feature id | `demo-seed-volume` |
| Status | **READY_FOR_IMPLEMENTATION** |
| Date | 2026-11-17 |
| Spec | [`02-spec.md`](./02-spec.md) (**APPROVED**) |
| Discovery | [`00-discovery.md`](./00-discovery.md) (explorer `54880534-98f9-4d04-8e86-0b2a2090c7c3`) |
| Tasks | [`05-tasks.md`](./05-tasks.md) |
| Branch | `feature/first-frontend` |
| Volume source | `feature/second-frontend` tip (port knobs/machinery; adapt BUSINESS statuses) |

**Human decisions recorded:** DEC-DSV-001…005 approved 2026-11-17. Planning proceeds with context gate **pass**.

---

## 1. Goal & measurable acceptance

Replace mini FR-11 Agent A/B seed (2 agents / 13 clients) with deterministic **20 agents**, each with **[2, 50] clients**, ordinal identities `agent-01`…`agent-20`, BUSINESS six-status pool + matrix-valid history. Match AC-001…010 in the spec. No migration. Invocation unchanged.

---

## 2. Strategy

1. **Port volume machinery** from second-frontend tip (`demo-seed-volume.constants.ts` knobs, `SeedAgentPlan`, `formatSeedAgentOrdinal`, `buildSeedAgentPlans` + specs).
2. **Adapt BUSINESS** — status pool = `@vises/contracts` `APPLICATION_STATUSES` (six); history chains per **REQ-005**; agent-app heuristics use BUSINESS finals (not FR-7).
3. **Rewire builders/service** — `buildSeedUsers`, `buildFr11SeedDataset`, `buildFr11AgentApps`, ledger, `SeedService` iterate plans; remove `SEED_AGENT_A_*` / `SEED_AGENT_B_*` composition.
4. **Verify** unit plans/history/dataset; lint; optional non-prod reset-demo for AC-006.

Prefer structural port over greenfield. Settings module stays untouched.

---

## 3. DAG

```
DSV-TASK-001 (volume constants + plan util + types)
   └─► DSV-TASK-002 (BUSINESS adapt + users/dataset/service rewire + specs)
```

| Order | ID | Title | Depends | Parallel? |
|------|-----|-------|---------|-----------|
| 1 | DSV-TASK-001 | Volume constants, plan types/utils, plan unit tests | — | No |
| 2 | DSV-TASK-002 | BUSINESS pool/history + dataset/users/service consume plans | DSV-TASK-001 | No |

**Cross-feature:** May run in parallel with `date-range-picker` tasks (disjoint packages: `apps/api` vs `apps/web`).

---

## 4. Affected packages

| Package | Touch |
|---------|-------|
| `apps/api` `modules/seed/**` | Constants, types, utils, service, specs |
| `apps/api` `modules/settings/**` | **None** (already calls `SeedService.resetDemo`) |
| `packages/contracts` | **Consume only** (`APPLICATION_STATUSES` / matrix) — no DTO change |
| `apps/web` | **None** |

### Layer boundaries

- Nest module: `apps/api/src/modules/seed/`
- Pure builders in `utils/`; knobs in `constants/`; plans type in `types/`
- No `src/shared` ↔ `modules/*` cross-import violations
- No new public HTTP surface

---

## 5. Sensitive paths

| Path | Policy |
|------|--------|
| Migrations | **None** — DEC-DSV-005; do not add migration files |
| `POST /api/settings/reset-demo` | Do not change auth / prod gate |
| PII seed fields | Keep `PiiCryptoService.encryptFields` before Client persist |
| Demo passwords / invite tokens | Do not log plaintext; keep seed constants |
| Application status / history | BUSINESS six + matrix-valid only |

---

## 6. Validation commands

| Scope | Command |
|-------|---------|
| Lint (convention gate) | `pnpm --filter @vises/api run lint` |
| Seed unit tests | `pnpm --filter @vises/api exec jest --testPathPattern=modules/seed --runInBand` |
| Build (optional) | `pnpm --filter @vises/api run build` |
| Manual AC-006 | Non-prod empty DB boot **or** `POST /api/settings/reset-demo` → assert 20 agents |

Note: `apps/api` `lint` may be a stub — still required as the convention gate in every task.

---

## 7. Human approval log

| Item | Decision | Date |
|------|----------|------|
| DEC-DSV-001 volume [20]/[2,50] | **APPROVED** — no fixed ~100 | 2026-11-17 |
| DEC-DSV-002 ordinal identities | **APPROVED** — no agent-a/b | 2026-11-17 |
| DEC-DSV-003 BUSINESS statuses | **APPROVED** | 2026-11-17 |
| DEC-DSV-004 invocation | **APPROVED** | 2026-11-17 |
| DEC-DSV-005 no migration | **APPROVED** | 2026-11-17 |

---

## 8. Risks

| Risk | Mitigation |
|------|------------|
| Naïve copy of FR-7 history from second tip | Follow **REQ-005** only; extend first-frontend history util |
| Existing demos keep mini seed until reset | Document AC-006; seed-if-empty skips non-empty DBs |
| Worst-case ~1000 clients | Use existing single seed transaction path; no new job |

---

## 9. Decisions needed from human

**None** for implementation. Residual operator action: run non-prod reset-demo after deploy if DB already seeded.
