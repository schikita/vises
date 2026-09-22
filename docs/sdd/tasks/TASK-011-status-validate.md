# TASK-011 — Applicant status validate

| Field | Value |
|-------|-------|
| Task ID | `TASK-011` |
| Title | Applicant status validation (sequential) |
| Status | **DONE** |
| REQ/NFR | REQ-018, REQ-019, REQ-021 |
| DEC | DEC-009 |
| Prerequisites | TASK-007, TASK-009 |
| Dependents | TASK-012 |

## Files / modules

- `bls-clients/status/**`
- Fixtures: `applicant_details.html`, `ready_book_status.html`, `edit_app.html`, `modal_attention_app_editing.html`
- Per-applicant sequential tasks

## Acceptance criteria

- Scrape/normalize statuses; enum includes `FORM_FILLING_IN_PROGRESS`, `READY_TO_BOOK`, `UNKNOWN`.
- `UNKNOWN` never treated as success.
- Edit + attention modal paths attempted within retry limits.
- All required applicants `READY_TO_BOOK` before BOOK; default required = all applicants.

## Verification criteria

- `npm run build` in `backend/` — **PASS** (2026-09-22)

## IMPLEMENTATION AGENT PROMPT

Implement **STATUS_VALIDATE** sequential per-applicant tasks for `durable-bls-workflow` (REQ-018–021).

Constraints:
- Normalize portal labels to finite enum; UNKNOWN blocks success.
- Use on-disk fixture spellings under `D:/Git/reps/test-scrape-app/`.
- Sequential only — no parallel browsers.
- Domain client ≠ orchestrator.
- Classify retries appropriately; exhaust → WAITING_STAFF.
- No secrets in logs.
- types/constants/utils rules.

Deliver: status step gates BOOK correctly; backend build green.

## Implementation notes (2026-09-22)

- Added `BlsStatusClientService` + `PortalStatusFillService` / pipeline: login → Manage Applicants (`/Global/appointmentdata/myappointments`) → scrape/normalize row status → success only on `READY_TO_BOOK`.
- Enum `BLS_APPLICANT_PORTAL_STATUS`: `FORM_FILLING_IN_PROGRESS` | `READY_TO_BOOK` | `UNKNOWN` (fixture spellings: `Form Filling In-Progress`, `Ready To Book Appointment`).
- When `FORM_FILLING_IN_PROGRESS`: Edit/Complete → Accept attention modal → optional empty-field fill → Submit → re-scrape; ambiguous post-edit → `VERIFY_THEN_REPEAT`.
- UNKNOWN / not ready → `SAFE_TO_REPEAT` (orchestrator exhaust → WAITING_STAFF).
- BOOK gated by sequential per-applicant `STATUS_APPLICANT` tasks (graph default = all applicants); `areRequiredApplicantsReadyToBook` helper exported.
- Dispatcher already mapped `STATUS_APPLICANT` / `STATUS_VALIDATE` → status client; module wires live client (stub kept deprecated).
