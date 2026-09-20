# Module: `settings`

**Path:** `backend/src/modules/settings/`  
**HTTP:** yes  
**Purpose:** Singleton company settings (cities, destinations, price, portal integration toggles) and admin demo reset.

## Main parts

| Part | Files | Role |
|------|-------|------|
| Controller | `settings.controller.ts` | GET / PATCH / reset-demo |
| Service | `settings.service.ts` | Load/patch row id=1; calls seed reset |
| DTO | `dto/patch-settings.dto.ts` | Partial settings update |
| Types | `types/settings-out.types.ts` | Facade → `shared/types` `SettingsOut` |
| Constants | `settings.constants.ts`, DI tokens | Defaults / `SETTINGS_SERVICE` |
| Interface | `interfaces/settings.service.interface.ts` | `ISettingsService` |

**Depends on:** `AuthModule`, `SeedModule` (for `resetDemo`), `Setting` entity.  
**Consumed by:** Portal autofill (proxy + email OTP toggles).

## API

| Method | Path | Auth | Response |
|--------|------|------|----------|
| `GET` | `/api/settings` | JWT (any role) | `SettingsOut` |
| `PATCH` | `/api/settings` | JWT + **admin** | `SettingsOut` |
| `POST` | `/api/settings/reset-demo` | JWT + **admin** | `{ ok: true }` |

### `PATCH` body (`PatchSettingsDto`) — all optional

| Field | Type | Meaning |
|-------|------|---------|
| `company` | string | Company display name |
| `defaultPrice` | int | Default payment amount |
| `cities` | string[] | Submit cities catalog |
| `destinations` | string[] | Destinations catalog |
| `webshareProxyEnabled` | boolean | Use Webshare proxies for portal autofill |
| `websharePlanId` | string | Optional Webshare plan filter |
| `emailOtpEnabled` | boolean | Mail.tm disposable OTP during portal autofill |

### `SettingsOut`

`company`, `defaultPrice`, `cities`, `destinations`, `webshareProxyEnabled`, `websharePlanId`, `emailOtpEnabled`.

**No API-key fields** in DTO or UI (DEC-006). CapMonster / Webshare secrets are env-only — see ops rotation below.

### Roles (DEC-001 locked)

| Role | Settings |
|------|----------|
| `admin` | May `PATCH` / `reset-demo` |
| `manager` | Read `GET` only — portal ops elsewhere; **no** settings write |
| `client` | Read `GET` only |
| `superadmin` | **Does not exist** — do not invent |

## Ops: rotating CapMonster / Webshare API keys (DEC-006 / REQ-014)

Keys are **never** stored in the settings DB row and there is **no** in-app key editor.

1. Update deployment env (compose / host `.env` / secrets store):
   - `CAPMONSTER_API_KEY`
   - `WEBSHARE_API_KEY`
   - related portal URL env as needed (`VISES_PORTAL_BASE_URL`, …)
2. Restart the API process so Nest `ConfigService` reloads validated env.
3. Confirm autofill: CapMonster path arms when key non-empty; Webshare lease fails closed if proxy enabled but key missing.
4. Never log keys; never commit live secrets to examples.

Admin UI toggles only `webshareProxyEnabled`, `websharePlanId`, and `emailOtpEnabled`. Proxy “list” = plan id + enablement; full IP-list editing is out of scope.

### `POST /api/settings/reset-demo`

Clears domain data and re-seeds demo users/apps/settings (via `SeedService`). Admin only.
