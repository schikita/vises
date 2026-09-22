# HANDOFF — bls-workflow-frontend

| Field | Value |
|-------|-------|
| Feature id | `bls-workflow-frontend` |
| Lifecycle status | **READY_FOR_IMPLEMENTATION** |
| Date | 2026-09-22 |
| IMPLEMENTING | **Not started** — do not treat this pack as in-progress product work |

---

## 1. Document paths

### Authoritative (PRIMARY)

| Doc | Path |
|-----|------|
| Index | `docs/sdd/frontend/README.md` |
| Request | `docs/sdd/frontend/00-request.md` |
| Discovery | `docs/sdd/frontend/00-discovery.md` |
| Target UX + DECs | `docs/sdd/frontend/01-target-ux.md` |
| API mapping | `docs/sdd/frontend/02-api-contract-mapping.md` |
| FSD design | `docs/sdd/frontend/03-fsd-component-design.md` |
| Plan | `docs/sdd/frontend/04-plan.md` |
| Task index | `docs/sdd/frontend/05-tasks.md` |
| Atomic tasks | `docs/sdd/frontend/tasks/FE-TASK-*.md` |
| This handoff | `docs/sdd/frontend/HANDOFF.md` |

### Specs mirror

| Doc | Path |
|-----|------|
| REQ/NFR/CON SoT | `specs/features/bls-workflow-frontend/02-spec.md` |
| Design / plan / tasks mirrors | `03-design.md`, `04-plan.md`, `05-tasks.md` |
| Lifecycle stubs | `06-implementation.md`, `07-verification.md`, `08-review.md` (NOT_STARTED) |

### Upstream (reuse; DONE)

- `docs/sdd/03-workflow-api.md`
- `docs/sdd/tasks/TASK-015-spa-poll-ui.md` (baseline)
- ISSUE-003 residual → closed by SPA events poll (this feature)

---

## 2. Execution order of FE tasks

1. **FE-TASK-001** — Events entity layer  
2. **FE-TASK-002** — Current-task + applicant utils  
3. **FE-TASK-003** — Snapshot DTO `id` / `maxAttempts`  
4. **FE-TASK-004** — Dual poll loop  
5. **FE-TASK-005** — Step visualization  
6. **FE-TASK-006** — Task detail + targeted retry  
7. **FE-TASK-007** — Events timeline + run link  
8. **FE-TASK-008** — CON-006 handoff + dual-mode copy  
9. **FE-TASK-009** — a11y + empty/error polish  
10. **FE-TASK-010** — Lint/build sweep  

**Suggested first implementer batch:** FE-TASK-001, FE-TASK-002, FE-TASK-003 (parallel).

---

## 3. Hard constraints

- **No secrets** in UI (passwords, Mail.tm tokens, DEK, `lockOwner`, vault).
- **Roles:** JWT `admin` \| `manager` only; no client workflow UI.
- **CON-006:** `AWAITING_STAFF_BOOKING` = success handoff; staff finish booking manually; never claim full booking automation.
- **Reuse** existing HTTP contracts (`docs/sdd/03-workflow-api.md`); additive DTO only per DEC-003.
- **Russian** staff-facing copy (NFR-001).
- **No WebSocket / SSE / EventSource / socket.io** (DEC-001 / CON-002 / NFR-005).
- **Extend** dual-mode Автозаполнение — do not replace RegisterUser evidence (DEC-002).
- FSD: types/constants/utils + container/render; no giant SPA redesign.
- Validation: `web` `npm run lint` + `npm run build` (backend build for FE-TASK-003).

---

## 4. Do not re-discover unless contradicted

Discovery (`docs/sdd/frontend/00-discovery.md`) and DECs in `01-target-ux.md` are authoritative Facts/Assumptions for this initiative. Re-open discovery **only** if code/API Facts contradict those docs.

---

## 5. Key decisions (quick)

| ID | Decision |
|----|----------|
| **DEC-001** | Snapshot + events **poll** ~3s; **reject WS/SSE** |
| **DEC-002** | Dual-mode Autofill **extend**; workflow primary |
| **DEC-003** | Small backend snapshot fields `tasks[].id` + `maxAttempts` |
| **DEC-004** | Applicant id Must; name from form applicants Should |
| **DEC-005** | Fixed RU CON-006 handoff banner copy |
| **DEC-006** | Compact events feed + optional expand |

---

## 6. Open questions / blockers

| Item | Status |
|------|--------|
| OQ-001…006 | **Resolved** via DEC-001…006 |
| Architectural blockers | **None** |
| Upstream ISSUE-001/002 (live E2E / compose) | Deferred; out of this FE feature scope |
| Env for manual smoke | Assumption: implementer has staff JWT + API |

---

## 7. Orchestrator instructions

1. Set lifecycle **IMPLEMENTING** only when product work starts.  
2. Assign implementer to first batch with each task’s **IMPLEMENTATION AGENT PROMPT**.  
3. Mark each `FE-TASK-###` DONE only after implementation **and** its verification criteria.  
4. After FE-TASK-010, move to VERIFYING (`07-verification.md`).  
5. **Do not** implement in the architect phase — already complete.

---

## 8. Explicit status note

**Phase IMPLEMENTING has not started.** This handoff ends at **READY_FOR_IMPLEMENTATION**. No product code under `backend/` or `web/` was modified by the architect phase that produced this pack.
