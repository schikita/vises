# Module: `capmonster`

**Path:** `backend/src/modules/capmonster/`  
**HTTP:** no (integration client)  
**Purpose:** CapMonster Cloud client for **ComplexImage BLS 3×3** captcha solving used by portal autofill.

## Main parts

| Part | Files | Role |
|------|-------|------|
| Module | `capmonster.module.ts` | Provides / exports service |
| Service | `capmonster.service.ts` | `createTask` + poll `getTaskResult` |
| Interface | `interfaces/captcha-solver.interface.ts` | `ICaptchaSolver` (`solveBls3x3`) |
| Types | `capmonster.types.ts`, `capmonster-client-error.types.ts` | API shapes + typed client errors |
| Constants | API paths, task types, poll status, DI token, **failure taxonomy** | Protocol literals + transient/permanent tables |
| Utils | `post-capmonster-json`, classify/create/is-error, sleep, base64 strip/assert, answer validate, error format | HTTP + taxonomy helpers |

## Public service API (Nest DI)

```ts
solveBls3x3(input: {
  clientKey: string;
  taskArgument: string;
  imagesBase64: string[]; // 9 tiles
  timeoutMs?: number;     // optional; portal passes min(PORTAL_CAPMONSTER_TIMEOUT_MS, remainingOuterMs)
}): Promise<SolveBls3x3ViaCapMonsterResult>
```

- **One** create+poll solve per call (no outer retry loop). Multi-attempt / Verified wait lives in [portal-scrape](portal-scrape.md).
- Throws typed `CapMonsterClientError` with `failureClass: 'transient' | 'permanent'` (plus optional `errorCode` / `httpStatus` / `phase`) so portal circuit-breaker never scrapes prose alone.
- Does **not** log `clientKey` or image payloads.
- Portal DOM extraction stays in `portal-scrape`; this module only talks to CapMonster HTTP API.

## Failure taxonomy (DEC-001)

Classification is pure and deterministic (`classifyCapMonsterFailure`). Constants live in `constants/capmonster-failure.constants.ts`.

### CapMonster JSON business errors (`errorId !== 0`, HTTP 2xx)

| Class | `errorCode` (non-exhaustive; see constants) |
|-------|-----------------------------------------------|
| **Transient** | `ERROR_NO_SLOT_AVAILABLE`, `ERROR_TOO_MANY_REQUESTS` |
| **Permanent** | `ERROR_KEY_DOES_NOT_EXIST`, `ERROR_ZERO_BALANCE`, `ERROR_KEY_DENIED`, `ERROR_IP_NOT_ALLOWED`, `ERROR_IP_BLOCKED`, `ERROR_TASK_NOT_SUPPORTED`, `ERROR_CAPTCHA_UNSOLVABLE` |
| **Permanent (default)** | Any other non-empty `errorCode`, or missing `errorCode` with `errorId !== 0` |

### Transport / HTTP (`postCapMonsterJson`)

| Class | Condition |
|-------|-----------|
| **Transient** | Network/fetch failures; abort / request timeout; HTTP **408, 425, 429, 500, 502, 503, 504** |
| **Permanent** | HTTP **400, 401, 403, 404** and other **4xx** not listed as transient |
| **Transient (default)** | Ambiguous non-2xx when status cannot be parsed |

### Other

| Class | Condition |
|-------|-----------|
| **Transient** | Per-solve poll wall timeout (`getTaskResult` timed out) |
| **Permanent** | Client validation before HTTP (empty key / TaskArgument, bad image count, unexpected poll `status`); unknown non-CapMonster throws inside solve |

## Env / config

- `CAPMONSTER_API_KEY` validated in [config](config.md); passed in as `clientKey` by portal config when solving.
- Never put real keys in docs or commit examples with live secrets.

### Ops rotation (DEC-006)

1. Set/replace `CAPMONSTER_API_KEY` in deployment env (not Settings PATCH).
2. Restart the API.
3. Permanent CapMonster failures (bad key / zero balance / denied) require this remediation before staff captcha/new-run affordances become useful again.

See also [settings](settings.md) elevated-settings policy (admin DB toggles only; no in-app key editor).
