# Module: `mailtm`

**Path:** `backend/src/modules/mailtm/`  
**HTTP:** no (integration client)  
**Purpose:** [Mail.tm](https://mail.tm) HTTP temporary-mailbox adapter for portal email OTP when `VISES_PORTAL_EMAIL_PROVIDER=mailtm` (default). Port surface is purpose-named (`TemporaryEmailProvider`); portal-scrape owns the DI factory that binds this adapter or the browser (tempmail.plus) adapter — see [portal-scrape](portal-scrape.md) § Temporary email providers.

## Main parts

| Part | Files | Role |
|------|-------|------|
| Module | `mailtm.module.ts` | Provides / exports **`MailTmService` only** (`TEMPORARY_EMAIL_PROVIDER` is bound in `PortalScrapeModule`) |
| Service | `mailtm.service.ts` | Account create, wait for mail, OTP extract, delete (HTTP) |
| Interface | `interfaces/temporary-email-provider.interface.ts` | `TemporaryEmailProvider` port (`MailPort` / `IDisposableEmail` aliases) |
| Types | `types/temporary-email.types.ts`, `types/mailtm.types.ts` | Agnostic port types + Mail.tm HTTP wire types |
| Constants | base paths, timings, DI token symbols | API + poll defaults; token symbols re-exported for callers |
| Utils | domain pick, local-part/password gen, body combine, OTP / portal-password extract, backoff, sleep, error format | Helpers (shared extractors also used by browser mail) |

## Public service API (Nest DI)

Call sites inject **`TEMPORARY_EMAIL_PROVIDER`** (not `MailTmService`). When the env provider is `mailtm`, those methods resolve to this service:

| Method | Purpose |
|--------|---------|
| `createAccount(input)` | Create disposable address + auth token + password; accepts `contextKey` (ignored for HTTP) |
| `waitLatestMessage(input)` | Poll inbox with backoff until mail or timeout; optional `excludeMessageIds` |
| `extractOtp(input)` | Parse EmailOtp (6-digit verification) from message body (sync) |
| `extractPortalPassword(input)` | Parse post-registration 6-digit portal login password from message body (sync) |
| `deleteAccount(input)` | Best-effort cleanup — **not** after OTP success; terminal / admin only |
| `disposeSession(contextKey)` | Soft no-op on Mail.tm (browser adapter closes Patchright session) |
| `loginAccount(input)` | Soft-fail re-auth (address + password) → account id + token for terminal delete |
| `resolveAccountIdFromToken(token)` | Soft-fail GET `/me` → account id from vaulted Bearer token |

## Retain behavior — operators (Mail.tm / API mode)

Durable BLS workflow **keeps** the disposable mailbox after OTP success so later LOGIN / STATUS / BOOK steps (and staff) can still use the portal-form address.

| Phase | Mailbox |
|-------|---------|
| OTP success (REGISTER) | **Retain** — do **not** call `deleteAccount` |
| With `workflowId` | Vault `MAILTM_PASSWORD` + `MAILTM_TOKEN` when create returned non-empty secrets (needs `VISES_SECRETS_MASTER_KEY`; see [portal-scrape](portal-scrape.md)) |
| Terminal: `AWAITING_STAFF_BOOKING` / `FAILED` / `CANCELLED` / `ABANDONED` | Soft-fail delete via vault after **72h** grace (`mailbox_cleanup_due_at`); purge `MAILTM_*` only — **keep** `PORTAL_PASSWORD` / `PORTAL_PASSWORD_INITIAL` |

Never delete on REGISTER/OTP success alone. Never log tokens or passwords. Admin-only explicit cleanup remains a Should (not required for Must).

When `VISES_PORTAL_EMAIL_PROVIDER=tempmail_plus`, there is **no** Mail.tm HTTP and typically **no** `MAILTM_*` vault rows — cleanup uses `disposeSession` instead (browser close). See portal-scrape temporary-email section.

## Env / settings

- `VISES_PORTAL_EMAIL_PROVIDER` — `mailtm` (default) \| `tempmail_plus`. Empty/invalid → `mailtm`. Boot-time only; restart to switch. Full operator notes (Chrome, single-process session, direct egress): [portal-scrape](portal-scrape.md).
- `MAILTM_API_BASE_URL` — API origin (may be empty at boot). **Required for OTP arming only when provider=`mailtm`**. Not required when `tempmail_plus`.
- Product `emailOtpEnabled` + CapMonster key are always part of OTP arming.
- Vault seal for retained mailbox credentials also needs `VISES_SECRETS_MASTER_KEY` (empty placeholder in `.env.*.example`).
