# Phase 4 — External integrations (durable BLS workflow)

| Field | Value |
|-------|-------|
| Feature id | `durable-bls-workflow` |
| Status | **DESIGNED** |
| Date | 2026-09-22 |
| Architecture | [`01-target-architecture.md`](./01-target-architecture.md) |
| Spec refs | REQ-009–020, REQ-025, REQ-028, CON-004–006, CON-012; DEC-005, DEC-007, DEC-008, DEC-011, DEC-017, DEC-019 |

---

## 1. Separation rule (**DEC-008**)

| Layer | Owns | Must not own |
|-------|------|--------------|
| Orchestrator (`BlsWorkflowRunner` + services) | Scheduling, locks, attempts, classification, verify-complete gates, events | CSS/xpath selectors, page click sequences |
| Domain BLS clients | Patchright page actions, fixture-aligned selectors, page-level verify helpers | `nextRunAt`, workflow status transitions, HTTP controllers |
| Providers | Vendor HTTP (Mail.tm, Proxy6, CapMonster), crypto | Workflow graph |

Suggested paths (extend module, not new top-level product app):

```
backend/src/modules/portal-scrape/bls-clients/
  register/
  login/
  password-change/
  status/
  booking/
backend/src/modules/portal-scrape/workflow/   # orchestrator, runner, reconciler
```

---

## 2. Domain BLS clients

### 2.1 Register client (REQ-009, REQ-010, DEC-019)

| Action | Notes |
|--------|-------|
| Consent / privacy | Fixture `email_privact_acceptence.html` |
| Field fill + captcha + OTP | Extend `run-portal-fill-pipeline.util.ts` |
| **Click `#btnSubmit`** | Must for workflow path |
| Verify success | Signals consistent with **`succes.html`** (on-disk spelling) |
| Outputs | `portalFormEmail` on application; portal password → vault |

**Retry:** captcha/OTP soft fails → `SAFE_TO_REPEAT`; after submit without success page → `VERIFY_THEN_REPEAT`.

### 2.2 Login client (REQ-011)

| Action | Notes |
|--------|-------|
| Email among decoys + `#btnVerify` | Extend login-prep |
| Captcha if `login_captcha.html` path | CapMonster |
| Password submit | Decrypt vault in-memory |
| Verify | Left login form / landed authenticated |

**Retry:** decoy/verify fails → `SAFE_TO_REPEAT`; password submit ambiguous → `VERIFY_THEN_REPEAT`.

### 2.3 Password-change client (REQ-012, REQ-013)

| Action | Notes |
|--------|-------|
| Detect forced UI | `reset_password.html` |
| Generate password | ≥8 upper/lower/digit/special |
| Update vault | Re-encrypt new password |
| Else | Orchestrator marks step `SKIPPED` |

### 2.4 Status client (REQ-018, REQ-019)

| Action | Notes |
|--------|-------|
| Scrape rows | `applicant_details.html`, `ready_book_status.html` |
| Normalize enum | At least `FORM_FILLING_IN_PROGRESS`, `READY_TO_BOOK`, `UNKNOWN` (+ observed labels) |
| Edit path | `edit_app.html` + accept `modal_attention_app_editing.html` |
| Rule | **`UNKNOWN` ≠ success**; all required applicants `READY_TO_BOOK` before BOOK |

### 2.5 Booking client (REQ-020, REQ-030, CON-006, DEC-011)

| In scope | Out of scope |
|----------|--------------|
| Open new appointment UI | Premium Lounge Accept / payConfirmModal |
| Optional unambiguous Location / Visa Type prefill | Payment / slot purchase |
| Stop for staff | VisaType `#btnSubmit` / `OnSubmitVisaType` as Must |

Terminal workflow status: **`AWAITING_STAFF_BOOKING`** (**DEC-010**). Past VisaType submit → default `NOT_SAFE_TO_REPEAT`.

Fixtures: `ready_book_status.html`, `slect_location_visa_type.html`, `book_new_appointment.html`.

---

## 3. TemporaryEmailProvider (**DEC-007**)

Evolve `IDisposableEmail` → `TemporaryEmailProvider` (name in types/interfaces; Mail.tm adapter implements).

| Method | Behavior change |
|--------|-----------------|
| `createAccount` | Unchanged semantics |
| `waitLatestMessage` / `extractOtp` | Unchanged |
| `deleteAccount` | **Not** called after registration OTP |
| New: retain handle | Persist encrypted password/token in `bls_secret_vault`; email on `applications.portalFormEmail` |
| Cleanup | On workflow terminal or admin action |

**Classification:** provider outage / OTP timeout → `SAFE_TO_REPEAT`; retain mailbox.

---

## 4. ProxyProvider (**DEC-017**)

Thin port over `PortalProxyLeaseService`:

- `acquire` / `release` around each browser attempt
- Fail closed when armed and pool empty → `SAFE_TO_REPEAT` wait / `WAITING_RETRY`
- Never log raw proxy password (mask as today)

---

## 5. CaptchaProvider (**DEC-017**)

Port over CapMonster `solveBls3x3`:

- Reuse CB / budget patterns from autofill checkpoints where REGISTER links a run
- CB open → do not COMPLETED; schedule retry

---

## 6. SecretsCryptoService (**DEC-005**)

```ts
type SecretEnvelope = {
  ciphertext: Buffer;
  nonce: Buffer;
  wrappedDek: Buffer;
  keyVersion: number;
};

type SecretsCryptoService = {
  encryptSecret: (plain: string) => Promise<SecretEnvelope>;
  decryptSecret: (envelope: SecretEnvelope) => Promise<string>;
};
```

- Master key: `VISES_SECRETS_MASTER_KEY` (base64 32 bytes)
- Missing key → fail closed on start/register (503 Russian detail)
- Unit-testable without browser (NFR-005)

---

## 7. Retry / failure classification guidance

| Integration | Typical class |
|-------------|---------------|
| Proxy acquire empty | `SAFE_TO_REPEAT` |
| CapMonster transient | `SAFE_TO_REPEAT` |
| CapMonster permanent / budget | `NOT_SAFE_TO_REPEAT` or human wait (align autofill permanent flag) |
| Mail.tm create/poll timeout | `SAFE_TO_REPEAT` |
| `#btnSubmit` / password submit no verify | `VERIFY_THEN_REPEAT` |
| Booking past CON-006 | `NOT_SAFE_TO_REPEAT` |
| Status `UNKNOWN` | non-success; retry scrape `SAFE_TO_REPEAT` until max → staff |

---

## 8. Mocking + fixtures

| Mode | Strategy |
|------|----------|
| Offline HTML | Prefer on-disk files under `D:/Git/reps/test-scrape-app/` with **exact spellings** (CON-012): `succes.html`, `email_privact_acceptence.html`, `slect_location_visa_type.html`, etc. |
| In-repo samples | `backend/src/modules/portal-scrape/fixtures/*` for register/captcha |
| Provider mocks | Nest test doubles for TemporaryEmail / Proxy / Captcha / Crypto in added unit tests |
| Live | Host Nest + Docker `db`; Patchright headed — operator practice (**Assumption**) |

Do not copy entire `test-scrape-app` into repo unless a later task explicitly vendors needed samples.

---

## 9. Mail.tm behavior change checklist

| Today (Fact) | Target |
|--------------|--------|
| Delete account in autofill `finally` after OTP | **Retain** until terminal |
| Password not stored | Encrypt in vault |
| Token not on run row | Vault `MAILTM_TOKEN` purpose |

Wire change in `portal-autofill.service.ts` / fill orchestration when used by workflow; avoid deleting on success path.

---

## 10. Phase gate

Integrations design complete. Tasks TASK-006…TASK-012 implement clients/providers. **No product code in this phase.**
