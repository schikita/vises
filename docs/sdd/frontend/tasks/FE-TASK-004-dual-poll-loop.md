# FE-TASK-004 — Dual poll loop (snapshot + events)

| Field | Value |
|-------|-------|
| Task ID | `FE-TASK-004` |
| Title | Panel container: snapshot + events poll (no WS) |
| Status | **TODO** |
| Feature | `bls-workflow-frontend` |
| REQ/NFR | REQ-005, REQ-006, REQ-007, REQ-019, NFR-003, NFR-005 |
| DEC | DEC-001 |
| Prerequisites | FE-TASK-001 |
| Dependents | FE-TASK-005…009 |
| Files | `web/src/widgets/bls-workflow-panel/BlsWorkflowPanel.tsx` (+ minimal types/state) |

## Goal

While non-terminal, poll snapshot **and** events on ~3s tick; stop on terminal including `AWAITING_STAFF_BOOKING`; retain last good snapshot on silent poll failure; reset events cursor when `workflowId` changes.

## Acceptance criteria

- Events GET called with `sinceEventId` cursor while workflow present and non-terminal.
- No new WS/SSE/EventSource dependency.
- Poll stops on terminal statuses (existing helper).
- Silent poll errors do not wipe snapshot.
- Mutations still refresh snapshot after success.
- ISSUE-003 functionally addressed at transport layer (timeline UI may land in FE-TASK-007; state may hold events array even if render is stub).
- Lint + build PASS.

## Verification

- Code review: setInterval / effect cleanup; cursor advance.
- Grep: no `WebSocket` / `EventSource`.
- `cd web && npm run lint && npm run build`

## IMPLEMENTATION AGENT PROMPT

```text
You are the implementer for bls-workflow-frontend FE-TASK-004 (DEC-001).

Read:
- docs/sdd/frontend/01-target-ux.md DEC-001
- docs/sdd/frontend/02-api-contract-mapping.md §5–6
- FE-TASK-001 deliverables (fetchBlsWorkflowEvents)
- BlsWorkflowPanel.tsx current snapshot-only poll

Wire dual poll in the panel container:
- Keep BLS_WORKFLOW_POLL_INTERVAL_MS = 3000
- On each silent tick: refresh snapshot; if workflowId, fetch events since cursor; append; advance latestEventId
- Reset events when applicationId or workflowId changes
- Stop when terminal (incl. AWAITING_STAFF_BOOKING)
- Preserve silent failure behavior
- Hold events in state for FE-TASK-007 (can pass empty render props temporarily)

Hard ban: WebSocket, SSE, socket.io, EventSource.

Validate: cd web && npm run lint && npm run build
```

## Test notes

Lint + build. Manual poll with running API if available.
