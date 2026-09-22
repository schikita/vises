# Phase 0 — Current state (durable BLS workflow)

| Field | Value |
|-------|-------|
| Feature theme | Durable resumable BLS portal autofill workflow |
| Feature id | `durable-bls-workflow` |
| Status | **READY_FOR_IMPLEMENTATION** (Phase 0 discovery complete; Phases 1–6 designed; Phase 7 not started) |
| Date | 2026-09-22 |
| Scope of this doc | Facts about the repo **as inspected**; no target design |
| Authoritative tree | `docs/sdd/` |
| Mirror | `specs/features/durable-bls-workflow/01-discovery.md` |

**Labeling:** Statements marked **Fact** were verified in-repo or on disk. Statements marked **Assumption** are labeled and must not be treated as requirements.

---

## 1. Repository architecture (Facts)

### 1.1 Layout

| Path | Role |
|------|------|
| `backend/` | NestJS 11 + TypeScript API (Node ≥22) |
| `web/` | React 19 + Vite 8 + Tailwind 4 SPA (FSD under `web/src/`) |
| `docker-compose.yml` (+ `.dev` / `.prod`) | Services: `db` (Postgres 18), `api`, `web` |
| `materials/` | Non-code materials |
| `specs/features/` | Per-feature SDD (many DONE portal/proxy features) |
| `docs/sdd/` | **This initiative’s** SDD home (user-requested) |
| `backend/docs/` | Module operator docs (portal-scrape, proxy6, mailtm, …) |

**Not present:** root FastAPI / Python API; `backend/src/modules/webshare/` (removed by Proxy6 migration).

### 1.2 Backend modules (`backend/src/modules/`)

| Module | Role for portal workflow |
|--------|--------------------------|
| `portal-scrape` | RegisterUser autofill + login-prep Patchright pipelines; durable run rows; staff HTTP |
| `proxy6` | Proxy6 API client, inventory sync, **DB fair lease** for browser egress |
| `capmonster` | BLS 3×3 captcha solver (`solveBls3x3`) |
| `mailtm` | Disposable email create / poll OTP / delete |
| `apps` | Applications CRUD, documents, statuses |
| `auth` / `users` | JWT + roles (`admin` / `manager` / client) |
| `settings` | Company settings; `emailOtpEnabled` |
| `database` | TypeORM entities + `SchemaBootstrap` |
| `config` | Zod `appEnvSchema` + env loading |
| `logger` | Winston / HTTP access logging |
| `seed` | Demo data on empty DB |
| `health` / `stats` | Health + owner dashboard |

Wiring: `backend/src/app.module.ts` imports the modules above (including `PortalScrapeModule`, `Proxy6Module`).

### 1.3 Stack / validation commands (Facts)

| Intent | Command | Notes |
|--------|---------|-------|
| DB + stack | `docker compose up` (root) | `db` + `api` + `web` |
| Backend build | `npm run build` in `backend/` | Nest build |
| Backend local | `npm run start` / `start:dev` | No `portal:*` scripts |
| Web | `npm run lint` / `build` / `dev` in `web/` | oxlint + `tsc -b` |
| Backend tests | **None** | `backend/package.json` scripts: `build`, `start`, `start:dev`, `start:prod` only — **no `test` script** |

### 1.4 Queues / workers / schedulers (Facts)

- **No** Bull / Redis queue / cron package in `backend/package.json`.
- Background-like behavior limited to Nest `OnModuleInit`:
  - `PortalAutofillResumeReconciler` — boot scan of `in_progress` runs (clear stale locks / terminalize expired/permanent/CB-open); **does not** launch browser or auto-resume fill.
  - `BlsWorkflowReconciler` — boot scan of `bls_workflows` with lock owner (clear stale locks 120s); leaves `nextRunAt` for runner; **does not** launch Patchright.
  - `SchemaBootstrap`, `SeedService` — schema ensure / seed-if-empty.
- Autofill and login-prep execute **synchronously inside the staff HTTP request** (long-lived POST).

### 1.5 Logging / config / auth (Facts)

- Env samples: `backend/.env.dev.example`, `.env.dev.local.example`, `.env.prod.example` (and local non-example copies may exist — do not commit secrets).
- Portal-related keys (examples): `VISES_PORTAL_BASE_URL`, `VISES_PORTAL_REGISTER_PATH`, `VISES_PORTAL_LOGIN_PATH`, `CAPMONSTER_API_KEY`, `PROXY6_API_KEY`, `MAILTM_API_BASE_URL`, `JWT_SECRET`, `UPLOAD_DIR`.
- Auth: JWT + role guards; autofill / login-prep require `admin` \| `manager`.
- User passwords: bcrypt `password_hash` on `users` — **not** portal credentials.

---

## 2. Current portal workflow (Facts)

### 2.1 End-to-end operator path today

```
Create / edit application (CRM)
    → applicants[] on Application (jsonb)
    → Staff opens application detail → tab «Автозаполнение»
    → Select applicant → POST /api/apps/:applicationId/portal-autofill
         { applicantId, optional supersede }
    → Backend: config → load app/applicant → optional Mail.tm create
         → map fields → Proxy6 lease (if key set) → Patchright RegisterUser
         → consent → field fill → screenshot → CapMonster Verified loop
         → optional Mail.tm OTP fill
         → persist portalFormEmail → evidence / terminal run row
    → SPA shows result + run list; may update CRM status on success/failure
```

**Separate (API exists, SPA has no trigger button):**

```
POST /api/apps/:applicationId/portal-login-prep
    → requires Application.portalFormEmail
    → Proxy6 lease → Patchright login URL
    → fill portal email among decoys → optional CapMonster #btnVerify
    → STOP (no password, no OTP-after-login, no status scrape, no booking)
```

### 2.2 What is automated vs not

| Stage (product theme) | Current state |
|-----------------------|---------------|
| Registration form fill | **Yes** — RegisterUser pipeline |
| Captcha (BLS 3×3) | **Yes** — CapMonster + Verified loop |
| Email OTP on register | **Yes** — Mail.tm when armed |
| Final RegisterUser `#btnSubmit` | **No** — intentionally **not** clicked (commented stop after OTP fill) |
| Login email prep | **Yes** — HTTP login-prep |
| Login password / User Id | **No** |
| Password change / reset | **No** automation (fixture `reset_password.html` unused by code) |
| Applicant status validation | **No** scrape |
| Booking appointment | **No** |
| Multi-stage durable workflow orchestration | **No** — only RegisterUser run entity + login-prep one-shot |

### 2.3 Persistence / resume behavior (RegisterUser only)

| Concern | Behavior |
|---------|----------|
| Run row | `portal_autofill_runs` created early as `in_progress`; checkpoints for stage, captcha attempt/budget, CapMonster CB, field progress (no field **values**) |
| Resume | Next eligible staff **POST** resumes same `runId` with captcha restore; **fresh browser / re-navigate** (no cookie/`storageState` persist) |
| Supersede | `supersede: true` abandons prior run, new `runId` |
| Boot reconcile | Stale lock clear / terminalize ineligible; **leaves eligible `in_progress` for next POST** — no auto browser resume |
| Mail.tm on resume | Fresh account when OTP armed; token **not** stored on run row |
| Proxy lease | DB-backed Proxy6 lease with expiry; acquire around fill / login-prep, release in `finally` |
| Login-prep | **No** durable run table / resume — one-shot sync HTTP + optional evidence PNG under upload dir |

### 2.4 Real-time UI observability (Facts)

- Staff widget: `web/src/widgets/portal-autofill-evidence/` on application detail tab «Автозаполнение».
- Loads runs via `GET …/portal-autofill-runs` on mount / applicant change / after POST completes.
- **No** `setInterval` / WebSocket / SSE live poll while POST is in flight; UI `busy` flag blocks until sync POST returns.
- List can include `in_progress` metadata (`pipelineStage`, field progress summary) if refreshed — but mid-run refresh is not automatic.
- Client-facing portal progress mapping exists (`mapPortalClientPortalProgress` / CRM statuses) — coarse outcome, not live stage streaming.
- Login-prep: **no** SPA button (read-only `portalFormEmail` display only).

### 2.5 Manual / automatic retry (Facts)

| Mechanism | Present? |
|-----------|----------|
| Manual resume / supersede / captcha-new-run via `retryEligibility` | **Yes** (RegisterUser) |
| Automatic retry worker / scheduler | **No** |
| Boot auto-resume of fill | **No** (reconcile only) |

### 2.6 Multi-applicant (Facts)

- Applicants live in `applications.applicants` jsonb array.
- Autofill is **per `(applicationId, applicantId)`**; SPA selects one applicant.
- No orchestrator that sequences all applicants through registration → booking as one durable workflow.

### 2.7 Encrypted credentials (Facts)

- **No** application-level encrypted vault for portal password / Mail.tm password / browser session secrets.
- Mail.tm password generated transiently; not returned on durable handles; account deleted in `finally` after OTP path.
- Proxy6 proxy username/password stored in `proxy6_proxies` table (plain columns; masked on admin list APIs per design).
- CapMonster / Proxy6 / JWT secrets from env — not in run checkpoints.
- Prior durable-resume DEC: **no secrets on `portal_autofill_runs`**.

---

## 3. Relevant files (real paths)

### Backend — portal / integrations

| Path | Notes |
|------|-------|
| `backend/src/modules/portal-scrape/portal-autofill.service.ts` | HTTP autofill orchestrator, checkpoints, resume |
| `backend/src/modules/portal-scrape/portal-autofill.controller.ts` | POST autofill, GET runs, screenshot |
| `backend/src/modules/portal-scrape/portal-autofill-resume.reconciler.ts` | Boot lock/status reconcile |
| `backend/src/modules/portal-scrape/bls-workflow.reconciler.ts` | Boot workflow stale-lock clear (DEC-018) |
| `backend/src/modules/portal-scrape/portal-fill.service.ts` | Patchright RegisterUser launch |
| `backend/src/modules/portal-scrape/utils/run-portal-fill-pipeline.util.ts` | Fill/captcha/OTP pipeline |
| `backend/src/modules/portal-scrape/portal-login-prep.service.ts` | Login-prep orchestrator |
| `backend/src/modules/portal-scrape/portal-login-prep.controller.ts` | `POST …/portal-login-prep` |
| `backend/src/modules/portal-scrape/utils/run-portal-login-prep-pipeline.util.ts` | Login email + verify stop |
| `backend/src/modules/portal-scrape/constants/portal-autofill-run-lifecycle.constants.ts` | Status / stage / lock TTLs |
| `backend/src/modules/proxy6/portal-proxy-lease.service.ts` | DB lease FOR UPDATE SKIP LOCKED |
| `backend/src/modules/proxy6/proxy6-api.service.ts` | Proxy6 HTTP API |
| `backend/src/modules/capmonster/capmonster.service.ts` | Captcha solve |
| `backend/src/modules/mailtm/mailtm.service.ts` | Disposable email + OTP |
| `backend/src/modules/database/entities/portal-autofill-run.entity.ts` | Durable run + checkpoints |
| `backend/src/modules/database/entities/application.entity.ts` | CRM app + `portalFormEmail` |
| `backend/src/modules/database/entities/proxy6-proxy.entity.ts` | Proxy inventory + lease |
| `backend/src/modules/database/database.module.ts` | Entities + `synchronize: true` |
| `backend/src/modules/database/schema.bootstrap.ts` | Post-sync column ensure / legacy drops |
| `backend/docs/modules/portal-scrape.md` | Operator module doc |

### Frontend

| Path | Notes |
|------|-------|
| `web/src/pages/application-detail/` | Staff app detail + autofill tab |
| `web/src/widgets/portal-autofill-evidence/` | Trigger + run list UI |
| `web/src/entities/portal-autofill/` | Types, labels, POST helpers, eligibility |
| `web/src/features/proxy6-proxies/` | Proxy6 admin panel |
| `web/src/app/providers/StoreProvider.tsx` | API wiring for autofill runs |

### In-repo HTML samples (offline)

| Path | Notes |
|------|-------|
| `backend/src/modules/portal-scrape/fixtures/register-user.sample.html` | Register sample |
| `backend/src/modules/portal-scrape/fixtures/bls-captcha.sample.html` | Captcha sample |

### Related SDD features

See `docs/sdd/README.md` table; especially `specs/features/portal-autofill-durable-resume/` and `specs/features/portal-login-status-check/`.

---

## 4. Existing data model (Facts)

### Entities registered in TypeORM

1. **`users`** — CRM users (role, bcrypt hash, invite fields).
2. **`applications`** — visa applications; jsonb `applicants`, `documents`, `extras`, `timeline`; columns include `clientEmail`, **`portalFormEmail`** (nullable), travel/visit/payment fields.
3. **`settings`** — singleton-ish settings; `emailOtpEnabled`; legacy Webshare columns dropped in bootstrap.
4. **`portal_autofill_runs`** — RegisterUser run lifecycle + evidence metadata + captcha/CB/lock/field_progress checkpoints.
5. **`proxy6_proxies`** — owned proxy inventory + `in_use` / lease token / expiry.

**No** entities for: workflow / job graph, booking state, portal password vault, Mail.tm account retention, browser session store, login-prep run history table.

### Schema evolution

- TypeORM `synchronize: true` on API boot.
- `SchemaBootstrap` adds `applications.extras` if missing; drops retired settings proxy columns.

---

## 5. Dependencies / adapters (Facts)

| Adapter | Package / integration | Used by |
|---------|----------------------|---------|
| Patchright | `patchright` npm | portal-fill, login-prep-fill |
| CapMonster | HTTP via Nest HttpModule | captcha Verified loop |
| Mail.tm | HTTP API (`MAILTM_API_BASE_URL`) | OTP on register |
| Proxy6 | `https://px6.link/api/...` + DB inventory | Browser proxy lease |
| PostgreSQL | `pg` + TypeORM | All persistence |
| JWT / bcrypt | `jsonwebtoken`, `bcryptjs` | Auth |

Browsers: launched **on demand** when staff hits autofill / login-prep; not at API boot. Typical local E2E uses host Nest + Docker `db` so Patchright can be headed on the desktop (**Assumption** for operator practice; documented in proxy6-migration reopen notes).

---

## 6. External HTML fixture inventory

**Directory inspected (read-only):** `D:/Git/reps/test-scrape-app/`

### Requested fixtures

| Filename (as requested) | Status | Notes |
|-------------------------|--------|-------|
| `succes.html` | **Present** | Typo spelling as on disk |
| `login.html` | **Present** | Used as login-prep sample reference in prior SDD |
| `login_captcha.html` | **Present** | |
| `applicant_details.html` | **Present** | |
| `modal_attention_app_editing.html` | **Present** | |
| `edit_app.html` | **Present** | |
| `ready_book_status.html` | **Present** | |
| `email_privact_acceptence.html` | **Present** | Typo spelling as on disk |
| `book_new_appointment.html` | **Present** | |

**All nine requested files exist on disk.**

### Additional files in same directory (not in the requested list)

| Filename | Likely closest use |
|----------|-------------------|
| `capcha.html` | Captcha page variant (spelling differs from `login_captcha.html`) |
| `reset_password.html` | Password reset / change UI reference |
| `slect_location_visa_type.html` | Location / visa type selection (typo `slect`) |
| `email.txt` | Non-HTML sample / notes |

### Closest alternatives for missing names

None of the nine requested names are missing. If code later looks for differently spelled names (e.g. `success.html`, `email_privacy_acceptance.html`), use the **on-disk** spellings above — do not assume corrected filenames exist.

### In-repo vs external fixtures

Automation currently ships small samples under `backend/src/modules/portal-scrape/fixtures/`. The richer multi-page BLS HTML set lives **outside** the Vises repo in `test-scrape-app` and is not copied into `docs/sdd` or `backend/` as of this discovery.

---

## 7. Limitations vs durable multi-stage product intent

| Desired capability | Current gap |
|--------------------|-------------|
| Full workflow: register → login/password → status → book | Only register fill (+ login email prep stub); **no** booking/status/password automation |
| No full restart on mid-flow failure | RegisterUser has checkpoint resume **within that pipeline**, but re-nav loses portal DOM state; later stages don’t exist as tasks |
| Task-level retry | Retry is run/pair eligibility for RegisterUser POST — **not** a multi-task workflow engine |
| Automatic retry | **Absent** (no worker) |
| Encrypted credentials | **Absent** for portal secrets; Mail.tm not retained |
| Real-time progress UI | Sync POST + post-hoc list refresh; **no** live stream/poll |
| Multi-applicant orchestration | Per-applicant manual trigger only |
| Submit registration | `#btnSubmit` **not** executed after OTP |
| Session continuity across crash | No browser storageState; Proxy6 lease DB-backed but browser session is not |
| Login-prep durability / SPA | One-shot API; no staff button; no resume entity |

---

## 8. Risks

| ID | Risk | Notes |
|----|------|-------|
| RISK-001 | Long sync HTTP vs proxies/timeouts | Nginx/client timeouts can kill mid-fill even if DB checkpoint exists |
| RISK-002 | Resume ≠ portal continuity | Fresh navigation after crash may force re-captcha / re-fill despite Nest checkpoints |
| RISK-003 | Mail.tm delete vs later login OTP | Portal email persisted; Mail.tm **account** deleted — later login OTP may need retention/encryption design |
| RISK-004 | No portal password storage | Login-prep cannot complete authentication without new secret handling |
| RISK-005 | Live portal drift vs fixtures | External HTML fixtures may diverge from live BLS DOM |
| RISK-006 | Concurrent POSTs | Lock + 409 exist for RegisterUser; login-prep has no equivalent run lock model |
| RISK-007 | Proxy pool exhaustion | Fail-closed when no free Proxy6 lease |
| RISK-008 | WIP / uncommitted tree | Large Proxy6 + login-prep WIP in working tree — discovery reflects **current files**, not a clean main-only snapshot |
| RISK-009 | Incomplete live verification on prior features | Several DONE features still carry NOT_VERIFIED live drills / ISSUES |

---

## 9. Missing information / open questions

These must be resolved in later phases (spec/design) — **not** answered here:

1. **OQ-001** — Exact stage graph for “durable BLS workflow” (which HTML fixtures map to which tasks; is registration submit in scope?).
2. **OQ-002** — Async job model vs keep sync HTTP (queue? Nest worker process? same API process?).
3. **OQ-003** — Browser session restore vs always re-nav for post-register stages.
4. **OQ-004** — How to obtain/store portal password / User Id (operator-entered? generated? encrypted at rest?).
5. **OQ-005** — Mail.tm retention policy for post-registration login OTP.
6. **OQ-006** — Real-time UI: poll interval vs SSE/WebSocket vs stick with sync POST.
7. **OQ-007** — Automatic retry policy (which failures, backoff, max attempts, human gate).
8. **OQ-008** — Multi-applicant: sequential vs parallel; shared proxy/email constraints.
9. **OQ-009** — Whether login-prep should share `portal_autofill_runs` or a new workflow table.
10. **OQ-010** — Product stance on registering `#btnSubmit` (currently intentionally skipped).
11. **OQ-011** — Relationship to reopen/extend DONE features vs new `durable-bls-workflow` only under `docs/sdd/`.

---

## 10. Assumptions

| ID | Assumption |
|----|------------|
| A1 | Product wants a **new multi-stage** durable workflow beyond RegisterUser checkpoints already shipped in `portal-autofill-durable-resume`. |
| A2 | External fixtures in `D:/Git/reps/test-scrape-app/` remain the preferred HTML references for future stage selectors (not yet wired into Nest pipelines except as human/docs samples). |
| A3 | User-facing copy stays Russian unless a later spec says otherwise. |
| A4 | Backend remains NestJS + TypeORM + synchronize (no sudden migration to FastAPI / Alembic). |
| A5 | Proxy6 remains the only portal proxy provider (Webshare retired). |
| A6 | “Real-time observability” means operators see progress **during** a run without waiting for HTTP completion — not met today. |

---

## 11. Facts vs assumptions (summary table)

| ID | Type | Statement |
|----|------|-----------|
| F1 | Fact | Stack is NestJS + TypeORM + Postgres under `backend/`; React/Vite under `web/` |
| F2 | Fact | No backend `npm test` script; no Bull/cron job framework |
| F3 | Fact | RegisterUser autofill is staff sync `POST …/portal-autofill` with durable `portal_autofill_runs` checkpoints |
| F4 | Fact | Boot reconciler does not auto-launch Patchright resume |
| F5 | Fact | Login-prep stops before password/OTP/status; SPA has no login-prep button |
| F6 | Fact | `#btnSubmit` after OTP is commented out / not executed |
| F7 | Fact | Webshare module directory absent; Proxy6 entity + DB lease present |
| F8 | Fact | All nine requested `test-scrape-app` HTML fixtures are present on disk |
| F9 | Fact | No encrypted portal-credential store on applications |
| F10 | Fact | Autofill UI does not poll mid-run; waits on sync POST |
| A1–A6 | Assumption | See §10 |

---

## 12. Phase gate

- Phase 0 docs: **complete**.
- Phases 1–6 (architecture, DB, API, integrations, tasks, execution plan): see [`README.md`](./README.md) — status **READY_FOR_IMPLEMENTATION**.
- **Phase 7 implementation: NOT STARTED.** Do not invoke implementers until explicit resume.
