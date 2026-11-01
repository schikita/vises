# Phase 0 — Discovery (BLS workflow frontend)

> **Historical snapshot (2026-09-22).** This discovery describes the BLS workflow staff SPA as inspected on that date. It is not the current `apps/web` map. The roles-and-applications frontend cycle (FE0–FE13) is **CLOSED** as of 2026-11-01. See [`docs/architecture.md`](../../architecture.md) §2 and [`specs/roles-and-applications-frontend/spec.md`](../../../specs/roles-and-applications-frontend/spec.md).

| Field | Value |
|-------|-------|
| Feature id | `bls-workflow-frontend` |
| Status | **Complete** (DISCOVERY → feeds SPECIFIED) |
| Date | 2026-09-22 |
| Authoritative tree | **`docs/sdd/frontend/`** |
| Specs mirror | `specs/features/bls-workflow-frontend/01-discovery.md` |
| Spec SoT | `specs/features/bls-workflow-frontend/02-spec.md` |
| Upstream | `docs/sdd/` + `specs/features/durable-bls-workflow/` (**DONE**) |

**Labeling:** **Fact** = verified in-repo / in upstream docs. **Assumption** = labeled; must not be treated as requirements.

---

## 1. Purpose of this discovery

Establish current staff SPA + API surface for durable BLS workflow after TASK-015, identify gaps vs product intent (step viz, task detail, controls, realtime, Автозаполнение integration, CON-006 presentation), and produce evidence for a frontend-only enhancement spec — **without inventing WebSocket/SSE** if the stack has none.

---

## 2. Upstream baseline (Facts)

| Source | Fact |
|--------|------|
| `docs/sdd/README.md` | Upstream feature **DONE** / `APPROVE_WITH_ISSUES`; optional follow-up: wire SPA events poll (**ISSUE-003**) |
| `docs/sdd/03-workflow-api.md` | HTTP contract: start / snapshot / events / retry / resume / pause / cancel; staff poll **3s**; **No** WebSocket/SSE Must |
| `docs/sdd/01-target-architecture.md` §6 / **DEC-006** | Staff UI polls GET every **3s** while non-terminal; no WS/SSE as Must (**CON-003**) |
| `docs/sdd/tasks/TASK-015-spa-poll-ui.md` | **DONE** — entity + widget + autofill tab; poll ~3s; lint+build PASS |
| `docs/sdd/tasks/TASK-013-realtime-events-poll-api.md` | **DONE** — snapshot + events GET; polling only |
| `specs/features/durable-bls-workflow/08-review.md` | **ISSUE-003:** SPA polls snapshot GET only; events endpoint unused (informational) |
| `specs/features/durable-bls-workflow/02-spec.md` | REQ-024 (poll UI), REQ-029 (events Should), CON-003 (prefer poll), CON-006 (booking stop) |

---

## 3. Frontend inventory (Facts)

### 3.1 Application detail — Автозаполнение tab

| Path | Role |
|------|------|
| `web/src/pages/application-detail/constants/application-detail-tabs.constants.ts` | Tab id `autofill`, label **«Автозаполнение»** |
| `web/src/pages/application-detail/ApplicationDetailRender.tsx` | When `activeTab === 'autofill'`: renders **`BlsWorkflowPanel`** then **`PortalAutofillEvidenceSection`** |
| `web/src/pages/application-detail/ApplicationDetail.tsx` | Container; staff routes via `staffBase(session?.role)` → `/owner` (admin) or `/admin` (manager) |

**Integration pattern (Fact):** **extend / dual-mode** — durable workflow panel **above** legacy RegisterUser evidence widget on the same tab. Panel hint copy states RegisterUser below is a separate diagnostic path.

### 3.2 BLS workflow entity + widget (TASK-015 shipped)

| Path | Role |
|------|------|
| `web/src/entities/bls-workflow/` | Types, RU labels, poll interval constant, fetch/start/retry/resume/pause/cancel helpers, eligibility utils |
| `web/src/widgets/bls-workflow-panel/BlsWorkflowPanel.tsx` | Container: load + `setInterval` poll snapshot; control actions |
| `web/src/widgets/bls-workflow-panel/BlsWorkflowPanelRender.tsx` | Presentational: controls, status grid, steps list, tasks list |
| `web/src/widgets/bls-workflow-panel/constants/bls-workflow-panel-copy.constants.ts` | Russian panel copy |

**Poll behavior (Fact):**

- Constant `BLS_WORKFLOW_POLL_INTERVAL_MS = 3_000` in `web/src/entities/bls-workflow/constants/bls-workflow.constants.ts`.
- Polls **only** `GET /apps/:applicationId/bls-workflow` via `fetchBlsWorkflow` (silent refresh).
- Polls while `snapshot != null && !isBlsWorkflowStatusTerminal(status)` and not `busy`.
- Terminal set includes **`AWAITING_STAFF_BOOKING`** (poll stops on CON-006 success terminal).

**Controls shipped (Fact):** Start, Start supersede, Retry, Resume, Pause, Cancel — gated by local eligibility helpers mirroring backend themes.

**What UI shows (Fact):**

- Workflow status (RU labels), lockHeld / no lock, current step/task keys (RU), attempt count of **resolved** current task, `nextRunAt`, `terminalReason`, safe last error.
- Flat ordered **steps** list + flat **tasks** list (task shows step + status + attempt + lastErrorMessage).
- Loading / empty / error / actionError / «Обновляем статус…» while polling.

### 3.3 Portal autofill (legacy) — still present

| Path | Role |
|------|------|
| `web/src/entities/portal-autofill/` | RegisterUser types, eligibility, POST helpers, RU labels |
| `web/src/widgets/portal-autofill-evidence/` | Applicant select + trigger + run list + screenshot open |
| `web/src/app/providers/StoreProvider.tsx` | Still owns `listPortalAutofillRuns` / `runPortalAutofill` via `apiRequest` |

**Fact:** Autofill widget still uses store methods; **BLS workflow API helpers live in the entity** (`apiRequest` / `apiRequestRaw` from `@/shared/api`) — not StoreProvider. Two client patterns coexist.

### 3.4 Auth / roles (Facts)

- Backend `@Roles('admin', 'manager')` on `BlsWorkflowController`.
- SPA staff shells: `staffBase` → `/owner` (admin) or `/admin` (non-admin staff / manager). Client role has no application-detail autofill staff path in the same way (application detail is staff-gated by routing).
- **Assumption:** Client never sees Автозаполнение tab content in production routes (consistent with existing staff app layout).

### 3.5 Russian copy (Facts)

- Panel copy: «Сценарий BLS», «Запустить», «Повторить», «Пауза», «Отменить», empty/loading strings in `BLS_WORKFLOW_PANEL_COPY`.
- Status/step/task labels in `BLS_WORKFLOW_*_LABEL_RU`.
- Backend Russian `{ detail }` constants (e.g. «Сценарий не найден», «Повтор недоступен для текущего состояния»).

### 3.6 Accessibility (Facts)

- Application detail tabs use `role="tab"` / `aria-selected` / `role="tabpanel"`.
- **BlsWorkflowPanel** itself: no `aria-live` for poll updates; buttons are native `Btn` without described-by error linkage beyond visible text.
- **Assumption:** Product expects incremental a11y improvements (live region for status changes) rather than WCAG formal certification in this feature.

---

## 4. Backend API inventory (Facts)

### 4.1 Controller

`backend/src/modules/portal-scrape/bls-workflow.controller.ts` — `@Controller('apps')`, JWT + Roles `admin`|`manager`.

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/apps/:applicationId/bls-workflow` | Start; body `{ supersede?: boolean }`; **201** |
| GET | `/api/apps/:applicationId/bls-workflow` | Latest snapshot (active preferred via service) |
| GET | `/api/apps/:applicationId/bls-workflow/:workflowId` | Explicit id snapshot |
| GET | `/api/apps/:applicationId/bls-workflow/:workflowId/events` | Query `sinceEventId`, `limit` |
| POST | `…/:workflowId/retry` | Body `{ taskId?: string }` |
| POST | `…/:workflowId/resume` | Short control out |
| POST | `…/:workflowId/pause` | Short control out |
| POST | `…/:workflowId/cancel` | Short control out |

### 4.2 Snapshot shape (Fact — code)

From `backend/src/modules/portal-scrape/types/bls-workflow-api.types.ts` / SPA mirror:

```ts
// Response example shape (fields only; values illustrative)
{
  workflowId: "wf_…",
  applicationId: "app_…",
  status: "RUNNING", // PENDING|RUNNING|WAITING_RETRY|WAITING_STAFF|PAUSED|
                     // AWAITING_STAFF_BOOKING|COMPLETED|FAILED|CANCELLED|ABANDONED
  currentStepKey: "STATUS_VALIDATE",
  currentTaskKey: "STATUS_APPLICANT",
  nextRunAt: "2026-09-22T12:00:00.000Z",
  lockHeld: true,
  terminalReason: null,
  steps: [
    { stepKey: "REGISTER", ordinal: 1, status: "COMPLETED", skipReason: null },
    { stepKey: "LOGIN", ordinal: 2, status: "COMPLETED", skipReason: null },
    { stepKey: "PASSWORD_CHANGE", ordinal: 3, status: "SKIPPED", skipReason: "…" },
    { stepKey: "STATUS_VALIDATE", ordinal: 4, status: "RUNNING", skipReason: null },
    { stepKey: "BOOK", ordinal: 5, status: "PENDING", skipReason: null }
  ],
  tasks: [
    {
      stepKey: "STATUS_VALIDATE",
      taskKey: "STATUS_APPLICANT",
      applicantId: "apl_1",
      ordinal: 1,
      status: "RUNNING",
      attemptCount: 2,
      lastErrorClass: null,
      lastErrorMessage: null
    }
  ],
  updatedAt: "2026-09-22T12:00:01.000Z"
}
```

**Not in snapshot DTO (Fact):** task `id`, `maxAttempts`, `lastErrorCode`, event timeline, vault secrets, `lockOwner`.

### 4.3 Events API (Fact — code)

```ts
// GET …/events?sinceEventId=0&limit=100
{
  workflowId: "wf_…",
  workflowStatus: "RUNNING",
  events: [
    {
      id: 42,
      eventType: "TASK_FAILED", // see BLS_WORKFLOW_EVENT_TYPE
      stepKey: "LOGIN",
      taskKey: "LOGIN_AUTH",
      payloadSafe: { /* no secrets */ },
      createdAt: "2026-09-22T12:00:00.000Z"
    }
  ],
  latestEventId: 42
}
```

| Constant | Value |
|----------|-------|
| Default `limit` | `BLS_WORKFLOW_EVENTS_DEFAULT_LIMIT = 100` |
| Max `limit` | `BLS_WORKFLOW_EVENTS_MAX_LIMIT = 200` |
| Missing `sinceEventId` | Parsed as `0` |

Event types (Fact): `WORKFLOW_CREATED`, `TASK_COMPLETED`, `STEP_COMPLETED`, `STEP_SKIPPED`, `TASK_FAILED`, `WORKFLOW_STATUS_CHANGED`, `WORKFLOW_ABANDONED`, `AWAITING_STAFF_BOOKING`, `AUTOFILL_RUN_LINKED` (`payloadSafe.runId`).

**SPA usage (Fact):** **None** — no `fetchBlsWorkflowEvents` util; ISSUE-003 confirmed in code.

### 4.4 Control / error details (Facts)

Russian details from `bls-workflow.constants.ts` include:

| Situation | detail |
|-----------|--------|
| Active exists | «Для этой заявки уже выполняется сценарий BLS» |
| Not found | «Сценарий не найден» |
| Live lock | «Сценарий уже выполняется» |
| Retry not eligible | «Повтор недоступен для текущего состояния» |
| Resume / pause / cancel not eligible | matching «…недоступн…» strings |

### 4.5 Multi-applicant (Facts)

- Graph draft: `STATUS_VALIDATE` creates **one `STATUS_APPLICANT` task per `applicantId`** (`build-bls-workflow-step-task-drafts.util.ts`).
- Snapshot exposes `tasks[].applicantId`.
- SPA lists `applicantId` only inside React `key`; **does not display** applicant name/id to staff.
- SPA `findBlsWorkflowCurrentTask` matches `stepKey + taskKey` only — **ambiguous** when multiple `STATUS_APPLICANT` rows share the same `taskKey` (returns first match).

### 4.6 Secret hygiene (Facts)

- API types document: never vault / Mail.tm token / DEK / portal password / `lockOwner`.
- SPA surfaces `lastErrorMessage` / `lastErrorClass` / `terminalReason` / `payloadSafe` (if wired) — must remain safe-only.
- No secrets observed in TASK-015 types.

### 4.7 CON-006 / `AWAITING_STAFF_BOOKING` (Facts)

- Backend terminal success for BOOK stop: status **`AWAITING_STAFF_BOOKING`** (DEC-010).
- SPA treats it as **terminal** → poll stops; RU label «Ожидает записи сотрудником».
- **Gap:** no dedicated success/handoff callout (what staff must do next: finish VisaType / payment manually); `terminalReason` may or may not explain CON-006.

---

## 5. Realtime evidence table (Facts vs Assumptions)

| Transport | Present in repo? | Evidence | Used by SPA today? |
|-----------|------------------|----------|--------------------|
| **Poll snapshot GET** | **Yes (Fact)** | `BlsWorkflowPanel` `setInterval` 3s → `fetchBlsWorkflow`; backend `getSnapshotForApplication` | **Yes** |
| **Poll events GET** | **Yes (Fact)** | Controller `listEvents`; `sinceEventId` + `limit`; TASK-013 DONE | **No** (ISSUE-003) |
| **SSE / EventSource** | **No (Fact)** | Grep `web/src`: no `EventSource` / SSE; `web/package.json`: no SSE client | No |
| **WebSocket / socket.io / `@nestjs/websockets` / `ws`** | **No (Fact)** | Grep `web/src`: no WebSocket; `backend/package.json` dependencies: **none** of `ws`, `socket.io`, `@nestjs/websockets`; Nest platform is Express only | No |
| Invent new WS for this feature | **Assumption if proposed** | Would require new deps + gateway + nginx/proxy sticky considerations | Not justified by current stack |

**Re-evaluation conclusion (discovery, not DEC):** Prefer **existing HTTP poll infra**. Snapshot poll already works. Events poll exists and is unused — lowest-cost way to address ISSUE-003 / richer timeline. Introducing WebSocket would be **greenfield** relative to Facts; any later transport choice is an **architect DEC**, constrained by CON against inventing WS without justification.

---

## 6. TASK-015 shipped vs gaps

| Capability | TASK-015 | Gap for this initiative |
|------------|----------|-------------------------|
| Poll snapshot ~3s | Done | Keep; optionally refresh more smartly when events advance |
| Start / supersede / retry / resume / pause / cancel | Done | Retry always default task (no `taskId`); snapshot lacks task `id` to target |
| Step/task lists | Flat lists | Weak **step viz** (no progress rail / REGISTER→BOOK emphasis); no “current” highlight beyond cursor fields |
| Per-task status / attempts / safe error | Partial | Attempt shown; **no maxAttempts**; error class shown; no next-retry semantics beyond `nextRunAt` |
| Multi-applicant | API has `applicantId` | **Not displayed**; current-task resolution **ambiguous** for duplicate `taskKey` |
| Events / timeline | API ready | **Unused** (ISSUE-003) |
| `AUTOFILL_RUN_LINKED` → evidence | Backend can emit | SPA does not deep-link runId to autofill widget |
| CON-006 handoff UX | Label only | Needs clear staff booking takeover presentation |
| Dual Автозаполнение | Panel + legacy | Prefer **extend** (already); clarify product primacy of workflow vs diagnostic RegisterUser |
| Loading/error/empty | Done | Keep; improve a11y live updates |
| Secrets | Done | Preserve |

---

## 7. Impact map

| Area | Impact |
|------|--------|
| `web/src/entities/bls-workflow/` | Types (events, optional task id if API extended), fetch events util, current-task resolution, labels |
| `web/src/widgets/bls-workflow-panel/` | Viz, timeline, CON-006 banner, controls, polling strategy |
| `web/src/pages/application-detail/` | Tab composition (extend vs replace legacy) |
| `web/src/widgets/portal-autofill-evidence/` | Optional deep-link / demotion of primary CTA |
| `web/src/shared/api/` | Reuse `apiRequest` / `apiRequestRaw` — no WS client |
| Backend | **Prefer no redesign**; possible **small** DTO add (`tasks[].id`, `maxAttempts`) if architect accepts for per-task retry — out of SPA-only if blocked |

---

## 8. Risks (discovery)

| ID | Risk | Notes |
|----|------|-------|
| RISK-D01 | Snapshot-only poll misses fine-grained transitions between 3s ticks | Events poll mitigates without WS |
| RISK-D02 | Ambiguous current task for multi-applicant STATUS_APPLICANT | Wrong attempt/error shown; wrong retry eligibility |
| RISK-D03 | Dual UI confuses operators (workflow vs RegisterUser) | Copy + primacy rules needed |
| RISK-D04 | Exposing raw `payloadSafe` / error strings that later leak secrets | Keep allowlist / display rules |
| RISK-D05 | Architect invents WS despite empty stack | CON + evidence table oppose unless justified |
| RISK-D06 | `AWAITING_STAFF_BOOKING` looks like failure if styling not success-oriented | CON-006 UX risk |

---

## 9. Facts vs Assumptions (summary)

| ID | Type | Statement |
|----|------|-----------|
| F1 | Fact | TASK-015 panel polls snapshot GET every 3s; stops on terminal including `AWAITING_STAFF_BOOKING` |
| F2 | Fact | Events GET API implemented; SPA never calls it (ISSUE-003) |
| F3 | Fact | No WebSocket / SSE / socket.io / `@nestjs/websockets` / `ws` in SPA or backend `package.json` |
| F4 | Fact | Автозаполнение tab already dual-mode: workflow panel + legacy autofill evidence |
| F5 | Fact | Snapshot includes `applicantId` on tasks; SPA does not display it |
| F6 | Fact | Snapshot omits task `id` and `maxAttempts` |
| F7 | Fact | Staff APIs are JWT `admin`\|`manager`; Russian `detail` errors |
| F8 | Fact | Upstream DEC-006 / CON-003 preferred HTTP poll over WS/SSE |
| A1 | Assumption | Extending the existing tab (workflow primary, RegisterUser secondary) remains preferred product integration |
| A2 | Assumption | ~3s poll latency is acceptable if events poll improves timeline fidelity |
| A3 | Assumption | Small backend DTO additions (task id) may be allowed if architect scopes them; not assumed Must |
| A4 | Assumption | Client role remains out of workflow UI |

---

## 10. Open questions (for spec / architect)

1. **Realtime transport:** Stay on snapshot poll only; add events poll; or (only with DEC + infra) introduce WS/SSE? Evidence favors poll + events.
2. **Автозаполнение integration:** Keep dual-mode (prefer); demote/hide legacy RegisterUser trigger; or replace entirely?
3. **Per-task retry:** Accept default-current-task retry only, or expose `tasks[].id` in snapshot for targeted retry?
4. **Multi-applicant display:** Show applicant id only, or resolve CRM applicant name from application form props?
5. **CON-006 banner:** Exact Russian operator instructions for `AWAITING_STAFF_BOOKING`?
6. **Event timeline UX:** Full history list vs last-N toast strip vs both?

---

## 11. Phase gate

- Phase 0 discovery (**this doc**): **complete**.
- Spec identifiers SoT: `specs/features/bls-workflow-frontend/02-spec.md` → **SPECIFIED**.
- Architect design/plan/tasks: **READY_FOR_IMPLEMENTATION** — see [`README.md`](./README.md), [`HANDOFF.md`](./HANDOFF.md). OQ-001…006 resolved via DEC-001…006 in [`01-target-ux.md`](./01-target-ux.md).
- Product IMPLEMENTING: **not started**.
