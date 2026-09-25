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

- **One** create+poll solve per call (no outer retry loop, no multi-captcha chain). Multi-attempt / Verified wait **and** post-pass same-kind chaining live in portal-fill’s Verified loop — see [portal-scrape](portal-scrape.md) Captcha / CapMonster Verified gate.
- Throws typed `CapMonsterClientError` with `failureClass: 'transient' | 'permanent'` (plus optional `errorCode` / `httpStatus` / `phase`) so portal circuit-breaker never scrapes prose alone.
- Does **not** log `clientKey` or image payloads.
- Portal DOM extraction and chain orchestration stay in `portal-fill` (composed via [portal-scrape](portal-scrape.md)); this module only talks to CapMonster HTTP API.

## Failure taxonomy (DEC-001)

Classification is pure and deterministic (`classifyCapMonsterFailure`). Constants live in `constants/capmonster-failure.constants.ts`.

### CapMonster JSON business errors (`errorId !== 0`, HTTP 2xx)

| Class | `errorCode` (non-exhaustive; see constants) |
|-------|-----------------------------------------------|
| **Transient** | `ERROR_NO_SLOT_AVAILABLE`, `ERROR_TOO_MANY_REQUESTS`, `ERROR_CAPTCHA_UNSOLVABLE` |
| **Permanent** | `ERROR_KEY_DOES_NOT_EXIST`, `ERROR_ZERO_BALANCE`, `ERROR_KEY_DENIED`, `ERROR_IP_NOT_ALLOWED`, `ERROR_IP_BLOCKED`, `ERROR_TASK_NOT_SUPPORTED` |
| **Permanent (default)** | Any other non-empty `errorCode`, or missing `errorCode` with `errorId !== 0` |

#### `ERROR_CAPTCHA_UNSOLVABLE` (Verified-loop free re-submit)

CapMonster’s own description treats this as usually temporary and recommends submitting the task again (unsolved tasks are typically not charged). Product behavior:

- Classified **transient** (not permanent / fail_fast).
- In the portal Verified loop: **re-submit** (fresh extract + new `createTask`) **without** burning outer `PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_ATTEMPTS`, **without** calling the CapMonster circuit-breaker failure recorder, and **without** setting `capmonsterPermanentFailed`.
- Hard budget of **`PORTAL_CAPMONSTER_UNSOLVABLE_MAX_TRIES` (10)** consecutive CapMonster unsolvable create+poll tries per captcha episode, **and** outer wall-clock (`PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_MS`). Either budget can end the episode first.
- **Progressive linear backoff** (unsolvable path only): after counted try `n` (`n=1..9`), wait **`n * PORTAL_CAPMONSTER_UNSOLVABLE_BACKOFF_STEP_MS` (5s)** before the next CapMonster create+poll — i.e. **5s, 10s, …, 45s** before tries 2..10. Try 1 is immediate. After try **10** exhaustion there is **no** progressive wait. Non-unsolvable CapMonster transient (slot / rate-limit) still uses fixed `PORTAL_CAPMONSTER_TRANSIENT_BACKOFF_MS` (2s).
- Progressive waits are **abort-interruptible** when the fill/workflow `AbortSignal` is present; abort ends the wait early and exits via abort cooperation (`stopReason=aborted`) — **not** unsolvable exhaustion. Wait duration is also capped by remaining Verified wall-clock; expiry uses existing `budget_exhausted` (does not raise `PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_MS`). Cumulative waits (225s before try 10) may hit the 300s outer budget before 10 unsolvables.
- After **10** unsolvables: Verified loop stops with `stopReason=capmonster_unsolvable_exhausted` and durable companion `errorCode=ERROR_CAPTCHA_UNSOLVABLE_TRIES_EXHAUSTED` (message names CapMonster `ERROR_CAPTCHA_UNSOLVABLE` + 10 tries). This is **not** CapMonster permanent / `capmonsterPermanentFailed`.
- On a durable BLS workflow task attempt, clients map that code via `SAFE_TO_REPEAT` → runner persists task `lastError*` and schedules `nextRunAt` / `WAITING_RETRY` **only if** the workflow is still runnable (not paused / cancelled / terminal). CapMonsterService itself remains **one** create+poll per `solveBls3x3` call.
- Distinct from portal **wrong-answer** after CapMonster `ready` + apply (that path still burns outer attempts).

See [portal-scrape](portal-scrape.md) Captcha / CapMonster Verified gate.

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
