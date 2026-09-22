# Module: `database`

**Path:** `backend/src/modules/database/`  
**HTTP:** no  
**Purpose:** PostgreSQL via TypeORM — root connection, entity registration, schema bootstrap on start.

## Main parts

| Part | Files | Role |
|------|-------|------|
| Module | `database.module.ts` | `TypeOrmModule.forRootAsync` + `forFeature` export |
| Bootstrap | `schema.bootstrap.ts` | Startup schema side-effects |
| Entities | `entities/*.entity.ts` | Tables |

## Entities (API-related persistence)

### `users` — `User`

Identity for auth and ACL: `id`, `name`, `login`, `email`, `passwordHash`, `invitePassword`, `role`, `active`, `inviteToken`, timestamps.

### `applications` — `Application`

CRM application: code, `clientEmail` (CRM identity / ACL), nullable `portalFormEmail` (portal RegisterUser / login address), status, travel/submit fields, JSON `applicants` / `documents` / `timeline` / `extras`, payment & visit fields, manager, timestamps.

### `settings` — `Setting`

Singleton-style row: company, default price, cities/destinations arrays, `emailOtpEnabled`. Legacy proxy-provider columns are dropped on boot (`SchemaBootstrap`).

### `proxy6_proxies` — `Proxy6Proxy`

Proxy6 inventory + lease state: host/port/credentials, period/expiry, `active`, `in_use`, lease token/timestamps, fairness counters. See [proxy6](proxy6.md).

### `portal_autofill_runs` — `PortalAutofillRun`

Durable autofill evidence metadata: application/applicant ids, screenshot relative path, capture status, `reportOk`, triggered-by user, error note, `createdAt`. PNG bytes live on disk, not in DB.

## Connection

- Driver: PostgreSQL (`DATABASE_URL`).  
- `synchronize: true` on API start (schema applied automatically).
