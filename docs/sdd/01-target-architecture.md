# Phase 1 — Target architecture (durable BLS workflow)

| Field | Value |
|-------|-------|
| Feature id | `durable-bls-workflow` |
| Status | **DESIGNED** |
| Date | 2026-09-22 |
| Spec (SoT for REQs) | [`specs/features/durable-bls-workflow/02-spec.md`](../../specs/features/durable-bls-workflow/02-spec.md) |
| Discovery | [`00-current-state.md`](./00-current-state.md) |
| Mirror | `specs/features/durable-bls-workflow/03-design.md` |

**Labeling:** **Fact** = verified in-repo / on disk. **Assumption** = labeled; closed via `DEC-###` where product-open.

---

## 1. Placement (Facts + extend-not-rewrite)

| Layer | Location | Role |
|-------|----------|------|
| Orchestration + staff HTTP | `backend/src/modules/portal-scrape/` (**extend**) | Workflow runner, control APIs, events poll, reconcile |
| Domain BLS page clients | `backend/src/modules/portal-scrape/bls-clients/` (**new subfolder**, same module) | Register / login / password-change / status / booking Patchright actions — **import-separable** from orchestrator |
| Crypto vault | `backend/src/modules/portal-scrape/` (or thin `secrets/` Nest providers colocated) | `encryptSecret` / `decryptSecret` AES-GCM + wrapped DEK |
| Temporary email port | `backend/src/modules/mailtm/` (**evolve** `IDisposableEmail` → `TemporaryEmailProvider`) | Create / poll OTP / **retain** / terminal delete |
| Proxy | `backend/src/modules/proxy6/` | `ProxyProvider` adapter over existing DB lease |
| Captcha | `backend/src/modules/capmonster/` | `CaptchaProvider` adapter over `solveBls3x3` |
| Persistence | `backend/src/modules/database/entities/` + `schema.bootstrap.ts` | New workflow tables; link `portal_autofill_runs` |
| Staff UI | `web/src/widgets/` + `web/src/entities/` (extend autofill tab / new workflow slice) | Poll GET progress |
| Apps surface | Controllers under `@Controller('apps')` | Paths like today’s `/api/apps/:applicationId/...` |

**DEC-001 (extend baselines):** Do **not** greenfield-rewrite `portal-scrape` pipelines. RegisterUser fill/captcha/OTP and login-prep remain the code baseline; this feature adds submit, password, status, booking clients, and a durable orchestrator around them (REQ-025, CON-010).

---

## 2. Domain model

### 2.1 Hierarchy

```
Application (CRM)
  └── BlsWorkflow (exactly one non-terminal active — REQ-001)
        ├── BlsWorkflowStep[]   ordered: REGISTER → LOGIN → PASSWORD_CHANGE → STATUS_VALIDATE → BOOK
        │     └── BlsWorkflowTask[]   sequential; per-applicant under STATUS_VALIDATE / BOOK eligibility
        │           └── BlsWorkflowAttempt[]   each execution try
        ├── BlsWorkflowEvent[]  append-only audit / UI stream (no secrets)
        └── BlsSecretVault[]    envelope-encrypted portal / mailbox secrets (FK workflow or application)
```

Optional linkage (not SoT):

```
BlsWorkflowStep(REGISTER) ──nullable──► portal_autofill_runs.id
```

### 2.2 State machines

#### Workflow statuses

| Status | Meaning |
|--------|---------|
| `PENDING` | Created; not yet runnable |
| `RUNNING` | Runner owns lock; executing a task |
| `WAITING_RETRY` | Failed/waiting; `nextRunAt` set for auto retry |
| `WAITING_STAFF` | Human gate (`NOT_SAFE_TO_REPEAT`, attempt exhaustion, ambiguous booking) |
| `PAUSED` | Staff pause; runner must not claim |
| `AWAITING_STAFF_BOOKING` | **Success terminal** for Must path when CON-006 stop reached (**DEC-010** / OQ-014) |
| `COMPLETED` | Reserved for future full-booking completion; **not** used for CON-006 stop in v1 |
| `FAILED` | Terminal failure (non-retryable or abandoned retries) |
| `CANCELLED` | Staff cancel |
| `ABANDONED` | Superseded by a new workflow |

**Active** = any of: `PENDING`, `RUNNING`, `WAITING_RETRY`, `WAITING_STAFF`, `PAUSED` (REQ-001 uniqueness).

#### Step statuses

`PENDING` → `READY` → `RUNNING` → `COMPLETED` | `SKIPPED` | `FAILED` | `WAITING`

- `PASSWORD_CHANGE` may go `PENDING` → `SKIPPED` when portal does not force change (REQ-012).
- Step `COMPLETED` **only** after external verify (REQ-007).

#### Task statuses

`PENDING` → `READY` → `RUNNING` → `COMPLETED` | `FAILED` | `WAITING` | `SKIPPED`

#### Attempt outcomes

`SUCCEEDED` | `FAILED` | `ABORTED` (lock lost / cancel / supersede mid-flight)

Each attempt stores: `errorClass` (`SAFE_TO_REPEAT` | `VERIFY_THEN_REPEAT` | `NOT_SAFE_TO_REPEAT` | null on success), safe `errorCode` / `errorMessage` (Russian operator copy, no secrets), evidence path refs, timestamps.

---

## 3. Ordered steps ↔ fixtures ↔ baselines

| Step | Tasks (illustrative) | Fixtures (`D:/Git/reps/test-scrape-app/` — **on-disk spellings**) | Extend |
|------|----------------------|------------------------------------------------------------------|--------|
| `REGISTER` | create mailbox; fill RegisterUser; captcha; OTP; **`#btnSubmit`**; verify success | `email_privact_acceptence.html`, in-repo `register-user.sample.html` + `bls-captcha.sample.html`, **`succes.html`** | `portal-autofill.service.ts`, `run-portal-fill-pipeline.util.ts` |
| `LOGIN` | login-prep email+verify; password submit; verify authed | `login.html`, `login_captcha.html` | `portal-login-prep.*` past stop |
| `PASSWORD_CHANGE` | detect forced change; set new pwd; vault update; verify — else `SKIPPED` | `reset_password.html` | new `bls-clients/password-change` |
| `STATUS_VALIDATE` | per-applicant scrape/normalize; edit/modal paths until `READY_TO_BOOK` | `applicant_details.html`, `ready_book_status.html`, `edit_app.html`, `modal_attention_app_editing.html` | new status client |
| `BOOK` | open booking UI; optional unambiguous prefill; **stop** CON-006 | `ready_book_status.html`, `slect_location_visa_type.html`, `book_new_appointment.html` | new booking client |

Supporting only: `capcha.html`, `email.txt`. Do not invent corrected filenames.

**Multi-applicant (REQ-021 / DEC-009):** one shared registration identity (`portalFormEmail`); `STATUS_VALIDATE` / booking-eligibility tasks are **sequential** per `applicantId` from `applications.applicants` jsonb. Default required set = **all** applicants on the application.

---

## 4. Orchestration (Nest in-process DB runner)

> **Superseded for process topology (2026-10-04):** Feature [`portal-worker-isolation`](../../specs/features/portal-worker-isolation/) **DEC-002 / DEC-013 / DEC-022** move browser execution to a separate `apps/workflow-worker` Nest process coordinated by **RabbitMQ** + simplified `{ correlationId, payload }` envelopes. The durable **DB claim / `nextRunAt` / SKIP LOCKED** model below remains valid; the **“runner inside the Nest API process” / “no queue Must”** wording does **not**. See `specs/features/portal-worker-isolation/03-design.md` and `06-implementation.md`.

**DEC-002 (runner) — historical:** Primary execution is a **DB-backed runner inside the Nest API process** (CON-002). No Bull/Redis/cron package for Must.

### 4.1 Components

| Component | Responsibility |
|-----------|----------------|
| Control APIs | start / get / retry / resume / pause / cancel / supersede — short HTTP (REQ-023, NFR-003) |
| `BlsWorkflowRunner` | Interval tick: claim due work (`nextRunAt <= now`, status eligible, lock free/stale) |
| Lock + heartbeat | Same pattern as autofill: owner token + `lockHeartbeatAt`; heartbeat ~30s; stale ~120s (**DEC-003** / OQ-013) |
| Task executor | Loads step/task → calls **domain client** → classifies failure → writes attempt + events → schedules `nextRunAt` or advances |
| Reconciler | Extend `PortalAutofillResumeReconciler` / new workflow reconciler on `OnModuleInit`: clear stale locks; leave due work for runner; terminalize abandoned/expired; **do not** assume DOM continuity |

### 4.2 Claim query (conceptual)

```sql
-- Fact pattern to mirror: Proxy6 FOR UPDATE SKIP LOCKED; autofill lock reclaim
SELECT … FROM bls_workflows
WHERE status IN ('PENDING','WAITING_RETRY','RUNNING' /* reclaim stale */)
  AND (next_run_at IS NULL OR next_run_at <= now())
  AND (lock_owner IS NULL OR lock_heartbeat_at < now() - stale)
ORDER BY next_run_at NULLS FIRST, updated_at
FOR UPDATE SKIP LOCKED
LIMIT 1;
```

### 4.3 Control flow (happy path)

```
Staff POST start
  → create workflow + steps + tasks (PENDING/READY)
  → set nextRunAt = now
  → return { workflowId } quickly

Runner tick
  → claim workflow lock
  → pick next READY task in step order
  → attempt++
  → domain client (browser + adapters)
  → VERIFY external state
  → COMPLETED → advance; or classify → WAITING_RETRY / WAITING_STAFF
  → append events; heartbeat; release lock when idle

Staff poll GET
  → workflow + current step/task + attempts summary + events since cursor
```

### 4.4 Idempotency + retry classes (**DEC-004**)

| Class | Auto retry? | Rule |
|-------|-------------|------|
| `SAFE_TO_REPEAT` | Yes (backoff, max attempts) | Side effect safe to redo (nav, fill, captcha solve, OTP poll) |
| `VERIFY_THEN_REPEAT` | Yes after external verify | Side effect may have happened (`#btnSubmit`, password submit). Re-nav; if already success → COMPLETED without re-click; if not → repeat |
| `NOT_SAFE_TO_REPEAT` | **No** | Past CON-006 VisaType submit, payment, unknown irreversible; → `WAITING_STAFF` |

**Numeric defaults (DEC-014 / OQ-013):**

| Constant | Default | Notes |
|----------|---------|-------|
| Lock heartbeat | 30_000 ms | Reuse autofill |
| Lock stale TTL | 120_000 ms | Reuse autofill |
| Staff UI poll | 3_000 ms | NFR-007 |
| Max auto attempts / task | 5 | Then human gate |
| Backoff | exponential: 5s × 2^(n-1), cap 5 min | Configurable env/settings later |

### 4.5 Verify-before-COMPLETED (**DEC-016**)

Default continuity: **fresh browser + re-navigate**; never mark COMPLETED from checkpoints alone (REQ-007, CON-007). Optional `storageState` is **out of Must**.

---

## 5. Security — envelope encryption (**DEC-005** / OQ-012)

| Item | Decision |
|------|----------|
| Algorithm | AES-256-GCM for payload ciphertext |
| Envelope | Per-secret random DEK; DEK wrapped with master key (AES-GCM wrap) |
| Master key | Env **`VISES_SECRETS_MASTER_KEY`** = base64-encoded **32 bytes** (Must default). Rotation via `keyVersion` column + dual-unwrap during rotate window (Should later) |
| Portal passwords | **Never** bcrypt/hash; generate ≥8 with upper/lower/digit/special (REQ-013); store ciphertext only |
| Logging / API | Never log plaintext, DEK, nonce misuse, or ciphertext in access logs as useful secret; **never** return secrets on DTOs (NFR-002) |
| Service API | `encryptSecret(plain) → { ciphertext, nonce, wrappedDek, keyVersion }`; `decryptSecret(envelope) → plain` (in-memory only for client call) |

Vault rows hold ciphertext columns only; see `02-database-redesign.md`.

---

## 6. Real-time UI (**DEC-006**)

- Staff application-detail workflow panel **polls GET** every **3s** while non-terminal (NFR-007).
- No WebSocket/SSE as Must (CON-003).
- Payload: current step/task, statuses, attempt count, `nextRunAt`, last safe error, recent events — **no secrets**.

---

## 7. Adapter ports (**DEC-007**, **DEC-008**, **DEC-017**)

```
┌─────────────────────────────┐
│  BlsWorkflowRunner          │  schedules / locks / verifies / classifies
└──────────────┬──────────────┘
               │ calls
     ┌─────────┴─────────┐
     ▼                   ▼
 BLS domain clients   Providers
 (register, login,    TemporaryEmailProvider (Mail.tm)
  pwd, status, book)  ProxyProvider (Proxy6 lease)
                      CaptchaProvider (CapMonster)
                      SecretsCryptoService
```

- Orchestrator **must not** embed page selectors; clients own Patchright + fixture-aligned selectors.
- Providers stay vendor-swappable at interface boundary; Proxy6-only and CapMonster remain concrete defaults (CON-004, CON-005, REQ-028).

**Mail retention (REQ-016):** stop delete-after-OTP in autofill `finally`; retain until workflow terminal (`AWAITING_STAFF_BOOKING` / `FAILED` / `CANCELLED` / `ABANDONED`) or explicit admin cleanup. Encrypted mailbox token/password in vault.

---

## 8. Observability

- Append **`bls_workflow_events`** on major transitions (REQ-029 Should → treat as implement in v1 for poll UX).
- Winston: structured safe fields (`workflowId`, `stepId`, `taskType`, `errorClass`, masked proxy). **Never** portal password / Mail.tm token / DEK.
- Evidence: reuse screenshot-on-disk + relative path metadata pattern from `portal_autofill_runs`.

---

## 9. Failure / recovery

| Scenario | Behavior |
|----------|----------|
| Process crash mid-task | Lock goes stale → reconciler clears owner → runner reclaim → re-nav + verify |
| CapMonster CB open | Classify `SAFE_TO_REPEAT` / wait; do not COMPLETED |
| Proxy pool empty | Fail closed; `WAITING_RETRY` with backoff |
| `#btnSubmit` ambiguous | `VERIFY_THEN_REPEAT` against `succes.html` signals / already-registered |
| Booking ambiguous CRM map | Stop for staff (REQ-030); still may reach `AWAITING_STAFF_BOOKING` if UI open satisfies CON-006 (**DEC-011**) |
| Supersede | Prior → `ABANDONED`; secrets retention until cleanup policy |

**DEC-018:** Extend boot reconcile; runner is the only auto browser launcher (no long sync multi-stage POST).

---

## 10. Alternatives considered

| Topic | Chosen | Rejected | Why |
|-------|--------|----------|-----|
| Runner | Nest DB tick + `nextRunAt` | Bull/Redis/cron | CON-002; no new infra; matches Proxy6 lease style |
| Realtime | HTTP poll 3s | WS/SSE | CON-003; existing GET patterns |
| SoT tables | New workflow graph | Overload `portal_autofill_runs` | REQ-026 |
| Continuity | Re-nav + verify | Persist storageState | CON-007; less secret surface |
| BOOK terminal name | `AWAITING_STAFF_BOOKING` | `COMPLETED` | OQ-014; honest staff takeover |
| Master key | Env 32-byte base64 | File/KMS only | OQ-012 Must default; KMS later without API break if `keyVersion` kept |
| Booking prefill | Should when unambiguous | Always auto-submit | CON-006 / REQ-030 |

---

## 11. Decision log

| ID | Decision | Consequences |
|----|----------|--------------|
| **DEC-001** | Extend `portal-scrape` / Proxy6 / CapMonster / Mail.tm; no greenfield rewrite | Implementers touch existing modules; preserve DONE feature baselines with supersession notes where behavior changes (`#btnSubmit`, retain mail, login past prep) |
| **DEC-002** | Nest in-process DB runner + `nextRunAt` | **Partially superseded:** DB/`nextRunAt` retained; process isolation + RabbitMQ Must via `portal-worker-isolation` DEC-002/013/022 |
| **DEC-003** | Lock heartbeat 30s / stale 120s (autofill parity) | Reuse utils patterns; OQ-013 closed |
| **DEC-004** | Retry classes SAFE / VERIFY_THEN / NOT_SAFE | Auto-retry policy unambiguous; staff gate for irreversible |
| **DEC-005** | AES-GCM + wrapped DEK; `VISES_SECRETS_MASTER_KEY` | Replayable portal passwords; ops must backup master key (RISK-004) |
| **DEC-006** | Staff UI poll default 3s | No WS; NFR-007 closed for v1 |
| **DEC-007** | `TemporaryEmailProvider`; retain until terminal | Changes Mail.tm delete-after-OTP; cleanup job required |
| **DEC-008** | BLS domain clients ≠ orchestrator | REQ-017; testable page actions |
| **DEC-009** | Sequential multi-applicant tasks in one workflow | REQ-021; longer wall time (RISK-010) |
| **DEC-010** | BOOK success terminal = `AWAITING_STAFF_BOOKING` | OQ-014; CON-006 stop clear in UX |
| **DEC-011** | Booking auto-fill = Should if CRM unambiguous else staff stop | OQ-016; no guessing |
| **DEC-012** | Link legacy `portal_autofill_runs` via nullable FK; no destructive drop | OQ-015; dual-model transitional (RISK-006) |
| **DEC-013** | One active workflow per application; supersede → ABANDONED | REQ-001 |
| **DEC-014** | Max auto attempts 5; exponential backoff capped 5 min | OQ-013 / NFR-008 |
| **DEC-015** | API under `/api/apps/:applicationId/bls-workflow…` style; Russian `{ detail }` | Matches portal-autofill controllers |
| **DEC-016** | Re-nav + external verify; no storageState Must | REQ-027 |
| **DEC-017** | ProxyProvider=Proxy6; CaptchaProvider=CapMonster | CON-004/005 |
| **DEC-018** | Boot reconcile extends lock clear; runner resumes due work | Aligns with autofill reconciler limits + adds auto claim |
| **DEC-019** | REGISTER Must click `#btnSubmit` + verify `succes.html` cues | Supersedes intentional skip in fill pipeline for workflow path |
| **DEC-020** | Events append-only; retention cleanup after terminal + TTL | Supports poll UI + audit without unbounded growth |

---

## 12. Risks to existing behavior

| Risk | Impact | Mitigation |
|------|--------|------------|
| `#btnSubmit` on legacy autofill POST | Product change vs current intentional stop | Workflow path Must submit; document whether standalone `POST …/portal-autofill` remains prepare-only or shares submit (prefer: **workflow uses submit**; legacy endpoint behavior called out in plan — default **legacy POST also gains submit when invoking shared pipeline** only if feature tasks wire shared util; keep explicit flag `submitRegistration: true` for workflow) |
| Mail.tm retain | Accounts accumulate | Terminal cleanup + admin delete |
| Dual SoT during migration | Confusion | `bls_*` tables authoritative; runs linked only |
| WIP Proxy6/login-prep tree | Build breakage | NFR-004 build gates before DONE |

**Assumption (A-ARCH-1):** Standalone legacy `POST …/portal-autofill` may remain available during transition; durable multi-stage Must path is the new workflow APIs. Shared pipeline gains optional submit controlled by orchestrator (**DEC-019**).

---

## 13. Phase gate

Architecture documented. Next: DB redesign, API, integrations, tasks, execution plan → **READY_FOR_IMPLEMENTATION**. **Phase 7 implementation not started.**
