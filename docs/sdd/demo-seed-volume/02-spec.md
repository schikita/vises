# Spec — Demo seed volume

| Field | Value |
|-------|-------|
| Feature id | `demo-seed-volume` |
| Document home | **`docs/sdd/demo-seed-volume/`** (authoritative) |
| Spec SoT | [`02-spec.md`](./02-spec.md) (this file) |
| Status | **APPROVED** |
| Human approval date | **2026-11-17** |
| Updated | 2026-11-17 |
| Branch target | `feature/first-frontend` |
| Volume source | `feature/second-frontend` tip (port volume; adapt statuses) |
| Discovery | [`00-discovery.md`](./00-discovery.md) (explorer `54880534-98f9-4d04-8e86-0b2a2090c7c3`) |

> **APPROVED** on 2026-11-17. **DEC-DSV-001…005** are locked as recorded in §8. Implement against this SoT after plan/tasks; do not invent a fixed total client count; do not retain `agent-a` / `agent-b` aliases; do not port FR-7 five-value status/history from second tip.

---

## 1. Summary

Non-prod demo seed on `feature/first-frontend` scales from the mini FR-11 set (**2 agents + 13 clients**) to the second-frontend volume model: **exactly 20 agents**, each with a **deterministic** client count in **[2, 50]** (inclusive), generated identities `u-agent-01`…`u-agent-20` / `agent-01@vises.app`…`agent-20@vises.app`, and per-application statuses drawn from the first-frontend **BUSINESS** six-value pool. Invocation stays seed-if-empty on `SeedService.onModuleInit` and reseed via `POST /api/settings/reset-demo` (non-prod). **No migration** — data-only.

---

## 2. Actors and roles

| Actor | Role |
|-------|------|
| API process (non-prod) | Runs seed-if-empty on module init when users + settings + applications are all empty |
| Admin / superadmin | May call `POST /api/settings/reset-demo` in non-prod to truncate operational tables and re-seed |
| Agent users (seeded) | 20 demo agents used by staff UI / demos; not product end-users |
| Superadmin / admins (seeded) | Unchanged fixed staff identities (1 superadmin + 2 admins) |
| Production operators | Must **not** receive reset-demo or automatic destructive reseed (`NODE_ENV` production gate unchanged) |

---

## 3. Goal and scope

### 3.1 Goal

Replace mini FR-11 hard-coded Agent A/B composition with deterministic **20-agent volume plans** matching second-frontend knobs, while every seeded `Application.status` and status-history edge remains a valid first-frontend **BUSINESS** value / §4.C matrix transition.

### 3.2 In scope

- Volume constants: `SEED_AGENT_COUNT`, `SEED_CLIENTS_PER_AGENT_MIN`, `SEED_CLIENTS_PER_AGENT_MAX`, `SEED_EXTRA_BALANCE_SLOTS_MAX` (plus existing `SEED_RNG_SEED`) — values as on second tip (**DEC-DSV-001**).
- Deterministic `buildSeedAgentPlans` (+ ordinal formatter + `SeedAgentPlan` type) and rewiring of `buildSeedUsers` / `buildFr11SeedDataset` / `SeedService` to consume plans.
- Agent identity scheme `u-agent-01`…`20`, `agent-01@vises.app`…`agent-20@vises.app` (**DEC-DSV-002**); remove `u-agent-a` / `u-agent-b` aliases from seed constants/builders.
- Status pool = BUSINESS `APPLICATION_STATUSES` (six); history chains and agent-app heuristics adapted for all six finals (**DEC-DSV-003**).
- Unit tests for plans (count, bounds, determinism, identity shapes) and verification that empty DB / reset-demo yields 20 agents.
- File-separation / Nest seed-module / TypeScript conventions compliance (§10).

### 3.3 Non-goals (explicit)

| Non-goal | Rationale |
|----------|-----------|
| Fixed total client count (e.g. ~100) | **DEC-DSV-001** — only per-agent [2, 50] bounds |
| Keeping `agent-a` / `agent-b` seed aliases | **DEC-DSV-002** |
| Porting FR-7 five-value statuses or drafting→pending / booked→issued history | **DEC-DSV-003** |
| Changing reset-demo auth, path, or prod gate | **DEC-DSV-004** |
| New DB tables/columns/migrations | **DEC-DSV-005** |
| New public HTTP APIs or contracts DTO changes | Out of scope |
| `apps/web` demo login UI redesign | Out of scope (may consume new logins once seeded) |
| Changing seed plaintext demo passwords policy | Unchanged unless required for compile |
| Prod enablement of demo reset | Forbidden remains |

---

## 4. Baseline and traceability

| Artifact | Relation |
|----------|----------|
| `feature/second-frontend` `demo-seed-volume.constants.ts` | Normative volume numeric knobs (**DEC-DSV-001**) |
| `feature/second-frontend` plan/users/dataset builders | Structural port source for volume machinery |
| `packages/contracts` `APPLICATION_STATUSES` / §4.C matrix | Normative BUSINESS status pool + legal history edges |
| first-frontend `build-status-history-chain.util.ts` | Baseline BUSINESS chains to **extend** for pool coverage |
| `SeedService.seedIfEmpty` / `resetDemo` | Unchanged invocation (**DEC-DSV-004**) |
| `POST /api/settings/reset-demo` | Unchanged route/roles/non-prod gate |
| Explorer `54880534-98f9-4d04-8e86-0b2a2090c7c3` | Discovery evidence |

---

## 5. Functional requirements

| ID | Statement | Priority | Status |
|----|-----------|----------|--------|
| **REQ-001** | Seed volume knobs **MUST** equal second tip: `SEED_AGENT_COUNT = 20`, `SEED_CLIENTS_PER_AGENT_MIN = 2`, `SEED_CLIENTS_PER_AGENT_MAX = 50`, and `SEED_EXTRA_BALANCE_SLOTS_MAX = 5`. Retain deterministic `SEED_RNG_SEED` (same value as today / tip: `20_250_920`). Do **not** introduce a product constant for total clients. | Must | **Accepted** (**DEC-DSV-001**) |
| **REQ-002** | `buildSeedAgentPlans()` **MUST** return exactly `SEED_AGENT_COUNT` plans. For each plan, `clientCount` ∈ [MIN, MAX] inclusive; `extraSlots` ∈ [0, `SEED_EXTRA_BALANCE_SLOTS_MAX`]; `balanceSlots = clientCount + extraSlots`; `statuses.length === clientCount`; money fields consistent with `SEED_DEFAULT_PRICE` (top-up = balanceSlots × price; final balance = extraSlots × price). Two successive calls with the same constants **MUST** be deep-equal (determinism). | Must | **Accepted** |
| **REQ-003** | Generated agent identities **MUST** use ordinals `01`…`20`: `userId = u-agent-{ordinal}`, `login/email = agent-{ordinal}@vises.app`, invite token `seed-agent-{ordinal}`, display name `Agent {ordinal}`. Seed **MUST NOT** emit `u-agent-a`, `u-agent-b`, `agent-a@vises.app`, or `agent-b@vises.app`. Superadmin + two admin fixed identities remain unchanged. | Must | **Accepted** (**DEC-DSV-002**) |
| **REQ-004** | Per-application status draws **MUST** use pool `APPLICATION_STATUSES` from `@vises/contracts` (six BUSINESS values). Seed **MUST NOT** write FR-7 literals `drafting`, `pending`, `rejected`, or `issued`. | Must | **Accepted** (**DEC-DSV-003**) |
| **REQ-005** | `buildStatusHistoryChain(finalStatus, agentId)` **MUST** return only edges present in the §4.C / `APPLICATION_STATUS_TRANSITION_MATRIX`. Coverage for pool finals: **`draft`** and **`filling`** → empty chain (create-like); **`not_ready_for_appointment`** → `draft`→`not_ready_for_appointment` (monitor actor/trigger as today); **`declined`** → that monitor edge then `not_ready_for_appointment`→`declined` (agent); **`ready_for_appointment`** → monitor edge then `not_ready_for_appointment`→`ready_for_appointment` (agent); **`booked`** → monitor edge, then `not_ready_for_appointment`→`ready_for_appointment`, then `ready_for_appointment`→`booked` (agent). No drafting/pending/issued edges. | Must | **Accepted** (**DEC-DSV-003**) |
| **REQ-006** | Dataset composition **MUST** iterate agent plans (not hard-coded A/B arrays). For each plan: 1 client : 1 application; client/application id prefixes use plan ordinal; ledger top-up + per-client debits match plan money; composition guardrails throw on client-count or balance mismatch. | Must | **Accepted** |
| **REQ-007** | Agent-app heuristics on first-frontend BUSINESS semantics: visit fields + `paymentPaid` when `status === 'booked'`; `docsCount = 0` when `status` is `draft` or `filling`; otherwise existing RNG doc count behavior. Do not key heuristics on FR-7 `issued` / `drafting`. | Must | **Accepted** |
| **REQ-008** | Invocation **MUST** remain: (a) `SeedService.onModuleInit` → `seedIfEmpty` only when users, settings, and applications are all empty; (b) full reseed via existing `SeedService.resetDemo` after operational truncate, exposed as `POST /api/settings/reset-demo` (admin/superadmin, non-prod only). No new trigger. | Must | **Accepted** (**DEC-DSV-004**) |
| **REQ-009** | After a successful seed-if-empty or reset-demo on an empty/truncated operational DB, persisted staff users with role `agent` **MUST** number exactly 20, with ids/logins per **REQ-003**. | Must | **Accepted** |
| **REQ-010** | No schema migration, no new tables/columns, no contracts DTO/API shape change for this feature. | Must | **Accepted** (**DEC-DSV-005**) |
| **REQ-011** | Unit tests **MUST** cover `buildSeedAgentPlans`: length 20; per-plan client bounds; determinism; id/login shapes. History unit tests **MUST** cover all six BUSINESS finals per **REQ-005**. Existing seed dataset specs updated so they no longer assume Agent A/B fixed 13-client composition. | Must | **Accepted** |
| **REQ-012** | Logging/telemetry for seed **MUST NOT** emit passport/applicant PII plaintext; counts/ids/codes only (same posture as current seed logger). | Must | **Accepted** |

---

## 6. Non-functional requirements

| ID | Statement |
|----|-----------|
| **NFR-001** | Security: `reset-demo` remains admin/superadmin and **forbidden when `NODE_ENV` is production**; seed-if-empty does not run a destructive clear. |
| **NFR-002** | PII: passport/identity seed fields continue through existing `PiiCryptoService.encryptFields` before Client persist. |
| **NFR-003** | Determinism: same `SEED_RNG_SEED` + constants ⇒ identical plans and identical derived dataset for a fixed `now` input. |
| **NFR-004** | Performance: seeding 20 agents × up to 50 clients each (worst case 1000 client/app pairs + history/ledger) must complete in a single transaction path already used by seed; no new background job required. |
| **NFR-005** | Backwards compatibility: existing non-empty DBs are unchanged until operator runs non-prod reset-demo; no automatic migration of mini `u-agent-a` rows. |
| **NFR-006** | Observability: seed completion log includes user/agent/client/app/history/ledger counts (no PII values). |
| **NFR-007** | Compliance with workspace file-separation, Nest seed module structure, and TypeScript conventions (§10). |

---

## 7. Constraints

| ID | Statement |
|----|-----------|
| **CON-001** | Data-only: **no** TypeORM migrations, no new entities/columns. |
| **CON-002** | Do not invent a fixed total-client product requirement. |
| **CON-003** | Do not retain mini agent-a/agent-b seed identities alongside generated agents. |
| **CON-004** | Do not write non-BUSINESS application status strings. |
| **CON-005** | History edges must be matrix-valid; do not port FR-7 chains. |
| **CON-006** | Do not change public API contracts or add endpoints. |
| **CON-007** | Do not enable reset-demo in production. |
| **CON-008** | One concern per file; no `enum` keyword for statuses/roles (unions / `as const` / contracts constants). |

---

## 8. Decisions and assumptions

### 8.1 Approved decisions

| ID | Decision | Status |
|----|----------|--------|
| **DEC-DSV-001** | Port second-frontend seed volume **as-is**: `SEED_AGENT_COUNT=20`, `SEED_CLIENTS_PER_AGENT_MIN=2`, `SEED_CLIENTS_PER_AGENT_MAX=50`, plus tip `SEED_EXTRA_BALANCE_SLOTS_MAX=5`. Do **not** invent a fixed ~100 (or any fixed) total client count; total is the sum of per-agent draws. | **APPROVED** (2026-11-17) |
| **DEC-DSV-002** | Agent identities use the full ordinal scheme only: `u-agent-01`…`u-agent-20`, logins `agent-01@vises.app`…`agent-20@vises.app`. Do **not** keep `agent-a` / `agent-b` aliases. | **APPROVED** (2026-11-17) |
| **DEC-DSV-003** | Adapt status pool and history to first-frontend **BUSINESS** six statuses (`filling`, `draft`, `not_ready_for_appointment`, `ready_for_appointment`, `booked`, `declined`). Second tip FR-7 five-value pool/history is **not** authoritative on this branch. Normative chain coverage is **REQ-005**. | **APPROVED** (2026-11-17) |
| **DEC-DSV-004** | Invocation unchanged: seed-if-empty on `SeedService.onModuleInit`; reseed via `POST /api/settings/reset-demo` (non-prod). | **APPROVED** (2026-11-17) |
| **DEC-DSV-005** | No migration required (data-only seed changes). | **APPROVED** (2026-11-17) |

### 8.2 Assumptions

| ID | Assumption |
|----|------------|
| **ASSUME-001** | Superadmin + two admin seed users/passwords remain the existing first-frontend constants. |
| **ASSUME-002** | 1 client ↔ 1 application per seeded pair remains (same as both tips). |
| **ASSUME-003** | `SEED_DEFAULT_PRICE` / settings singleton seeding remain the existing first-frontend values. |
| **ASSUME-004** | Operators needing the new volume on an already-populated demo DB will run non-prod reset-demo after backup. |

---

## 9. Data model impact

| Item | Impact |
|------|--------|
| Entities / columns | **None** — reuse `User`, `Client`, `Application`, `ApplicationStatusHistory`, `BalanceTransaction`, `Setting` |
| Migrations | **None** (**DEC-DSV-005**) |
| Sensitive fields | Passport/identity columns remain encrypted at rest via existing PII crypto; demo passwords remain seed constants (non-prod demo only) |
| Row volume | Up to 20 agents; per agent 2–50 clients/apps; history/ledger scale with that |

---

## 10. API surface

| Surface | Change |
|---------|--------|
| `POST /api/settings/reset-demo` | **Unchanged** path, body, auth (admin/superadmin), non-prod gate, response `{ ok: true }` |
| Other HTTP APIs | **None** |
| `@vises/contracts` DTOs | **No** additive/breaking change required; consume `APPLICATION_STATUSES` / `ApplicationStatus` |

Seed module internal builders are not public API.

---

## 11. Edge cases and error handling

| Case | Expected behavior |
|------|-------------------|
| Partially populated DB (some of users/settings/apps non-empty) | seed-if-empty **skips** with existing warn; operator uses reset-demo after backup |
| Fully populated DB | seed-if-empty **skips** (log already populated) |
| Production `reset-demo` | **403** / forbidden — unchanged |
| Plan/dataset composition mismatch (client count or balance math) | Builder **throws** before/at persist (fail closed; no silent wrong ledger) |
| `filling` / `ready_for_appointment` drawn as final status | Persisted; history per **REQ-005**; no FR-7 fallback |
| Existing mini seed rows still present | Untouched until reset-demo; after reset, only ordinal agents exist |

---

## 12. Out of scope

- Plan/tasks documents (orchestrator follow-up).
- Frontend demo credential UI / docs beyond what seed creates.
- Changing demo password strings or invite UX.
- Analytics redesign for larger seed volume.
- Automatic upgrade path from `u-agent-a` → `u-agent-01` without reset-demo.
- Porting second tip FR-7 status union into contracts on first-frontend.

---

## 13. Acceptance criteria

| ID | Criterion (testable) | Maps to |
|----|----------------------|---------|
| **AC-001** | `demo-seed-volume.constants.ts` (or equivalent single constants file) exports `SEED_AGENT_COUNT=20`, `SEED_CLIENTS_PER_AGENT_MIN=2`, `SEED_CLIENTS_PER_AGENT_MAX=50`, `SEED_EXTRA_BALANCE_SLOTS_MAX=5`, and existing `SEED_RNG_SEED`. | REQ-001, DEC-DSV-001 |
| **AC-002** | Unit test: `buildSeedAgentPlans()` length is exactly 20; every `clientCount` ∈ [2,50]; every `extraSlots` ∈ [0,5]; two calls deep-equal. | REQ-002, REQ-011 |
| **AC-003** | Unit test: for each plan, `userId === \`u-agent-${ordinal}\`` and `login === \`agent-${ordinal}@vises.app\`` with ordinals `01`…`20`; suite fails if `agent-a` / `agent-b` identities appear in plan output. | REQ-003, DEC-DSV-002 |
| **AC-004** | Unit test: every planned status ∈ `APPLICATION_STATUSES` (six BUSINESS values); no `drafting`/`pending`/`rejected`/`issued`. | REQ-004, DEC-DSV-003 |
| **AC-005** | Unit test: `buildStatusHistoryChain` for all six finals matches **REQ-005**; every edge exists in `APPLICATION_STATUS_TRANSITION_MATRIX`. | REQ-005, REQ-011 |
| **AC-006** | Empty DB boot (`seedIfEmpty`) or non-prod `POST /api/settings/reset-demo` results in **exactly 20** users with `role === 'agent'` and ids `u-agent-01`…`u-agent-20`. | REQ-008, REQ-009, DEC-DSV-004 |
| **AC-007** | No new migration file added for this feature; schema unchanged. | REQ-010, DEC-DSV-005 |
| **AC-008** | Mini FR-11 fixed arrays / `SEED_AGENT_A_*` / `SEED_AGENT_B_*` composition constants are removed or no longer referenced by seed builders. | REQ-006, CON-003 |
| **AC-009** | Seed completion log includes agent count (20) and client/app counts without passport/name plaintext. | REQ-012, NFR-006 |
| **AC-010** | Touched seed files obey one-concern-per-file (types / constants / utils / service separated); no TypeScript `enum` for statuses. | REQ-011, NFR-007, CON-008 |

---

## 14. Open questions

None. Human product decisions **DEC-DSV-001…005** are approved; history coverage for BUSINESS pool finals is locked in **REQ-005**.

---

## 15. Sensitive paths

| Path | Handling policy |
|------|-----------------|
| Auth / roles on `POST /api/settings/reset-demo` | Unchanged: JWT + RolesGuard `admin`/`superadmin`; production forbidden (**DEC-DSV-004**, NFR-001) |
| Destructive truncate in `resetDemo` | Unchanged; operator backup responsibility; non-prod only |
| PII passport fields in seed | Continue encrypt-via-`PiiCryptoService` before Client save (NFR-002) |
| Demo passwords / invite tokens | Remain seed constants for non-prod demo; do not log plaintext passwords |
| Application status / history | BUSINESS six + matrix-valid edges only (**DEC-DSV-003**) |
| Migrations | **None** (**DEC-DSV-005**) |
| Public contracts / HTTP shapes | Unchanged (**CON-006**) |
| Event schemas | Unaffected |

---

## 16. Compliance notes (workspace rules)

### File separation (`file-separation`)

- Volume knobs → `*.constants.ts` only.
- `SeedAgentPlan` → dedicated `*.types.ts`.
- `buildSeedAgentPlans`, `formatSeedAgentOrdinal`, dataset/users builders → dedicated `*.utils.ts` / `*.util.ts` matching existing seed naming; no types/constants inline in util files beyond imports.
- Barrel `index.ts` files re-export only.

### NestJS structure (`nestjs-structure`)

- Changes stay inside `apps/api/src/modules/seed/**` (+ settings controller/service **untouched** except that they already call `SeedService.resetDemo`).
- Do not merge service + constants + types into one file; keep `SeedService` as the Nest provider orchestrating pure builders.

### TypeScript conventions (`typescript-conventions`)

- No `enum` for statuses/roles; use `@vises/contracts` unions / `APPLICATION_STATUSES` `as const`.
- Named exports; explicit return types on new/changed functions.
- Prefer `as const` objects / readonly arrays for pools.

---

## 17. Verification summary (for plan/tasks)

1. **Unit:** `buildSeedAgentPlans` — exactly 20; bounds; determinism; identity shapes (**AC-002**, **AC-003**).
2. **Unit:** status pool ∈ BUSINESS six; history chains for all six finals matrix-valid (**AC-004**, **AC-005**).
3. **Integration / manual non-prod:** empty DB or `POST /api/settings/reset-demo` → 20 agents `u-agent-01`…`20` (**AC-006**).
4. **Repo hygiene:** no migration; mini A/B composition gone from builders (**AC-007**, **AC-008**).
