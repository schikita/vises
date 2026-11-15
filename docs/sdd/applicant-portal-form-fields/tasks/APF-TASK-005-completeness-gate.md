# APF-TASK-005 — BLS completeness gate for happy-path portal fields

| Field | Value |
|-------|-------|
| Task ID | `APF-TASK-005` |
| Title | Expand start completeness required keys + messages (api + worker mirrors) |
| owner_layer | `apps/api` + `apps/workflow-worker` (`modules/bls-workflow` completeness twins) |
| depends_on | APF-TASK-003, APF-TASK-004 |
| Phase | C |
| Status | **DONE** |
| REQ/NFR | REQ-008, REQ-009, CON-004, NFR-004 |
| sensitive_paths | Workflow start gate (api + worker); operator-facing Russian messages; Client field reads |

## Acceptance criteria

- Extend `BLS_APPLICANT_COMPLETENESS_REQUIRED_FIELD_KEYS` (and message constants) in **both** `apps/api` and `apps/workflow-worker` to include new happy-path required CRM keys that Edit Member treats as portal `*` for adult + inviting=company (home structured country/city/postal; employer name/phone/address; occupation; inviting authority + company-path fields as applicable; `costCoveredBy`; `meansOfSupport`). Align with builder required set — do **not** invent portal values.
- Keep api and worker completeness constants / types / collectors / validators in sync (worker `start()` → `evaluateBlsWorkflowStartGate` must fail closed the same way as api).
- Optional fingerprint override / Line2 / second destination / conditionals bag are **not** required by the gate (CON-004) unless product explicitly marks them required — default: exclude optionals and conditional sections.
- `validateBlsApplicantCompleteness` / collectors use new keys; workflow start fails closed with aggregated detail messages.
- Constants and messages in dedicated files; no enum; no PII values in logs/details beyond field absence messages.
- Document final required-key list in task notes if it differs from the recommended set above (must still match happy-path `*` gaps in discovery).
- Refresh `00-discovery.md` §4–§5 matrix rows for newly gated keys (REQ-001).

## verification_commands

```bash
cd apps/api && npm run lint && npm run build
cd apps/workflow-worker && npm run lint && npm run build
```

## IMPLEMENTATION AGENT PROMPT

Expand BLS applicant completeness for new happy-path portal CRM keys per [`02-spec.md`](../02-spec.md) REQ-008 and [`00-discovery.md`](../00-discovery.md) §5. Mirror the same keys/messages/types/collector picks in **both** api and workflow-worker completeness modules (plan-review finding: worker has a duplicated start gate). Follow existing `bls-applicant-completeness.constants.ts` / util patterns. Exclude conditional-section bag fields (CON-004). One concern per file. No FE. No migration. Coordinate with APF-TASK-003/004 field property names. Do not parallel with APF-TASK-004 (both touch worker).

## Notes — final required-key list (APF-TASK-005)

**Choice:** inviting company auth+contact block is **always** required at the start gate (happy-path adult + inviting=company simplicity), not branched on `blsInvitingAuthority` value.

**Per-applicant keys** (`BLS_APPLICANT_COMPLETENESS_REQUIRED_FIELD_KEYS`):

`firstName`, `lastName`, `lastNameAtBirth`, `dob`, `countryOfBirth`, `passportNumber`, `passportIssued`, `passportExpires`, `passportType`, `passportIssueCountry`, `passportIssuedBy`, `phone` (+ 9-digit format), `address`, `homeCountry`, `homeCity`, `homePostalCode`, `purpose`, `firstEntry`, `entries`, `durationDays`, `employerName`, `employerPhone`, `employerAddress`, `occupation`, `blsInvitingAuthority`, `invitingAuthorityName`, `invitingCountry`, `invitingCity`, `invitingZipCode`, `invitingAddress`, `invitingEmail`, `invitingContactNo`, `invitingContactName`, `invitingContactSurname`, `invitingContactCountry`, `invitingContactCity`, `invitingContactZipCode`, `invitingContactAddress`, `invitingContactContactNo`, `invitingContactEmail`, `costCoveredBy`, `meansOfSupport`

**Application-level:** `clientEmail` (existing).

**Explicitly not gated:** `homeAddressLine2`, `previousFingerPrint*`, `memberStateSecondDestination`, inviting fax fields, `portalFormConditionals` bag (CON-004). Application travel dates/destination remain outside this applicant collector.
