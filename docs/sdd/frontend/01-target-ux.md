# Phase 1 — Target UX / frontend architecture

| Field | Value |
|-------|-------|
| Feature id | `bls-workflow-frontend` |
| Status | **DESIGNED** |
| Date | 2026-09-22 |
| Spec SoT | `specs/features/bls-workflow-frontend/02-spec.md` |
| Discovery | [`00-discovery.md`](./00-discovery.md) |
| Upstream API | `docs/sdd/03-workflow-api.md` |

**Labeling:** **Fact** = verified in discovery / code. **Assumption** = labeled.

---

## 1. Placement

| Surface | Decision |
|---------|----------|
| Page | Existing `web/src/pages/application-detail/` — tab **«Автозаполнение»** (REQ-001) |
| Primary widget | Enhance `web/src/widgets/bls-workflow-panel/` (TASK-015 baseline) |
| Secondary widget | Keep `web/src/widgets/portal-autofill-evidence/` below workflow (**DEC-002**) |
| Entity | Extend `web/src/entities/bls-workflow/` |
| New pages / routes | **None** (CON-008) |

---

## 2. Decisions (OQ resolution)

### DEC-001 — Realtime: snapshot + events poll (reject WS/SSE)

| | |
|--|--|
| **Resolves** | OQ-001 |
| **Decision** | Keep **GET snapshot** poll every **`BLS_WORKFLOW_POLL_INTERVAL_MS` (3000)** while non-terminal. Add **GET events** poll on the same tick (or immediately after snapshot) with `sinceEventId` cursor. **Do not** add WebSocket, SSE, EventSource, socket.io, or Nest gateway packages. |
| **Facts** | No WS/SSE usage or deps in `web/` or `backend/package.json` (discovery §5). Events GET exists (TASK-013). Snapshot poll ships (TASK-015). Upstream DEC-006 / CON-003 preferred HTTP poll. ISSUE-003 = events unused. |
| **Assumptions** | ~3s latency acceptable (A2). Coalescing snapshot refresh when `latestEventId` advances reduces stale gaps without extra interval. |
| **Rejected** | Snapshot-only (fails REQ-007 / ISSUE-003). Inventing WS/SSE (fails CON-002 / NFR-005; greenfield infra). |
| **REQ** | REQ-005, REQ-006, REQ-007, NFR-003, NFR-005, CON-002 |

**Control flow:**

```
while snapshot.status non-terminal && !busy:
  GET snapshot (silent; retain last good on network blip)
  if workflowId:
    GET events?sinceEventId=<cursor>&limit=100
    append new events to local ring / feed
    advance cursor to latestEventId
  wait 3s
on terminal (incl. AWAITING_STAFF_BOOKING): stop both polls
```

### DEC-002 — Автозаполнение: extend dual-mode

| | |
|--|--|
| **Resolves** | OQ-002 |
| **Decision** | **Extend** TASK-015 layout: `BlsWorkflowPanel` **primary** (above), legacy `PortalAutofillEvidenceSection` **secondary/diagnostic** (below). Do **not** remove RegisterUser path in this feature. Add RU copy clarifying primacy (workflow = multi-stage SoT; RegisterUser = evidence / one-shot diagnostic). |
| **Facts** | Tab already dual-mode (discovery F4). REQ-014 / CON-008 prefer extend. |
| **Rejected** | Replace-only Autofill tab (unnecessary regression; blocks AC-007). |
| **REQ** | REQ-014, CON-008, RISK-001 |

### DEC-003 — Targeted retry via small snapshot DTO extension

| | |
|--|--|
| **Resolves** | OQ-003 |
| **Decision** | **Small backend DTO extension** (CON-003 scoped): add non-secret `id: string` and `maxAttempts: number` to each snapshot `tasks[]` row. SPA mirrors types and **Should** offer per-task Retry when eligible; **Must** keep default retry (omit `taskId`) working without selection. |
| **Facts** | Retry body already accepts `taskId?`. Snapshot omits task `id` / `maxAttempts` today (F6). Service already resolves manual retry by task id internally. |
| **Assumptions** | Exposing UUID task ids is safe (not vault). `maxAttempts` is policy constant (typically 5) already known to runner — display-only. |
| **Rejected** | SPA-only forever without ids (blocks REQ-010 Should / multi-task clarity). Large API redesign. |
| **REQ** | REQ-010, CON-003, RISK-007 |

### DEC-004 — Applicant display labels

| | |
|--|--|
| **Resolves** | OQ-004 |
| **Decision** | **Must** show `applicantId` when non-null. **Should** resolve human label (`firstName` + `lastName` or equivalent) from application `form.applicants` passed as optional panel prop from `ApplicationDetailRender`. Fallback: id string. Fix current-task resolution to use `ordinal` and/or `applicantId` when multiple tasks share `taskKey` (REQ-012). |
| **Assumption** | Application detail already has applicants array in form state (Fact from page code). |
| **REQ** | REQ-011, REQ-012 |

### DEC-005 — CON-006 handoff Russian copy

| | |
|--|--|
| **Resolves** | OQ-005 |
| **Decision** | Distinct **success/handoff** banner when `status === 'AWAITING_STAFF_BOOKING'` (not failure styling). Canonical RU copy stored as panel constant (see below). Optional secondary line from `terminalReason` when present and non-secret. Poll **stopped** (REQ-006). Do not offer Cancel/Retry as primary CTAs for this success terminal. |
| **REQ** | REQ-013, CON-006, CON-009, NFR-001 |

Canonical RU copy (DEC-005):

```text
Автоматизация остановлена на безопасной границе записи.
Сотрудник должен завершить бронирование вручную
(тип визы, оплата и Premium Lounge не выполняются автоматически).
```

### DEC-006 — Events timeline UX

| | |
|--|--|
| **Resolves** | OQ-006 |
| **Decision** | **Compact chronological feed** inside the workflow panel (newest at bottom or top — match existing list patterns; prefer newest last for “log” feel). Cap DOM via API `limit` (default 100) + local ring; **optional expand** (“Показать все события”) still bounded by API max 200 / NFR-007. Not a separate route. |
| **REQ** | REQ-007, REQ-017, REQ-018, NFR-007 |

---

## 3. Target UX composition (single panel)

Order top → bottom inside `BlsWorkflowPanelRender` (enhance, don’t redesign CRM):

1. **Header** — «Сценарий BLS» + primacy hint (DEC-002)
2. **Controls** — Start / Supersede / Retry / Resume / Pause / Cancel (existing eligibility; Russian `detail` on errors)
3. **CON-006 banner** — only when `AWAITING_STAFF_BOOKING` (DEC-005)
4. **Status summary** — status RU, current step/task RU, lockHeld, `nextRunAt`, terminalReason, safe error (REQ-004)
5. **Step visualization** — horizontal or vertical ordered rail REGISTER→BOOK; current step emphasized; SKIPPED shows reason (REQ-002)
6. **Tasks** — list/detail with applicant label, attempts (`attemptCount` / `maxAttempts` when present), safe errors; optional per-row Retry when `id` known (REQ-003, REQ-010, REQ-011)
7. **Events feed** — compact timeline; allowlisted `payloadSafe` fields only; `AUTOFILL_RUN_LINKED` shows runId + hint to evidence below (REQ-007, REQ-017, REQ-018)
8. **Loading / empty / error / polling** — existing patterns + aria-live (REQ-015, NFR-004)

Below panel (page composition):

9. **Legacy RegisterUser evidence** — secondary heading «Диагностика RegisterUser» (or equivalent RU) — DEC-002

---

## 4. Loading / error / empty

| State | Behavior |
|-------|----------|
| Initial load | Spinner / «Загрузка…»; no false empty flash |
| Empty (404 / no workflow) | Empty copy + Start CTA — not page-level hard error |
| Action error | Show Russian API `detail` in actionError region |
| Silent poll failure | Keep last good snapshot; muted «Обновляем…» / optional soft indicator (NFR-003) |
| Terminal | Stop polls; retain snapshot |

---

## 5. Russian copy

- Reuse / extend `BLS_WORKFLOW_PANEL_COPY` and entity RU label maps.
- New strings for: primacy hint, CON-006 banner (DEC-005), events section title, expand control, applicant prefix («Заявитель»), attempts («попытка N из M»), dual-mode secondary heading.
- Unknown keys → raw key fallback (edge case 14).

---

## 6. Accessibility

- Keep native keyboard-activable controls (existing `Btn`).
- Add **`aria-live="polite"`** region announcing status / current step changes during poll (NFR-004 Should → treat as implement Must for status string).
- Tab markup on application-detail already uses `role="tab"` — do not break.
- Error text associated visually adjacent to controls (no new modal required).

---

## 7. Secret hygiene

| Never show | May show |
|------------|----------|
| Portal passwords, Mail.tm tokens/passwords, DEK/master key, `lockOwner`, vault envelopes | Snapshot status fields, `lastErrorClass` / `lastErrorMessage`, `terminalReason`, allowlisted `payloadSafe` keys (`runId`, status-like scalars) |

**Allowlist approach (REQ-017):** util `pickBlsWorkflowPayloadSafeDisplay` — only known keys; never `JSON.stringify` entire `payloadSafe` into DOM.

---

## 8. Multi-applicant

- Display applicant on each `STATUS_APPLICANT` (and any task with `applicantId`).
- Current task: prefer match `stepKey + taskKey + ordinal` aligning with backend cursor, or among matches pick RUNNING/WAITING_* / highest ordinal — **implementer follows util contract in FE-TASK-002**; must eliminate first-match bug (discovery RISK-D02).

---

## 9. Risks (design)

| ID | Risk | Mitigation |
|----|------|------------|
| RISK-FE-001 | Dual poll doubles traffic | Same 3s tick; skip events if no workflowId; NFR-003 |
| RISK-FE-002 | DTO add slips / breaks clients | Additive fields only; SPA optional chaining until FE-TASK-003 done |
| RISK-FE-003 | CON-006 read as failure | Distinct success styles + DEC-005 copy |
| RISK-FE-004 | payloadSafe dump | Allowlist util |

---

## 10. Phase gate

Phase 1 Target UX: **DESIGNED**. Next: API mapping [`02-api-contract-mapping.md`](./02-api-contract-mapping.md).
