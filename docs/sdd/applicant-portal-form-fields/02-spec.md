# Spec — Applicant portal form fields

| Field | Value |
|-------|-------|
| Feature id | `applicant-portal-form-fields` |
| Document home | **`docs/sdd/applicant-portal-form-fields/`** (authoritative) |
| Spec SoT | [`02-spec.md`](./02-spec.md) (this file) |
| Status | **APPROVED** — DEC-001…005 / ASSUME-001…003 via feature request 2026-11-15 |
| Updated | 2026-11-15 |
| Upstream | MA Edit Member fill; VT booking prefill |
| Materials | `site_materials/manage_applicants_appointments/*`, `site_materials/visa_type/*` |
| Discovery | [`00-discovery.md`](./00-discovery.md) (explorer `6645dba5`) |

---

## 1. Goal and scope

### 1.1 Goal

Persist every portal-required CRM field needed to autofill **Visa Type Selection** and **Manage Applicants Edit Member** so the client (API) can submit them and workflow-worker can fill without `UNSKIPPABLE_GAP` for the happy path **adult + inviting=company**. Fail closed at BLS workflow start when new happy-path required keys are missing.

### 1.2 In scope

- Additive DB columns on `clients` and `applications` (human-approved — DEC-005).
- Contracts + Nest DTO/services for write/read of new fields.
- Worker: extend `mapClientToApplicantInput` / `ApplicantInput`; status client pass-through into `buildEditMemberFillInput`; booking client pass `category` + `visaSubType`.
- Expand `BLS_APPLICANT_COMPLETENESS_REQUIRED_FIELD_KEYS` (+ messages) for new happy-path keys.
- Optional conditional bag (`portal_form_conditionals_json`) — persist/read only; not completeness-required.

### 1.3 Non-goals (explicit)

| Non-goal | Rationale |
|----------|-----------|
| Frontend collection / SPA forms | **DEC-004** — out of this cycle |
| Inventing portal values when CRM empty | **REQ-009** / MA OQ-007 |
| Encrypting new fields under FR-6 | **DEC-002** — plaintext nullable like phone/address |
| New Appointment For column | **ASSUME-003** — still derived from applicant count |
| Rebuilding Edit Member / booking fill pipelines | Already implemented; this feature supplies data |
| Premium / payment / CON-006 forbidden surfaces | Unchanged |

---

## 2. Actors

| Actor | Role |
|-------|------|
| Staff / future FE | Will POST/PATCH new fields via API (UI later) |
| `apps/api` clients + apps modules | Persist/read columns; completeness gate |
| `apps/workflow-worker` | Map Client → fill / booking prefill |
| Portal BLS | External SoT for form validation |

---

## 3. Baseline and traceability

| Artifact | Relation |
|----------|----------|
| MA OQ-002 / `02-database.md` §3 | Schema expand only if already collected — **superseded for this cycle by DEC-001** |
| `EditMemberCrmApplicantSource` | Typed extended keys already exist |
| `buildEditMemberFillInput` | Plans required gaps; needs CRM values |
| `PortalBookingPrefillHint` | Already has `visaSubType` / `category` |
| `bls-booking-client.service.ts` | Must pass category + visaSubType |
| `bls-status-client.service.ts` | Must pass extended applicant keys |
| Completeness constants | Must grow for fail-closed start |

---

## 4. Requirements

| ID | Statement | Priority |
|----|-----------|----------|
| **REQ-001** | Maintain inventory matrix: portal field ↔ CRM store ↔ DTO ↔ worker read (see §8). Keep discovery matrix current when tasks land. | Must |
| **REQ-002** | Persist all happy-path Edit Member `*` gaps: structured home, employer+occupation, inviting authority + company/contact blocks, `costCoveredBy`, `meansOfSupport`, optional fingerprint status/date, optional `memberStateSecondDestination`. | Must |
| **REQ-003** | Persist `applications.visa_sub_type`; expose on `UpsertAppDto` / application read path as `visaSubType`. | Must |
| **REQ-004** | API write/read for new Client fields. Prefer dedicated `ClientPortalFormUpdateDto` PATCH under clients module (avoid conflating FR-6 passport gate) **or** extend `ClientCreateDto` + post-paid portal-form PATCH. Do not stuff non-passport keys into `ClientPassportUpdateDto` unless explicitly justified. | Must |
| **REQ-005** | Status client must pass extended CRM keys into `buildEditMemberFillInput`. | Must |
| **REQ-006** | Booking client must pass `visaSubType` + `category` (`extras.category`) into `PortalBookingPrefillHint`. | Must |
| **REQ-007** | Extend `mapClientToApplicantInput` / `ApplicantInput` with extended plaintext keys (+ conditionals bag if mapped). | Must |
| **REQ-008** | Expand BLS applicant completeness required keys + Russian operator messages for new happy-path fields so STATUS/workflow start fails closed if missing. | Must |
| **REQ-009** | Never invent portal values; never log PII field values (ids/codes/counts only in logs/events). | Must |
| **REQ-010** | One concern per file; no `enum` / function declarations in types or constants files; explicit return types (typescript-conventions + file-separation). | Must |

---

## 5. Non-functional

| ID | Statement |
|----|-----------|
| **NFR-001** | Additive nullable migration only; null = “not yet collected” (compatible with existing rows). |
| **NFR-002** | Mirror Client/Application entity changes in `apps/workflow-worker` when duplicated; update `schema.bootstrap.ts` if used. |
| **NFR-003** | New fields stay off `PII_ENCRYPTED_FIELD_KEYS` (DEC-002). |
| **NFR-004** | Lint+build gates per task (`npm run lint` / `npm run build` in affected packages). |

---

## 6. Constraints

| ID | Statement |
|----|-----------|
| **CON-001** | No FE UI work in this feature. |
| **CON-002** | Do not reopen durable-bls-workflow closed review; extend data paths only. |
| **CON-003** | Do not put secrets or raw passport ciphertext into conditionals jsonb. |
| **CON-004** | Completeness gate must not require conditional-section keys for happy-path adult. |

---

## 7. Decisions and assumptions

| ID | Decision | Status |
|----|----------|--------|
| **DEC-001** | Expand Client/Application schema for portal-required CRM gaps (overrides MA OQ-002 “schema only if already collected” — product now wants collection). | **APPROVED** |
| **DEC-002** | New fields are plaintext nullable (like phone/address), **not** added to `PII_ENCRYPTED_FIELD_KEYS` unless identity/passport. | **APPROVED** |
| **DEC-003** | Wire booking category from `applications.extras.category`; `visaSubType` from new column. | **APPROVED** |
| **DEC-004** | FE UI out of scope; contracts/API must accept fields for future FE. | **APPROVED** |
| **DEC-005** | Human approved additive migration via this feature request. | **APPROVED** |
| **ASSUME-001** | Schengen Edit Member ids apply; National verify-first remains (MA DEC-006). | Assumed |
| **ASSUME-002** | Staff trip category semantics = portal booking Category (Normal / Premium / Prime Time). | Assumed |
| **ASSUME-003** | Family still derived from multi-client applicant count (no new Appointment For column). | Assumed |

---

## 8. Inventory matrix (REQ-001) — happy-path gaps + booking

| Portal / use | CRM store (target) | DTO / API | Worker read |
|--------------|--------------------|-----------|-------------|
| Home Line1 | `clients.address` (existing) | create / detail / portal PATCH | `ApplicantInput.address` → Line1 |
| Home Line2 | `clients.home_address_line2` | portal form DTO | `homeAddressLine2` |
| Home country/city/postal | `home_country` / `home_city` / `home_postal_code` | portal form DTO | `homeCountry` / `homeCity` / `homePostalCode` |
| Employer + occupation | `employer_*` / `occupation` | portal form DTO | matching CRM keys |
| Inviting radio + blocks | `bls_inviting_authority` + inviting_* / inviting_contact_* | portal form DTO | matching CRM keys |
| Cost / support | `cost_covered_by` / `means_of_support` | portal form DTO | `costCoveredBy` / `meansOfSupport` |
| Fingerprint | `previous_finger_print_status` / `_date` | portal form DTO | optional override |
| Second destination | `member_state_second_destination` | portal form DTO | optional |
| Conditionals bag | `portal_form_conditionals_json` | portal form DTO | optional fill only |
| Visa Sub Type | `applications.visa_sub_type` | `UpsertAppDto.visaSubType` + read | booking prefill |
| Category | `applications.extras.category` (existing) | `UpsertAppDto.category` (existing) | booking prefill (**wire**) |

Full already-mapped set: see [`00-discovery.md`](./00-discovery.md) §4.

---

## 9. Acceptance criteria

| ID | Criterion |
|----|-----------|
| **AC-01** | Migration adds listed nullable columns; bootstrap updated; worker entity mirror matches. |
| **AC-02** | Contracts + Nest accept/return new Client portal fields and `visaSubType` without FE. |
| **AC-03** | Status path: extended Client columns → `ApplicantInput` → `buildEditMemberFillInput` without inventing values. |
| **AC-04** | Booking path: prefill receives `category` + `visaSubType` when present. |
| **AC-05** | Completeness rejects start when new happy-path required keys missing; messages present. |
| **AC-06** | No new keys in `PII_ENCRYPTED_FIELD_KEYS`; no PII values in logs. |
| **AC-07** | Lint+build pass in touched packages (api residual debt noted if pre-existing). |

---

## 10. Out of scope reminder

SPA field collection UX, validation UX, and staff form redesign belong to a later FE feature that consumes the contracts introduced here.
