# SDD — Durable BLS portal workflow

> **Scope pointer (2026-11-01).** This tree is the durable BLS workflow SDD (status in the table below). It is not the only product SDD. The roles-and-applications cycle (backend and frontend) is **CLOSED** as of 2026-11-01. Live boundaries: [`docs/architecture.md`](../architecture.md). Closed specs: [`specs/roles-and-applications/spec.md`](../../specs/roles-and-applications/spec.md) and [`specs/roles-and-applications-frontend/spec.md`](../../specs/roles-and-applications-frontend/spec.md). [`00-current-state.md`](./00-current-state.md) is a historical Phase-0 snapshot.

| Field | Value |
|-------|-------|
| Feature theme | Durable, resumable BLS portal autofill workflow |
| Feature id | `durable-bls-workflow` |
| Document home | **`docs/sdd/`** (authoritative) |
| Mirror | `specs/features/durable-bls-workflow/` |
| Status | **DONE** (`08-review.md`: **APPROVE_WITH_ISSUES**; ISSUE-001/002/003 residual non-blocking; clear live E2E + compose before production) |
| Updated | 2026-09-22 |

## Purpose

Evolve Vises from RegisterUser-only staff autofill toward a **multi-stage durable BLS workflow**:

**REGISTER → LOGIN → PASSWORD_CHANGE (conditional) → STATUS_VALIDATE → BOOK (CON-006 stop → `AWAITING_STAFF_BOOKING`)**

with Nest DB-backed runner, encrypted credentials (AES-GCM + wrapped DEK), Mail.tm retention, Proxy6 + CapMonster, polling staff UI, and domain clients separate from the orchestrator.

## Architecture summary

- **SoT:** `bls_workflows` / steps / tasks / attempts / events + `bls_secret_vault`; link (not replace) `portal_autofill_runs`.
- **Runner:** Nest in-process poll on `nextRunAt` + lock/heartbeat (30s/120s); no Bull/Redis Must.
- **Retry:** `SAFE_TO_REPEAT` / `VERIFY_THEN_REPEAT` / `NOT_SAFE_TO_REPEAT`; max 5 auto attempts; exponential backoff capped.
- **Secrets:** `VISES_SECRETS_MASTER_KEY`; never hash portal passwords; never log/API-expose.
- **UI:** GET poll ~3s; paths under `/api/apps/.../bls-workflow*`.
- **Extend** `portal-scrape` / proxy6 / capmonster / mailtm — do not greenfield rewrite.

## Ordered steps (fixtures on-disk spellings)

| Step | Fixtures (`D:/Git/reps/test-scrape-app/`) |
|------|------------------------------------------|
| REGISTER | `email_privact_acceptence.html`, `succes.html` + in-repo samples; **Must `#btnSubmit`** |
| LOGIN | `login.html`, `login_captcha.html` |
| PASSWORD_CHANGE | `reset_password.html` or SKIPPED |
| STATUS_VALIDATE | `applicant_details.html`, `ready_book_status.html`, `edit_app.html`, `modal_attention_app_editing.html` |
| BOOK | `ready_book_status.html`, `slect_location_visa_type.html`, `book_new_appointment.html` — stop before VisaType submit / payment |

## Task order (first batch)

See [`05-execution-plan.md`](./05-execution-plan.md) and [`tasks/`](./tasks/).

**Execution order (spine):** TASK-001 → TASK-002 → TASK-003 → TASK-004 → …  
**First 5:** TASK-001, TASK-005 (∥ after 001), TASK-002, TASK-003, TASK-004.

**Total tasks:** 20 (`TASK-001`…`TASK-020`).

## Phase status

| Phase | Doc | Status |
|-------|-----|--------|
| **0 — Discovery** | [`00-current-state.md`](./00-current-state.md) | **Complete** |
| **1 — Target architecture** | [`01-target-architecture.md`](./01-target-architecture.md) | **Complete** |
| **2 — Database redesign** | [`02-database-redesign.md`](./02-database-redesign.md) | **Complete** |
| **3 — Workflow API** | [`03-workflow-api.md`](./03-workflow-api.md) | **Complete** |
| **4 — External integrations** | [`04-external-integrations.md`](./04-external-integrations.md) | **Complete** |
| **5 — Tasks** | [`tasks/`](./tasks/) + [`05-execution-plan.md`](./05-execution-plan.md) | **Complete** |
| **6 — Execution plan / gate** | [`05-execution-plan.md`](./05-execution-plan.md) | **Complete** → **READY_FOR_IMPLEMENTATION** |
| **7 — Implementation** | product code under `backend/` / `web/` | **DONE** (TASK-001…020) |
| **8 — Verification** | [`../specs/features/durable-bls-workflow/07-verification.md`](../specs/features/durable-bls-workflow/07-verification.md) | **Complete** (0 FAIL; ISSUE-001/002 waive live/compose) |
| **9 — Review** | [`../specs/features/durable-bls-workflow/08-review.md`](../specs/features/durable-bls-workflow/08-review.md) | **DONE** — **APPROVE_WITH_ISSUES** |

## Blocked items

- **None** for architecture kickoff / Phase 7 resume.
- Non-blocking OQs 012–016 closed via DEC-005, DEC-010, DEC-011, DEC-012, DEC-014.

## Risks (carry forward)

See spec RISK-001…010 and architecture §12 (submit supersession, mail retain cost, dual SoT, WIP tree, master key backup).

## Feature closed (DONE)

1. Review verdict: **APPROVE_WITH_ISSUES** — see [`specs/features/durable-bls-workflow/08-review.md`](../specs/features/durable-bls-workflow/08-review.md). Verification: [`07-verification.md`](../specs/features/durable-bls-workflow/07-verification.md) (**0 FAIL**; builds + `test:workflow` PASS; CON-006 static PASS).
2. Before **production enablement**: clear **ISSUE-001** (fixture/live portal E2E REGISTER→BOOK) and **ISSUE-002** (`docker compose` + health + `bls_*` tables).
3. Optional: wire SPA events poll (**ISSUE-003**); master-key backup ops (RISK-004).
4. Operators: [backend/docs/modules/portal-scrape.md](../../backend/docs/modules/portal-scrape.md) — set `VISES_SECRETS_MASTER_KEY` (base64 32 bytes); start/poll on application-detail **Автозаполнение**; CON-006 stop = `AWAITING_STAFF_BOOKING`.

### TASK-020 test command

```bash
cd backend && npm run test:workflow
```

Exact script: `npm run build && node --test ./test/workflow/crypto-and-state.test.cjs` (Node built-in runner; crypto + retry/state helpers; no secrets in output).

## Follow-on frontend initiative (separate feature)

| Field | Value |
|-------|-------|
| Feature id | `bls-workflow-frontend` |
| Status | **READY_FOR_IMPLEMENTATION** |
| Authoritative docs | [`frontend/`](./frontend/) |
| Handoff | [`frontend/HANDOFF.md`](./frontend/HANDOFF.md) |
| Spec SoT | `specs/features/bls-workflow-frontend/02-spec.md` |

Enhances TASK-015 staff SPA (step viz, events poll closing **ISSUE-003**, CON-006 handoff, dual-mode Автозаполнение). Realtime: **DEC-001** snapshot + events poll — **no** WebSocket/SSE. Product IMPLEMENTING not started.

## Related DONE SDD (baselines — extend, don’t casually reopen)

| Feature id | Relevance |
|------------|-----------|
| `portal-autofill-durable-resume` | RegisterUser checkpoints |
| `portal-login-status-check` | login-prep stop (superseded for workflow LOGIN) |
| `proxy6-migration` / `proxy6-admin-ui` | Proxy6 lease |
| Captcha / Mail.tm / register autofill features | Building blocks |

## Key documents

| Doc | Role |
|-----|------|
| [00-current-state.md](./00-current-state.md) | Discovery facts |
| [01-target-architecture.md](./01-target-architecture.md) | DECs + orchestration |
| [02-database-redesign.md](./02-database-redesign.md) | Schema |
| [03-workflow-api.md](./03-workflow-api.md) | HTTP surface |
| [04-external-integrations.md](./04-external-integrations.md) | Clients + providers |
| [05-execution-plan.md](./05-execution-plan.md) | DAG + Phase 7 gate |
| [tasks/](./tasks/) | Atomic implementer prompts |
| Specs mirror | `specs/features/durable-bls-workflow/` |
