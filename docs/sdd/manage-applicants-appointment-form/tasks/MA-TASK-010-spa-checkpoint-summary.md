# MA-TASK-010 — SPA checkpoint summary (Phase C, optional)

| Field | Value |
|-------|-------|
| Task ID | `MA-TASK-010` |
| Title | Optional snapshot exposure of portalStatus + fieldProgress summary |
| owner_layer | `apps/api` workflow DTO + `apps/web` entities/bls-workflow (FSD entities layer) |
| depends_on | MA-TASK-002 |
| Phase | C |
| Status | **DEFERRED** (OQ-004: frontend later — 2026-11-14) |
| REQ/NFR | REQ-029, DEC-005, NFR-002 |
| sensitive_paths | Public snapshot DTO (additive only) |

## Acceptance criteria

- Additive optional fields on snapshot tasks: `portalStatus`, summary counts / `lastCompletedStep` — **no values**.
- Web entity types + panel display (RU labels) without secrets.
- Old SPA ignoring fields remains safe.
- **Do not implement in current Phase 7 batch** (OQ-004).

## verification_commands

```bash
cd apps/api && npm run lint && npm run build
cd apps/web && npm run lint && npm run build
```

## IMPLEMENTATION AGENT PROMPT

FSD: types in entities model; one component file per UI piece. No WS/SSE. **Deferred** until a later human ask to schedule Phase C.
