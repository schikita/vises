# Module: `portal-scrape`

**Path:** `backend/src/modules/portal-scrape/` (Nest **façade** only)  
**HTTP:** yes (staff autofill + login prep; durable BLS workflow HTTP lives in sibling `bls-workflow`)  
**Purpose:** Composition root for portal automation. Operator-facing behavior is unchanged; packaging is split across sibling Nest modules (feature `portal-scrape-module-split`).

Product capabilities composed by this façade:

1. **Durable BLS workflow** (primary staff path) — Nest DB-backed runner: **REGISTER → LOGIN → PASSWORD_CHANGE (conditional) → STATUS_VALIDATE → BOOK**. BOOK stops at the CON-006 safe point → workflow status **`AWAITING_STAFF_BOOKING`** (staff finishes VisaType submit / payment manually). Encrypted portal credentials in `bls_secret_vault` (master key `VISES_SECRETS_MASTER_KEY`). Owned by `BlsWorkflowModule` + `BlsClientsModule` + `BlsSecretsModule`.
2. **RegisterUser autofill** (legacy / evidence) — map application data → fill fields → optional CapMonster captcha / temporary-email OTP / proxy lease → durable screenshot evidence; when OTP uses a disposable address, persist it as `Application.portalFormEmail` and **retain** the mailbox after OTP success (deferred cleanup via `BlsWorkflowTerminalCleanupService` after **72h** grace). Staff start of autofill is **410 Gone** — use durable BLS workflow. HTTP orchestration stays on this façade; fill/pipeline lives in `PortalFillModule`.
3. **Login preparation** — navigate to the configured login URL, fill the portal-form email among decoy Email inputs, optionally click `#btnVerify` when CapMonster is configured. Stops there (diagnostic one-shot; full auth is the workflow LOGIN step). HTTP orchestration on façade; Patchright pipeline in `PortalFillModule`.

Browsers start only when an HTTP endpoint or the workflow **runner** claims due work (not at API boot for Patchright). There are **no** `portal:map-check` / `portal:autofill` (or other `portal:*`) npm scripts; triggers are HTTP + in-process runner only.

## Nest module map (portal-scrape-module-split)

`AppModule` and `AppsModule` import **only** `PortalScrapeModule` (DEC-002). Child modules are siblings under `backend/src/modules/<name>/` — not nested packages under the façade.

| Nest module | Path | Owns |
|-------------|------|------|
| `PortalScrapeModule` | `portal-scrape/` | **Façade:** composition imports; autofill + login-prep controllers/services; autofill resume reconciler; public `index.ts` re-exports for AppsModule |
| `BlsWorkflowModule` | `bls-workflow/` | Repository, service, lock, runner, reconciler; **`BlsWorkflowTaskExecutor`**; terminal cleanup; workflow controller + DTOs; workflow utils/types/constants |
| `BlsClientsModule` | `bls-clients/` | Domain clients (register/login/password-change/status/booking); `ProxyAdapter` + `PROXY_PROVIDER`; client ports/types/utils (stubs unwired) |
| `PortalFillModule` | `portal-fill/` | All `*-fill.service.ts` + `PortalFillService`; captcha DOM / pipeline utils; `CaptchaAdapter` + `CAPTCHA_PROVIDER` |
| `PortalCoreModule` | `portal-core/` | Config / data / field mapper / site adapter + registry; shared misc utils; `PortalAutofillRunPersistenceService` |
| `BlsSecretsModule` | `bls-secrets/` | `SecretsCryptoService`, `BlsSecretVaultService`, crypto utils/constants/types |
| `BrowserMailModule` | `browser-mail/` | `BrowserMailAdapter`, session store; **boot factory** for `TEMPORARY_EMAIL_PROVIDER` (+ aliases) |

Vendor leaves (unchanged): `mailtm`, `capmonster`, `proxy6`.

### Dependency direction (Nest `imports`)

```text
PortalScrapeModule (façade)
  ├─→ BlsWorkflowModule
  ├─→ BlsClientsModule
  ├─→ PortalFillModule
  ├─→ PortalCoreModule
  ├─→ BlsSecretsModule
  ├─→ BrowserMailModule
  └─→ AuthModule, SettingsModule, CapMonsterModule, MailTmModule, Proxy6Module

BlsWorkflowModule → BlsClientsModule → PortalFillModule → PortalCoreModule / BrowserMailModule / CapMonsterModule
BlsClientsModule  → PortalFillModule / PortalCoreModule / BlsSecretsModule / BrowserMailModule / Proxy6Module
BrowserMailModule → MailTmModule
```

**Forbidden edges:** `mailtm` → `browser-mail` / portal modules; `database` → portal feature modules; `PortalFillModule` → `BlsClientsModule`; `BlsClientsModule` → `BlsWorkflowModule` (no Nest `forwardRef`).

### Token homes (runtime identity unchanged)

| Token | Owning module |
|-------|---------------|
| `TEMPORARY_EMAIL_PROVIDER` / `DISPOSABLE_EMAIL` / `MAIL_PROVIDER` | Bound in `BrowserMailModule` (token symbols from `mailtm`) |
| `CAPTCHA_PROVIDER` / `PORTAL_FORM_FILLER` | `PortalFillModule` |
| `PROXY_PROVIDER` / `BLS_*_CLIENT` | `BlsClientsModule` |
| `BLS_WORKFLOW_TASK_EXECUTOR` | `BlsWorkflowModule` |
| `PORTAL_AUTOFILL_CONFIG` / `PORTAL_APPLICATION_DATA` / `PORTAL_FIELD_MAPPER` / `PORTAL_SITE_ADAPTER_REGISTRY` | `PortalCoreModule` |
| `PORTAL_AUTOFILL` | Façade (`portal-scrape`) |

## Dual email (CRM vs portal)

| Field | Column | Meaning |
|-------|--------|---------|
| `clientEmail` | `client_email` | CRM / client identity (ACL matching) |
| `portalFormEmail` | `portal_form_email` | Address typed on RegisterUser / used for portal login; nullable until autofill OTP (or seed) sets it |

- Autofill **never** overwrites `clientEmail` with the disposable address.
- Login prep uses **`portalFormEmail` only** (never `clientEmail`). Missing/blank → fail closed with a Russian staff message.
- Upsert API accepts `portalFormEmail` for SPA round-trips but **does not write** it; only autofill persist + seed write the column.
- Staff SPA shows `portalFormEmail` read-only on application detail; client pages may ignore the field. No login-prep button in the SPA yet.

## Main parts (façade surface)

| Part | Files | Role |
|------|-------|------|
| Nest façade | `portal-scrape.module.ts` | Imports child modules; providers = autofill + login-prep + resume reconciler only |
| Controller | `portal-autofill.controller.ts` | Staff HTTP under `/apps/...` (autofill runs + **410** start) |
| Controller | `portal-login-prep.controller.ts` | Staff HTTP login preparation |
| Orchestration | `portal-autofill.service.ts` | Autofill HTTP entry, evidence, status mapping, `portalProgress` for AppsModule |
| Orchestration | `portal-login-prep.service.ts` | Login-prep HTTP entry, fail-closed checks, lease, evidence |
| Reconciler | `portal-autofill-resume.reconciler.ts` | Boot: clear stale autofill locks / terminalize expired rows (no browser) |
| DTO | `dto/portal-autofill.dto.ts` | Autofill body (legacy; POST start is 410) |
| Constants / types / utils | façade `constants/` `types/` `utils/` | Autofill HTTP + login-prep HTTP owned symbols; thin re-export barrels of public child API |
| Fixtures | `fixtures/*.sample.html` | Offline HTML samples |
| Interfaces | `interfaces/portal-autofill.interface.ts` | Façade autofill port |

**Sibling ownership (not under this folder):** workflow controller/runner/executor → `bls-workflow/`; domain clients + proxy → `bls-clients/`; Patchright fill + captcha adapter → `portal-fill/`; config/data/mapper/site adapters/run persistence → `portal-core/`; vault crypto → `bls-secrets/`; browser mail + email factory → `browser-mail/`.

**Imports:** Auth, Settings, CapMonster, Mail.tm, Proxy6, TypeORM (`Application`, `User`, `PortalAutofillRun`) plus sibling portal modules above. Call sites inject **purpose ports** (`TEMPORARY_EMAIL_PROVIDER`, `CAPTCHA_PROVIDER`, `PROXY_PROVIDER`, `BLS_*_CLIENT`) from owning modules — not concrete vendor services.

**AppsModule:** imports façade only; injects `PortalAutofillService`; type `PortalClientPortalProgress` from `portal-scrape` public barrel.

## Env / config

| Key | Role |
|-----|------|
| `VISES_PORTAL_BASE_URL` | Portal origin |
| `VISES_PORTAL_REGISTER_PATH` | RegisterUser path |
| `VISES_PORTAL_LOGIN_PATH` | Login entry path (sample: `/Global/account/login`; required in Zod `appEnvSchema`) |
| `VISES_SECRETS_MASTER_KEY` | **Durable workflow vault** (DEC-005): base64 of exactly **32** random bytes. Empty ⇒ boot OK; encrypt/decrypt fail-closed (**503**). Never commit a real key. Backup required — lost key = unrecovered vault ciphertext. |
| `VISES_PORTAL_EMAIL_PROVIDER` | Temporary-email backend: `mailtm` (default) \| `tempmail_plus`. Empty/invalid → `mailtm`. Boot-time factory only — **restart** to switch. See § Temporary email providers. |
| `CAPMONSTER_API_KEY` / `PROXY6_API_KEY` / `MAILTM_API_BASE_URL` | Same as [capmonster](capmonster.md) / [proxy6](proxy6.md) / [mailtm](mailtm.md). `MAILTM_API_BASE_URL` is required for OTP arming only when provider=`mailtm`. |

`PortalConfigService.resolvePortalLoginUrl()` joins base + login path (same style as register). Empty/whitespace path or missing base → fail closed **before** browser launch.

### Temporary email providers (`VISES_PORTAL_EMAIL_PROVIDER`)

Portal OTP uses one Nest-bound `TemporaryEmailProvider` selected at boot by **`BrowserMailModule`** (not the façade):

| Value | Adapter | When to use |
|-------|---------|-------------|
| `mailtm` (default) | [Mail.tm](mailtm.md) HTTP (`MailTmService`) | API containers / no host Chrome |
| `tempmail_plus` | `BrowserMailAdapter` — [tempmail.plus](https://tempmail.plus/) via Patchright | Host process with Chrome (see below) |

**OTP arming** (CapMonster key ∧ product `emailOtpEnabled`):

- `mailtm` — also requires non-empty `MAILTM_API_BASE_URL` after trim.
- `tempmail_plus` — does **not** require `MAILTM_API_BASE_URL`.

**Operator constraints for `tempmail_plus`:**

1. **Host Chrome / Patchright** — Adapter launches `chromium` with `channel: 'chrome'` and lazy-imports `patchright` on first email op (Nest boot does not eager-load Patchright for email). Install Chrome for Patchright on the **same host** that runs the API process (`npx patchright install chrome`). Default Docker API image typically has **no** browser binaries — first mailbox create fails with a clear launch error (RISK-006 / NFR-003).
2. **Single-process in-memory session store** — Inbox browser/context/page is held in a process-local `Map` keyed by `workflowId`. Multi-replica or process restart → later wait/read fails closed (`email_browser_session_missing`). Do not assume shared Redis/session across instances.
3. **Direct egress** — tempmail.plus traffic does **not** use Proxy6. Portal browser steps may still lease Proxy6 for the visa portal; Nest CapMonster / Mail.tm / Proxy6 HTTP remain non-proxied as before.
4. **Vault** — Browser accounts use empty token/password handles; REGISTER does not write `MAILTM_*` vault rows. Terminal cleanup still schedules 72h due-at and calls `disposeSession` (closes Patchright); due tick soft-skips Mail.tm `deleteAccount` when no `MAILTM_*` secrets. `PORTAL_PASSWORD*` purposes are unchanged.

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
| REGISTER | RegisterUser + OTP; retains disposable mailbox | Evidence may link `portal_autofill_runs` |
| LOGIN | Portal login with vaulted password | — |
| PASSWORD_CHANGE | Conditional reset; else SKIPPED | — |
| STATUS_VALIDATE | Per-applicant status scrape / edit when needed | BOOK waits until applicants ready |
| BOOK | Opens booking UI; optional unambiguous CRM prefill | **Stops before** VisaType `#btnSubmit` / `OnSubmitVisaType`, Premium Lounge Accept, or payment (**CON-006**) |

When BOOK reaches the safe stop, workflow status becomes **`AWAITING_STAFF_BOOKING`** (success terminal for Must path — **DEC-010**). Staff continue booking **manually** in the browser. Status `COMPLETED` is reserved for a future full-booking verify path and is **not** used for the CON-006 stop.

### Temporary mailbox + vault cleanup (portal-credential-reveal)

Amends older “immediate delete + purge all vault on terminal” behavior (durable TASK-018 / REQ-016 narrative). Applies to both email providers; browser mode usually has no `MAILTM_*` rows.

| Moment | Disposable mailbox | `MAILTM_*` vault | `PORTAL_PASSWORD_INITIAL` | `PORTAL_PASSWORD` (current) | `portalFormEmail` |
|--------|--------------------|------------------|---------------------------|-----------------------------|-------------------|
| REGISTER success (emailed 6-digit) | **Retain** | Vault when `workflowId` **and** non-empty token/password (API mode); skipped for browser empty secrets | **Set** (6-digit from mail) | **Set** (same as initial) | **Set** |
| PASSWORD_CHANGE success | — | — | **Retain** | **Rotated** to generated new password | — |
| Enter `AWAITING_STAFF_BOOKING` / `FAILED` / `CANCELLED` / `ABANDONED` | **Retain**; set `mailbox_cleanup_due_at` = now + **72h**; eager `disposeSession(workflowId)` | **Retain** if present | **Retain** | **Retain** | **Retain** |
| Runner tick when due | Soft-fail `deleteAccount` when vault secrets present; always `disposeSession` | **Purge** those purposes only (if any) | **Retain** | **Retain** | **Retain** |

- Grace constant: `BLS_WORKFLOW_MAILBOX_CLEANUP_GRACE_MS` (72 hours). No Bull — durable column + runner tick (`purgeDueMailboxes`).
- Soft-fail throughout; never logs tokens/passwords.
- See [mailtm](mailtm.md). Feature: `specs/features/portal-scrape-integration-layers/` (+ `portal-credential-reveal`).

### Staff SPA (poll UI)

On application detail → tab **Автозаполнение**, panel **Сценарий BLS**:

- **Start** / **Start supersede** (abandons prior active → `ABANDONED`).
- Live snapshot: status, current step/task, attempt, `nextRunAt`, lock, last safe error, steps/tasks.
- Polls `GET …/bls-workflow` about every **3s** while non-terminal; stops on terminal (including `AWAITING_STAFF_BOOKING`).
- Controls: retry / resume / pause / cancel (admin \| manager; page-gated). **Pause** and **cancel** immediately signal abort of in-flight portal/browser work and clear `nextRunAt` (no auto-retry while paused/cancelled); HTTP returns after signal — browser teardown is best-effort async.
- Snapshot/events poll **never** shows vault secrets, portal passwords, or Mail.tm tokens.
- Portal password reveal is **API-only** this feature (no SPA button yet) — see reveal route below.

### Workflow HTTP API overview

All routes: **JWT + roles `admin` \| `manager`**. Base: `@Controller('apps')` → `/api/apps/...`.
Snapshot and events responses **never** include secrets. Control POSTs return immediately (browser work is runner-owned).

| Method | Path | Role |
|--------|------|------|
| `POST` | `/api/apps/:applicationId/bls-workflow` | Start (`{ supersede?: boolean }`) → **201**; active without supersede → **409** |
| `GET` | `/api/apps/:applicationId/bls-workflow` | Latest snapshot (active preferred) |
| `GET` | `/api/apps/:applicationId/bls-workflow/:workflowId` | Snapshot by id |
| `GET` | `/api/apps/:applicationId/bls-workflow/:workflowId/events` | `?sinceEventId=&limit=` event poll |
| `GET` | `/api/apps/:applicationId/bls-workflow/:workflowId/portal-credentials` | **Intentional secrets exception:** `{ applicationId, workflowId, portalFormEmail, portalPasswordInitial, portalPassword }` when status ∈ mailbox-cleanup terminals; else **409**. Blank email / missing initial or current password → **422** Russian. Decrypt failure → **503**. Audits `PORTAL_CREDENTIALS_REVEALED` with `{ actorUserId }` only. |
| `POST` | `/api/apps/:applicationId/bls-workflow/:workflowId/retry` | Manual retry (live lock → **409**) |
| `POST` | `/api/apps/:applicationId/bls-workflow/:workflowId/resume` | Unpause / schedule now |
| `POST` | `/api/apps/:applicationId/bls-workflow/:workflowId/pause` | `PAUSED` + clear `nextRunAt` + abort in-flight browser (signal+return) |
| `POST` | `/api/apps/:applicationId/bls-workflow/:workflowId/cancel` | `CANCELLED` + clear `nextRunAt` + abort in-flight browser + mailbox-cleanup schedule |

Authoritative shapes: `docs/sdd/03-workflow-api.md` (snapshot/events); portal credentials: feature `portal-credential-reveal` DEC-001. Nest packaging for workflow/clients/fill lives under sibling modules composed by this façade — see § Nest module map above (HTTP paths/contracts unchanged).

## Legacy autofill / login-prep API

All routes: **JWT + roles `admin` \| `manager`**. Controllers base: `@Controller('apps')`.

| Method | Path | Body / query | Response |
|--------|------|--------------|----------|
| `POST` | `/api/apps/:applicationId/portal-autofill` | (ignored) | **410 Gone** + Russian `{ detail }` — non-executing; use BLS workflow to start registration (`portal-autofill-workflow-cutover` DEC-002) |
| `GET` | `/api/apps/:applicationId/portal-autofill-runs` | `?limit=` (clamped), optional `?applicantId=` | `{ runs, retryEligibility, eligibilityApplicantId }` |
| `GET` | `/api/apps/portal-autofill-runs/:runId/screenshot` | — | PNG `StreamableFile` |
| `POST` | `/api/apps/:applicationId/portal-login-prep` | — | `PortalLoginPrepReport` (HTTP may be 422/502 via passthrough) |

Static path `portal-autofill-runs/:runId/screenshot` is registered **before** `:applicationId/...` routes to avoid param collision.

Workflow REGISTER may still soft-link `portal_autofill_runs` for evidence; staff open screenshots from workflow events, not a legacy start UI.

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
3. Acquire Proxy6 proxy lease when `PROXY6_API_KEY` non-empty (`PROXY_PROVIDER`). Empty key → direct browser egress.  
4. Launch Patchright → `goto` login URL.  
5. Decoy-aware discovery of the real Email control → fill with `portalFormEmail` only.  
6. If CapMonster key non-empty: click `#btnVerify` + existing Verified loop as feasible; else fill-only success with a note.  
7. Optional evidence PNG (no status semantics).  
8. Release lease in `finally`.  
9. **Stop** — no password / User Id / OTP-after-verify / application-status scrape.

Nest CapMonster / Mail.tm / Proxy6 HTTP / CRM remain **non-proxied** (portal browser lease only). tempmail.plus (when enabled) is also direct egress — see § Temporary email providers.

## Internal autofill pipeline (no public HTTP beyond the routes above)

1. Resolve config (base URL, register path, CapMonster / email-provider / proxy flags).  
2. Optionally acquire proxy lease (`PROXY_PROVIDER`).  
3. Launch Patchright → open RegisterUser → dismiss consent modals.  
4. Map + fill fields; CapMonster-enabled captcha path → Verified loop (below).  
5. Optional temporary-email inbox + OTP fill when OTP is armed **and** captcha success (`capMonsterOk`) — Mail.tm HTTP or tempmail.plus browser per `VISES_PORTAL_EMAIL_PROVIDER`.  
6. When disposable address was used: **persist** `portalFormEmail` **before** retain/delete decision (persist failure ⇒ hard-fail run + delete). On OTP success: **retain** mailbox (vault `MAILTM_*` when `workflowId` + API secrets present); delete only on OTP/failure paths. Terminal statuses schedule deferred mailbox cleanup via `BlsWorkflowTerminalCleanupService` (**72h** grace + `disposeSession`; `PORTAL_PASSWORD` retained); events TTL + due-mailbox purge via runner tick.  
7. Capture screenshot → write `portal_autofill_runs` row + file under evidence dir.  
8. Map outcome to HTTP status / application status updates as designed.

> **Cutover note:** Staff `POST …/portal-autofill` remains **410 Gone** (non-executing). Do not revive deleted legacy start paths; primary registration is durable BLS workflow.

## Captcha / CapMonster (Verified gate)

Success is **portal Verified**, not CapMonster API `ready` alone.

| Predicate | Detail |
|-----------|--------|
| Selector | `PORTAL_REGISTER_USER_SELECTORS.verifiedControl` → `#btnVerified` (parent RegisterUser page) |
| Text | Visible control whose text includes `PORTAL_CAPTCHA_VERIFIED_TEXT` (`Verified`, case-sensitive) |
| Non-success | Element present but `display: none` / not visible (sample fixture) |

### CapMonster-enabled path

1. Pipeline clicks `#btnVerify` **once** (unchanged entry).  
2. `runPortalCaptchaVerifiedLoop` owns outer budget + circuit-breaker + Verified checks **and** post-pass same-kind chaining (below). CapMonster `solveBls3x3` remains **one** create+poll per call ([capmonster](capmonster.md)).  
3. Each outer attempt: adaptive `#btnVerify` only when challenge/iframe is absent (ensure-ready DEC) → re-extract BLS challenge → CB gate → **new** `solveBls3x3` → apply with **real confirm/submit** (DEC-007; not dry-run) → burn that outer attempt once → **chain sequence** (below) → only then Verified wait/check.  
4. `capMonsterOk = true` **only** when Verified succeeds after the chain ends; CapMonster `ready` alone is never success. Otherwise hard-fail with a clear notes string (no key / image payloads).

### Post-pass same-kind chain (portal-fill)

After a **successful** first solve-apply in an outer attempt, the Verified loop does **not** treat `#btnVerified` as episode success yet. It runs an in-process chain (`runPortalCaptchaChainAfterPass`):

1. Wait **`PORTAL_CAPTCHA_CHAIN_WAIT_AFTER_PASS_MS` (5000 ms)** — always the full wait after each successful pass (including when Verified is already visible). Abort-interruptible and capped by remaining outer wall-clock (same cooperation as unsolvable backoff).  
2. **Probe-only** same-kind BLS 3×3 presence (GenerateCaptcha iframe / challenge). **No** adaptive `#btnVerify` on probe miss — absent ends the chain.  
3. If a challenge is present and successful applies in this chain are already **4** (1 first pass + **`PORTAL_CAPTCHA_CHAIN_MAX_FOLLOW_UPS` (3)** follow-ups): stop further solves, log `phase=captcha_chain stopReason=chain_limit`, end chain. Do **not** invent a new public episode `stopReason` or permanent CapMonster class for limit alone.  
4. Else: CB gate → follow-up `solvePortalBlsCaptcha` (another CapMonster create+poll + apply). On success, increment chain apply count and repeat from step 1.  
5. When the chain ends (no challenge, or `chain_limit`), continue with existing `waitForPortalCaptchaVerified`. Episode `ok` still requires the Verified predicate.

**Attempt accounting:** one outer burnable attempt covers the first successful pass **and** all successful follow-ups in that chain. Successful follow-ups do **not** increment outer `attempts`. Follow-up failures use the existing taxonomy (unsolvable = free re-submit without counting a successful pass; CapMonster transient/permanent/CB and portal ensure/solve failures = burn / fail-fast as today, then leave the chain).

**Durability:** chain round index is **in-process only** within one Verified attempt — no durable chain-round checkpoint. Resume restores attempts / CB / deadline only; a mid-chain process restart starts a normal outer attempt (may re-solve; bounded by depth + wall-clock).

**Abort / budget:** abort during a chain wait → `stopReason=aborted` (not chain-limit success). Remaining wall-clock ≤ 0 → `budget_exhausted`. Follow-up CapMonster errors drive the same CB / unsolvable / permanent paths as non-chain solves.

All CapMonster-enabled portal pipelines that call `runPortalCaptchaVerifiedLoop` inherit this chain (register autofill, login-prep, etc.) — no per-pipeline duplicate loops.

### CapMonster-disabled path

Unchanged: no Verify click for solve, no CapMonster HTTP, no Verified wait loop, no chain.

### Budgets vs per-solve timeout (NFR-002)

| Layer | Constant | Role |
|-------|----------|------|
| Outer wall-clock | `PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_MS` (default 300s) | Hard stop for whole Verified loop (includes chain waits + follow-up solves) |
| Outer attempts | `PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_ATTEMPTS` (default 5) | Max burnable outer extract→solve→apply cycles (CapMonster `ERROR_CAPTCHA_UNSOLVABLE` free re-submits do **not** consume this budget; successful chain follow-ups share the outer attempt that burned after the first pass) |
| Chain wait after pass | `PORTAL_CAPTCHA_CHAIN_WAIT_AFTER_PASS_MS` (default 5000 ms) | Fixed post-pass delay before same-kind re-probe |
| Chain max follow-ups | `PORTAL_CAPTCHA_CHAIN_MAX_FOLLOW_UPS` (default 3) | Max successful follow-up solve-applies after the first pass (≤ **4** successful applies per chain) |
| CapMonster unsolvable tries | `PORTAL_CAPMONSTER_UNSOLVABLE_MAX_TRIES` (default 10) | Max consecutive CapMonster unsolvable create+poll free re-submits per episode |
| Unsolvable progressive backoff step | `PORTAL_CAPMONSTER_UNSOLVABLE_BACKOFF_STEP_MS` (default 5s) | After unsolvable try `n` (`n=1..9`), wait `n * STEP` before next create+poll (5s…45s before tries 2..10); try 1 immediate; no wait after try 10 |
| Per CapMonster solve | `PORTAL_CAPMONSTER_TIMEOUT_MS` (existing, default 180s) | create+poll budget **per** CapMonster call (first pass and each follow-up) |
| Granted per solve | `min(PORTAL_CAPMONSTER_TIMEOUT_MS, remainingOuterMs)` | Keeps total runtime bounded |

Stop when **outer attempts**, **outer wall-clock**, or the **unsolvable try ceiling** is exhausted. Chain depth alone never marks success. An in-flight CapMonster poll may overrun by at most the timeout already granted for that solve. Wall-clock may still end an unsolvable-only sequence before 10 tries (progressive waits sum to **225s** before try 10 and can hit the 300s outer budget sooner); reaching 10 unsolvables stops free re-submit even if wall-clock remains. Progressive unsolvable waits and chain waits are capped by remaining wall-clock and are **abort-interruptible** when a fill `AbortSignal` is supplied (abort ≠ unsolvable exhaustion / ≠ chain-limit success).

Other named timings: `PORTAL_CAPTCHA_VERIFIED_SETTLE_MS`, `PORTAL_CAPMONSTER_TRANSIENT_BACKOFF_MS` (fixed **2s** for non-unsolvable CapMonster transient only — unsolvable uses progressive backoff above), `PORTAL_CAPTCHA_CHALLENGE_READY_PROBE_MS` (also used as the short same-kind presence probe after chain wait).

### Circuit-breaker (ownership in portal-fill)

| Aspect | Behavior |
|--------|----------|
| **Owner** | Run-scoped state in the Verified-loop util under `portal-fill` (not `CapMonsterService` singleton) |
| **Classification** | [capmonster](capmonster.md) typed errors (`transient` / `permanent`) |
| **Open** | After `PORTAL_CAPMONSTER_CB_FAILURE_THRESHOLD` (3) **consecutive CapMonster transient** failures → no further `createTask` / `getTaskResult`; phase fails with `PORTAL_CAPMONSTER_CIRCUIT_OPEN_REASON` |
| **Half-open** | After `PORTAL_CAPMONSTER_CB_OPEN_MS` (15s) cooldown, one probe solve; success → `closed`; transient → `open` again |
| **Permanent** | Fail-fast immediately (no half-open) |
| **API success** | CapMonster `ready` resets consecutive transient count (even if Verified not yet shown) |
| **Portal-only failures** | Wrong answer / extract / apply without CapMonster error → consume outer budget only; **do not** open the CapMonster circuit (DEC-004) |
| **`ERROR_CAPTCHA_UNSOLVABLE`** | Free CapMonster re-submit: **does not** burn outer attempts, **does not** call CB failure recorder (no fail_fast / no consecutive transient increment), **does not** set `capmonsterPermanentFailed`. Re-runs ensure → extract → new `createTask` while wall-clock remains **and** unsolvable try count `< PORTAL_CAPMONSTER_UNSOLVABLE_MAX_TRIES`, with **progressive linear backoff** after tries 1..9 (`n * 5s`, abort-interruptible). After **10** unsolvables → `stopReason=capmonster_unsolvable_exhausted` + companion `errorCode=ERROR_CAPTCHA_UNSOLVABLE_TRIES_EXHAUSTED` (non-permanent; no progressive wait). On a runnable BLS workflow task, that maps to `SAFE_TO_REPEAT` → task `lastError*` + `WAITING_RETRY` / `nextRunAt`; paused / cancelled / terminal workflows do **not** get a new auto-retry schedule. Distinct from wrong-answer after API `ready` (that still burns attempts). |

### Confirm path (DEC-007)

Apply still runs real confirm (`onSubmit` / `#submit`). Stale dry-run comments were removed; CapMonster-enabled autofill must not reintroduce dry-run confirm.

### Logging / notes

Phase, attempt index, CB transitions, failure class, and chain tokens (`phase=captcha_chain`, round/apply index, stop reasons such as `no_challenge` / `chain_limit`) may appear in logs/notes. Never log `clientKey`, raw image base64, full CapMonster request bodies, mail.tm passwords/tokens, or proxy passwords.

## Multi-site adapters (DEC-009 / REQ-015 / REQ-016)

Portal HTML/selectors and optional site-outcome probing live behind **`IPortalSiteAdapter`**. Shared layers (run lifecycle, CapMonster, Mail.tm, proxy lease, CRM/status projections) stay reusable.

| Part | Files | Role |
|------|-------|------|
| Interface | `portal-core/interfaces/…` (`IPortalSiteAdapter`) | `siteId`, `matches({ submitCountry })`, `supportsSiteOutcomeProbe`, `probeSiteOutcome` |
| Registry | `portal-core/…/portal-site-adapter.registry.ts` | Ordered list; first match wins; **no match → fail closed** |
| Belarus (live) | `portal-core/…/belarus-portal-site.adapter.ts` | A-MS-1 allow-list: empty or case-insensitive `Belarus`; outcome always `{ state: 'not_available' }` (DEC-002) |
| DI token | `PORTAL_SITE_ADAPTER_REGISTRY` | Injected into autofill orchestration (owned by `PortalCoreModule`) |

### Routing

Staff `POST …/portal-autofill` is **410 Gone** (non-executing). Workflow REGISTER / fill pipeline resolves the adapter **after** loading the application and **before** browser / proxy / Mail.tm work. Unsupported `submitCountry` returns **400** with Russian staff message (`PORTAL_AUTOFILL_RETRY_MSG_UNSUPPORTED_COUNTRY`) — never silent Belarus HTML.

Staff retry eligibility uses the same registry (`adapterSupported`).

### Adding a future Russia (or other) adapter

1. Implement `IPortalSiteAdapter` (e.g. `russia-portal-site.adapter.ts`) with country `matches`, selectors/mapping ownership as needed, and optional real `probeSiteOutcome` when scrapeable.
2. Register the class in **`PortalCoreModule`** providers (not the façade).
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
