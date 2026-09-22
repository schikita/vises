# TASK-007 — Domain BLS client scaffolding + provider ports

| Field | Value |
|-------|-------|
| Task ID | `TASK-007` |
| Title | Domain BLS clients scaffolding + Proxy/Captcha ports |
| Status | **DONE** |
| REQ/NFR | REQ-017, REQ-025, REQ-028 |
| DEC | DEC-008, DEC-017 |
| Prerequisites | TASK-004 (executor port) |
| Dependents | TASK-008…TASK-012 |

## Files / modules

- `backend/src/modules/portal-scrape/bls-clients/**` (register/login/password-change/status/booking stubs)
- Thin `ProxyProvider` / `CaptchaProvider` adapters wrapping `proxy6` + `capmonster`
- Orchestrator imports clients only via interfaces

## Acceptance criteria

- Domain clients are import-separable from runner (REQ-017 / AC-012).
- Proxy6 lease + CapMonster remain concrete defaults; fail-closed when required.
- No page automation complete yet — stubs + interfaces OK; subsequent tasks fill in.

## Verification criteria

- `npm run build` in `backend/` — **PASS** (2026-09-22)

## IMPLEMENTATION AGENT PROMPT

Scaffold **BLS domain clients** and **ProxyProvider / CaptchaProvider** ports for `durable-bls-workflow` (DEC-008 / DEC-017).

Constraints:
- Clients live under `portal-scrape/bls-clients/`; orchestrator must not embed selectors.
- Reuse `PortalProxyLeaseService` and CapMonster service — do not reintroduce Webshare.
- No new anti-bot stack.
- types/constants/utils rules; Nest module wiring.
- Do not implement full register/login/booking flows here (later tasks).

Deliver: interfaces + Nest providers + stub methods; runner can inject them; backend build green.

## Implementation notes

- Added `bls-clients/` with interfaces, stub Nest services, Proxy6/CapMonster adapters, and `BlsWorkflowTaskExecutor` dispatcher (by step/task key).
- `BLS_WORKFLOW_TASK_EXECUTOR` now binds to the dispatcher (legacy `StubBlsWorkflowTaskExecutor` kept unwired).
- Stubs return structured `SAFE_TO_REPEAT` — no Patchright / selectors.
- See `specs/features/durable-bls-workflow/06-implementation.md`
