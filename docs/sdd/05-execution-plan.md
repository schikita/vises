# Phase 5–6 — Execution plan (durable BLS workflow)

| Field | Value |
|-------|-------|
| Feature id | `durable-bls-workflow` |
| Status | **IMPLEMENTING** |
| Date | 2026-09-22 |
| Tasks | [`tasks/`](./tasks/) (TASK-001…TASK-020) |
| Spec | `specs/features/durable-bls-workflow/02-spec.md` |
| Next | All TASK-001…020 **DONE** → **VERIFYING** |

---

## 1. Definition of READY_FOR_IMPLEMENTATION

This initiative is **READY_FOR_IMPLEMENTATION** when:

1. Spec (`02-spec.md`) is SPECIFIED with REQ/NFR/CON complete — **done**.
2. Architecture, DB, API, integrations docs exist under `docs/sdd/` — **done**.
3. Atomic tasks with agent prompts exist — **done** (TASK-001…020).
4. Specs mirror `03-design` / `04-plan` / `05-tasks` aligned — **done** with this pack.
5. **Phase 7 (product code) has NOT started** until an explicit resume instructs implementers.

---

## 2. Execution DAG (prerequisites → outputs)

```text
TASK-001 persistence
   ├─► TASK-002 state machine
   │      ├─► TASK-003 attempts+lock ──► TASK-004 runner ──► TASK-017 reconcile
   │      │                              │
   │      ├─► TASK-013 events poll API   │
   │      └─► TASK-014 control APIs ─────┴─► TASK-015 SPA UI
   │
   └─► TASK-005 encryption
          └─► TASK-006 email retain
                 │
TASK-007 client scaffolding ◄── TASK-004 (executor port)
   │
   ├─► TASK-008 REGISTER ──► TASK-016 link autofill runs
   │         │
   │         └─► TASK-009 LOGIN ──► TASK-010 password change
   │                    │
   │                    └─► TASK-011 status ──► TASK-012 BOOK
   │                                              │
   └──────────────────────────────────────────────┴─► TASK-018 terminal cleanup

TASK-002 + TASK-005 ──► TASK-020 tests
TASK-014 + TASK-015 ──► TASK-019 operator docs
```

### Sequential order (shared schema / coupling)

Recommended **serial spine** (do not parallelize these against each other):

1. TASK-001 → TASK-002 → TASK-003 → TASK-004  
2. TASK-005 (can start after TASK-001 in parallel with TASK-002/003)  
3. TASK-006 after TASK-005  
4. TASK-007 after TASK-004  
5. Domain chain TASK-008 → TASK-009 → TASK-010 → TASK-011 → TASK-012  
6. TASK-016 after TASK-008  
7. TASK-013 after TASK-002 (parallel with runner)  
8. TASK-014 after TASK-004  
9. TASK-015 after TASK-013+014  
10. TASK-017 after TASK-004  
11. TASK-018 after TASK-006+012  
12. TASK-019 late  
13. TASK-020 after TASK-002+005 (earlier OK once helpers stable)

### Safe parallelization

| Parallel set | Notes |
|--------------|-------|
| TASK-005 ∥ TASK-002/003 | After TASK-001 |
| TASK-013 ∥ TASK-004 | After TASK-002; events don’t need domain clients |
| TASK-017 ∥ TASK-008… | After TASK-004 |
| TASK-020 ∥ mid domain | After crypto+state helpers exist |
| TASK-019 | Docs only; after API/UI shapes stable |

**Do not** parallelize two writers on entity shape (TASK-001 exclusive) or competing edits to the same fill pipeline without coordination (TASK-008 owns submit change).

---

## 3. Validation approach (real commands only)

| Gate | Command |
|------|---------|
| Backend compile | `npm run build` in `backend/` |
| Web | `npm run lint` + `npm run build` in `web/` |
| Stack | `docker compose up` / `docker compose up -d --build` at repo root; `GET /api/health` |
| Portal baselines | `npm run portal:map-check` / `portal:autofill` in `backend/` when fill/map touched |
| New tests | `npm run test:workflow` in `backend/` (TASK-020) — **not** FastAPI/pytest |

No backend lint script today — do not invent.

---

## 4. Non-goals for implementation approach

- Redis/Bull/WS/SSE as primary design
- Greenfield portal-scrape rewrite
- Webshare
- storageState Must
- Automating payment / Premium Lounge / VisaType submit
- Dropping `portal_autofill_runs`

---

## 5. Phase 7 gate (implementation)

**Phase 7 is NOT started** by this document pack.

Start Phase 7 only when orchestrator/user says to implement (typically TASK-001 first batch).

Suggested **first implementation batch**:

1. TASK-001 Persistence foundation  
2. TASK-005 Encryption service (parallel after 001)  
3. TASK-002 State machine + repos  
4. TASK-003 Attempts + locking  
5. TASK-004 Retry scheduler / DB runner  

Then TASK-006/007 and domain chain.

---

## 6. Blockers / risks at plan time

| Item | Status |
|------|--------|
| Spec OQ-012…016 | Closed via DEC-005/010/011/012/014 |
| Blocking architect OQs | **None** |
| RISK-008 WIP tree | Builds must be verified early in Phase 7 |
| RISK-004 master key ops | Documented in TASK-019 |

---

## 7. How to continue

1. Status is **IMPLEMENTING** with all TASK-001…020 **DONE**.  
2. Hand off to **VERIFYING** (orchestrator → verifier).  
3. Progress in `specs/features/durable-bls-workflow/06-implementation.md`.  
4. Workflow unit tests: `npm run test:workflow` in `backend/`.
