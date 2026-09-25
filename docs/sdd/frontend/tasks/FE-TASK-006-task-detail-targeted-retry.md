# FE-TASK-006 — Task detail + targeted retry

| Field | Value |
|-------|-------|
| Task ID | `FE-TASK-006` |
| Title | Enhanced task list/detail, applicant labels, targeted retry |
| Status | **DONE** |
| Feature | `bls-workflow-frontend` |
| REQ/NFR | REQ-003, REQ-004, REQ-009, REQ-010, REQ-011, NFR-001 |
| DEC | DEC-003, DEC-004 |
| Prerequisites | FE-TASK-002, FE-TASK-003, FE-TASK-004 |
| Dependents | FE-TASK-010 |
| Files | `BlsWorkflowTaskListRender.tsx`, panel container/render, copy constants |

## Goal

Present tasks with status, attempts (`attemptCount` / `maxAttempts` when present), safe errors, applicant identity; enable per-task Retry via `taskId` when eligible; keep default Retry without selection.

## Acceptance criteria

- Task rows show RU labels, status, attempts, safe error fields.
- Non-null `applicantId` displayed; name resolved when `applicants` prop provided.
- Current task highlighting uses fixed resolver from FE-TASK-002.
- When `task.id` present and retry-eligible, row action calls `retryBlsWorkflow(..., { taskId })`.
- Toolbar Retry without selection still omits `taskId` (backend default).
- Russian API `detail` on failure.
- No secrets.
- Lint + build PASS.

## Verification

- Code review of retry body.
- `cd web && npm run lint && npm run build`

## IMPLEMENTATION AGENT PROMPT

```text
You are the implementer for bls-workflow-frontend FE-TASK-006.

Read:
- REQ-003, REQ-009, REQ-010, REQ-011 in 02-spec.md
- DEC-003, DEC-004 in docs/sdd/frontend/01-target-ux.md
- FE-TASK-002 / FE-TASK-003 outputs

Implement BlsWorkflowTaskListRender + wire applicants prop from ApplicationDetailRender into BlsWorkflowPanel.
Use findBlsWorkflowCurrentTask (fixed) and resolveBlsWorkflowApplicantLabel.
Targeted retry Should when id exists; Must keep default retry.

Validate: cd web && npm run lint && npm run build
```

## Test notes

Lint + build. Manual retry with API if available.
