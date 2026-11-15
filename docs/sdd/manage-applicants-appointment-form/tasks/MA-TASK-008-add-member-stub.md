# MA-TASK-008 — Add Family Member branch (conditional Must stub)

| Field | Value |
|-------|-------|
| Task ID | `MA-TASK-008` |
| Title | Detect pre-start family members + Add New Member gate stub |
| owner_layer | `apps/workflow-worker` portal-fill + bls-workflow task drafting (if needed) |
| depends_on | MA-TASK-002 |
| Phase | A (detection/stub) |
| Status | **DONE** (arch OKAY + code OKAY, 2026-11-14) |
| REQ/NFR | REQ-025, CON-009, DEC-004, OQ-005 |
| sensitive_paths | None |

## Acceptance criteria

- Gate: Add New Member **only if** application already has additional member(s) entered **before** workflow start (OQ-005).
- If none → **Must not** click Add New Member / `ManageApplicant('')`.
- When members exist: document/stub branch `OPEN_ADD_MEMBER` → same modal→iframe→Edit fill (Phase B MA-TASK-009).
- Checkpoint supports `memberBranch: 'ADD_NEW_MEMBER' | 'EDIT_EXISTING'`.
- Primary Edit path regression-free.

## verification_commands

```bash
cd apps/workflow-worker && npm run lint && npm run build
```

## IMPLEMENTATION AGENT PROMPT

Conditional Must per OQ-005 / DEC-004 — not optional product curiosity. Materials brief §7.8 OOS is overridden. Stub detection + hard “no click if no pre-start members”; full fill in MA-TASK-009.
