# MA-TASK-004 — Field maps + CRM fill input

| Field | Value |
|-------|-------|
| Task ID | `MA-TASK-004` |
| Title | Edit Member field maps + CRM → fill input contract |
| owner_layer | `apps/workflow-worker` portal-fill / portal-core (+ api Client mapping as needed) |
| depends_on | MA-TASK-002 |
| Phase | A |
| Status | **DONE** (arch OKAY + code OKAY cycle 2, 2026-11-14) |
| REQ/NFR | REQ-007, REQ-019, REQ-020, DEC-006, OQ-002, OQ-003, OQ-007 |
| sensitive_paths | Client/applicant PII mapping (no logging values); `portal-fill` field maps (serial before MA-TASK-003) |

## Acceptance criteria

- Selector/id maps for Edit Member required fields (spec §8) in dedicated constants/types files.
- Extend date/dropdown field-name support for Edit Member ids (shared calendar path — no fork).
- Status client builds typed fill input from existing CRM/applicant/application location+visa (**portal-aligned shape** — OQ-002); never invent.
- Optional/conditional with no CRM → marked skippable; portal-required `*` with no source → explicit unskippable gap (OQ-007).
- Visa/location from **pre-start** application selection (OQ-003); National path flagged verify-first.

## verification_commands

```bash
cd apps/workflow-worker && npm run lint && npm run build
cd apps/api && npm run lint && npm run build
```

## IMPLEMENTATION AGENT PROMPT

One concern per file. Map flow.md data contract → portal `#id`s from **existing** user-entered data. Prefer leave-correct-prefill (brief §7). Do not invent values. Skip-missing for optional/conditional. Do not implement full fill here — only maps + input DTO/builders.
