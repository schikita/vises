# Phase 2 — Database (booking continue checkpoints)

| Field | Value |
|-------|-------|
| Feature id | `bls-booking-visa-type` |
| Status | **DESIGNED** — **human migration gate** if additive columns required |
| Date | 2026-11-14 |
| Spec | [`02-spec.md`](./02-spec.md) |

---

## 1. Intent

Persist booking-continue checkpoints (consent done, lastCompletedStep, slots/captcha stuck evidence) **without** storing PII, email bodies, tokens, or captcha answers.

---

## 2. Preferred strategy (**DEC-proposed-003**)

| Option | When | Action |
|--------|------|--------|
| **A — Reuse MA columns** | `manage-applicants-appointment-form` MA-TASK-001 landed (`portal_status`, `portal_checkpoint_json` on `bls_workflow_tasks`) | Extend checkpoint JSON schema for BOOK task with booking keys; **no new migration** |
| **B — Additive columns** | MA columns not yet present and BOOK needs durable mid-step resume | Same additive columns as MA (`portal_status` varchar nullable, `portal_checkpoint_json` jsonb nullable) — **single shared migration**; coordinate with MA |
| **C — Error fields only** | Human rejects JSON checkpoint for BOOK v1 | Persist stuck via `lastErrorCode` / `lastErrorClass` / message ≤500 only; weaker resume |

**Default proposed:** Prefer **A** (columns already present on api+worker entities from MA persistence work — VT-TASK-001 verifies reuse). Else **B** (shared with MA). Never invent a third column name.

### Option B rollback / compatibility

- Columns are **additive nullable**; existing rows remain valid (`null` = resume-from-scratch / scrape-first).
- Down migration (if ever required): drop the two columns only after confirming no BOOK/MA checkpoint consumers in the target env.
- No backfill required for v1.

---

## 3. Checkpoint JSON shape (booking BOOK task)

Logical fields (ids / codes only):

```ts
{
  lastCompletedStep: string // e.g. EMAIL_CONSENT_DONE | FORM_FILLED | SUBMITTED | SLOTS_UNAVAILABLE
  dataProtectionConsentDone: boolean
  dataProtectionMessageId?: string // opaque id; not body
  bookingFieldProgress?: Record<string, 'filled' | 'skipped' | 'failed'>
  lastOutcome?: 'SLOTS_UNAVAILABLE' | 'UNKNOWN_NEXT' | 'CAPTCHA_PENDING' | 'PREMIUM_STOP'
  stuckCode?: string // BOOK_* proposed codes
}
```

Do **not** store: consent URL query `data=`, email HTML, CRM field values, captcha selections.

---

## 4. Workflow status impact

| Status | Change |
|--------|--------|
| `AWAITING_STAFF_BOOKING` | Still valid terminal for staff takeover / unknown-next / exhaustion |
| Mid-booking | Prefer `WAITING_RETRY` / `WAITING_STAFF` + BOOK task checkpoint — **avoid** treating open-UI-only as terminal success (**DEC-proposed-004**) |
| New workflow status enum values | **Not Must** for v1 unless human requires SPA clarity (OQ-004) |

---

## 5. Proposed stuck codes (align stuck_state_db_contract)

| Code | Class | Meaning |
|------|-------|---------|
| `BOOK_DP_CONSENT_PENDING` | SAFE_TO_REPEAT | Waiting for DP email / consent link |
| `BOOK_DP_CONSENT_FAILED` | VERIFY_THEN_REPEAT / staff | Consent link missing or disagree risk |
| `BOOK_CAPTCHA_PENDING` | SAFE_TO_REPEAT | Captcha visible / solve in progress |
| `BOOK_SLOTS_UNAVAILABLE` | SAFE_TO_REPEAT | Banner seen; Try Again / backoff |
| `BOOK_UNKNOWN_NEXT` | NOT_SAFE or staff | Post-submit UI not in materials |
| `BOOK_PREMIUM_OR_PAYMENT` | NOT_SAFE_TO_REPEAT | Forbidden surface |

---

## 6. Migration gate

- **No TypeORM migration merge** without human approval recorded in `04-plan.md` §7.
- If Option A (reuse MA), VT migration task is **N/A** / skipped.
- Entities mirrored in `apps/api` and `apps/workflow-worker` when columns exist.
