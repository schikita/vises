# Discovery — Demo seed volume

| Field | Value |
|-------|-------|
| Feature id | `demo-seed-volume` |
| Updated | 2026-11-17 |
| Branch under study | `feature/first-frontend` (current) |
| Volume source tip | `feature/second-frontend` |
| Explorer | `54880534-98f9-4d04-8e86-0b2a2090c7c3` |
| Confidence | high |

## Goal (user request)

Port the **second-frontend demo seed volume** (20 agents; per-agent clients in [2, 50]; generated agent identities) onto **first-frontend**, adapting status pool and history chains to the **BUSINESS** six-value `ApplicationStatus` union. Keep seed-if-empty + non-prod `reset-demo` as the only invocation paths. Data-only — no schema migration.

## Current state on `feature/first-frontend` (evidence)

### Volume / identities (mini FR-11)

- `apps/api/src/modules/seed/constants/demo-seed-volume.constants.ts` exports only `SEED_RNG_SEED = 20_250_920` (no agent/client volume knobs).
- `demo-users.constants.ts`: fixed staff set including **`u-agent-a` / `u-agent-b`**, logins `agent-a@vises.app` / `agent-b@vises.app`.
- `demo-fr11-composition.constants.ts`: fixed status arrays
  - Agent A: 8 statuses (`draft` ×2, `not_ready_for_appointment` ×2, `declined` ×1, `booked` ×3)
  - Agent B: 5 statuses (`draft`, `not_ready_for_appointment`, `booked` ×3)
  - ⇒ **2 agents + 13 clients/apps** (1:1 client↔application).
- Fixed top-up / final balance strings (`SEED_AGENT_A_TOP_UP_AMOUNT`, `SEED_AGENT_B_FINAL_BALANCE`, etc.).

### Builders / service

- `build-seed-users.util.ts` — hard-codes 1 superadmin + 2 admins + **2 agents**.
- `build-fr11-seed-dataset.util.ts` — composes Agent A then Agent B from fixed status arrays + fixed top-ups.
- `build-fr11-agent-apps.util.ts` — per-agent clients/apps/history; visit/payment when `status === 'booked'`; `docsCount = 0` when `draft`.
- `build-status-history-chain.util.ts` — **BUSINESS** chains for `draft` / `not_ready_for_appointment` / `declined` / `booked`; returns `[]` for `filling` and `ready_for_appointment` (comment: those finals are not in the mini mapped distribution).
- `seed.service.ts` — `onModuleInit` → `seedIfEmpty()` when users + settings + applications are all empty; `resetDemo()` truncates operational tables then re-seeds.
- Settings path unchanged: `POST /api/settings/reset-demo` (admin/superadmin, **forbidden in production** via `isDemoControlsEnabled`).

### Contracts (normative for statuses)

- `packages/contracts` `ApplicationStatus` / `APPLICATION_STATUSES` (six):  
  `filling` | `draft` | `not_ready_for_appointment` | `ready_for_appointment` | `booked` | `declined`.

## Tip state on `feature/second-frontend` (evidence)

### Volume constants

`demo-seed-volume.constants.ts`:

| Constant | Value |
|----------|-------|
| `SEED_RNG_SEED` | `20_250_920` |
| `SEED_AGENT_COUNT` | `20` |
| `SEED_CLIENTS_PER_AGENT_MIN` | `2` |
| `SEED_CLIENTS_PER_AGENT_MAX` | `50` |
| `SEED_EXTRA_BALANCE_SLOTS_MAX` | `5` |

### Generated agent machinery

- `build-seed-agent-plans.util.ts` — deterministic plans via Mulberry32 from `SEED_RNG_SEED`; per agent: clientCount ∈ [2,50], extraSlots ∈ [0,5], statuses drawn from pool, balanceSlots = clientCount + extraSlots.
- `format-seed-agent-ordinal.util.ts` — zero-pad 1-based index → `01`…`20`.
- `seed-agent-plan.types.ts` — `SeedAgentPlan` type (one concern).
- `build-seed-users.util.ts` — staff fixed; **20 agents** from plans; returns `agentPlans`.
- `build-fr11-seed-dataset.util.ts` — iterates `input.agentPlans` (no A/B hard-code).
- `seed.service.ts` — passes `agentPlans` into dataset builder; logs agent count.
- Spec coverage: `build-seed-agent-plans.util.spec.ts` asserts length 20, bounds, determinism, id/login shapes.

### Identity scheme (second tip)

Prefixes in `demo-users.constants.ts` (no `agent-a` / `agent-b`):

- ids: `u-agent-` + ordinal → `u-agent-01`…`u-agent-20`
- logins: `agent-` + ordinal + `@vises.app` → `agent-01@vises.app`…`agent-20@vises.app`
- invite tokens: `seed-agent-` + ordinal
- names: `Agent ` + ordinal

### Status / history mismatch (must adapt)

Second tip still uses **FR-7 five-value** union (`drafting` | `pending` | `rejected` | `booked` | `issued`):

- `SEED_APPLICATION_STATUS_POOL = APPLICATION_STATUSES` (five on that branch).
- `build-status-history-chain.util.ts` builds drafting→pending→… / booked→issued chains.
- Agent apps treat visit/payment for `booked || issued`; zero docs for `drafting`.

**Cannot port status/history verbatim** onto first-frontend; must bind pool + chains to BUSINESS six and existing §4.C matrix.

## Gap matrix (summary)

| Area | first-frontend today | second-frontend tip | Target for this feature |
|------|----------------------|---------------------|-------------------------|
| Agent count | 2 fixed | 20 generated | 20 generated |
| Clients per agent | Fixed 8 + 5 | RNG [2, 50] | RNG [2, 50] |
| Total clients | 13 fixed | Variable (not a fixed ~100) | Variable via per-agent bounds only |
| Agent ids/logins | `u-agent-a` / `agent-a@…` | `u-agent-01`…`20` | Same as second tip scheme |
| Status pool | Fixed A/B arrays (4 of 6 BUSINESS) | FR-7 five-value random pool | BUSINESS six (`APPLICATION_STATUSES`) |
| History chains | BUSINESS subset | FR-7 five-value | BUSINESS for **all** pool finals |
| Volume constants file | RNG only | Count + min/max + extra slots | Port second tip knobs |
| Plan util / types | Absent | Present + unit tests | Port + adapt types/pool |
| Invocation | seed-if-empty + reset-demo | Same pattern | Unchanged |
| Migration | N/A | N/A | None (data-only) |

## Affected areas

- **Primary:** `apps/api/src/modules/seed/**` (constants, types, utils, `seed.service.ts`, unit specs).
- **Unchanged contract surface:** `POST /api/settings/reset-demo` (settings module gates non-prod + roles).
- **Contracts consume:** `@vises/contracts` `APPLICATION_STATUSES` / `ApplicationStatus` (no contract change expected).
- **Not in scope for volume port:** `apps/web`, new HTTP endpoints, DB migrations, prod enablement of reset-demo.

## Risks / notes for spec

1. Blind cherry-pick of second tip history/apps helpers would reintroduce FR-7 status literals — **reject**; adapt to BUSINESS.
2. Mini composition left `filling` / `ready_for_appointment` without history finals; with a six-value random pool those finals **will** appear — history (and visit/docs heuristics) must cover them.
3. Total client count is **not** a product knob; acceptance must not assert a fixed total (e.g. ~100).
4. Existing DBs with mini seed need `reset-demo` (non-prod) to observe new volume; empty DB gets volume on first boot via seed-if-empty.

## Artifact home

Authoritative: `docs/sdd/demo-seed-volume/`  
Spec SoT: [`02-spec.md`](./02-spec.md)
