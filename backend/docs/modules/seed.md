# Module: `seed`

**Path:** `backend/src/modules/seed/`  
**HTTP:** no (triggered at boot + via settings API)  
**Purpose:** Seed-if-empty demo data on module init; shared `resetDemo` used by admin settings.

## Main parts

| Part | Files | Role |
|------|-------|------|
| Module | `seed.module.ts` | Registers `SeedService` |
| Service | `seed.service.ts` | `OnModuleInit` → `seedIfEmpty`; `resetDemo` |
| Constants | demo users/credentials, settings, volume, name pools | Fixed demo ids, passwords, RNG knobs |
| Utils | `build-seed-users`, `build-sample-apps`, `build-extra-seed-apps`, RNG helpers | Demo dataset factories |
| Types | factories, seed applicant/client profiles | Factory typing |

## Behavior

### Boot (`onModuleInit`)

If tables are empty, insert:

- Fixed demo admin / manager / client accounts
- Extra random managers and clients (`active` mix)
- Settings row
- Fixed sample applications (`a1`, `a2`, `a5`) plus many random apps across all CRM statuses. Sample/extra rows that represent post-autofill carry a distinct `portalFormEmail` alongside `clientEmail`; never-autofilled demos leave `portalFormEmail` null.

Volume knobs live in `constants/demo-seed-volume.constants.ts`. Generation is deterministic (`SEED_RNG_SEED`) so reset-demo / image rebuilds stay reproducible.

### Admin API link

`POST /api/settings/reset-demo` (see [settings](settings.md)) clears domain tables and re-runs seed logic so operators can restore a known demo dataset.

## Demo accounts (seed-if-empty)

| Role | Id | Login |
|------|-----|-------|
| admin | `u-admin` | `admin` |
| manager | `u-maria` | `maria@vises.app` |
| client | `u-anna` | `anna@example.com` |
| client | `u-pavel` | `pavel@example.com` |

Display names are Russian (Cyrillic); logins/emails stay ASCII.  
Extra managers: `elena@vises.app`, `igor@vises.app`, `sofia@vises.app` (some may be inactive).  
Extra clients: `client.N@example.com` (shared client password; ~20% inactive).

Invite tokens: `seed-admin`, `seed-manager`, `seed-client`, `seed-client-pavel`, `seed-manager-*`, `seed-client-*`. Passwords live in `constants/demo-credentials.constants.ts` (local-dev only).
