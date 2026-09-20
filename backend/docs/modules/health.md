# Module: `health`

**Path:** `backend/src/modules/health/`  
**HTTP:** yes  
**Purpose:** Minimal liveness probe for compose / reverse proxies.

## Main parts

| Part | File | Role |
|------|------|------|
| Module | `health.module.ts` | Registers controller |
| Controller | `health.controller.ts` | `GET /health` |

## API

| Method | Path | Auth | Response |
|--------|------|------|----------|
| `GET` | `/api/health` | none | `{ "ok": true }` |

No DTOs, services, or DB access.
