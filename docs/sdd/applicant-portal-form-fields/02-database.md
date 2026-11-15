# Phase 2 — Database (portal form field persistence)

| Field | Value |
|-------|-------|
| Feature id | `applicant-portal-form-fields` |
| Status | **APPROVED** (DEC-005 — additive migration via feature request) |
| Date | 2026-11-15 |
| Spec | REQ-002, REQ-003, NFR-001…003, DEC-001, DEC-002, DEC-005 |
| Plan | [`04-plan.md`](./04-plan.md) §7 |

---

## 1. Goal

Add first-class nullable columns for happy-path Edit Member / booking CRM gaps, plus an optional jsonb bag for conditional portal sections — without encrypting new fields or inventing values.

---

## 2. Schema changes

### 2.1 `applications`

| Column | Type | Nullable | Purpose |
|--------|------|----------|---------|
| `visa_sub_type` | `varchar(120)` | yes | Portal Visa Sub Type label/text for booking prefill |

**Property:** `visaSubType` on Application entity (api + worker mirror if present).

`extras.category` remains the Category store (no new column — DEC-003).

### 2.2 `clients` (plaintext nullable — DEC-002)

| Column | Type | Nullable | Maps to CRM key |
|--------|------|----------|-----------------|
| `home_address_line2` | `text` | yes | `homeAddressLine2` |
| `home_country` | `varchar(120)` | yes | `homeCountry` |
| `home_city` | `varchar(120)` | yes | `homeCity` |
| `home_postal_code` | `varchar(40)` | yes | `homePostalCode` |
| `employer_name` | `varchar(200)` | yes | `employerName` |
| `employer_phone` | `varchar(80)` | yes | `employerPhone` |
| `employer_address` | `text` | yes | `employerAddress` |
| `occupation` | `varchar(120)` | yes | `occupation` |
| `previous_finger_print_status` | `varchar(40)` | yes | `previousFingerPrintStatus` |
| `previous_finger_print_date` | `varchar(20)` | yes | `previousFingerPrintDate` |
| `bls_inviting_authority` | `varchar(40)` | yes | `blsInvitingAuthority` |
| `inviting_authority_name` | `varchar(200)` | yes | `invitingAuthorityName` |
| `inviting_country` | `varchar(120)` | yes | `invitingCountry` |
| `inviting_city` | `varchar(120)` | yes | `invitingCity` |
| `inviting_zip_code` | `varchar(40)` | yes | `invitingZipCode` |
| `inviting_address` | `text` | yes | `invitingAddress` |
| `inviting_email` | `varchar(200)` | yes | `invitingEmail` |
| `inviting_contact_no` | `varchar(80)` | yes | `invitingContactNo` |
| `inviting_fax_no` | `varchar(80)` | yes | `invitingFaxNo` |
| `inviting_contact_name` | `varchar(120)` | yes | `invitingContactName` |
| `inviting_contact_surname` | `varchar(120)` | yes | `invitingContactSurname` |
| `inviting_contact_country` | `varchar(120)` | yes | `invitingContactCountry` |
| `inviting_contact_city` | `varchar(120)` | yes | `invitingContactCity` |
| `inviting_contact_zip_code` | `varchar(40)` | yes | `invitingContactZipCode` |
| `inviting_contact_address` | `text` | yes | `invitingContactAddress` |
| `inviting_contact_contact_no` | `varchar(80)` | yes | `invitingContactContactNo` |
| `inviting_contact_email` | `varchar(200)` | yes | `invitingContactEmail` |
| `inviting_contact_fax_no` | `varchar(80)` | yes | `invitingContactFaxNo` |
| `cost_covered_by` | `varchar(120)` | yes | `costCoveredBy` |
| `means_of_support` | `varchar(120)` | yes | `meansOfSupport` |
| `member_state_second_destination` | `varchar(120)` | yes | `memberStateSecondDestination` |
| `portal_form_conditionals_json` | `jsonb` | yes | optional minor / residence / prev visa / EU family bag |

**Recommendation:** first-class columns for happy-path gaps above; jsonb **only** for conditional sections (not for employer/home/inviting happy-path).

### 2.3 Conditionals jsonb (logical)

Store optional flags + field values for sections that are **not** completeness-required on happy-path adult. Exact key shape is implementer-owned under one concern per file (types in `*.types.ts`). Must not hold FR-6 ciphertext or invent defaults for missing keys.

---

## 3. What does **not** change

| Item | Note |
|------|------|
| `PII_ENCRYPTED_FIELD_KEYS` | Unchanged (DEC-002) |
| `clients.address` | Remains Line1 freeform |
| `applications.extras` | Still holds `category` |
| Appointment For | Derived from applicant count (ASSUME-003) |
| Destructive drops | Forbidden |

---

## 4. Migration strategy

1. Human approval — **DEC-005 done** via this feature request ([`04-plan.md`](./04-plan.md) §7).
2. Additive TypeORM migration in `apps/api` (APF-TASK-002).
3. Update `apps/api/src/modules/database/schema.bootstrap.ts` and worker mirror if used.
4. Mirror `Client` (+ Application if duplicated) entity in `apps/workflow-worker`.
5. Backfill: all null = not collected; compatible with existing rows.
6. Apply `npm run migration:run` only in approved env.

### Rollback / compatibility

- Columns additive nullable; `down` may drop them only after confirming no consumers.
- No required default values that invent portal content.

---

## 5. Alternatives considered

| Option | Pros | Cons |
|--------|------|------|
| **A. First-class columns + conditionals jsonb (proposed)** | Queryable happy-path; flexible conditionals | Larger migration |
| B. All new fields in one jsonb | Smaller DDL | Weak typing; harder completeness; mixes concerns |
| C. Only extend `extras` on application for client fields | No clients DDL | Wrong entity; breaks Client↔applicant model |

**Recommendation:** Option A.
