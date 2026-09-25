# Phase 3 — Workflow API (durable BLS workflow)

| Field | Value |
|-------|-------|
| Feature id | `durable-bls-workflow` |
| Status | **DESIGNED** |
| Date | 2026-09-22 |
| Architecture | [`01-target-architecture.md`](./01-target-architecture.md) |
| Spec refs | REQ-001, REQ-005–006, REQ-022–024, NFR-001–003, DEC-006, DEC-010, DEC-015 |

---

## 1. Conventions

| Topic | Rule |
|-------|------|
| Base | Nest `@Controller('apps')` → HTTP `/api/apps/...` (global prefix **Fact**) |
| Auth | JWT Bearer; roles **`admin` \| `manager`** only (REQ-022) |
| Errors | Russian `{ detail: string }` consistent with autofill (NFR-001) |
| Secrets | **Never** in responses (vault, Mail.tm token, DEK, portal password) |
| Control plane | Short responses; browser work via runner (REQ-023) |
| Locale fields | camelCase JSON |

Conflict / lock → **409** with Russian detail (autofill parity).

---

## 2. Endpoints

### 2.1 Start

`POST /api/apps/:applicationId/bls-workflow`

```ts
// Request
type StartBlsWorkflowBody = {
  supersede?: boolean; // abandon active workflow if present
};

// Response 201
type StartBlsWorkflowOut = {
  workflowId: string;
  status: string; // PENDING | RUNNING | …
  applicationId: string;
};
```

| Case | HTTP | Detail (RU theme) |
|------|------|-------------------|
| Active exists, no supersede | 409 | Workflow already active for application |
| App missing | 404 | Application not found |
| Success | 201 | — |

Creates steps/tasks; sets `nextRunAt=now`; returns immediately.

### 2.2 Get (snapshot)

`GET /api/apps/:applicationId/bls-workflow`

Returns **latest** workflow for app (active preferred, else newest terminal).

```ts
type BlsWorkflowOut = {
  workflowId: string;
  applicationId: string;
  status: string;
  currentStepKey: string | null;
  currentTaskKey: string | null;
  nextRunAt: string | null; // ISO
  lockHeld: boolean; // derived; no lockOwner secret needed
  terminalReason: string | null;
  steps: Array<{
    stepKey: string;
    ordinal: number;
    status: string;
    skipReason: string | null;
  }>;
  tasks: Array<{
    id: string; // additive (DEC-003 / bls-workflow-frontend) — retry body.taskId
    stepKey: string;
    taskKey: string;
    applicantId: string | null;
    ordinal: number;
    status: string;
    attemptCount: number;
    maxAttempts: number; // additive (DEC-003) — attempt budget display
    lastErrorClass: string | null;
    lastErrorMessage: string | null;
  }>;
  updatedAt: string;
};
```

Optional: `GET /api/apps/:applicationId/bls-workflow/:workflowId` for explicit id.

### 2.3 Events poll (realtime)

`GET /api/apps/:applicationId/bls-workflow/:workflowId/events?sinceEventId=&limit=`

```ts
type BlsWorkflowEventsOut = {
  workflowId: string;
  workflowStatus: string;
  events: Array<{
    id: number;
    eventType: string;
    stepKey: string | null;
    taskKey: string | null;
    payloadSafe: Record<string, unknown>;
    createdAt: string;
  }>;
  latestEventId: number | null;
};
```

Staff UI: poll every **3s** while non-terminal (**DEC-006**); also refresh snapshot GET.

**No** WebSocket/SSE Must.

### 2.4 Manual retry

`POST /api/apps/:applicationId/bls-workflow/:workflowId/retry`

```ts
type RetryBlsWorkflowBody = {
  taskId?: string; // optional; default = current failed/waiting task
};

type RetryBlsWorkflowOut = {
  workflowId: string;
  status: string;
  nextRunAt: string | null;
};
```

Eligibility: failed / waiting staff / exhausted auto; not when live non-stale lock (409). Clears human gate; sets `nextRunAt=now`; may reset attempt window per policy (document: retry allows +N attempts or resets count — **Assumption:** manual retry resets `attempt_count` budget for that task).

### 2.5 Resume

`POST /api/apps/:applicationId/bls-workflow/:workflowId/resume`

For `PAUSED` or `WAITING_RETRY` / `WAITING_STAFF` when eligible — alias semantics: unpause + schedule now. Prefer separate from retry if pause-only.

### 2.6 Pause

`POST /api/apps/:applicationId/bls-workflow/:workflowId/pause`

Sets `PAUSED` (non-terminal, resumable); clears workflow and current-task `nextRunAt` so the runner must not claim or auto-retry while paused. If an attempt is in flight, **immediately signals abort** of portal/browser automation for that `workflowId` (force-close hooks; proxy release via existing `finally`). The HTTP handler persists status + schedule clear, signals abort, and returns — it does **not** await full browser teardown. Resume / manual retry are the paths to run again.

### 2.7 Cancel

`POST /api/apps/:applicationId/bls-workflow/:workflowId/cancel`

→ `CANCELLED` (terminal); release lock; clear workflow and current-task `nextRunAt`; schedule mailbox cleanup per policy. Same class of **immediate abort** of in-flight portal/browser work as pause. No auto-retry after cancel. HTTP remains short (signal + durable write + return; do not await browser close).

### 2.8 Supersede

Preferred via `start` with `supersede: true` (autofill parity). Optional dedicated:

`POST /api/apps/:applicationId/bls-workflow/:workflowId/supersede` → abandon + create new (or only abandon).

**DEC-013:** prior → `ABANDONED`.

---

## 3. Relationship to legacy autofill APIs

| Endpoint | Fate |
|----------|------|
| `POST …/portal-autofill` | **410 Gone** — non-executing; registration starts only via BLS workflow (`portal-autofill-workflow-cutover` DEC-002 / REQ-003) |
| `GET …/portal-autofill-runs` | Remains; REGISTER step may link `runId` in events/payloadSafe |
| `GET …/portal-autofill-runs/:runId/screenshot` | Remains; staff open via workflow `AUTOFILL_RUN_LINKED` event |
| `POST …/portal-login-prep` | Remains as diagnostic one-shot (non-REGISTER); workflow LOGIN is the product path for full auth |

Staff SPA control on **Автозаполнение** is **bls-workflow** only (`BlsWorkflowPanel`). Legacy RegisterUser start UI is removed.

---

## 4. AuthZ matrix

| Role | start/retry/… | get/events | secrets |
|------|---------------|------------|---------|
| admin | yes | yes | never |
| manager | yes | yes | never |
| client | no | no | no |

---

## 5. Error catalog (illustrative Russian `detail`)

| Code / situation | HTTP | detail |
|------------------|------|--------|
| Active workflow exists | 409 | Для этой заявки уже выполняется сценарий BLS |
| Live lock | 409 | Сценарий уже выполняется |
| Not eligible retry | 400 | Повтор недоступен для текущего состояния |
| Not found | 404 | Сценарий не найден |
| Master key missing | 503 | Шифрование учётных данных не настроено |

---

## 6. Phase gate

API shapes fixed for implementers (TASK-013 / TASK-014). **No product code in this phase.**

---

## 7. Nest packaging note (portal-scrape-module-split)

HTTP paths, auth roles, and response contracts in this document are unchanged. Implementation ownership after the packaging split: workflow controller/runner/executor → `BlsWorkflowModule`; domain clients + `PROXY_PROVIDER` → `BlsClientsModule`; fill/captcha → `PortalFillModule`; vault → `BlsSecretsModule`; temporary-email factory → `BrowserMailModule`. `AppModule` still imports only the `PortalScrapeModule` façade. Operator module map: [`backend/docs/modules/portal-scrape.md`](../../backend/docs/modules/portal-scrape.md) § Nest module map.
