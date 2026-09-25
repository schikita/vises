# Module: `proxy6`

**Path:** `backend/src/modules/proxy6/`  
**HTTP:** yes (admin management under `/api/proxy6`)  
**Purpose:** Proxy6 API client, DB inventory reconcile, fair DB lease for portal Patchright sessions, and admin-only management APIs.

## Main parts

| Part | Files | Role |
|------|-------|------|
| Module | `proxy6.module.ts` | HttpModule + TypeORM `Proxy6Proxy` + services/controller |
| API client | `proxy6-api.service.ts` | Serialized Proxy6 HTTP (`px6.link`); 429 backoff |
| Inventory | `proxy6-inventory.service.ts` | `getproxy` / buy / prolong upsert; soft deactivate missing |
| Lease | `portal-proxy-lease.service.ts` | DB LRL lease + stale reclaim (`SKIP LOCKED`) |
| Controller | `proxy6.controller.ts` | Admin JWT routes (masked responses) |
| Entity | `database/entities/proxy6-proxy.entity.ts` | Inventory + lease columns |
| Types / constants / utils | module folders + barrels | One util per file; no secrets in logs/API |

## Public service API (Nest DI)

### `Proxy6ApiService`

Methods: `getproxy`, `getprice`, `getcount`, `getcountry`, `buy`, `prolong`, `delete` (+ `deleted` fallback), `check`, optional `setdescr`, balance. Never logs API key or proxy passwords.

### `Proxy6InventoryService`

- Force refresh from remote; optional debounce for non-forced reconcile.
- Non-forced refresh also uses **in-process single-flight** (concurrent callers share one in-flight `getproxy` after a debounce miss). Admin `POST /proxies/refresh` remains forced and does **not** join that coalesce as owner.
- Upsert from buy/prolong (persists `period_days` / `date_end`).
- Soft `active=false` for remote-missing rows (including when `in_use`).

### `PortalProxyLeaseService`

- `acquire(config)` → lease handle with Patchright proxy config (`http://host:port` + optional `bypass`).
- `release` / handle `release` — idempotent clear of in-use fields.
- Empty/whitespace `PROXY6_API_KEY` → caller skips lease (direct browser). Non-empty + empty/all-leased pool → fail closed.
- **Empty usable pool:** before returning `empty_pool`, acquire runs a non-forced `refreshFromRemote(false)` **outside** the lease DB transaction, then retries fair selection **once**. Sync/API errors propagate as existing `Proxy6ApiError` codes (not remapped to `empty_pool`). Still-empty after a successful sync uses a clarified Russian message. **No auto-buy** from this path — restock via admin buy/refresh.
- **`all_leased`** (usable rows exist but all busy): no remote reconcile; same message as before.
- Coalesce/debounce are **per Nest process**. Multi-replica deploys may each issue their own coalesced `getproxy` after a wipe (residual; no shared cluster lock in v1).

## Env

| Source | Key |
|--------|-----|
| Env | `PROXY6_API_KEY` (empty allowed; non-empty enables portal proxying) |

No buy period/country env defaults. No list TTL env (module debounce constant only).

## Admin HTTP (`/api/proxy6`)

All routes: **JWT + role `admin`**. Responses never include API key or proxy user/password (hosts masked).

| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/balance` | Account balance |
| `GET` | `/price` | Query: count, period, optional version |
| `GET` | `/count` | Query: country, optional version |
| `GET` | `/countries` | Optional version |
| `POST` | `/buy` | Body: count, period, country; defaults version=4, type=auto |
| `POST` | `/prolong` | Body: period, ids |
| `POST` | `/replace` | Buy then delete; partial failure → Russian CONFLICT |
| `POST` | `/delete` | Body: ids |
| `GET` | `/proxies` | Masked DB inventory |
| `POST` | `/proxies/refresh` | Force remote reconcile |
| `GET` | `/stats` | Lease counters from DB |

## Portal-only proxy (DEC-005)

Patchright browser context uses the leased Proxy6 endpoint — including **durable BLS workflow** domain clients (REGISTER…BOOK) and legacy RegisterUser / login-prep HTTP paths. Nest CapMonster / Mail.tm / Proxy6 HTTP stay direct (not routed through the browser proxy). Optional `proxy.bypass` host list is best-effort (may be empty).

Workflow BOOK still stops at CON-006 (`AWAITING_STAFF_BOOKING`); proxy lease release is independent of that staff booking handoff. See [portal-scrape](portal-scrape.md).

## Schema

- Table `proxy6_proxies` via TypeORM `synchronize: true`.
- Startup `SchemaBootstrap` drops legacy settings columns `webshare_proxy_enabled` / `webshare_plan_id` if present (CON-008). **No Alembic.**

See [settings](settings.md), [portal-scrape](portal-scrape.md), [config](config.md), [database](database.md).
