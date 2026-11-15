# Phase 3 — API and integrations

| Field | Value |
|-------|-------|
| Feature id | `bls-booking-visa-type` |
| Status | **DESIGNED** |
| Date | 2026-11-14 |
| Spec | [`02-spec.md`](./02-spec.md) |

---

## 1. External systems

| System | Role in this feature | Reuse / extend |
|--------|----------------------|----------------|
| BLS portal | Visa Type Selection, captcha, slots page, DP accept URL | Existing Playwright portal-fill |
| Mail.tm / TemporaryEmailProvider | Retained mailbox; find DP email; extract consent href | Extend wait/extract APIs |
| CapMonster (existing) | Solve booking captcha | Reuse captcha pipeline |
| Proxy6 | Session continuity | Unchanged lease patterns |
| AWS tracking redirect | Consent CTA wraps portal `dataprotectionemailaccept` | Follow link; do not hardcode tracking host |

---

## 2. TemporaryEmailProvider extensions (Must)

Current (Fact): `waitLatestMessage({ contextKey, token, timeoutMs, unreadOnly?, excludeMessageIds? })` → `{ messageId, body }` — no subject.

**Required additions (this feature):**

| Capability | Purpose |
|------------|---------|
| Subject filter / match | Find message with subject containing `BLS - Data Protection Information` (stable substring) |
| Consent link extract | From HTML body, locate `<a>` whose visible text contains exact green CTA string; return href |
| Explicit non-match | Never return red disagree CTA href |

Green CTA text (fixture):

> `I have read and understood the information on data protection and I explicitly consent to the data treatment`

Disagree (forbidden):

> `I disagree and don't give my consent`

Implementation may: extend `WaitTemporaryEmailMessageInput` with `subjectIncludes?: string`, and add `extractDataProtectionConsentHref(body: string): string | null` in a dedicated `*.utils.ts` file (file-separation).

---

## 3. Booking client / portal-fill

| Integration | Change |
|-------------|--------|
| `BlsBookingClientService` | Drive consent → continue pipeline (not safe-stop-only) |
| `runPortalBookingSafeStopPipeline` | Evolve to continue pipeline or new util composing existing phases + submit/captcha/slots |
| `PORTAL_BOOKING_SELECTORS` | Add Sub Type, Members, Category, slots banner, Try Again, captcha cues; remove Submit from “forbid click” list (keep Premium/payment forbid) |
| Captcha | After Submit (and whenever DOM shows), probe `#captcha-main-div` / `.captcha-div` / `.main-div-container` + `#btnVerify` |
| Family | New helper for `#familyDisclaimer` Accept (not Premium) |

---

## 4. HTTP staff API (`apps/api`)

| Surface | Impact |
|---------|--------|
| Workflow snapshot / events | May expose new `lastErrorCode` / checkpoint summary fields if Phase C |
| Control (retry/resume) | Unchanged envelopes preferred (`packages/contracts`) |
| New public DTO Must | **No** unless SPA Phase C requires snapshot fields (**DEC-proposed-005**) |

---

## 5. Staff SPA (`apps/web`)

| Phase | Change |
|-------|--------|
| A/B | Optional: existing `AWAITING_STAFF_BOOKING` banner still valid for staff terminal |
| C | Surface consent pending / slots unavailable / unknown-next from snapshot (FSD entities/widgets) |

---

## 6. Secrets / logging (NFR)

- Never log mailbox token, email HTML, consent `data=` query, OTP, portal password, captcha answers.
- Retain mailbox until true terminal cleanup (TASK-018 pattern) — consent needs mailbox still present at BOOK.
