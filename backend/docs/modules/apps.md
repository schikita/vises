# Module: `apps`

**Path:** `backend/src/modules/apps/`  
**HTTP:** yes  
**Purpose:** Visa applications CRM — list/upsert/delete apps, upload and download documents. Visibility is role-scoped.

## Main parts

| Part | Files | Role |
|------|-------|------|
| Controller | `apps.controller.ts` | `/apps` REST + multipart docs |
| Service | `apps.service.ts` | Persistence, ACL, uploads, client mint |
| DTO | `dto/upsert-app.dto.ts` | Full upsert body (`AppIn` parity) |
| Types | `types/app-out.types.ts`, `upsert-app-result.types.ts`, `doc-meta.types.ts`, `privileged-app-fields.types.ts`, `timeline-item.types.ts` | API + domain shapes |
| Constants | `app-status.constants.ts`, `app-code.constants.ts`, `payment.constants.ts`, `upload-dir.constants.ts` | Statuses, codes, upload roots |
| Utils | document I/O, ACL (`can-see-app`, `assert-client-owns`), extras merge, code generation, etc. | One util per file |
| Interface | `interfaces/apps.service.interface.ts` | `IAppsService` |

**Depends on:** `AuthModule`, `UsersModule`, `PortalScrapeModule` (client-safe `portalProgress` embed), `Application` + `User` entities.  
**Related HTTP:** Portal autofill routes also live under `/api/apps/...` but belong to [portal-scrape](portal-scrape.md).

## Application statuses

`new`, `docs`, `review`, `ready`, `booked`, `done`, `fixes`, `autofill_ok`, `autofill_failed`, `declined`.  
Clients may only set `new` / `docs`.

## API

All routes require **JWT**. Delete requires **admin or manager**.

| Method | Path | Roles | Notes | Response |
|--------|------|-------|-------|----------|
| `GET` | `/api/apps` | any | Filtered by role (client sees own apps) | `AppOut[]` |
| `POST` | `/api/apps` | any | Upsert; status **200** | `UpsertAppResult` |
| `DELETE` | `/api/apps/:appId` | admin, manager | Soft/hard remove per service | `{ ok: true }` |
| `POST` | `/api/apps/:appId/docs` | any (must see app) | Multipart: field `file`, body `type` | `AppOut` |
| `GET` | `/api/apps/:appId/docs/:docId` | any (must see app) | File stream attachment | `StreamableFile` |

### `POST /api/apps` body (`UpsertAppDto`)

Optional fields include: `id`, `code`, `clientEmail`, `status`, travel/submit fields, `applicants`, `documents`, payment/visit fields, `manager`, `timeline`, `category`, `paused`, `transfer`, `submitFrom` / `submitTo`, plus ignored-on-write `createdAt` / `updatedAt` for SPA full-object upserts.

### Response shapes

**`AppOut`:** application CRM fields in camelCase (`id`, `code`, `clientEmail`, `status`, applicants/documents JSON, payment, visit, manager, timeline, extras-derived flags, timestamps), plus additive **`portalProgress`** (client-safe portal send/fill/site-outcome projection — see [portal-scrape](portal-scrape.md)).

**`UpsertAppResult`:** `AppOut` plus optional `issuedClientAccess` (`UserCredentialsOut`) when staff upsert mints a new client account.
