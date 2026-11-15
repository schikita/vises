# APF-TASK-002 — Client/Application schema + migration

| Field | Value |
|-------|-------|
| Task ID | `APF-TASK-002` |
| Title | Additive `clients` + `applications` columns, bootstrap, worker entity mirror |
| owner_layer | `apps/api` database (+ `apps/workflow-worker` entity mirror) |
| depends_on | APF-TASK-001 (property names); **DEC-005 approved** |
| Phase | A |
| Status | **DONE** |
| REQ/NFR | REQ-002, REQ-003, NFR-001, NFR-002, DEC-001, DEC-002, DEC-005 |
| sensitive_paths | TypeORM migration; `schema.bootstrap.ts`; Client/Application entities |

## Acceptance criteria

- Add `applications.visa_sub_type` varchar(120) nullable → property `visaSubType`.
- Add all plaintext nullable `clients` columns from [`02-database.md`](../02-database.md) §2.2 including `portal_form_conditionals_json` jsonb nullable.
- TypeORM migration under `apps/api/src/modules/database/migrations/` — additive only; reversible `down` documented.
- Update `apps/api/src/modules/database/schema.bootstrap.ts` (`ADD COLUMN IF NOT EXISTS` pattern if present).
- Mirror Client (and Application if duplicated) in `apps/workflow-worker/src/modules/database/entities/`; update worker `schema.bootstrap.ts` if used.
- Do **not** extend `PII_ENCRYPTED_FIELD_KEYS`.
- Null-compatible with existing rows.

## verification_commands

```bash
cd apps/api && npm run lint && npm run build
cd apps/workflow-worker && npm run lint && npm run build
# Apply only in approved env after review:
# cd apps/api && npm run migration:run
```

## IMPLEMENTATION AGENT PROMPT

Implement additive schema per [`02-database.md`](../02-database.md). DEC-005 already approved in [`04-plan.md`](../04-plan.md) §7. Entity columns + migration + bootstrap + worker mirrors. One concern per file. No service/DTO logic here (APF-TASK-003). Never invent defaults that fill portal content. Do not touch FE.
