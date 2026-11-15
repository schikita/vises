# VT-TASK-005 — Extended Visa Type form fill

| Field | Value |
|-------|-------|
| Task ID | `VT-TASK-005` |
| Title | Fill Sub Type / Members / Category (Prefer Normal); extend prefill |
| owner_layer | `apps/workflow-worker` portal-fill |
| depends_on | VT-TASK-004 |
| Phase | A |
| Status | DONE |
| Verification note | 2026-11-14 — review fix: removed `listbox!` (bind `listboxEl`); Family Accept fail-fast members FAILED. `npm run lint` + `npm run build` in `apps/workflow-worker` PASS |
| REQ/NFR | REQ-010, REQ-011, REQ-020, DEC-006, DEC-007 |
| sensitive_paths | Ambiguous CRM → staff; no Premium Accept |

## Acceptance criteria

- Label/listbox fill for Visa Sub Type, Number Of Members (after Family Accept), Category.
- Prefer Normal category; if CRM requires Premium → stop for staff (do not Accept Premium modal).
- Family path: Accept family disclaimer then members; Individual path unchanged.
- Obfuscated ids never hardcoded.
- Ambiguous values → ambiguous flag / staff gate (no guessing).
- Checkpoint fieldProgress updated for filled keys (ids only).

## verification_commands

```bash
cd apps/workflow-worker && npm run lint && npm run build
```

## IMPLEMENTATION AGENT PROMPT

Extend `prefillPortalBookingSelectionFields` (or sibling fill util) for Sub Type / Members / Category per materials. Prefer Normal. Family Accept then members. Stop before Submit (still VT-TASK-007). File-separation; reuse Kendo listbox helpers.
