# MA-TASK-009 — Add Family Member fill (conditional Must)

| Field | Value |
|-------|-------|
| Task ID | `MA-TASK-009` |
| Title | Implement Add New Member + Edit fill for pre-start family members |
| owner_layer | `apps/workflow-worker` portal-fill + bls-clients/status |
| depends_on | MA-TASK-007, MA-TASK-008 |
| Phase | B |
| Status | **DONE** (arch OKAY cycle 2 + code OKAY, 2026-11-14) |
| REQ/NFR | REQ-025, CON-009, DEC-004, OQ-005, OQ-007 |
| sensitive_paths | Multi-applicant CRM mapping |

## Acceptance criteria

- Click Add New Member **only** when application has additional members pre-start.
- After portal add: same VISA_TYPE_MODAL → EDIT_FRAME_READY → FORM_FILLING → Submit → Ready with applicant-scoped checkpoint.
- Map fill from that member’s existing CRM data; skip optional empty; never invent (OQ-007).
- Does not bypass Ready gate for BOOK; all required applicants still Ready.
- Primary Edit path regression-free.
- If no pre-start members → path never runs (assert / no-op).

## verification_commands

```bash
cd apps/workflow-worker && npm run lint && npm run build
cd apps/api && npm run lint && npm run build
```

## IMPLEMENTATION AGENT PROMPT

Reuse Phase A fillers. OQ-005: conditional Must when pre-start family members exist. Do not automate Delete. Keep upstream CON-006 / BOOK safe-stop unchanged.
