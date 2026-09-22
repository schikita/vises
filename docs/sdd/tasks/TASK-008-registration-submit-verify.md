# TASK-008 — Registration (submit + verify)



| Field | Value |

|-------|-------|

| Task ID | `TASK-008` |

| Title | Registration including #btnSubmit + verify |

| Status | **DONE** |

| REQ/NFR | REQ-009, REQ-010, REQ-007, REQ-008 |

| DEC | DEC-019, DEC-012 |

| Prerequisites | TASK-004, TASK-005, TASK-006, TASK-007 |

| Dependents | TASK-009, TASK-016 |



## Files / modules



- `bls-clients/register/**`

- Extend `run-portal-fill-pipeline.util.ts` / `portal-autofill.service.ts` with workflow submit path

- Fixtures reference: `succes.html`, `email_privact_acceptence.html`, in-repo register/captcha samples

- Optional link `portal_autofill_runs` on REGISTER step



## Acceptance criteria



- REGISTER task: fill, captcha, OTP when armed, **click `#btnSubmit`**, verify success cues before COMPLETED.

- Persist `portalFormEmail` + encrypted portal password.

- Submit ambiguity → `VERIFY_THEN_REPEAT`.

- Mailbox retained (TASK-006).



## Verification criteria



- `npm run build` in `backend/` — **PASS** (2026-09-22)

- `portal:map-check` / fixture `portal:autofill` — **NOT_VERIFIED** (not required gate; offline success cues taken from `succes.html`)



## IMPLEMENTATION AGENT PROMPT



Implement **REGISTER** domain client + workflow executor wiring for `durable-bls-workflow` (REQ-009 / DEC-019).



Constraints:

- **Must click `#btnSubmit`** on workflow path; verify against success signals from fixture `succes.html` (spelling on disk).

- Extend existing fill pipeline — do not rewrite portal-scrape from scratch.

- Encrypt portal password via SecretsCryptoService; never log/API-expose.

- Classify failures SAFE / VERIFY_THEN / NOT_SAFE correctly.

- Re-nav + verify before COMPLETED (REQ-007).

- Use Proxy6 + CapMonster via ports; retain Mail.tm.

- types/constants/utils rules.



Deliver: REGISTER completes only after external verify; vault + portalFormEmail set; backend build green.



## Implementation notes



- Opt-in `submitRegisterForm: true` on fill pipeline / `PortalFillService` — legacy staff sync autofill omits the flag (no `#btnSubmit`).

- `BlsRegisterClientService` replaces stub DI binding; generates + vaults `PORTAL_PASSWORD` before fill; persists `portalFormEmail`; retains Mail.tm + vaults MAILTM_* with `workflowId`.

- Success verify uses `#div-success` / `#status` / `#message` / `#contBtn` cues from `succes.html`.

- Submit ambiguity → `VERIFY_THEN_REPEAT`; other fill failures → `SAFE_TO_REPEAT`.

- Optional soft-link of newest `portal_autofill_runs` row onto REGISTER step (TASK-016 owns full run lifecycle).

- See `specs/features/durable-bls-workflow/06-implementation.md`


