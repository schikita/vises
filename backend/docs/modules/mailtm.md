# Module: `mailtm`

**Path:** `backend/src/modules/mailtm/`  
**HTTP:** no (integration client)  
**Purpose:** [Mail.tm](https://mail.tm) disposable mailbox lifecycle for portal email OTP during autofill.

## Main parts

| Part | Files | Role |
|------|-------|------|
| Module | `mailtm.module.ts` | Provides / exports `MailTmService` |
| Service | `mailtm.service.ts` | Account create, wait for mail, OTP extract, delete |
| Interface | `interfaces/disposable-email.interface.ts` | `IDisposableEmail` port |
| Types | `types/mailtm.types.ts` | Account / message / OTP result types |
| Constants | base paths, timings, DI token | API + poll defaults |
| Utils | domain pick, local-part/password gen, body combine, OTP extract, backoff, sleep, error format | Helpers |

## Public service API (Nest DI)

| Method | Purpose |
|--------|---------|
| `createAccount()` | Create disposable address + auth token |
| `waitLatestMessage(input)` | Poll inbox with backoff until mail or timeout |
| `extractOtp(input)` | Parse OTP from message body (sync) |
| `deleteAccount(input)` | Best-effort cleanup |

## Env / settings

- `MAILTM_API_BASE_URL` — API origin (may be empty at boot; required when email OTP is armed).  
- Settings flag `emailOtpEnabled` (admin) gates use from portal autofill.  
- CapMonster key presence is part of “armed” conditions in portal config (OTP flow still needs captcha path).
