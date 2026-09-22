# TASK-015 — SPA poll UI (application detail)

| Field | Value |
|-------|-------|
| Task ID | `TASK-015` |
| Title | Staff SPA workflow poll UI |
| Status | **DONE** |
| REQ/NFR | REQ-022, REQ-024, NFR-001, NFR-007 |
| DEC | DEC-006 |
| Prerequisites | TASK-013, TASK-014 |
| Dependents | None (UI leaf) |

## Files / modules

- `web/src/entities/` workflow types + API helpers
- `web/src/widgets/` or extend `portal-autofill-evidence` / application-detail tab
- `web/src/pages/application-detail/`
- FSD layering; Russian copy

## Acceptance criteria

- Staff see current step/task/status/attempt/nextRunAt/last safe error while running.
- Poll GET every ~3s while non-terminal; stop when terminal.
- Start / retry / pause / cancel controls for admin|manager flows already gated by app.
- No secrets displayed.
- Lint+build clean.

## Verification criteria

- `npm run lint` and `npm run build` in `web/`

## IMPLEMENTATION AGENT PROMPT

Implement **staff SPA polling UI** for durable BLS workflow on application detail (REQ-024 / DEC-006).

Constraints:
- FSD: entities/features/widgets/pages correctly; no business logic in thin routes.
- Poll ~3s; no WS/SSE.
- Russian UI strings; never show secrets.
- Prefer extending autofill tab area over inventing unrelated dashboard chrome.
- Follow existing Tailwind/UI patterns in application-detail.
- types in `types/`, constants in `constants/`, utils one-arrow-per-file.

Deliver: operable poll UI wired to workflow APIs; web lint+build green.

## Implementation notes (DONE 2026-09-22)

- Entity + widget + application-detail autofill tab wiring complete.
- `web/` `npm run lint` + `npm run build` **PASS**.
- See `specs/features/durable-bls-workflow/06-implementation.md` § TASK-015.
