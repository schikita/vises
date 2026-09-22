# Module: `mailtm`

**Path:** `backend/src/modules/mailtm/`  
**HTTP:** no (integration client)  
**Purpose:** [Mail.tm](https://mail.tm) temporary mailbox lifecycle for portal email OTP during autofill / BLS workflow (`TemporaryEmailProvider`, DEC-007).

## Main parts

| Part | Files | Role |
|------|-------|------|
| Module | `mailtm.module.ts` | Provides / exports `MailTmService` as `TEMPORARY_EMAIL_PROVIDER` |
| Service | `mailtm.service.ts` | Account create, wait for mail, OTP extract, delete |
| Interface | `interfaces/temporary-email-provider.interface.ts` | `TemporaryEmailProvider` port (`IDisposableEmail` alias) |
| Types | `types/mailtm.types.ts` | Account / message / OTP result types |
| Constants | base paths, timings, DI tokens | API + poll defaults |
| Utils | domain pick, local-part/password gen, body combine, OTP extract, backoff, sleep, error format | Helpers |

## Public service API (Nest DI)

| Method | Purpose |
|--------|---------|
| `createAccount()` | Create disposable address + auth token + password (password for vault retain only — never log) |
| `waitLatestMessage(input)` | Poll inbox with backoff until mail or timeout |
| `extractOtp(input)` | Parse OTP from message body (sync) |
| `deleteAccount(input)` | Best-effort cleanup — **not** after OTP success; terminal / admin only (REQ-016) |
| `loginAccount(input)` | Soft-fail re-auth (address + password) → account id + token for terminal delete |
| `resolveAccountIdFromToken(token)` | Soft-fail GET `/me` → account id from vaulted Bearer token |

## Retain behavior (REQ-016 / DEC-007) — operators

Durable BLS workflow and RegisterUser autofill **keep** the disposable mailbox after OTP success so later LOGIN / STATUS / BOOK steps (and staff) can still use the portal-form address.

| Phase | Mailbox |
|-------|---------|
| OTP success (REGISTER) | **Retain** — do **not** call `deleteAccount` |
| With `workflowId` | Vault `MAILTM_PASSWORD` + `MAILTM_TOKEN` (needs `VISES_SECRETS_MASTER_KEY`; see [portal-scrape](portal-scrape.md)) |
| Legacy autofill without `workflowId` | Retain without vault |
| Terminal: `AWAITING_STAFF_BOOKING` / `FAILED` / `CANCELLED` / `ABANDONED` | Soft-fail delete via vault (token → GET `/me`, else `portalFormEmail` + password login), then purge vault rows (`BlsWorkflowTerminalCleanupService`) |

Never delete on REGISTER/OTP success alone. Never log tokens or passwords. Admin-only explicit cleanup remains a Should (not required for Must).

## Env / settings

- `MAILTM_API_BASE_URL` — API origin (may be empty at boot; required when email OTP is armed).  
- Settings flag `emailOtpEnabled` (admin) gates use from portal autofill.  
- CapMonster key presence is part of “armed” conditions in portal config (OTP flow still needs captcha path).  
- Vault seal for retained mailbox credentials also needs `VISES_SECRETS_MASTER_KEY` (empty placeholder in `.env.*.example`).
