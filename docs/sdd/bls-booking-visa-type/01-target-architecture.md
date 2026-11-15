# Phase 1 — Target architecture

| Field | Value |
|-------|-------|
| Feature id | `bls-booking-visa-type` |
| Status | **DESIGNED** (DEC-proposed defaults; human may override OQ) |
| Date | 2026-11-14 |
| Spec | [`02-spec.md`](./02-spec.md) |
| Discovery | [`00-discovery.md`](./00-discovery.md) |

---

## 1. Architecture intent

Extend the existing durable BLS workflow **BOOK** domain path so Ready To Book applicants complete **email data-protection consent**, then Visa Type Selection fill → Submit → captcha probe → recognizable outcomes (slots unavailable), while **payment / Premium Accept remain hard-stopped**.

```
STATUS_VALIDATE success (READY_TO_BOOK) — upstream
        ↓
BOOK (extend — this feature)
  EMAIL_CONSENT (TemporaryEmailProvider retain mailbox)
    → find subject ≈ "BLS - Data Protection Information"
    → follow green consent CTA only
    → checkpoint DATA_PROTECTION_CONSENT_DONE
  BOOKING_ENTRY
    → clickPortalBookNewAppointment (never doorstep)
    → waitForPortalBookingSelectionUi (prefer full-page cues)
  ATTENTION → acceptPortalAttentionModal
  FORM_FILL
    → Location / Visa Type / Sub Type / Appointment For / Members / Category (Prefer Normal)
    → Family Accept allowed; Premium Accept forbidden
  SUBMIT (#btnSubmit / OnSubmitVisaType)  ← CON-006 Submit revision
  CAPTCHA? (always probe) → reuse captcha pipeline
  OUTCOME
    → SLOTS_UNAVAILABLE → Try Again + SAFE_TO_REPEAT backoff
    → UNKNOWN_NEXT → staff / AWAITING_STAFF_BOOKING (no invented calendar)
    → Premium / payment surface → NOT_SAFE hard stop
```

**No** new Must top-level step key replacing `BOOK` (**arch constraint ARC-001**; do not confuse with spec **DEC-002** consent-before-book). Prefer extending `runPortalBookingSafeStopPipeline` → rename/evolve to a continue pipeline inside booking fill. Domain client ≠ orchestrator.

---

## 2. Component boundaries

| Component | Package / module | Responsibility |
|-----------|------------------|----------------|
| Orchestrator / runner | `apps/workflow-worker` bls-workflow | Unchanged step graph REGISTER…BOOK; advance/terminal policy updated per DEC |
| Booking domain client | `bls-clients/booking` | Orchestrate consent + fill continue; map CRM → booking fill input |
| Portal booking fill | `portal-fill` | Consent handoff hooks, Attention, extended selectors/fill, Submit, captcha probe, slots detector |
| Temporary email | `temporary-email` (+ browser-mail adapter) | Subject-filtered wait + HTML consent-link extract; retain until terminal |
| Captcha | `portal-fill` captcha utils + CapMonster | Reuse for booking surface |
| Classifier | `bls-workflow` (+ api mirror) | Allowlist Submit; keep Premium/payment `NOT_SAFE` |
| Persistence | `apps/api` + worker entities | Booking checkpoint in task JSON (**DEC-proposed-003**); migration only if MA columns absent |
| Staff SPA | `apps/web` | Phase C: mid-booking / slots / consent stuck visibility |

---

## 3. State machine ownership

| Concern | Owner |
|---------|-------|
| Logical booking steps (`EMAIL_CONSENT`…`SLOTS_UNAVAILABLE`) | Booking pipeline + checkpoint `lastCompletedStep` |
| Workflow step key `BOOK` | Unchanged graph |
| Terminal `AWAITING_STAFF_BOOKING` | After unknown-next / staff-needed / exhaustion — **not** immediately after UI open (**DEC-proposed-004**) |
| Consent checkpoint | `DATA_PROTECTION_CONSENT_DONE` before booking entry |
| Error classes | Inherit `SAFE_TO_REPEAT` / `VERIFY_THEN_REPEAT` / `NOT_SAFE_TO_REPEAT` |

### High-level machine (authoritative)

```
READY_TO_BOOK
  → EMAIL_CONSENT_PENDING
  → EMAIL_CONSENT_DONE
  → BOOKING_UI_OPEN
  → ATTENTION_ACCEPTED (if shown)
  → FORM_FILLED
  → SUBMITTED
  → CAPTCHA_PENDING? → CAPTCHA_OK
  → SLOTS_UNAVAILABLE | UNKNOWN_NEXT | PREMIUM_OR_PAYMENT_STOP
```

---

## 4. Policy supersession (CON-006 / TASK-012)

| Prior (TASK-012 DONE) | This feature |
|-----------------------|--------------|
| Never click `#btnSubmit` / `OnSubmitVisaType` | **Allowed** after form ready + Prefer Normal |
| Never Premium Accept / payment | **Unchanged — forbidden** |
| BOOK success = open UI + optional prefill → `AWAITING_STAFF_BOOKING` | BOOK success deferred until materials-covered outcome or staff terminal |
| `classifyPortalBookingUnsafeAction` treats submit as `NOT_SAFE` | Submit removed from unsafe set; Premium/payment remain |

Record as **DEC-001** (human confirm) in plan §7. Do not rewrite closed TASK-012 file body; reference supersession here + spec CON section.

---

## 5. Email consent integration

```
Vaulted MAILTM_TOKEN / mailbox (retain from REGISTER)
  → TemporaryEmailProvider.waitMessageBySubject (new) or list+filter
  → extractDataProtectionConsentHref(body) — green CTA text only
  → browser/page.goto(href) or click equivalent
  → persist DATA_PROTECTION_CONSENT_DONE
  → then booking entry
```

Never follow disagree CTA text. Never log full email body / tokens.

---

## 6. Risks

| Risk | Mitigation |
|------|------------|
| Consent email timing unknown | OQ-001; wait with timeout + SAFE_TO_REPEAT / staff |
| Terminal cleanup too early | Do not treat open-UI as BOOK success; cleanup stays terminal-only |
| Dual visa-type UIs | Prefer heading + VisaType form action |
| Family vs Premium Accept confusion | Separate helpers; Premium forbid list |
| Slots hammering | Backoff + max attempts; OQ staff timing |
| MA still PLANNED | Sequencing note: prerequisite Ready state; may use TASK-011 Ready path until MA ships |

---

## 7. Non-goals (architecture)

- New Rabbit event schemas unless human requires (**DEC-proposed-005** default: no).
- Calendar / payment / Premium Accept automation.
- Second mail stack.
- Parallel orchestrator outside bls-workflow.
