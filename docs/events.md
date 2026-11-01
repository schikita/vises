# Workflow bus events (RabbitMQ)

Source of truth: `@vises/contracts` payload/routing-key definitions, plus AMQP topology and publish/consume code in `apps/api` and `apps/workflow-worker`.

This document covers **cross-process RabbitMQ messages** on the workflow bus only. HTTP envelopes such as `AppsUpsertArmResponse` (`packages/contracts/src/types/apps-upsert-arm.types.ts`) share the same `MessageEnvelope` shape but are **not** RabbitMQ events.

## Topology

| Name | Exact string | Declared in |
|------|--------------|-------------|
| Exchange | `vises.workflow` | `WORKFLOW_BUS_EXCHANGE` in `apps/api/src/modules/messaging/constants/workflow-bus.constants.ts` and `apps/workflow-worker/src/modules/messaging/constants/workflow-bus.constants.ts` (identical values) |
| Exchange type | `topic` | `WORKFLOW_BUS_EXCHANGE_TYPE` (same two files) |
| Run queue | `workflow-worker.run` | `WORKFLOW_BUS_QUEUE_RUN` |
| Abort queue | `workflow-worker.abort` | `WORKFLOW_BUS_QUEUE_ABORT` |
| DLQ name constant | `vises.workflow.dlq` | `WORKFLOW_BUS_DLQ` (exported only; **not** asserted, bound, or consumed — see [Retry and DLQ](#retry-and-dlq)) |

Bindings (asserted by both publisher `onModuleInit` and consumer `onModuleInit`):

| Queue | Routing keys |
|-------|----------------|
| `workflow-worker.run` | `workflow.created`, `workflow.schedule`, `workflow.resume`, `workflow.retry` |
| `workflow-worker.abort` | `workflow.abort` |

Messaging lives under `apps/*/src/modules/messaging/` (not `apps/api/src/shared/`). Connection URL: `RABBITMQ_URL` (required; fail-closed). Compose service: `rabbitmq` in `docker-compose.yml` (`rabbitmq:4.1-management-alpine`).

## Shared envelope

All RabbitMQ bodies must be JSON `MessageEnvelope`:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `correlationId` | `string` (non-empty after trim) | yes | Correlation id; also set as AMQP `correlationId` property on publish |
| `payload` | typed per routing key | yes | Event-specific payload (key must be present; value may be any JSON) |

- Schema: `packages/contracts/src/types/message-envelope.types.ts`
- Runtime guard (duplicated, not in contracts): `apps/api/src/modules/messaging/utils/is-message-envelope.util.ts` and `apps/workflow-worker/src/modules/messaging/utils/is-message-envelope.util.ts`
- Publisher rejects non-envelopes; consumer `nack`s invalid bodies

Publish options (API): `contentType: application/json`, `persistent: true`.

## Event catalog (summary)

| Name (logical) | Routing key | Producer(s) | Consumer(s) | Schema path |
|----------------|-------------|-------------|-------------|-------------|
| Workflow created | `workflow.created` | `apps` module → `AppsService` | `workflow-worker` → `WorkflowBusConsumerService.handleRunMessage` | `packages/contracts/src/types/workflow-message.types.ts` (`WorkflowCreatedPayload`) |
| Workflow schedule | `workflow.schedule` | `apps` → `AppsService`; `bls-workflow` → `BlsWorkflowService.publishScheduleNudge` | same run handler | `…/workflow-message.types.ts` (`WorkflowSchedulePayload`) |
| Workflow abort | `workflow.abort` | `bls-workflow` → `BlsWorkflowService.publishAbort` | `WorkflowBusConsumerService.handleAbortMessage` | `…/workflow-message.types.ts` (`WorkflowAbortPayload`) |
| Workflow resume | `workflow.resume` | **none in repo** (bound only) | run handler would receive if published | `…/workflow-message.types.ts` (`WorkflowResumePayload`) |
| Workflow retry | `workflow.retry` | **none in repo** (bound only) | run handler would receive if published | `…/workflow-message.types.ts` (`WorkflowRetryPayload`) |

Routing-key constants: `packages/contracts/src/constants/workflow-routing-key.constants.ts` (`WORKFLOW_ROUTING_KEYS`).

---

## Events in detail

### 1. `workflow.created`

| Attribute | Value |
|-----------|--------|
| Event name / routing key | `workflow.created` (`WORKFLOW_ROUTING_KEYS.CREATED`) |
| Exchange | `vises.workflow` |
| Queue | `workflow-worker.run` |
| Schema | `packages/contracts/src/types/workflow-message.types.ts` → `WorkflowCreatedMessage` / `WorkflowCreatedPayload` |

**Payload fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `workflowId` | `string` | yes (contract) | New workflow id |
| `applicationId` | `string` | yes (contract) | Application id |

Envelope: `{ correlationId, payload }` as above.

**Producer**

- Module: `apps` (`apps/api/src/modules/apps/`)
- Service: `AppsService` (`apps/api/src/modules/apps/apps.service.ts`)
- Path: after staff upsert arms a workflow with `ensured.created && ensured.workflowId`, calls `WorkflowBusPublisherService.publish` with `WORKFLOW_ROUTING_KEYS.CREATED`
- Publisher infrastructure: `apps/api/src/modules/messaging/workflow-bus-publisher.service.ts`

**Consumer**

- App: `apps/workflow-worker`
- Handler: `WorkflowBusConsumerService.handleRunMessage` (`apps/workflow-worker/src/modules/messaging/workflow-bus-consumer.service.ts`)
- Behavior: if `payload.workflowId` is a non-empty string and (for non-schedule keys) due time is treated as now, may set `workflow.nextRunAt` when currently `null`, then always `runner.tick()`, then `ack`

**Idempotency**

- No message-id / processed-message store keyed by `correlationId`
- Side effect is conditional: sets `nextRunAt` only when `workflow.nextRunAt == null`, then invokes claim loop (`BlsWorkflowRunner.tick`) whose durable claim/lock is DB-backed
- Duplicate creates can still call `tick()` repeatedly

**Retry / DLQ**

- On handler error: `nack(msg, false, false)` (no requeue). See [Retry and DLQ](#retry-and-dlq).

**Ordering**

- Consumer channel `prefetch(1)`. No cross-message ordering guarantee beyond single-consumer prefetch. Durable work ordering is via DB `nextRunAt` / claim, not the queue.

**Versioning**

- Not versioned on the wire (no `version` / schema id in envelope). Package `@vises/contracts` is `0.1.0`. Breaking payload changes require an explicit migration plan (new routing key or coordinated deploy).

**Outbox**

- Not used. Publish reliability relies on a synchronous `channel.publish` after the HTTP/DB path; failure fails the upsert await (no try/catch around these publishes in `AppsService`).

---

### 2. `workflow.schedule`

| Attribute | Value |
|-----------|--------|
| Event name / routing key | `workflow.schedule` (`WORKFLOW_ROUTING_KEYS.SCHEDULE`) |
| Exchange | `vises.workflow` |
| Queue | `workflow-worker.run` |
| Schema | `packages/contracts/src/types/workflow-message.types.ts` → `WorkflowScheduleMessage` / `WorkflowSchedulePayload` |

**Payload fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `workflowId` | `string` | yes (contract) | Workflow id to nudge |
| `applicationId` | `string` | yes (contract) | Application id |
| `scheduledAt` | `string` | yes (contract) | ISO-8601 timestamp |
| `batchId` | `string` | no | Optional batch id (contract comment: future App3; **no publisher sets it today**) |

**Producers**

1. `AppsService` (`apps/api/src/modules/apps/apps.service.ts`): after arming when `ensured.workflowId && ensured.workflowAction !== 'none'`, publishes with `scheduledAt: new Date().toISOString()` and the same `correlationId` as the optional `workflow.created` in that request.
2. `BlsWorkflowService.publishScheduleNudge` (`apps/api/src/modules/bls-workflow/bls-workflow.service.ts`): called from `retry` and `resume` after durable `nextRunAt = now`. Uses a fresh `randomUUID()` correlation id. Publish errors are caught and logged (`workflow_bus_schedule_nudge_publish_failed`); HTTP still succeeds.

**Consumer**

- Same run handler as created. For this routing key, due time is parsed from `payload.scheduledAt` (invalid → treated as now). If `when <= Date.now() + 1000` and `nextRunAt == null`, sets `nextRunAt` then `runner.tick()`.

**Idempotency / retry / ordering / versioning**

- Same pattern as `workflow.created` (no bus-level idempotency key store; `nack` without requeue; prefetch 1; schema not versioned).

**Outbox**

- Not used. Apps upsert: sync publish. Staff resume/retry nudge: best-effort publish after DB write (errors swallowed).

---

### 3. `workflow.abort`

| Attribute | Value |
|-----------|--------|
| Event name / routing key | `workflow.abort` (`WORKFLOW_ROUTING_KEYS.ABORT`) |
| Exchange | `vises.workflow` |
| Queue | `workflow-worker.abort` |
| Schema | `packages/contracts/src/types/workflow-message.types.ts` → `WorkflowAbortMessage` / `WorkflowAbortPayload` |

**Payload fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `workflowId` | `string` | yes (contract) | Workflow to abort in-flight |
| `applicationId` | `string` | yes (contract) | Application id |
| `reason` | `'pause' \| 'cancel' \| 'supersede'` | yes (contract) | Abort reason |

**Producer**

- Module: `bls-workflow`
- Service: `BlsWorkflowService.publishAbort` (`apps/api/src/modules/bls-workflow/bls-workflow.service.ts`)
- Call sites: `pause` → reason `'pause'`; `cancel` → reason `'cancel'`
- Contract allows `'supersede'`; **no publisher in this repo emits `reason: 'supersede'`** over RabbitMQ
- Errors caught and logged (`workflow_bus_abort_publish_failed`)

**Consumer**

- `WorkflowBusConsumerService.handleAbortMessage`
- Casts payload to `WorkflowAbortPayload`; if `workflowId` non-empty, calls `BlsWorkflowAbortRegistry.requestAbort(workflowId)`, then `ack`

**Idempotency**

- Bus: no dedup by `correlationId`
- Process-local: `BlsWorkflowAbortRegistry.requestAbort` is a no-op when no attempt entry exists; if already aborted, does not re-abort the controller (`apps/workflow-worker/src/modules/bls-workflow/bls-workflow-abort.registry.ts`)

**Retry / DLQ / ordering / versioning / outbox**

- Same as other keys: `nack` without requeue on parse/handler failure; no wired DLQ; no outbox (best-effort publish after control-plane DB/abort-local signal); schema not versioned.

---

### 4. `workflow.resume` (contract + binding only)

| Attribute | Value |
|-----------|--------|
| Routing key | `workflow.resume` |
| Exchange / queue | `vises.workflow` → `workflow-worker.run` |
| Schema | `WorkflowResumePayload`: `workflowId`, `applicationId` (both `string`, required in contract) |
| Producer | **None.** Staff resume publishes `workflow.schedule` via `publishScheduleNudge`, not this key. |
| Consumer | Bound to run queue; handler does not special-case this key (same as created: due = now). |

---

### 5. `workflow.retry` (contract + binding only)

| Attribute | Value |
|-----------|--------|
| Routing key | `workflow.retry` |
| Exchange / queue | `vises.workflow` → `workflow-worker.run` |
| Schema | `WorkflowRetryPayload`: `workflowId`, `applicationId` (both `string`, required in contract) |
| Producer | **None.** Staff retry publishes `workflow.schedule` via `publishScheduleNudge`, not this key. |
| Consumer | Bound to run queue; no special-case beyond shared run handling. |

---

## Retry and DLQ

| Mechanism | Evidence |
|-----------|----------|
| Requeue on failure | **No.** Both handlers call `channel.nack(msg, false, false)`. |
| Backoff | **None** in messaging code. |
| Dead-letter exchange / queue args | **Not configured.** Queues are asserted `{ durable: true }` only — no `x-dead-letter-exchange` / `x-dead-letter-routing-key`. |
| `WORKFLOW_BUS_DLQ` (`vises.workflow.dlq`) | Constant exists and is re-exported from messaging `constants/index.ts` in both apps; **never referenced** by `assertQueue`, bind, publish, or consume. |
| Who inspects DLQ | **Nobody in code.** RabbitMQ management UI on compose ports `15672` is available for operators; no app DLQ consumer. |

Failed messages are therefore discarded by the broker after `nack` without requeue (unless a broker policy outside this repo is applied — **Unverified** here).

## Outbox

No transactional outbox table, publisher, or relay exists under `apps/api` or `apps/workflow-worker`.

Publish reliability relies on:

1. Durable topic exchange + durable queues + `persistent: true` messages after a successful `channel.publish`
2. Live AMQP connection established at module init (`RABBITMQ_URL` fail-closed)
3. Call-site behavior: upsert awaits publish (propagates errors); pause/cancel/resume/retry nudges log and continue on publish failure

## Ordering guarantees

- Channel `prefetch(1)` on the worker consumer limits unacked in-flight messages per consumer channel.
- Topic exchange does not provide total order across routing keys or producers.
- Authoritative scheduling/execution order is the PostgreSQL workflow claim model (`nextRunAt`, locks), woken by these messages — not FIFO semantics of the bus.

## Versioning

- Wire schema: **not versioned** (envelope is only `correlationId` + `payload`).
- Type/source of truth: `@vises/contracts` (`package.json` version `0.1.0`).
- Breaking changes to payloads or routing keys require a coordinated migration plan (new key and dual publish/consume, or lockstep deploy). There is no in-message schema version field today.

## Known gaps

| Gap | Evidence |
|-----|----------|
| DLQ constant unused | `WORKFLOW_BUS_DLQ` defined in both apps’ `workflow-bus.constants.ts` but never asserted/bound/consumed; `nack(..., requeue=false)` with no DLQ args |
| No bus-level idempotency | `correlationId` logged and set as AMQP property; no processed-message store; run path only guards `nextRunAt == null` before set |
| No outbox | Direct `channel.publish` only |
| `workflow.resume` / `workflow.retry` never published | Keys in `@vises/contracts` and queue bindings; HTTP resume/retry publish `workflow.schedule` instead (`BlsWorkflowService.publishScheduleNudge`) |
| `WorkflowAbortReason` includes `'supersede'` but no Rabbit publish uses it | Contract in `workflow-message.types.ts`; `publishAbort` only accepts `'pause' \| 'cancel'` |
| `batchId` unused by producers | Optional on `WorkflowSchedulePayload`; no current publisher sets it (`packages/contracts/src/index.ts` notes future App3) |
| Topology constants duplicated outside contracts | Identical exchange/queue/DLQ strings copied in `apps/api` and `apps/workflow-worker` messaging constants (values match byte-for-byte; not centralized in `@vises/contracts`) |
| Envelope guard duplicated | `is-message-envelope.util.ts` copied in both apps rather than living in `@vises/contracts` |
| Messaging not under `src/shared/` | Implementation is `modules/messaging` in each app |

## Open questions

| Claim | Reason unverified | Marked |
|-------|-------------------|--------|
| Broker-side DLQ/policy may exist outside repo | No RabbitMQ definitions/policies in-repo beyond compose image + app `assert*` | Unverified — operators must check the live broker |
| Multi-worker competing consumers on the same queues | Compose runs one `workflow-worker` service; horizontal scale not evidenced in code | Unverified |

## Related non-bus contracts

| Type | Path | Note |
|------|------|------|
| `AppsUpsertArmResponse` | `packages/contracts/src/types/apps-upsert-arm.types.ts` | HTTP arming response envelope; not a RabbitMQ routing key |
