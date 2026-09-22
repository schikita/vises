# TASK-013 — Realtime events + poll APIs

| Field | Value |
|-------|-------|
| Task ID | `TASK-013` |
| Title | Realtime events + poll GET APIs |
| Status | **DONE** |
| REQ/NFR | REQ-024, REQ-029, NFR-007 |
| DEC | DEC-006, DEC-015, DEC-020 |
| Prerequisites | TASK-001, TASK-002 |
| Dependents | TASK-015 |
| Completed | 2026-09-22 |

## Files / modules

- `backend/src/modules/portal-scrape/bls-workflow.controller.ts` — GET snapshot + events
- `backend/src/modules/portal-scrape/workflow/bls-workflow.service.ts` — snapshot/listEvents/appendEvent
- `backend/src/modules/portal-scrape/workflow/bls-workflow.repository.ts` — event append/poll
- Types/utils/constants under portal-scrape
- Paths per `docs/sdd/03-workflow-api.md`

## Acceptance criteria

- `GET …/bls-workflow` snapshot and `GET …/bls-workflow/:id/events?sinceEventId=` implemented.
- Events append-only, payload_safe only.
- Auth admin|manager; Russian error details.
- No WS/SSE.

## Verification criteria

- `npm run build` in `backend/` — **PASS** (2026-09-22)
- Manual curl/Postman against running API when stack up — deferred (stack not required for DONE gate when build green)

## IMPLEMENTATION AGENT PROMPT

Implement **workflow snapshot + events poll APIs** for `durable-bls-workflow` (`docs/sdd/03-workflow-api.md`).

Constraints:
- Nest controllers under `apps`; JWT admin|manager.
- Polling only (DEC-006); no WebSocket/SSE.
- Never return secrets; Russian `{ detail }`.
- Emit events from state transitions (wire what exists; runner will call append).
- types/constants/utils; extend portal-scrape.

Deliver: GET snapshot + events; backend build green.
