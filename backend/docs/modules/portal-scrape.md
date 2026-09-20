# Module: `portal-scrape`

**Path:** `backend/src/modules/portal-scrape/`  
**HTTP:** yes (staff autofill)  
**Purpose:** On-demand Patchright browser automation against the external visa portal **RegisterUser** form: map application data → fill fields → optional CapMonster captcha / Mail.tm OTP / Webshare proxy → durable screenshot evidence.

Browsers start only when the HTTP endpoint is invoked (not at API boot).

## Main parts

| Part | Files | Role |
|------|-------|------|
| Controller | `portal-autofill.controller.ts` | Staff HTTP under `/apps/...` |
| Orchestration | `portal-autofill.service.ts` | HTTP entry, evidence persist, status mapping |
| Config | `portal-config.service.ts` | Portal URL/path + env/settings for integrations |
| Data | `portal-data.service.ts` | Load application + applicant for fill |
| Mapping | `portal-field-mapper.service.ts` | App → portal field values |
| Fill | `portal-fill.service.ts` | Patchright pipeline (consent, fields, captcha, OTP) |
| DTO | `dto/portal-autofill.dto.ts` | `{ applicantId }` |
| Constants | captcha/OTP/consent selectors, field sets, evidence paths, DI tokens | Selectors & defaults |
| Types | report, fill pipeline, captcha, config, run list, etc. | Domain contracts |
| Utils | large set under `utils/` | One arrow helper per file (pipeline steps) |
| Fixtures | `fixtures/*.sample.html` | Offline HTML samples |
| Interfaces | `interfaces/portal-*.interface.ts` | Capability ports (`IPortalAutofill`, `IPortalSiteAdapter`, …) |
| Site adapters | `belarus-portal-site.adapter.ts`, `portal-site-adapter.registry.ts` | Multi-site seam (Belarus first; fail-closed routing) |

**Imports:** Auth, Settings, CapMonster, Mail.tm, Webshare, TypeORM (`Application`, `User`, `PortalAutofillRun`).

## API

All routes: **JWT + roles `admin` \| `manager`**. Controller base: `@Controller('apps')`.

| Method | Path | Body / query | Response |
|--------|------|--------------|----------|
| `POST` | `/api/apps/:applicationId/portal-autofill` | `{ applicantId: string }` | `AutofillReport` (HTTP status may be non-200 via passthrough) |
| `GET` | `/api/apps/:applicationId/portal-autofill-runs` | `?limit=` (clamped), optional `?applicantId=` | `{ runs, retryEligibility, eligibilityApplicantId }` |
| `GET` | `/api/apps/portal-autofill-runs/:runId/screenshot` | — | PNG `StreamableFile` |

Static path `portal-autofill-runs/:runId/screenshot` is registered **before** `:applicationId/...` routes to avoid param collision.

### `AutofillReport` (high level)

- `ok`, `applicationId`, `applicantId`
- `summary`: `{ filled, skipped, failed }`
- `fields[]`: per-field status / value / reason
- `metadata`, `generatedAt`
- optional `evidence`: run id, paths, `captureOk`, download path

### Run list item

Metadata + enrichment (no secrets): `id`, `applicationId`, `applicantId`, `createdAt`, `captureStatus`, `reportOk`, `errorNote`, `screenshotAvailable`, `downloadPath`, plus lifecycle `status`, `pipelineStage`, `fieldProgressSummary`, `terminalReason`, `captcha` summary. List includes `in_progress`. Response also has pair-scoped `retryEligibility` / `eligibilityApplicantId`.

## Internal pipeline (no public HTTP)

1. Resolve config (base URL, register path, CapMonster/Mail.tm/Webshare flags).  
2. Optionally acquire Webshare proxy lease.  
3. Launch Patchright → open RegisterUser → dismiss consent modals.  
4. Map + fill fields; CapMonster-enabled captcha path → Verified loop (below).  
5. Optional Mail.tm inbox + OTP fill when `emailOtpEnabled` **and** captcha success (`capMonsterOk`).  
6. Capture screenshot → write `portal_autofill_runs` row + file under evidence dir.  
7. Map outcome to HTTP status / application status updates as designed.

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

Phase, attempt index, CB transitions, and failure class may appear in logs/notes. Never log `clientKey`, raw image base64, or full CapMonster request bodies.

## Multi-site adapters (DEC-009 / REQ-015 / REQ-016)

Portal HTML/selectors and optional site-outcome probing live behind **`IPortalSiteAdapter`**. Shared layers (run lifecycle, CapMonster, Mail.tm, Webshare, CRM/status projections) stay reusable.

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
