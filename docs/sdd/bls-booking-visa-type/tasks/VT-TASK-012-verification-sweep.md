# VT-TASK-012 — Verification sweep

| Field | Value |
|-------|-------|
| Task ID | `VT-TASK-012` |
| Title | Lint/build/regression sweep for booking continue |
| owner_layer | docs + `apps/workflow-worker` (+ api if touched) |
| depends_on | VT-TASK-010 |
| Phase | B |
| Status | **DONE** |
| REQ/NFR | NFR-005, NFR-006, AC-10 |
| sensitive_paths | Static check: no Premium Accept / payment clicks |
| Completed | 2026-11-14 |

## Acceptance criteria

- Worker lint + build PASS; api lint + build PASS if touched.
- Static review: disagree CTA never clicked; Premium/payment never accepted; Submit path present after DEC-001.
- Register/login/mail retain not obviously regressed.
- Record command results in this task file or plan notes when run.
- Confirm slots detector + consent constants exist.

## verification_commands

```bash
cd apps/workflow-worker && npm run lint && npm run build
cd apps/api && npm run lint && npm run build
# optional: cd apps/workflow-worker && node scripts/verify-booking-captcha-dismiss.mjs
```

## IMPLEMENTATION AGENT PROMPT

Docs/verification task after Phase B core. Fix only build/lint breaks found. Confirm CON-004 payment hard-stop and CON-005 Submit in-scope. Do not expand into calendar.

---

## Verification results (2026-11-14)

### Commands

| command | result | notes |
|---------|--------|-------|
| `cd apps/workflow-worker; npm run lint` | **PASS** | noop script `process.exit(0)` |
| `cd apps/workflow-worker; npm run build` | **PASS** | `nest build` ok |
| `cd apps/api; npm run lint` | **PASS** | noop script `process.exit(0)` |
| `cd apps/api; npm run build` | **FAIL (pre-existing, out of scope)** | See known failures below — not introduced by Phase B booking work |
| `cd apps/workflow-worker; node scripts/verify-booking-captcha-dismiss.mjs` | **PASS** | `ok:true`, surface dismissed via `booking_surface_dismiss` |

### Known api build failures (out of scope — document only)

| file | error summary |
|------|---------------|
| `apps/api/src/modules/analytics/utils/build-analytics-dto.util.ts:81` | `perAgent` is `AnalyticsPerAgentDto[]` but contract expects `PaginatedList<AnalyticsPerAgentDto>` |
| `apps/api/src/modules/auth/auth.service.ts:130` | `UserMeDto` missing `firstName`, `lastName` |
| `apps/api/src/modules/clients/utils/map-client-to-list-dto.util.ts:14` | `ClientListDto` missing `agentName`, `routeFrom`, `routeTo` |

No worker/api booking code changes required for this sweep. Calendar / Phase C not expanded.

### Static checklist (AC-10 / CON-004 / CON-005 / DEC-001)

| check | result | evidence |
|-------|--------|----------|
| Disagree CTA never clicked | **PASS** | `extractDataProtectionConsentHref` returns only green consent CTA; explicitly excludes disagree needle; `completePortalBookingEmailConsent` opens consent href only |
| Premium / payment never accepted | **PASS** | Detection-only (`isPortalBookingPremiumOrPaymentSurfaceVisible`); `classifyPortalBookingUnsafeAction` → NOT_SAFE; pipeline hard-stops before Accept/confirm; `premiumLoungeAcceptText` constant unused for clicks |
| Submit path present (DEC-001 / CON-005) | **PASS** | `clickPortalVisaTypeSubmit` + `submitVisaTypeAfterFormReady` in continue pipeline; classifier comments allowlist `#btnSubmit` / `OnSubmitVisaType` |
| Slots detector + constants exist | **PASS** | `portal-booking-slots-unavailable.constants.ts` (`PORTAL_BOOKING_SLOTS_UNAVAILABLE_ERROR_CODE`, `PORTAL_BOOKING_SLOTS_PROBE_MS`); probe/phase utils wired |
| Consent constants exist | **PASS** | `portal-booking-email-consent.constants.ts`; `TEMPORARY_EMAIL_DATA_PROTECTION_*` in temporary-email constants |
| Register / login / mail retain not obviously regressed | **PASS** | Register client + retain-after-OTP path intact; booking uses retained mailbox; terminal cleanup comments retain until true terminal (DEC-004); login still entry for booking continue |
