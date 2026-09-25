# FE-TASK-009 — a11y + empty/error polish

| Field | Value |
|-------|-------|
| Task ID | `FE-TASK-009` |
| Title | aria-live status region + loading/empty/error polish + secret hygiene pass |
| Status | **DONE** |
| Feature | `bls-workflow-frontend` |
| REQ/NFR | REQ-015, REQ-016, REQ-017, NFR-004 |
| DEC | — |
| Prerequisites | FE-TASK-004, FE-TASK-008 |
| Dependents | FE-TASK-010 |
| Files | panel container/render, copy constants, live-status util |

## Goal

Basic a11y live updates during poll; ensure loading/empty/error Russian states remain coherent after viz additions; final secret-hygiene pass on displayed fields.

## Acceptance criteria

- `aria-live="polite"` (or equivalent) announces meaningful status/current-step changes. ✅
- Controls remain keyboard-activable. ✅ (`Btn` → native `<button>`)
- Loading / empty / error / actionError / polling indicator still present and RU. ✅
- No vault/`lockOwner`/password fields rendered. ✅
- Lint + build PASS. ✅

## Verification

- DOM: `BlsWorkflowPanelRender` — `aria-live="polite"` + `role="status"` + `aria-atomic` (sr-only).
- `cd web && npm run lint` — PASS (exit 0; pre-existing oxlint warnings only)
- `cd web && npm run build` — PASS (`tsc -b` + vite)

## IMPLEMENTATION AGENT PROMPT

```text
You are the implementer for bls-workflow-frontend FE-TASK-009.

Read REQ-015, REQ-016, NFR-004.
Add polite live region for workflow status updates during polling.
Polish empty/error/loading copy consistency after earlier UI tasks.
Secret hygiene pass: ensure only safe DTO fields and allowlisted payload keys appear.

Validate: cd web && npm run lint && npm run build
```

## Test notes

Lint + build PASS. Live text built from status + current-step labels (+ loading/empty/error/actionError/polling). Events still via `pickBlsWorkflowPayloadSafeDisplay`. No WS/SSE.
