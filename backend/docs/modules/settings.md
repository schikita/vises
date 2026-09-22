# Module: `settings`

**Path:** `backend/src/modules/settings/`  
**HTTP:** yes  
**Purpose:** Singleton company settings (cities, destinations, price, email OTP flag) and admin demo reset.

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
**Consumed by:** Portal autofill (email OTP toggle; proxy enablement is env-only via Proxy6).

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
| `cities` | string[] | Submit cities catalog (server coerces to Minsk-only) |
| `destinations` | string[] | Destinations catalog |
| `emailOtpEnabled` | boolean | Mail.tm disposable OTP during portal autofill |

### `SettingsOut`

`company`, `defaultPrice`, `cities`, `destinations`, `emailOtpEnabled`, `demoControlsEnabled`.

**No API-key fields** and **no proxy plan/toggle fields** in DTO or Settings UI. CapMonster / Proxy6 secrets are env-only — see ops rotation below. Proxy inventory/admin is under [`/api/proxy6`](proxy6.md).

### Roles (DEC-001 locked)

| Role | Settings |
|------|----------|
| `admin` | May `PATCH` / `reset-demo` |
| `manager` | Read `GET` only — portal ops elsewhere; **no** settings write |
| `client` | Read `GET` only |
| `superadmin` | **Does not exist** — do not invent |

## Ops: rotating CapMonster / Proxy6 API keys

Keys are **never** stored in the settings DB row and there is **no** in-app key editor.

1. Update deployment env (compose / host `.env` / secrets store):
   - `CAPMONSTER_API_KEY`
   - `PROXY6_API_KEY`
   - related portal URL env as needed (`VISES_PORTAL_BASE_URL`, …)
2. Restart the API process so Nest `ConfigService` reloads validated env.
3. Confirm autofill: CapMonster path arms when key non-empty; Proxy6 lease fails closed when key non-empty but pool empty/all leased. Empty `PROXY6_API_KEY` → direct browser egress.
4. Never log keys; never commit live secrets to examples.

Admin Settings UI does not manage Proxy6 inventory (follow-up SPA). Use admin `/api/proxy6/*` or ops tooling.

### `POST /api/settings/reset-demo`

Clears domain data and re-seeds demo users/apps/settings (via `SeedService`). Admin only.
