# FE-TASK-002 — Current-task + applicant utils

| Field | Value |
|-------|-------|
| Task ID | `FE-TASK-002` |
| Title | Unambiguous current-task resolution + applicant labels |
| Status | **TODO** |
| Feature | `bls-workflow-frontend` |
| REQ/NFR | REQ-011, REQ-012 |
| DEC | DEC-004 |
| Prerequisites | None (parallel with 001) |
| Dependents | FE-TASK-006 |
| Files | `web/src/entities/bls-workflow/utils/find-bls-workflow-current-task.util.ts`, new applicant label util, barrels |

## Goal

Fix first-match bug when multiple tasks share `taskKey` (e.g. multi-applicant `STATUS_APPLICANT`) and provide applicant display label helper.

## Acceptance criteria

- `findBlsWorkflowCurrentTask` is unambiguous when duplicate `taskKey` exists (use ordinal and/or applicantId and/or RUNNING/WAITING_* preference — document choice in util comment).
- `resolveBlsWorkflowApplicantLabel(applicantId, applicants?)` returns name when match found, else id, else safe fallback.
- Types for applicants input live in entity `types/` if reusable.
- Lint + build PASS.

## Verification

- Manual reasoning / code review of match logic with 2+ STATUS_APPLICANT fixtures.
- `cd web && npm run lint && npm run build`

## IMPLEMENTATION AGENT PROMPT

```text
You are the implementer for bls-workflow-frontend FE-TASK-002.

Read:
- specs/features/bls-workflow-frontend/02-spec.md REQ-011, REQ-012
- docs/sdd/frontend/01-target-ux.md DEC-004
- web/src/entities/bls-workflow/utils/find-bls-workflow-current-task.util.ts (current first-match bug)

Fix findBlsWorkflowCurrentTask so multi-applicant duplicate taskKeys cannot return the wrong row.
Add resolveBlsWorkflowApplicantLabel util (one file, arrow).
Keep types out of util files; update barrels.

No UI wiring required in this task (panel wiring is FE-TASK-006/008).
No backend changes.
Validate: cd web && npm run lint && npm run build
```

## Test notes

Lint + build. Prefer a small inline comment with match precedence for future maintainers.
