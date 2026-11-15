# Tasks index — applicant-portal-form-fields

| Field | Value |
|-------|-------|
| Feature id | `applicant-portal-form-fields` |
| Status | **DONE** (all APF-TASK-001…005 arch OKAY + code OKAY) |
| Date | 2026-11-15 |
| Spec SoT | [`02-spec.md`](./02-spec.md) |
| Plan | [`04-plan.md`](./04-plan.md) |
| Atomic prompts | [`tasks/`](./tasks/) |

## Execution order

| ID | Title | REQ | Depends | Phase | Status |
|----|-------|-----|---------|-------|--------|
| [APF-TASK-001](./tasks/APF-TASK-001-contracts-extended-fields.md) | Contracts extended portal + visaSubType | REQ-001,003,004,007 | — | A | **DONE** (arch OKAY + code OKAY) |
| [APF-TASK-002](./tasks/APF-TASK-002-client-application-schema.md) | Client/Application schema + migration | REQ-002,003, NFR-001…002, DEC-005 | 001 | A | **DONE** (arch OKAY + code OKAY) |
| [APF-TASK-003](./tasks/APF-TASK-003-api-dto-persistence.md) | Nest DTO + persist/read | REQ-003,004,009,010 | 001, 002 | A | **DONE** (arch OKAY + code OKAY) |
| [APF-TASK-004](./tasks/APF-TASK-004-worker-crm-wiring.md) | Worker map + status/booking | REQ-005,006,007,009 | 003 | B | **DONE** (arch OKAY + code OKAY) |
| [APF-TASK-005](./tasks/APF-TASK-005-completeness-gate.md) | Completeness happy-path keys (api + worker) | REQ-008,009, CON-004 | 003, 004 | C | **DONE** (arch OKAY + code OKAY) |

## First batch (after DEC-005)

1. APF-TASK-001  
2. APF-TASK-002  
3. APF-TASK-003  
4. APF-TASK-004  
5. APF-TASK-005  

Preferred serial **001 → 002 → 003 → 004 → 005** (005 after 004; both touch worker completeness / CRM).

## Hard constraints (all tasks)

- One concern per file (`.cursor/rules/file-separation.mdc`)
- TypeScript conventions: no `enum`, typed returns, const objects
- Never invent portal values; never log PII values
- Do not add new fields to `PII_ENCRYPTED_FIELD_KEYS` (DEC-002)
- No FE UI (DEC-004)
- Migration only as approved (DEC-005)
