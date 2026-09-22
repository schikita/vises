# FE-TASK-007 — Events timeline + AUTOFILL_RUN_LINKED

| Field | Value |
|-------|-------|
| Task ID | `FE-TASK-007` |
| Title | Compact events feed + safe runId linkage hint |
| Status | **TODO** |
| Feature | `bls-workflow-frontend` |
| REQ/NFR | REQ-007, REQ-017, REQ-018, NFR-001, NFR-007 |
| DEC | DEC-006 |
| Prerequisites | FE-TASK-001, FE-TASK-004 |
| Dependents | FE-TASK-010 |
| Files | `BlsWorkflowEventsFeedRender.tsx`, panel render/copy; optional evidence highlight prop |

## Goal

Operator-visible compact event timeline from polled events; allowlisted payload only; Should surface `AUTOFILL_RUN_LINKED` runId toward legacy evidence on same tab.

## Acceptance criteria

- Compact feed renders eventType (RU), time, step/task keys when present.
- Uses allowlist util — no raw object dump.
- Bounded by API limit / local ring (no unbounded DOM).
- Optional expand control still bounded (NFR-007).
- `AUTOFILL_RUN_LINKED`: show runId; call optional `onAutofillRunLinked` or display hint to scroll to RegisterUser section.
- Graceful if run list missing (edge 12).
- Closes ISSUE-003 for SPA timeline visibility.
- Lint + build PASS.

## Verification

- Grep: no `JSON.stringify(payloadSafe)` into UI.
- `cd web && npm run lint && npm run build`

## IMPLEMENTATION AGENT PROMPT

```text
You are the implementer for bls-workflow-frontend FE-TASK-007 (DEC-006).

Read REQ-007, REQ-017, REQ-018 and docs/sdd/frontend/01-target-ux.md DEC-006.
Consume events state from FE-TASK-004 dual poll.
Add BlsWorkflowEventsFeedRender; wire allowlisted display.
For AUTOFILL_RUN_LINKED, surface runId safely and optionally notify parent for evidence highlight.

No WS. No secret fields.

Validate: cd web && npm run lint && npm run build
```

## Test notes

Lint + build. Manual events growth with running workflow.
