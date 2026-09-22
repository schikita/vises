# TASK-020 — Automated tests (crypto + state machine)

| Field | Value |
|-------|-------|
| Task ID | `TASK-020` |
| Title | Tests for crypto + state machine (+ document command) |
| Status | **DONE** |
| REQ/NFR | NFR-005, REQ-008, REQ-014 |
| DEC | DEC-004, DEC-005 |
| Prerequisites | TASK-002, TASK-005 |
| Dependents | None |

## Files / modules

- Add minimal test runner script to `backend/package.json` (e.g. `node --test` or vitest/jest — prefer **Node built-in test** or light vitest if already alignable; **do not invent pytest**)
- Tests under `backend/src/modules/portal-scrape/**/*.spec.ts` or `backend/test/`
- Document exact command in `docs/sdd/` implementation notes when Phase 7 runs / here as verification

## Acceptance criteria

- Tests cover: encrypt/decrypt round-trip; wrong key fails; retry classification helpers; key state transitions (e.g. cannot COMPLETED without verify flag; NOT_SAFE blocks auto schedule).
- `package.json` has documented script; NFR-005 satisfied.
- No secrets asserted in logs.

## Verification criteria

- Documented command e.g. `npm run test:workflow` (exact name chosen in impl) exits 0
- `npm run build` in `backend/` still works

## IMPLEMENTATION AGENT PROMPT

Add **automated tests** for workflow crypto and state/classification helpers (`durable-bls-workflow`, NFR-005).

Constraints:
- There is **no** existing backend `npm test` — you must **add** a script and document the **exact** command.
- Do not invent FastAPI/pytest tooling.
- Prefer testing pure utils/services without browser.
- Never print secrets in test output.
- Keep scope small (crypto + state machine + classification) — not full E2E Patchright.
- types/constants/utils rules for any new helpers.

Deliver: passing documented test command + build green.

## Implementation notes (2026-09-22)

- Added `backend/test/workflow/crypto-and-state.test.cjs` (Node built-in `node:test`; pure utils from `dist/`; no Nest bootstrap; no secrets in output).
- Script: `npm run test:workflow` → `npm run build && node --test ./test/workflow/crypto-and-state.test.cjs`
- Covers: AES-GCM + wrap/unwrap round-trip; wrong master key fails; retry classification; COMPLETED requires verify flag; `NOT_SAFE_TO_REPEAT` blocks auto-schedule gate.
- `npm run test:workflow`: **PASS** (6 tests)
- `npm run build`: **PASS**
- See `specs/features/durable-bls-workflow/06-implementation.md` § TASK-020.
