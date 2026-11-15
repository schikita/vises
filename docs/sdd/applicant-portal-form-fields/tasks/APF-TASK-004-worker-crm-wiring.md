# APF-TASK-004 — Worker CRM map + booking/status wiring

| Field | Value |
|-------|-------|
| Task ID | `APF-TASK-004` |
| Title | Map Client→ApplicantInput/EditMemberCrm; booking prefill category+visaSubType; status pass-through |
| owner_layer | `apps/workflow-worker` (`portal-core`, `bls-clients/status`, `bls-clients/booking`) |
| depends_on | APF-TASK-003 |
| Phase | B |
| Status | **TODO** |
| REQ/NFR | REQ-005, REQ-006, REQ-007, REQ-009, DEC-003, ASSUME-002, ASSUME-003 |
| sensitive_paths | Client PII mapping (no value logs); booking CON-006 surfaces unchanged |

## Acceptance criteria

- Extend `mapClientToApplicantInput` / `ApplicantInput` to copy new plaintext Client columns (and conditionals if mapped).
- `bls-status-client.service.ts` passes extended keys into `buildEditMemberFillInput` applicant source (employer/home/inviting/cost/fingerprint/etc.) — not inventing when null/empty.
- `bls-booking-client.service.ts` sets `PortalBookingPrefillHint.category` from `extras.category` and `visaSubType` from Application `visaSubType` / `visa_sub_type` (DEC-003).
- Appointment For / members remain from applicant count (ASSUME-003).
- No changes to Premium/payment forbidden paths; no PII values in logs (gap field ids only).

## verification_commands

```bash
cd apps/workflow-worker && npm run lint && npm run build
```

## IMPLEMENTATION AGENT PROMPT

Wire data only — fill/prefill pipelines already exist. Extend `mapClientToApplicantInput` + status client pass-through + booking client prefill per [`02-spec.md`](../02-spec.md) REQ-005…007 and DEC-003. Match `EditMemberCrmApplicantSource` keys. One concern per file. Never invent values. Never log PII. Do not expand completeness (APF-TASK-005) or FE.
