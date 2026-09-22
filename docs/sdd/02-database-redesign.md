# Phase 2 — Database redesign (durable BLS workflow)

| Field | Value |
|-------|-------|
| Feature id | `durable-bls-workflow` |
| Status | **DESIGNED** |
| Date | 2026-09-22 |
| Architecture | [`01-target-architecture.md`](./01-target-architecture.md) |
| Spec refs | REQ-001, REQ-004–008, REQ-014, REQ-016, REQ-026, NFR-006; DEC-005, DEC-010, DEC-012, DEC-020 |

---

## 1. Current schema assessment (Facts)

| Entity / table | Role today | Gap vs target |
|----------------|------------|---------------|
| `applications` | CRM; `portal_form_email`; jsonb `applicants` | No vault FK; no workflow pointer |
| `portal_autofill_runs` | RegisterUser lifecycle, checkpoints, lock, captcha CB, evidence | Single-stage only; no password vault; not multi-step SoT |
| `proxy6_proxies` | Inventory + lease | Unchanged; lease reused |
| `users` / `settings` | Auth / flags (`emailOtpEnabled`) | Unchanged for CRM auth |
| — | No workflow/step/task/attempt/event/secret tables | **Must add** (REQ-026) |

**Conclusion:** Keep existing tables. Add `bls_*` graph as **source of truth**. Link RegisterUser runs optionally (**DEC-012**). No destructive drop of `portal_autofill_runs`.

---

## 2. Target ERD

```mermaid
erDiagram
  applications ||--o| bls_workflows : "one active non-terminal"
  bls_workflows ||--|{ bls_workflow_steps : has
  bls_workflow_steps ||--|{ bls_workflow_tasks : has
  bls_workflow_tasks ||--|{ bls_workflow_attempts : has
  bls_workflows ||--|{ bls_workflow_events : emits
  bls_workflows ||--|{ bls_secret_vault : secrets
  bls_workflow_steps }o--o| portal_autofill_runs : "nullable link REGISTER"

  applications {
    varchar id PK
    varchar portal_form_email
    jsonb applicants
  }

  bls_workflows {
    varchar id PK
    varchar application_id UK_active
    varchar status
    timestamptz next_run_at
    varchar lock_owner
    timestamptz lock_heartbeat_at
    varchar current_step_id
    int schema_version
  }

  bls_workflow_steps {
    varchar id PK
    varchar workflow_id FK
    varchar step_key
    int ordinal
    varchar status
    varchar portal_autofill_run_id
  }

  bls_workflow_tasks {
    varchar id PK
    varchar step_id FK
    varchar task_key
    varchar applicant_id
    int ordinal
    varchar status
    int attempt_count
    varchar last_error_class
  }

  bls_workflow_attempts {
    varchar id PK
    varchar task_id FK
    int attempt_no
    varchar outcome
    varchar error_class
    varchar evidence_relative_path
  }

  bls_workflow_events {
    bigserial id PK
    varchar workflow_id FK
    varchar event_type
    jsonb payload_safe
    timestamptz created_at
  }

  bls_secret_vault {
    varchar id PK
    varchar workflow_id FK
    varchar purpose
    bytea ciphertext
    bytea nonce
    bytea wrapped_dek
    int key_version
  }

  portal_autofill_runs {
    varchar id PK
    varchar application_id
    varchar status
  }
```

---

## 3. Entities / fields / constraints / indexes

### 3.1 `bls_workflows`

| Column | Type | Notes |
|--------|------|-------|
| `id` | varchar(40) PK | `uid()` style |
| `application_id` | varchar(40) | Index |
| `status` | varchar(32) | See architecture state machine |
| `terminal_reason` | varchar(500) null | Safe text |
| `next_run_at` | timestamptz null | Runner due query |
| `lock_owner` | varchar(64) null | |
| `lock_heartbeat_at` | timestamptz null | |
| `current_step_key` | varchar(64) null | Denormalized for GET |
| `current_task_key` | varchar(64) null | |
| `supersedes_workflow_id` | varchar(40) null | |
| `triggered_by_user_id` | varchar(40) null | |
| `schema_version` | int default 1 | Future migrations |
| `created_at` / `updated_at` | timestamptz | |

**Constraints / indexes (query justification):**

| Index / constraint | Query pattern |
|--------------------|---------------|
| Partial **unique** on `(application_id)` WHERE status IN active set **or** app-level unique active via service + supporting index `(application_id, status)` | REQ-001: one active workflow; start conflict / supersede |
| `(status, next_run_at)` | Runner claim due work |
| `(lock_heartbeat_at)` where lock set | Reconcile stale locks |
| `(application_id, created_at DESC)` | Staff list / get latest |

**Fact:** PostgreSQL partial unique is preferred; if synchronize limits expressiveness, enforce uniqueness in service transaction + non-partial index, document in bootstrap (**Assumption:** Nest TypeORM synchronize may not emit partial unique — use `schema.bootstrap` raw SQL for partial unique if needed — **DEC-012 companion**).

### 3.2 `bls_workflow_steps`

| Column | Type | Notes |
|--------|------|-------|
| `id` | varchar(40) PK | |
| `workflow_id` | varchar(40) FK | Index |
| `step_key` | varchar(32) | `REGISTER`…`BOOK` |
| `ordinal` | int | 1..5 |
| `status` | varchar(32) | |
| `skip_reason` | varchar(500) null | PASSWORD_CHANGE skip |
| `portal_autofill_run_id` | varchar(40) null | Link only; **not** SoT |
| `started_at` / `completed_at` | timestamptz null | |
| Unique `(workflow_id, step_key)` | | Load step graph |
| Index `(workflow_id, ordinal)` | | Ordered advance |

### 3.3 `bls_workflow_tasks`

| Column | Type | Notes |
|--------|------|-------|
| `id` | varchar(40) PK | |
| `step_id` | varchar(40) FK | Index |
| `task_key` | varchar(64) | e.g. `REGISTER_SUBMIT`, `STATUS_APPLICANT` |
| `applicant_id` | varchar(40) null | Per-applicant tasks |
| `ordinal` | int | Sequential within step |
| `status` | varchar(32) | |
| `attempt_count` | int default 0 | |
| `max_attempts` | int default 5 | DEC-014 |
| `last_error_class` | varchar(32) null | |
| `last_error_code` | varchar(64) null | |
| `last_error_message` | varchar(500) null | Russian safe |
| `next_run_at` | timestamptz null | Optional task-level; workflow-level sufficient if single runner cursor |
| Unique `(step_id, ordinal)` | | Deterministic order |

### 3.4 `bls_workflow_attempts`

| Column | Type | Notes |
|--------|------|-------|
| `id` | varchar(40) PK | |
| `task_id` | varchar(40) FK | Index |
| `attempt_no` | int | |
| `outcome` | varchar(32) | |
| `error_class` | varchar(32) null | |
| `error_code` / `error_message` | varchar | Safe |
| `evidence_relative_path` | varchar(500) null | |
| `started_at` / `finished_at` | timestamptz | |
| Unique `(task_id, attempt_no)` | | REQ-004 |
| Index `(task_id, started_at DESC)` | | UI attempt history |

**Never store** field values, passwords, OTP codes, proxy passwords, CapMonster keys.

### 3.5 `bls_workflow_events`

| Column | Type | Notes |
|--------|------|-------|
| `id` | bigserial PK | Monotonic poll cursor |
| `workflow_id` | varchar(40) FK | Index |
| `event_type` | varchar(64) | e.g. `STEP_STARTED`, `ATTEMPT_FAILED` |
| `step_key` / `task_key` | varchar null | |
| `payload_safe` | jsonb | No secrets |
| `created_at` | timestamptz | Index `(workflow_id, id)` for `sinceEventId` poll |

**Retention (DEC-020):** After workflow terminal + `N` days (default **30**), delete events (and optionally soft-archive attempts). Implement as runner/maintenance tick or bootstrap-scheduled best-effort cleanup — no Redis.

### 3.6 `bls_secret_vault`

| Column | Type | Notes |
|--------|------|-------|
| `id` | varchar(40) PK | |
| `workflow_id` | varchar(40) FK | Index; cascade policy on terminal cleanup |
| `application_id` | varchar(40) | Denorm for ops queries |
| `purpose` | varchar(32) | `PORTAL_PASSWORD` \| `MAILTM_PASSWORD` \| `MAILTM_TOKEN` |
| `ciphertext` | bytea | AES-GCM ciphertext |
| `nonce` | bytea | 12-byte typical |
| `wrapped_dek` | bytea | DEK wrapped by master |
| `key_version` | int | Master key generation |
| `created_at` / `rotated_at` | timestamptz | |
| Unique `(workflow_id, purpose)` | | One active secret per purpose |

**Query pattern:** decrypt only inside domain client call path after lock held; never SELECT into logs.

### 3.7 `applications` changes

| Change | Notes |
|--------|-------|
| Optional `active_bls_workflow_id` varchar null | Denorm for fast UI; **or** derive via query — prefer derive to avoid dual-write (**Assumption:** no new column unless GET latency needs it; v1 = query by `application_id` + status) |

`portal_form_email` remains plaintext email identifier (not a secret); password stays in vault only.

### 3.8 `portal_autofill_runs` relationship

- Remains RegisterUser evidence/checkpoint table.
- `bls_workflow_steps.portal_autofill_run_id` nullable FK-like string (no hard DB FK required if synchronize simplicity preferred; soft link).
- Workflow SoT never reads run status alone to mark REGISTER COMPLETED — must still verify portal (**REQ-007**).
- In-flight legacy runs at deploy: leave alone; new starts use workflow API (**DEC-012**).

---

## 4. Encryption storage summary

```
plain ──AES-GCM(DEK)──► ciphertext + nonce
DEK    ──AES-GCM(MK)──► wrapped_dek
MK     ◄── VISES_SECRETS_MASTER_KEY (env, base64 32 bytes), keyed by key_version
```

No plaintext secret columns. No hash of portal password.

---

## 5. Migration strategy (TypeORM synchronize + schema.bootstrap)

**Facts:** `synchronize: true`; `SchemaBootstrap` already patches columns / drops retired settings fields.

| Step | Action |
|------|--------|
| 1 | Add TypeORM entity classes under `database/entities/` |
| 2 | Register in `database.module.ts` entities array |
| 3 | Boot synchronize creates tables |
| 4 | `schema.bootstrap.ts`: ensure partial unique / indexes if synchronize misses; **do not drop** `portal_autofill_runs` |
| 5 | Env sample docs: add `VISES_SECRETS_MASTER_KEY` |
| 6 | Seed: optional demo workflow **off** by default |

**Non-goals:** Alembic; destructive data wipe; forcing migration of historical autofill runs into steps.

---

## 6. Cleanup policy

| Trigger | Action |
|---------|--------|
| Workflow → `AWAITING_STAFF_BOOKING` / `FAILED` / `CANCELLED` / `ABANDONED` | Eligible for Mail.tm `deleteAccount` after grace (default immediate on terminal **or** 24h grace — **Assumption:** delete on terminal success path after staff-visible settle; document constant) |
| Explicit admin cleanup | Delete mailbox + vault rows for workflow |
| Events TTL | 30 days post-terminal |

Vault plaintext never written to disk outside ciphertext columns.

---

## 7. Phase gate

DB redesign documented. Implementers follow entity list in TASK-001. **No product code in this phase.**
