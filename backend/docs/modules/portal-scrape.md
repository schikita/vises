# Module: `portal-scrape`

**Path:** `backend/src/modules/portal-scrape/`  
**HTTP:** yes (staff autofill + login prep + **durable BLS workflow**)  
**Purpose:** On-demand Patchright browser automation against the external visa portal:

1. **Durable BLS workflow** (primary staff path) — Nest DB-backed runner: **REGISTER → LOGIN → PASSWORD_CHANGE (conditional) → STATUS_VALIDATE → BOOK**. BOOK stops at the CON-006 safe point → workflow status **`AWAITING_STAFF_BOOKING`** (staff finishes VisaType submit / payment manually). Encrypted portal credentials in `bls_secret_vault` (master key `VISES_SECRETS_MASTER_KEY`).
2. **RegisterUser autofill** (legacy / evidence) — map application data → fill fields → optional CapMonster captcha / Mail.tm OTP / proxy lease → durable screenshot evidence; when OTP uses a disposable mail.tm address, persist it as `Application.portalFormEmail` and **retain** the Mail.tm mailbox after OTP success (REQ-016; terminal delete via `BlsWorkflowTerminalCleanupService`).
3. **Login preparation** — navigate to the configured login URL, fill the portal-form email among decoy Email inputs, optionally click `#btnVerify` when CapMonster is configured. Stops there (diagnostic one-shot; full auth is the workflow LOGIN step).

Browsers start only when an HTTP endpoint or the workflow **runner** claims due work (not at API boot for Patchright). There are **no** `portal:*` npm scripts for staff; triggers are HTTP + in-process runner.

## Dual email (CRM vs portal)

| Field | Column | Meaning |
|-------|--------|---------|
| `clientEmail` | `client_email` | CRM / client identity (ACL matching) |
| `portalFormEmail` | `portal_form_email` | Address typed on RegisterUser / used for portal login; nullable until autofill OTP (or seed) sets it |

- Autofill **never** overwrites `clientEmail` with the disposable address.
- Login prep uses **`portalFormEmail` only** (never `clientEmail`). Missing/blank → fail closed with a Russian staff message.
- Upsert API accepts `portalFormEmail` for SPA round-trips but **does not write** it; only autofill persist + seed write the column.
- Staff SPA shows `portalFormEmail` read-only on application detail; client pages may ignore the field. No login-prep button in the SPA yet.

## Main parts

| Part | Files | Role |
|------|-------|------|
| Controller | `bls-workflow.controller.ts` | Staff HTTP: start / snapshot / events / retry / resume / pause / cancel |
| Orchestration | `workflow/bls-workflow.service.ts` + `bls-workflow.runner.ts` | Graph advance, controls, DB poll runner |
| Domain clients | `bls-clients/**` | REGISTER / LOGIN / PASSWORD_CHANGE / STATUS / BOOK (BOOK = CON-006 safe stop) |
| Secrets | `secrets-crypto.service.ts`, `bls-secret-vault.service.ts` | AES-GCM + wrapped DEK; vault rows |
| Terminal cleanup | `bls-workflow-terminal-cleanup.service.ts` | Mail.tm delete + vault purge on terminal |
| Reconciler | `bls-workflow.reconciler.ts` | Boot: clear stale workflow locks |
| Controller | `portal-autofill.controller.ts` | Staff HTTP under `/apps/...` (autofill + runs) |
| Controller | `portal-login-prep.controller.ts` | Staff HTTP login preparation |
| Orchestration | `portal-autofill.service.ts` | Autofill HTTP entry, evidence persist, status mapping, portal-form email persist |
| Orchestration | `portal-login-prep.service.ts` | Login-prep HTTP entry, fail-closed checks, lease, evidence |
| Fill façade | `portal-login-prep-fill.service.ts` | Patchright launch + login pipeline |
| Config | `portal-config.service.ts` | Portal base URL, register path, **login path**, integrations; `resolvePortalLoginUrl` |
| Data | `portal-data.service.ts` | Load application + applicant for fill |
| Mapping | `portal-field-mapper.service.ts` | App → portal field values |
| Fill | `portal-fill.service.ts` | Patchright RegisterUser pipeline (consent, fields, captcha, OTP) |
| DTO | `dto/portal-autofill.dto.ts`, `dto/start-bls-workflow.dto.ts`, `dto/retry-bls-workflow.dto.ts` | Autofill + workflow bodies |
| Constants | captcha/OTP/consent selectors, login selectors, booking, workflow, secrets, DI tokens | Selectors & defaults |
| Types | report, fill pipeline, captcha, config, login prep, BLS workflow API/graph, run list, etc. | Domain contracts |
| Utils | large set under `utils/` | One arrow helper per file (pipeline steps, decoy Email discovery/fill, workflow helpers) |
| Fixtures | `fixtures/*.sample.html` | Offline HTML samples |
| Interfaces | `interfaces/portal-*.interface.ts`, BLS client / executor ports | Capability ports |
| Site adapters | `belarus-portal-site.adapter.ts`, `portal-site-adapter.registry.ts` | Multi-site seam (Belarus first; fail-closed routing) |

**Imports:** Auth, Settings, CapMonster, Mail.tm, Proxy6 (DB lease), TypeORM (`Application`, `User`, `PortalAutofillRun`, `bls_*` + vault entities).

## Env / config

| Key | Role |
|-----|------|
| `VISES_PORTAL_BASE_URL` | Portal origin |
| `VISES_PORTAL_REGISTER_PATH` | RegisterUser path |
| `VISES_PORTAL_LOGIN_PATH` | Login entry path (sample: `/Global/account/login`; required in Zod `appEnvSchema`) |
| `VISES_SECRETS_MASTER_KEY` | **Durable workflow vault** (DEC-005): base64 of exactly **32** random bytes. Empty ⇒ boot OK; encrypt/decrypt fail-closed (**503**). Never commit a real key. Backup required — lost key = unrecovered vault ciphertext. |
| `CAPMONSTER_API_KEY` / `PROXY6_API_KEY` / `MAILTM_API_BASE_URL` | Same as [capmonster](capmonster.md) / [proxy6](proxy6.md) / [mailtm](mailtm.md) |

`PortalConfigService.resolvePortalLoginUrl()` joins base + login path (same style as register). Empty/whitespace path or missing base → fail closed **before** browser launch.

### Operator: master key

1. Generate locally (do **not** paste into git):  
   `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
2. Put the value in gitignored `.env.dev` / `.env.dev.local` / `.env.prod` (samples leave `VISES_SECRETS_MASTER_KEY=` **empty**).
3. Without a valid key, workflow start/login that need vault seal/open return Russian **503** (`Шифрование учётных данных не настроено` / secrets crypto unavailable).

Documented in `.env.dev.example`, `.env.dev.local.example`, `.env.prod.example` (see [config](config.md)).

## Durable BLS workflow (operators)

### Pipeline & CON-006 booking stop

| Step | What automation does | Staff note |
|------|----------------------|------------|
| REGISTER | RegisterUser + OTP; retains Mail.tm mailbox | Evidence may link `portal_autofill_runs` |
| LOGIN | Portal login with vaulted password | — |
| PASSWORD_CHANGE | Conditional reset; else SKIPPED | — |
| STATUS_VALIDATE | Per-applicant status scrape / edit when needed | BOOK waits until applicants ready |
| BOOK | Opens booking UI; optional unambiguous CRM prefill | **Stops before** VisaType `#btnSubmit` / `OnSubmitVisaType`, Premium Lounge Accept, or payment (**CON-006**) |

When BOOK reaches the safe stop, workflow status becomes **`AWAITING_STAFF_BOOKING`** (success terminal for Must path — **DEC-010**). Staff continue booking **manually** in the browser. Status `COMPLETED` is reserved for a future full-booking verify path and is **not** used for the CON-006 stop.

### Mail.tm retain until terminal (REQ-016)

- After registration OTP success the disposable mailbox is **kept** (not deleted).
- Credentials may be vaulted (`MAILTM_TOKEN` / `MAILTM_PASSWORD`) when a `workflowId` is present.
- Delete + vault purge run only on terminal: `AWAITING_STAFF_BOOKING` / `FAILED` / `CANCELLED` / `ABANDONED` (`BlsWorkflowTerminalCleanupService`). See [mailtm](mailtm.md).

### Staff SPA (poll UI)

On application detail → tab **Автозаполнение**, panel **Сценарий BLS**:

- **Start** / **Start supersede** (abandons prior active → `ABANDONED`).
- Live snapshot: status, current step/task, attempt, `nextRunAt`, lock, last safe error, steps/tasks.
- Polls `GET …/bls-workflow` about every **3s** while non-terminal; stops on terminal (including `AWAITING_STAFF_BOOKING`).
- Controls: retry / resume / pause / cancel (admin \| manager; page-gated).
- **Never** shows vault secrets, portal passwords, or Mail.tm tokens.

### Workflow HTTP API overview

All routes: **JWT + roles `admin` \| `manager`**. Base: `@Controller('apps')` → `/api/apps/...`. Responses never include secrets. Control POSTs return immediately (browser work is runner-owned).

| Method | Path | Role |
|--------|------|------|
| `POST` | `/api/apps/:applicationId/bls-workflow` | Start (`{ supersede?: boolean }`) → **201**; active without supersede → **409** |
| `GET` | `/api/apps/:applicationId/bls-workflow` | Latest snapshot (active preferred) |
| `GET` | `/api/apps/:applicationId/bls-workflow/:workflowId` | Snapshot by id |
| `GET` | `/api/apps/:applicationId/bls-workflow/:workflowId/events` | `?sinceEventId=&limit=` event poll |
| `POST` | `/api/apps/:applicationId/bls-workflow/:workflowId/retry` | Manual retry (live lock → **409**) |
| `POST` | `/api/apps/:applicationId/bls-workflow/:workflowId/resume` | Unpause / schedule now |
| `POST` | `/api/apps/:applicationId/bls-workflow/:workflowId/pause` | `PAUSED` |
| `POST` | `/api/apps/:applicationId/bls-workflow/:workflowId/cancel` | `CANCELLED` + cleanup eligibility |

Authoritative shapes: `docs/sdd/03-workflow-api.md`.

## Legacy autofill / login-prep API

All routes: **JWT + roles `admin` \| `manager`**. Controllers base: `@Controller('apps')`.

| Method | Path | Body / query | Response |
|--------|------|--------------|----------|
| `POST` | `/api/apps/:applicationId/portal-autofill` | `{ applicantId: string }` | `AutofillReport` (HTTP status may be non-200 via passthrough) |
| `GET` | `/api/apps/:applicationId/portal-autofill-runs` | `?limit=` (clamped), optional `?applicantId=` | `{ runs, retryEligibility, eligibilityApplicantId }` |
| `GET` | `/api/apps/portal-autofill-runs/:runId/screenshot` | — | PNG `StreamableFile` |
| `POST` | `/api/apps/:applicationId/portal-login-prep` | — | `PortalLoginPrepReport` (HTTP may be 422/502 via passthrough) |

Static path `portal-autofill-runs/:runId/screenshot` is registered **before** `:applicationId/...` routes to avoid param collision.

### `AutofillReport` (high level)

- `ok`, `applicationId`, `applicantId`
- `summary`: `{ filled, skipped, failed }`
- `fields[]`: per-field status / value / reason
- `metadata`, `generatedAt`
- optional `evidence`: run id, paths, `captureOk`, download path

### Run list item

Metadata + enrichment (no secrets): `id`, `applicationId`, `applicantId`, `createdAt`, `captureStatus`, `reportOk`, `errorNote`, `screenshotAvailable`, `downloadPath`, plus lifecycle `status`, `pipelineStage`, `fieldProgressSummary`, `terminalReason`, `captcha` summary. List includes `in_progress`. Response also has pair-scoped `retryEligibility` / `eligibilityApplicantId`.

### `PortalLoginPrepReport` (high level)

- `ok`, `applicationId`, optional `loginUrl`
- `emailFilled`, `verifyClicked`, `capMonsterAttempted`, `capMonsterOk`
- optional `screenshotRelativePath` (under `UPLOAD_DIR/portal-login-prep/…`; no download route in Must)
- `notes[]`, optional `error`
- **No** status-scrape fields, password, or User Id claims

## Login preparation pipeline

1. Load application; if `portalFormEmail` blank → **422** Russian fail-closed.  
2. Resolve login URL from env (`VISES_PORTAL_BASE_URL` + `VISES_PORTAL_LOGIN_PATH`); fail closed if unusable.  
3. Acquire Proxy6 proxy lease when `PROXY6_API_KEY` non-empty (`PortalProxyLeaseService`). Empty key → direct browser egress.  
4. Launch Patchright → `goto` login URL.  
5. Decoy-aware discovery of the real Email control → fill with `portalFormEmail` only.  
6. If CapMonster key non-empty: click `#btnVerify` + existing Verified loop as feasible; else fill-only success with a note.  
7. Optional evidence PNG (no status semantics).  
8. Release lease in `finally`.  
9. **Stop** — no password / User Id / OTP-after-verify / application-status scrape.

Nest CapMonster / Mail.tm / Proxy6 HTTP / CRM remain **non-proxied** (browser lease only).

## Internal autofill pipeline (no public HTTP beyond the routes above)

1. Resolve config (base URL, register path, CapMonster/Mail.tm/proxy flags).  
2. Optionally acquire proxy lease.  
3. Launch Patchright → open RegisterUser → dismiss consent modals.  
4. Map + fill fields; CapMonster-enabled captcha path → Verified loop (below).  
5. Optional Mail.tm inbox + OTP fill when `emailOtpEnabled` **and** captcha success (`capMonsterOk`).  
6. When disposable address was used: **persist** `portalFormEmail` **before** retain/delete decision (persist failure ⇒ hard-fail run + delete). On OTP success: **retain** mailbox (vault `MAILTM_*` when `workflowId` present); delete only on OTP/failure paths. Terminal statuses (`AWAITING_STAFF_BOOKING` / `FAILED` / `CANCELLED` / `ABANDONED`) run `BlsWorkflowTerminalCleanupService` (soft-fail Mail.tm delete + vault purge; events TTL via runner tick).  
7. Capture screenshot → write `portal_autofill_runs` row + file under evidence dir.  
8. Map outcome to HTTP status / application status updates as designed.

## Captcha / CapMonster (Verified gate)

Success is **portal Verified**, not CapMonster API `ready` alone.

| Predicate | Detail |
|-----------|--------|
| Selector | `PORTAL_REGISTER_USER_SELECTORS.verifiedControl` → `#btnVerified` (parent RegisterUser page) |
| Text | Visible control whose text includes `PORTAL_CAPTCHA_VERIFIED_TEXT` (`Verified`, case-sensitive) |
| Non-success | Element present but `display: none` / not visible (sample fixture) |

### CapMonster-enabled path

1. Pipeline clicks `#btnVerify` **once** (unchanged entry).  
2. `runPortalCaptchaVerifiedLoop` owns outer budget + circuit-breaker + Verified checks.  
3. Each attempt: adaptive `#btnVerify` only when challenge/iframe is absent (DEC-002) → re-extract BLS challenge → CB gate → **new** `solveBls3x3` → apply with **real confirm/submit** (DEC-007; not dry-run) → settle → Verified check.  
4. `capMonsterOk = true` **only** when Verified succeeds; otherwise hard-fail with a clear notes string (no key / image payloads).

### CapMonster-disabled path

Unchanged: no Verify click for solve, no CapMonster HTTP, no Verified wait loop.

### Budgets vs per-solve timeout (NFR-002)

| Layer | Constant | Role |
|-------|----------|------|
| Outer wall-clock | `PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_MS` (default 300s) | Hard stop for whole Verified loop |
| Outer attempts | `PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_ATTEMPTS` (default 5) | Max extract→solve→apply cycles |
| Per CapMonster solve | `PORTAL_CAPMONSTER_TIMEOUT_MS` (existing, default 120s) | create+poll budget **per attempt** |
| Granted per attempt | `min(PORTAL_CAPMONSTER_TIMEOUT_MS, remainingOuterMs)` | Keeps total runtime bounded |

Stop when **either** outer attempts **or** outer wall-clock is exhausted. An in-flight CapMonster poll may overrun by at most the timeout already granted for that attempt.

Other named timings: `PORTAL_CAPTCHA_VERIFIED_SETTLE_MS`, `PORTAL_CAPMONSTER_TRANSIENT_BACKOFF_MS` (fixed, no jitter), `PORTAL_CAPTCHA_CHALLENGE_READY_PROBE_MS`.

### Circuit-breaker (ownership in portal-scrape)

| Aspect | Behavior |
|--------|----------|
| **Owner** | Run-scoped state in the Verified-loop util (not `CapMonsterService` singleton) |
| **Classification** | [capmonster](capmonster.md) typed errors (`transient` / `permanent`) |
| **Open** | After `PORTAL_CAPMONSTER_CB_FAILURE_THRESHOLD` (3) **consecutive CapMonster transient** failures → no further `createTask` / `getTaskResult`; phase fails with `PORTAL_CAPMONSTER_CIRCUIT_OPEN_REASON` |
| **Half-open** | After `PORTAL_CAPMONSTER_CB_OPEN_MS` (15s) cooldown, one probe solve; success → `closed`; transient → `open` again |
| **Permanent** | Fail-fast immediately (no half-open) |
| **API success** | CapMonster `ready` resets consecutive transient count (even if Verified not yet shown) |
| **Portal-only failures** | Wrong answer / extract / apply without CapMonster error → consume outer budget only; **do not** open the CapMonster circuit (DEC-004) |

### Confirm path (DEC-007)

Apply still runs real confirm (`onSubmit` / `#submit`). Stale dry-run comments were removed; CapMonster-enabled autofill must not reintroduce dry-run confirm.

### Logging / notes

Phase, attempt index, CB transitions, and failure class may appear in logs/notes. Never log `clientKey`, raw image base64, full CapMonster request bodies, mail.tm passwords/tokens, or proxy passwords.

## Multi-site adapters (DEC-009 / REQ-015 / REQ-016)

Portal HTML/selectors and optional site-outcome probing live behind **`IPortalSiteAdapter`**. Shared layers (run lifecycle, CapMonster, Mail.tm, proxy lease, CRM/status projections) stay reusable.

| Part | Files | Role |
|------|-------|------|
| Interface | `interfaces/portal-site-adapter.interface.ts` | `siteId`, `matches({ submitCountry })`, `supportsSiteOutcomeProbe`, `probeSiteOutcome` |
| Registry | `portal-site-adapter.registry.ts` | Ordered list; first match wins; **no match → fail closed** |
| Belarus (live) | `belarus-portal-site.adapter.ts` | A-MS-1 allow-list: empty or case-insensitive `Belarus`; outcome always `{ state: 'not_available' }` (DEC-002) |
| DI token | `PORTAL_SITE_ADAPTER_REGISTRY` | Injected into autofill orchestration |

### Routing

`POST …/portal-autofill` resolves the adapter **after** loading the application and **before** browser / proxy / Mail.tm work. Unsupported `submitCountry` returns **400** with Russian staff message (`PORTAL_AUTOFILL_RETRY_MSG_UNSUPPORTED_COUNTRY`) — never silent Belarus HTML.

Staff retry eligibility uses the same registry (`adapterSupported`).

### Adding a future Russia (or other) adapter

1. Implement `IPortalSiteAdapter` (e.g. `russia-portal-site.adapter.ts`) with country `matches`, selectors/mapping ownership as needed, and optional real `probeSiteOutcome` when scrapeable.
2. Register the class in `portal-scrape.module.ts` providers.
3. Append it to the ordered list inside `PortalSiteAdapterRegistry` constructor (or a future multi-inject list).
4. Do **not** change CRM dual-status / client `portalProgress` contracts — only adapter capabilities feed `siteOutcome`.

Russia HTML fill is **out of scope** for the current feature (CON-007); only the registration seam is required.

### Client-safe progress

`GET /api/apps` (and upsert/doc responses) embed additive `portalProgress`:

```ts
{
  dataSaved: boolean;
  portalSend: 'not_started' | 'in_progress' | 'attempted' | 'succeeded' | 'failed';
  fillSummary: { filled: number; skipped: number; failed: number } | null;
  siteOutcome: { state: 'not_available' } | { state: 'approved' | 'rejected' | 'unknown'; detail?: string };
}
```

No screenshot URLs, CB dumps, pipeline internals, or secrets (NFR-002). Staff continue to use enriched `GET …/portal-autofill-runs`.
