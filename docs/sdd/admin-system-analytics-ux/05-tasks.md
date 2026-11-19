# Tasks index — admin-system-analytics-ux

| Field | Value |
|-------|-------|
| Feature id | `admin-system-analytics-ux` |
| Status | **DONE** (arch OKAY + code OKAY) |
| Date | 2026-11-17 |
| Spec SoT | [`02-spec.md`](./02-spec.md) (**APPROVED_WITH_PROPOSED_DEFAULTS**) |
| Plan | [`04-plan.md`](./04-plan.md) |

## Execution order

| ID | Title | Owner | Depends | Status | Arch | Code |
|----|-------|-------|---------|--------|------|------|
| ASAU-TASK-001 | Contracts: enrich clientsPerAgent + §5.1 shapes | contracts | — | **DONE** | OKAY | OKAY |
| ASAU-TASK-002 | Backend analytics enrich + §5.1 aggregates | backend | 001 | **DONE** | OKAY | OKAY |
| ASAU-TASK-003 | Backend users: agent latestAppId via Client.agentId | backend | — | **DONE** | OKAY | OKAY |
| ASAU-TASK-004 | Backend apps: delete Roles + payment write ACL | backend | — | **DONE** | OKAY | OKAY |
| ASAU-TASK-005 | Система FE: remove visits + status de-dupe; teaser metrics | frontend | 002 | **DONE** | OKAY | OKAY |
| ASAU-TASK-006 | Analytics FE: rename, enrich, paginate, §5.1 | frontend | 002 | **DONE** | OKAY | OKAY |
| ASAU-TASK-007 | Users FE: remove row mutation buttons | frontend | — | **DONE** | OKAY | OKAY |
| ASAU-TASK-008 | Application detail: delete + payment tab RBAC | frontend | 004 | **DONE** | OKAY | OKAY |
| ASAU-TASK-009 | Visits compact search/city height | frontend | — | **DONE** | OKAY | OKAY |

Parallel: after **001** → **002**; **003 ∥ 004 ∥ 007 ∥ 009** anytime; after **002/004** → **005 ∥ 006 ∥ 008**.

## Hard constraints (all tasks)

- One concern per file; one component per `.tsx`
- No `enum`; explicit return types
- Nest modules under `src/modules/<feature>/`
- No new DB migrations unless human-approved
- Monetary values as decimal **strings**
- Russian UI copy where the page already uses Russian
- Sensitive tasks **001 / 002 / 004** require human-visible ACK before merge

---

## ASAU-TASK-001 — Contracts: enrich clientsPerAgent + §5.1 shapes

| Field | Value |
|-------|-------|
| **id** | `ASAU-TASK-001` |
| **title** | Lock Analytics DTO additive agent metrics + DEC-ASAU-009 §5.1 types |
| **owner_layer** | `packages/contracts` |
| **depends_on** | none |
| **sensitive_paths** | Public Analytics contract; money fields as strings — **human ACK before merge** |

### Acceptance criteria

- [ ] `AnalyticsClientsPerAgentDto` additive: `balance: string`, `registered: number`, `paid: number`, `paidAmount: string` (keep `agentId`, `count`, `percentage`)
- [ ] New exported types exactly: `AnalyticsBookedVsUnpaidDto`, `AnalyticsCityBucketDto`, `AnalyticsPaymentCompletenessDto`, `AnalyticsPaidVolumeAgentDto` per plan §3
- [ ] `AnalyticsDto` required fields: `bookedVsUnpaid`, `cityDistribution`, `paymentCompleteness`, `paidVolumeByAgent` (+ existing fields)
- [ ] JSDoc semantics match REQ-008 / DEC-ASAU-009
- [ ] Package index re-exports new types
- [ ] No `enum`

### Verification commands

```bash
pnpm --filter @vises/contracts run build
pnpm --filter @vises/contracts exec tsc --noEmit
```

---

## ASAU-TASK-002 — Backend analytics enrich + §5.1 aggregates

| Field | Value |
|-------|-------|
| **id** | `ASAU-TASK-002` |
| **title** | Enrich analytics DTO builder with balance/registered/paid + §5.1 |
| **owner_layer** | `apps/api` → `src/modules/analytics/` |
| **depends_on** | `ASAU-TASK-001` |
| **sensitive_paths** | Balance exposure; agent self-scope isolation — **human ACK before merge** |

### Acceptance criteria

- [ ] `clientsPerAgent` rows include balance / registered / paid / paidAmount (DEC-ASAU-003)
- [ ] `bookedVsUnpaid`, `cityDistribution`, `paymentCompleteness`, `paidVolumeByAgent` populated from existing data (no migrations)
- [ ] Agent-scoped analytics: only self metrics for money/balance; empty/omit other agents
- [ ] Unit tests in `build-analytics-dto.util.spec.ts` and/or `analytics.service.spec.ts` cover new fields (must exist and assert)
- [ ] File separation for new helpers/types/constants

### Verification commands

```bash
pnpm --filter @vises/api run build
pnpm --filter @vises/api exec jest --testPathPattern=modules/analytics
```

---

## ASAU-TASK-003 — Backend users: agent latestAppId via Client.agentId

| Field | Value |
|-------|-------|
| **id** | `ASAU-TASK-003` |
| **title** | Resolve latestAppId for agents via owned clients’ applications |
| **owner_layer** | `apps/api` → `src/modules/users/` |
| **depends_on** | none |
| **sensitive_paths** | Users list DTO; agent ownership join |

### Acceptance criteria

- [ ] For `role === 'agent'`, `latestAppId` uses apps linked through `Client.agentId`
- [ ] Latest = max `updatedAt` then `createdAt`
- [ ] Non-agent users keep existing email/login identity match
- [ ] Spec covers agent-with-clients-but-mismatched-email (must assert non-null latestAppId when owned apps exist)
- [ ] Null only when zero owned apps (AC-010)

### Verification commands

```bash
pnpm --filter @vises/api run build
pnpm --filter @vises/api exec jest --testPathPattern=modules/users
```

---

## ASAU-TASK-004 — Backend apps: delete Roles + payment write ACL

| Field | Value |
|-------|-------|
| **id** | `ASAU-TASK-004` |
| **title** | Restrict application delete and payment writes to admin\|superadmin |
| **owner_layer** | `apps/api` → `src/modules/apps/` |
| **depends_on** | none |
| **sensitive_paths** | DELETE ACL; payment fields — **human ACK before merge** |

### Acceptance criteria

- [ ] `DELETE /apps/:appId` Roles = admin|superadmin only
- [ ] Agent cannot write `paymentPaid` / `paymentAmount` / `paymentNote` (fail closed: 403 or equivalent explicit rejection)
- [ ] Tests assert agent forbidden on delete and payment write (named specs must run; no empty suite pass)
- [ ] Admin|superadmin unchanged

### Verification commands

```bash
pnpm --filter @vises/api run build
pnpm --filter @vises/api exec jest --testPathPattern=modules/apps
```

---

## ASAU-TASK-005 — Система FE: remove visits + status de-dupe; teaser metrics

| Field | Value |
|-------|-------|
| **id** | `ASAU-TASK-005` |
| **title** | OwnerHome: drop upcoming visits + Analytics-parity status card; teaser metrics |
| **owner_layer** | `apps/web` → FSD `pages/owner-home` |
| **depends_on** | `ASAU-TASK-002` |
| **sensitive_paths** | Money display on admin home |

### Acceptance criteria

- [ ] «Ближайшие визиты» block removed (AC-001)
- [ ] Analytics-parity status breakdown card removed or demoted so Система is not the deep funnel (AC-002 / REQ-003) — e.g. stop mounting `OwnerHomeStatusBreakdownCard` from analytics `byStatus`
- [ ] Top agents teaser ≤5 shows balance, registered, paid (AC-001)
- [ ] No full «Показатели агентов» list; no primary paidTotal/unpaidTotal money story (AC-002, AC-003)
- [ ] Keep recent users + cities + compact KPIs
- [ ] File separation / one component per file

### Verification commands

```bash
pnpm --filter @vises/web run lint
pnpm --filter @vises/web run build
```

---

## ASAU-TASK-006 — Analytics FE: rename, enrich, paginate, §5.1

| Field | Value |
|-------|-------|
| **id** | `ASAU-TASK-006` |
| **title** | Analytics: «Показатели агентов» + pagination + metrics + admin §5.1 cards |
| **owner_layer** | `apps/web` → FSD `pages/analytics` |
| **depends_on** | `ASAU-TASK-002` |
| **sensitive_paths** | Balance/paidAmount display |

### Acceptance criteria

- [ ] Card title **«Показатели агентов»** (AC-004)
- [ ] Rows show balance, registered, paid, paidAmount (AC-005)
- [ ] Client-side pagination page size **10** (AC-006)
- [ ] Admin §5.1 sections for bookedVsUnpaid, cityDistribution, paymentCompleteness, paidVolumeByAgent with RU labels (AC-007); agent §5.1 not required
- [ ] Status buckets remain via existing global.byStatus UI (AC-004)
- [ ] File separation; pagination helpers/components split

### Verification commands

```bash
pnpm --filter @vises/web run lint
pnpm --filter @vises/web run build
```

---

## ASAU-TASK-007 — Users FE: remove row mutation buttons

| Field | Value |
|-------|-------|
| **id** | `ASAU-TASK-007` |
| **title** | Remove «Новый пароль», «Отключить»/«Включить», «Удалить» from Users rows |
| **owner_layer** | `apps/web` → FSD `pages/users` |
| **depends_on** | none |
| **sensitive_paths** | Removing privileged actions from UI (satisfies REQ-015 UI side this cycle) |

### Acceptance criteria

- [ ] Three mutation buttons gone (AC-009); disable/delete UI absence satisfies REQ-015 this cycle
- [ ] List/view/sort still work; row click still uses `user.latestAppId` from API
- [ ] Keep «Ссылка» + create dialog
- [ ] Dead handlers/props cleaned for lint

### Verification commands

```bash
pnpm --filter @vises/web run lint
pnpm --filter @vises/web run build
```

---

## ASAU-TASK-008 — Application detail: delete + payment tab RBAC

| Field | Value |
|-------|-------|
| **id** | `ASAU-TASK-008` |
| **title** | Hide delete + «Оплата и документы» for non-admin roles |
| **owner_layer** | `apps/web` → FSD `pages/application-detail` |
| **depends_on** | `ASAU-TASK-004` |
| **sensitive_paths** | RBAC UI gates |

### Acceptance criteria

- [ ] Delete control visible only for admin|superadmin (AC-011)
- [ ] «Оплата и документы» tab only for admin|superadmin (AC-012)
- [ ] Agents retain other tabs/workflows
- [ ] Role checks via existing session helpers; constants/types separated

### Verification commands

```bash
pnpm --filter @vises/web run lint
pnpm --filter @vises/web run build
```

---

## ASAU-TASK-009 — Visits compact search/city height

| Field | Value |
|-------|-------|
| **id** | `ASAU-TASK-009` |
| **title** | Compact Visits search input and city select height |
| **owner_layer** | `apps/web` → FSD `pages/visits` |
| **depends_on** | none |
| **sensitive_paths** | none |

### Acceptance criteria

- [ ] Search and city controls share a compact, consistent height (AC-013)
- [ ] Prefer local scoped styles over breaking global `.field`
- [ ] Labels remain accessible

### Verification commands

```bash
pnpm --filter @vises/web run lint
pnpm --filter @vises/web run build
```
