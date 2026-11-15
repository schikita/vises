# MA-TASK-001 — Task portalStatus + checkpoint columns

| Field | Value |
|-------|-------|
| Task ID | `MA-TASK-001` |
| Title | Additive `portal_status` + `portal_checkpoint_json` on `bls_workflow_tasks` |
| owner_layer | `apps/api` database (+ worker entity mirror) |
| depends_on | OQ-001 **APPROVED** 2026-11-14 (`04-plan.md` §7) |
| Phase | A |
| Status | **DONE** (arch OKAY + code OKAY, 2026-11-14) |
| REQ/NFR | REQ-015, REQ-016, REQ-018, NFR-007, DEC-003 |
| sensitive_paths | TypeORM migration; schema bootstrap |

## Acceptance criteria

- Columns `portal_status` (varchar nullable) and `portal_checkpoint_json` (jsonb nullable) on `bls_workflow_tasks`.
- Entities updated in `apps/api` and mirrored in `apps/workflow-worker`.
- Migration additive only; null = resume-from-scrape compatible.
- Human approval recorded in `04-plan.md` §7 before merge.

## verification_commands

```bash
cd apps/api && npm run lint && npm run build
cd apps/workflow-worker && npm run lint && npm run build
# Migration (after OQ-001 recorded in 04-plan.md §7):
# Prefer hand-authored additive migration under apps/api/src/modules/database/migrations/
# then: cd apps/api && npm run build
# Apply only in approved env: npm run migration:run
# Optional entity-diff assist: npm run migration:generate (review diff; no secrets)
```

## IMPLEMENTATION AGENT PROMPT

Implement additive persistence for Manage Applicants checkpoints (**DEC-003**, OQ-001 approved). Do **not** store field values. Align with `02-database.md`. Sync api + worker entities. Follow file-separation / Nest entity rules. Do not reopen TASK-011 docs. Persist columns ready for scraped/normalized `FORM_FILLING_IN_PROGRESS` \| `READY_TO_BOOK` \| `UNKNOWN` (write path lands in MA-TASK-002).
