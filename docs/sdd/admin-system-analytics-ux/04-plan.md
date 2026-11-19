# Phase 4 — Execution plan

| Field | Value |
|-------|-------|
| Feature id | `admin-system-analytics-ux` |
| Status | **DONE** (ASAU-TASK-001…009 implemented; arch OKAY; code OKAY) |
| Date | 2026-11-17 |
| Spec | [`02-spec.md`](./02-spec.md) (**APPROVED_WITH_PROPOSED_DEFAULTS**; DEC-ASAU-001…009) |
| Discovery | [`00-discovery.md`](./00-discovery.md) (explorer `2c9cd70c-66b6-4ad4-83ee-b39f33d293bd`) |
| Tasks | [`05-tasks.md`](./05-tasks.md) |
| Branch | `feature/first-frontend` |
| Screenshots | «Ближайшие визиты» + «Клиенты по агентам» (Cursor assets attached to request) |

**Human decisions:** Spec **APPROVED_WITH_PROPOSED_DEFAULTS** under the full SDD orchestration request (invent/propose + implement). Override rights retained. Context gate **pass**. Plan-review cycle 1 REJECT addressed in this revision.

---

## 1. Goal & measurable acceptance

Differentiate Система (ops snapshot) from Analytics (period workspace); enrich agent performance with balance / registered / paid; remove Система upcoming visits **and** Analytics-parity status breakdown; fix Users→agent apps; tighten delete + payment RBAC; compact Visits filters. Match **AC-001…014**.

---

## 2. Strategy

1. **Contracts first** — additive enrich of `AnalyticsClientsPerAgentDto` + locked §5.1 fields (**DEC-ASAU-009**).
2. **Backend analytics** — compute metrics + §5.1 aggregates; no migrations.
3. **Backend users** — `latestAppId` for agents via `Client.agentId` → applications (**OQ-ASAU-001** deep-link latest).
4. **Backend apps ACL** — DELETE + payment write fail closed for agents (**OQ-ASAU-003**).
5. **Frontend** — Система de-dupe; Analytics cards; Users buttons; Application RBAC; Visits height.
6. **Agent §5.1** — deferred (**DEC-ASAU-008**).

---

## 3. Locked contract shapes (DEC-ASAU-009)

```ts
// Additive on existing clientsPerAgent rows:
// balance: string; registered: number; paid: number; paidAmount: string;

type AnalyticsBookedVsUnpaidDto = {
  bookedCount: number;
  unpaidCount: number;
};

type AnalyticsCityBucketDto = {
  city: string;
  count: number;
  percentage: string;
};

type AnalyticsPaymentCompletenessDto = {
  totalApplications: number;
  paidCount: number;
  completenessPercentage: string; // decimal string
};

type AnalyticsPaidVolumeAgentDto = {
  agentId: string;
  paidAmount: string; // decimal string sum
  paidCount: number;
};

// AnalyticsDto adds:
// bookedVsUnpaid: AnalyticsBookedVsUnpaidDto;
// cityDistribution: AnalyticsCityBucketDto[];
// paymentCompleteness: AnalyticsPaymentCompletenessDto;
// paidVolumeByAgent: AnalyticsPaidVolumeAgentDto[];
```

Status mix continues via existing `global.byStatus` (no duplicate field).

---

## 4. Plan picks (residual OQs)

| OQ | Plan pick |
|----|-----------|
| **OQ-ASAU-001** | Deep-link to **latest owned app** |
| **OQ-ASAU-002** | Keep Users «Ссылка» + create dialog |
| **OQ-ASAU-003** | Tighten payment **write** ACL for agents |
| **OQ-ASAU-004** | RU copy in task constants |
| **OQ-ASAU-005** | Closed by DEC-ASAU-009 |

---

## 5. DAG

```
ASAU-TASK-001 (contracts) [sensitive ACK]
   └─► ASAU-TASK-002 (analytics API) [sensitive ACK]
          ├─► ASAU-TASK-005 (Система FE)
          └─► ASAU-TASK-006 (Analytics FE)

ASAU-TASK-003 (users latestAppId) — independent of 001
ASAU-TASK-004 (apps ACL) [sensitive ACK] — independent
   └─► ASAU-TASK-008 (Application detail RBAC)

ASAU-TASK-007 (Users FE buttons) — independent (no depends on 003)
ASAU-TASK-009 (Visits height) — independent
```

| Order | ID | Depends | Parallel? |
|------|-----|---------|-----------|
| 1 | ASAU-TASK-001 | — | No |
| 2 | ASAU-TASK-002 | 001 | ∥ 003, 004, 007, 009 |
| 2 | ASAU-TASK-003 | — | ∥ |
| 2 | ASAU-TASK-004 | — | ∥ |
| 3 | ASAU-TASK-005 | 002 | ∥ 006, 008 |
| 3 | ASAU-TASK-006 | 002 | ∥ |
| 3 | ASAU-TASK-007 | — | ∥ anytime |
| 3 | ASAU-TASK-008 | 004 | ∥ |
| 3 | ASAU-TASK-009 | — | ∥ anytime |

---

## 6. Sensitive-path human checkpoints

Before merge of each sensitive task, record human-visible ACK in PR/review notes (orchestrator will flag in final report):

| Task | Checkpoint |
|------|------------|
| **001** | Public contracts + money string fields on AnalyticsDto |
| **002** | Balance exposure + agent self-scope isolation |
| **004** | DELETE Roles tighten + payment write fail-closed for agents |

Migrations remain **forbidden** unless human-approved mid-flight.

---

## 7. Affected packages / FSD

Unchanged from cycle-1 plan: `packages/contracts`, `apps/api` analytics/users/apps, `apps/web` pages owner-home / analytics / users / application-detail / visits. No stats Must change (FE stops consuming upcomingVisits). No events/deploy.

---

## 8. Validation commands

| Scope | Command |
|-------|---------|
| Contracts | `pnpm --filter @vises/contracts run build` (+ lint if real) |
| API | `pnpm --filter @vises/api run build` + scoped jest **without** `--passWithNoTests` |
| Web | `pnpm --filter @vises/web run lint` + `build` |

---

## 9. Decisions needed from human (non-blocking)

- Override any PROPOSED_DEFAULT DEC.
- Expand Users cleanup beyond the three buttons.
- Pull agent §5.1 (**DEC-ASAU-008**) back into Must earlier.
