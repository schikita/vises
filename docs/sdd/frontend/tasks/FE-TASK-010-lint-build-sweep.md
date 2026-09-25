# FE-TASK-010 — Lint/build verification sweep

| Field | Value |
|-------|-------|
| Task ID | `FE-TASK-010` |
| Title | Final web lint+build (and backend build if DTO shipped) verification sweep |
| Status | **DONE** |
| Feature | `bls-workflow-frontend` |
| REQ/NFR | NFR-002, NFR-005, NFR-006, AC-009, AC-010 |
| DEC | DEC-001 |
| Prerequisites | FE-TASK-001…009 |
| Dependents | None (gate before VERIFYING) |
| Files | None intentionally — fix only residuals found |

## Goal

Confirm feature readiness gate: web lint+build green; no WS deps; FSD barrels coherent; document commands run for `06-implementation.md` later.

## Acceptance criteria

- `cd web && npm run lint` PASS
- `cd web && npm run build` PASS
- If FE-TASK-003 merged: `cd backend && npm run build` PASS
- `web/package.json` / imports: no `ws`, `socket.io`, EventSource client usage for this feature
- Brief note of commands+results ready for implementer to paste into specs `06-implementation.md`

## Verification

- Commands above.
- Grep sweep for WebSocket/EventSource in touched files.

## IMPLEMENTATION AGENT PROMPT

```text
You are the implementer for bls-workflow-frontend FE-TASK-010 (verification sweep).

Assume FE-TASK-001…009 are done. Do not add features.
Run:
  cd web && npm run lint
  cd web && npm run build
  cd backend && npm run build   # if DTO changes present

Fix only compile/lint residuals from this feature.
Confirm no WS/SSE client was introduced (DEC-001 / NFR-005).

Record command results for handoff to verifier / 06-implementation.md.
Do not mark the feature DONE — lifecycle VERIFYING is separate.
```

## Test notes

Lint + build only (NFR-002).

## Results (2026-09-23)

| Command | Result |
|---------|--------|
| `cd web && npm run lint` | PASS (exit 0; warnings only) |
| `cd web && npm run build` | PASS |
| `cd backend && npm run build` | PASS |
| Grep `web/src` WebSocket / EventSource / socket.io / `\bws\b` | No matches |
| Product code fixes | None required |
