# TASK-014 — Staff control APIs (start/retry/resume/pause/cancel/supersede)



| Field | Value |

|-------|-------|

| Task ID | `TASK-014` |

| Title | Admin/staff control APIs |

| Status | **DONE** |

| REQ/NFR | REQ-001, REQ-005, REQ-006, REQ-022, REQ-023, NFR-001, NFR-003 |

| DEC | DEC-013, DEC-015 |

| Prerequisites | TASK-002, TASK-003, TASK-004 |

| Dependents | TASK-015 |

| Completed | 2026-09-22 |



## Files / modules



- `backend/src/modules/portal-scrape/bls-workflow.controller.ts` — POST start/retry/resume/pause/cancel + existing GETs

- `backend/src/modules/portal-scrape/workflow/bls-workflow.service.ts` — start/retry/resume/pause/cancel

- `backend/src/modules/portal-scrape/dto/start-bls-workflow.dto.ts`, `retry-bls-workflow.dto.ts`

- Types/utils/constants under portal-scrape

- Paths in `docs/sdd/03-workflow-api.md`



## Acceptance criteria



- POST start (with supersede), retry, resume, pause, cancel implemented.

- Short HTTP responses; enqueue via `nextRunAt` / status — no multi-stage sync browser in request.

- 409 on active conflict / live lock with Russian detail.

- Clients cannot access.



## Verification criteria



- `npm run build` in `backend/` — **PASS** (2026-09-22)

- Exercise endpoints with JWT when stack available — deferred (build gate sufficient for DONE)



## IMPLEMENTATION AGENT PROMPT



Implement **staff control-plane APIs** for `durable-bls-workflow` per `docs/sdd/03-workflow-api.md`.



Constraints:

- Short handlers only (REQ-023); runner executes browser work.

- Roles admin|manager; Russian errors; no secrets in responses.

- One active workflow; supersede → ABANDONED (DEC-013).

- Lock conflicts → 409.

- Extend portal-scrape Nest patterns (mirror `portal-autofill.controller.ts`).

- types/constants/utils rules.



Deliver: start/retry/resume/pause/cancel (+ supersede via start); backend build green.


