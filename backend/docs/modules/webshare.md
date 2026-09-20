# Module: `webshare`

**Path:** `backend/src/modules/webshare/`  
**HTTP:** no (integration + in-process lease)  
**Purpose:** Fetch usable Webshare proxies and **lease** one per portal autofill browser session (fail closed if none free).

## Main parts

| Part | Files | Role |
|------|-------|------|
| Module | `webshare.module.ts` | Wires list + lease services |
| List service | `webshare-proxy-list.service.ts` | Paginated Proxy List API + TTL cache |
| Lease service | `portal-proxy-lease.service.ts` | Mutexed acquire/release of proxy ids |
| Types | proxy rows, runtime config, lease, Patchright proxy config | Contracts |
| Constants | base URL, TTL default, page size, backoff, error messages | Protocol / ops |
| Utils | build proxy server URLs, sticky username, Patchright config, mask address, mutex, errors | Helpers |

## Public service API (Nest DI)

### `WebshareProxyListService`

- `getUsableProxies(config, forceRefresh)` — inventory of usable proxies for plan/key; respects TTL and 429 backoff.

### `PortalProxyLeaseService`

- `acquire(config)` → `PortalProxyLease` (includes Patchright-ready proxy config).  
- `release(lease)` — free id for reuse.  
- Errors: misconfigured, auth, rate limited, empty pool, all leased, list failed.

## Env / settings

| Source | Key / field |
|--------|-------------|
| Env | `WEBSHARE_API_KEY`, `WEBSHARE_PROXY_LIST_TTL_MS` |
| Settings (DB) | `webshareProxyEnabled`, `websharePlanId` |

When proxy is enabled but key missing / misconfigured, portal autofill fails closed rather than running direct egress.

### Ops rotation (DEC-006)

1. Set/replace `WEBSHARE_API_KEY` in deployment env (not Settings PATCH).
2. Optionally adjust `WEBSHARE_PROXY_LIST_TTL_MS`.
3. Restart the API.
4. Admin may still toggle `webshareProxyEnabled` / `websharePlanId` in Settings UI after restart.

See [settings](settings.md) for elevated-operator policy (`admin` only; no `superadmin`).
