# Vises API — Backend documentation

NestJS 11 API for the Vises CRM (visa applications). Global prefix: **`/api`**. Default listen: **`0.0.0.0:8100`**.

## Runtime

| Item | Value |
|------|--------|
| Entry | `src/main.ts` → `AppModule` |
| Validation | Global `ValidationPipe` (`whitelist`, `transform`, `forbidNonWhitelisted`) |
| Errors | `DetailExceptionFilter` (`shared/filters`) |
| Auth | Bearer JWT (`Authorization: Bearer <token>`) via `JwtAuthGuard` |
| Roles | `admin` · `manager` · `client` (`RolesGuard` + `@Roles`) |
| CORS | `origin: *`, `credentials: false` |

## Module map

| Module | HTTP? | Role |
|--------|-------|------|
| [health](modules/health.md) | Yes | Liveness |
| [auth](modules/auth.md) | Yes | Login, demo, me, invite |
| [users](modules/users.md) | Yes | Admin user CRUD |
| [apps](modules/apps.md) | Yes | Applications + documents |
| [settings](modules/settings.md) | Yes | Company settings + demo reset |
| [portal-scrape](modules/portal-scrape.md) | Yes | Portal RegisterUser autofill |
| [capmonster](modules/capmonster.md) | No | Captcha solver (used by portal) |
| [mailtm](modules/mailtm.md) | No | Disposable email OTP (portal) |
| [webshare](modules/webshare.md) | No | Proxy lease pool (portal) |
| [config](modules/config.md) | No | Env validation / ConfigService |
| [database](modules/database.md) | No | TypeORM + entities |
| [logger](modules/logger.md) | No | Winston Nest logger |
| [seed](modules/seed.md) | No | Boot seed + demo reset data |
| [shared](modules/shared.md) | — | Cross-cutting guards, mappers, utils |

`AppModule` imports: config → logger → database → seed → health → auth → users → apps → settings → portal-scrape. CapMonster, Mail.tm, and Webshare are pulled in by `PortalScrapeModule`.

## API route index

All paths below are under `/api`.

### Public / unauthenticated

| Method | Path | Module |
|--------|------|--------|
| `GET` | `/health` | health |
| `POST` | `/auth/login` | auth |
| `POST` | `/auth/demo` | auth |
| `GET` | `/invite/:token` | auth |

### Authenticated (JWT)

| Method | Path | Roles | Module |
|--------|------|-------|--------|
| `GET` | `/auth/me` | any | auth |
| `GET` | `/settings` | any | settings |
| `GET` | `/apps` | any (scoped) | apps |
| `POST` | `/apps` | any (scoped) | apps |
| `POST` | `/apps/:appId/docs` | any (scoped) | apps |
| `GET` | `/apps/:appId/docs/:docId` | any (scoped) | apps |

### Staff / admin

| Method | Path | Roles | Module |
|--------|------|-------|--------|
| `DELETE` | `/apps/:appId` | admin, manager | apps |
| `PATCH` | `/settings` | admin | settings |
| `POST` | `/settings/reset-demo` | admin | settings |
| `GET` | `/users` | admin | users |
| `POST` | `/users` | admin | users |
| `PATCH` | `/users/:userId` | admin | users |
| `POST` | `/users/:userId/reissue` | admin | users |
| `DELETE` | `/users/:userId` | admin | users |
| `POST` | `/apps/:applicationId/portal-autofill` | admin, manager | portal-scrape |
| `GET` | `/apps/:applicationId/portal-autofill-runs` | admin, manager | portal-scrape |
| `GET` | `/apps/portal-autofill-runs/:runId/screenshot` | admin, manager | portal-scrape |

## Auth header

```http
Authorization: Bearer <jwt>
```

JWT is issued by `POST /auth/login` or `POST /auth/demo` (when enabled).

## Related code layout

```txt
backend/src/
  main.ts
  app.module.ts
  modules/          # feature + infra modules (this docs set)
  shared/           # cross-cutting (see modules/shared.md)
```
