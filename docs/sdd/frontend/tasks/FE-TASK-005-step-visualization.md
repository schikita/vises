# FE-TASK-005 — Step visualization

| Field | Value |
|-------|-------|
| Task ID | `FE-TASK-005` |
| Title | REGISTER→BOOK step rail with current emphasis |
| Status | **DONE** |
| Feature | `bls-workflow-frontend` |
| REQ/NFR | REQ-002, NFR-001, REQ-020 |
| DEC | — (UX in 01-target-ux §3) |
| Prerequisites | FE-TASK-004 (panel stable); soft-ok after types |
| Dependents | FE-TASK-008 |
| Files | `BlsWorkflowStepRailRender.tsx`, `BlsWorkflowPanelRender.tsx`, copy constants |

## Goal

Replace flat weak step list emphasis with a clear ordered visualization REGISTER → LOGIN → PASSWORD_CHANGE → STATUS_VALIDATE → BOOK; current step distinguishable; SKIPPED shows reason.

## Acceptance criteria

- All five step keys represented when present in snapshot.steps (ordered by ordinal).
- Current step visually distinct via `currentStepKey`.
- Skip reason visible for SKIPPED.
- RU labels via existing entity helpers.
- Container/render split preserved.
- Lint + build PASS.

## Verification

- Visual check in staff app or render props review.
- `cd web && npm run lint && npm run build`

## IMPLEMENTATION AGENT PROMPT

```text
You are the implementer for bls-workflow-frontend FE-TASK-005.

Read:
- specs/features/bls-workflow-frontend/02-spec.md REQ-002
- docs/sdd/frontend/01-target-ux.md §3
- docs/sdd/frontend/03-fsd-component-design.md
- Existing BlsWorkflowPanelRender step list

Add BlsWorkflowStepRailRender (presentational) and compose it in BlsWorkflowPanelRender.
Use existing Tailwind/Btn patterns — no new design system.
Russian labels via entity utils/constants.
Do not change poll logic.

Validate: cd web && npm run lint && npm run build
```

## Test notes

Lint + build. Manual UI glance.
