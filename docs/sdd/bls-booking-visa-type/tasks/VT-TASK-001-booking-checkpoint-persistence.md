# VT-TASK-001 — Booking checkpoint persistence

| Field | Value |
|-------|-------|
| Task ID | `VT-TASK-001` |
| Title | Ensure BOOK can persist portal checkpoint (reuse MA columns or shared migration) |
| owner_layer | `apps/api` database (+ worker entity mirror) |
| depends_on | **Human approval of DEC-003** (`04-plan.md` §7) |
| Phase | A |
| Status | **DONE** |
| REQ/NFR | REQ-018, CON-007, NFR-003 |
| sensitive_paths | TypeORM migration; schema bootstrap |

## Acceptance criteria

- If MA `portal_status` + `portal_checkpoint_json` already exist on `bls_workflow_tasks`: document reuse; **no new migration**; task is DONE after verification note in plan.
- Else: additive nullable columns (same names as MA) on `bls_workflow_tasks` in api + worker entities; human approval recorded before merge.
- Null-compatible with resume-from-scratch.

## verification_commands

```bash
cd apps/api && npm run lint && npm run build
cd apps/workflow-worker && npm run lint && npm run build
# If migration required (after DEC-003 approved in 04-plan.md §7):
# hand-authored additive migration under apps/api; npm run build; migration:run in approved env only
```

## Verification notes (2026-11-14)

**Outcome: DONE — Option A reuse confirmed. No new migration.**

### Column evidence (present)

| Surface | Path | Evidence |
|---------|------|----------|
| API entity | `apps/api/src/modules/database/entities/bls-workflow-task.entity.ts` | `portalStatus` → `portal_status` varchar(64) nullable; `portalCheckpointJson` → `portal_checkpoint_json` jsonb nullable |
| Worker entity | `apps/workflow-worker/src/modules/database/entities/bls-workflow-task.entity.ts` | Same columns mirrored |
| Migration | `apps/api/src/modules/database/migrations/1794676457503-AddBlsWorkflowTaskPortalCheckpoint.ts` | MA-TASK-001 additive `up`/`down` for both columns |
| Schema bootstrap (api) | `apps/api/src/modules/database/schema.bootstrap.ts` | `ADD COLUMN IF NOT EXISTS portal_status` / `portal_checkpoint_json` |
| Schema bootstrap (worker) | `apps/workflow-worker/src/modules/database/schema.bootstrap.ts` | Same ensure |

Nullability satisfies resume-from-scratch / resume-from-scrape.

### Commands

| Command | Result |
|---------|--------|
| `cd apps/api && npm run lint` | PASS (noop exit 0) |
| `cd apps/api && npm run build` | FAIL — 3 pre-existing TS errors unrelated to checkpoint columns (`build-analytics-dto.util.ts`, `auth.service.ts`, `map-client-to-list-dto.util.ts`) |
| `cd apps/workflow-worker && npm run lint` | PASS (noop exit 0) |
| `cd apps/workflow-worker && npm run build` | PASS |

Plan note: `04-plan.md` §7 DEC-003 updated with VT-TASK-001 Option A verification.

## IMPLEMENTATION AGENT PROMPT

Implement or verify booking checkpoint persistence per `02-database.md` / **DEC-003**. **Default path = Option A:** verify `portal_status` + `portal_checkpoint_json` already exist on api+worker entities; if present, record reuse in `04-plan.md` §7 and mark this task DONE without a new migration. Only author Option B additive migration on drift, with nullable rollback note. Follow Nest entity + file-separation rules. **Stop** if DEC-003 is `_pending_` and columns are missing. Do not store PII or email bodies.
