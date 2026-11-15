# Task index — portal-form-data-collection

| Field | Value |
|-------|-------|
| Feature id | `portal-form-data-collection` |
| Spec | [`02-spec.md`](./02-spec.md) |
| Plan | [`04-plan.md`](./04-plan.md) (rev 3 — DEC-PF-011) |
| Status | **DONE** |

| ID | Title | Owner | Depends | Status | Arch | Code |
|----|-------|-------|---------|--------|------|------|
| PF-TASK-001 | Contracts: portal-form journey/contact fields | contracts | — | DONE | OKAY | OKAY |
| PF-TASK-002 | API: portal-form persist/read for journey/contact | api | 001 | DONE | OKAY | OKAY |
| PF-TASK-002b | API+FE: expose AppOut/Application.clientId | api+web | 002 | DONE | OKAY | OKAY |
| PF-TASK-003 | FE entities: portal-form client + visaSubType | web | 001, 002 | DONE | OKAY | OKAY |
| PF-TASK-004 | FE schemas + conditional validation | web | 003 | DONE | OKAY | OKAY |
| PF-TASK-005a | FE BLS themed core sections | web | 004 | DONE | OKAY | OKAY |
| PF-TASK-005b | FE BLS themed conditionals/inviting/cost/EU | web | 005a | DONE | OKAY | OKAY |
| PF-TASK-007 | API: 1:N clientId + create Client on upsert | api | 002b | DONE | OKAY | OKAY |
| PF-TASK-006 | Staff pages one-page + Save all + Client picker | web | 005b, 002b, 007 | DONE | OKAY | OKAY |

---

## PF-TASK-001

- **id:** PF-TASK-001
- **title:** Contracts — extend portal-form DTOs with journey/contact fields
- **owner_layer:** `packages/contracts`
- **depends_on:** []
- **acceptance_criteria:**
  - `ClientPortalFormUpdateDto` and `ClientPortalFormDetailDto` include optional/nullable: `phone`, `purpose`, `firstEntry`, `entries`, `durationDays`
  - Exported from package index; build passes
  - No invented new CRM columns beyond existing Client fields
  - **Checkpoint:** field list limited to OQ-PF-001 set above; no migration (human-approved 2026-11-15)
- **verification_commands:**
  - `cd packages/contracts && pnpm run lint && pnpm run build`
- **sensitive_paths:** public contracts (additive only); PII field names in types

---

## PF-TASK-002

- **id:** PF-TASK-002
- **title:** API — Nest portal-form DTO + pick/apply/map for journey/contact
- **owner_layer:** `apps/api` `src/modules/clients`
- **depends_on:** [PF-TASK-001]
- **acceptance_criteria:**
  - Nest `ClientPortalFormUpdateDto` mirrors contracts fields including the five journey/contact keys
  - Field-key constants + pick/apply/map utils round-trip existing Client columns on GET detail and PATCH portal-form
  - Jest unit tests cover pick/apply/map for the new keys
  - No migration; portal-form PATCH remains non-FR-6-gated; staff roles unchanged
  - **Checkpoint:** same additive field list as 001; no extra public columns
- **verification_commands:**
  - `cd apps/api && pnpm run lint && pnpm run build`
  - `cd apps/api && pnpm test -- --testPathPattern=portal-form`
- **sensitive_paths:** clients module; plaintext PII; no logging of values

---

## PF-TASK-002b

- **id:** PF-TASK-002b
- **title:** Expose `clientId` on AppOut + FE Application; add passport entity util
- **owner_layer:** `apps/api` apps mapper + `apps/web` entities
- **depends_on:** [PF-TASK-002]
- **acceptance_criteria:**
  - `AppOut` includes `clientId: string` (from Application entity); `appOut` mapper fills it
  - FE `Application` includes `clientId` (empty string ok until saved); upsert response / emptyApplication updated
  - `patchClientPassport` util in `entities/client` for `PATCH /clients/:id/passport`
  - No migration; additive response field only
- **verification_commands:**
  - `cd apps/api && pnpm run lint && pnpm run build`
  - `cd apps/web && pnpm run lint && pnpm run build`
- **sensitive_paths:** AppOut public shape (additive); clientId is opaque UUID — not FR-6 plaintext

---

## PF-TASK-003

- **id:** PF-TASK-003
- **title:** FE entities — portal-form API client + Application visaSubType
- **owner_layer:** `apps/web` `entities/client`, `entities/application`
- **depends_on:** [PF-TASK-001, PF-TASK-002]
- **acceptance_criteria:**
  - `patchClientPortalForm` (or equivalent) util calling `PATCH /clients/:id/portal-form`
  - Client detail fetch types include portal-form + journey fields (`phone`, `purpose`, `firstEntry`, `entries`, `durationDays`)
  - `Application` / upsert payload types include `visaSubType`
  - One concern per file; no component code in entities
- **verification_commands:**
  - `cd apps/web && pnpm run lint && pnpm run build`
- **sensitive_paths:** auth-bearing API clients; PII in types only

---

## PF-TASK-004

- **id:** PF-TASK-004
- **title:** FE form schemas + option constants + branch-aware refinements
- **owner_layer:** `apps/web` `features/application-form`
- **depends_on:** [PF-TASK-003]
- **acceptance_criteria:**
  - One-page Zod schema covers full Edit Member + booking fields from spec inventory
  - Mirror `BLS_APPLICANT_COMPLETENESS_REQUIRED_FIELD_KEYS` (+ phone 9-digit length) into FE constants with comment citing `apps/api/.../bls-applicant-completeness.constants.ts`; AC-07 key-parity with that list
  - Branch-aware refinements: inviting company/hotel/person; minor; other residence; prior visa; fingerprint date when status requires; entry permit; EU family — inactive branches not required; no invented defaults (**AC-04, AC-05, AC-14**)
  - Travel Date + Intended Arrival both present and **kept synchronized** to one `travelDate` store; short note that Arrival shares Travel store (**AC-06**)
  - Option lists English worker-mappable strings; no GUID tables (**AC-13**)
  - Fingerprint radios default empty; date only when selected status requires it (**AC-14**)
  - Types/constants/utils separated per file-separation rule
  - Unit tests or documented schema cases for at least: company inviting required; hotel inviting required (company not); inactive minor; fingerprint date when status=`0`
- **verification_commands:**
  - `cd apps/web && pnpm run lint && pnpm run build`
  - Manual/schema checklist: company vs hotel inviting; fingerprint date visibility; Travel/Arrival sync
- **sensitive_paths:** none beyond form field names

---

## PF-TASK-005a

- **id:** PF-TASK-005a
- **title:** FE BLS-mirrored themed core sections
- **owner_layer:** `apps/web` `features/application-form` `components/`
- **depends_on:** [PF-TASK-004]
- **acceptance_criteria:**
  - Themed dark+gold form shell + numbered banners for: Personal Details; Passport Details (+ Travel Date / Intended Arrival / Departure); Address & Contact; Employer Details; Travel Information; booking block (Location / Visa Type / Sub Type / Category)
  - English portal labels; required markers; labels associated with controls (NFR-004)
  - One React component per file; const arrow + explicit props/return type; existing `components/` segment (no parallel `ui/`)
  - Manual checklist vs `manage_applicant(form).html` for these sections
- **verification_commands:**
  - `cd apps/web && pnpm run lint && pnpm run build`
  - Manual: section banner order + booking block present
- **sensitive_paths:** none

---

## PF-TASK-005b

- **id:** PF-TASK-005b
- **title:** FE BLS-mirrored conditionals, inviting, cost, EU family
- **owner_layer:** `apps/web` `features/application-form` `components/`
- **depends_on:** [PF-TASK-005a]
- **acceptance_criteria:**
  - Sections: Minors; Residence other than nationality; Previous Schengen Visa; Fingerprints; Entry permit; Inviting (company/hotel/person branches); Cost of travelling; EU family
  - Controlling radios/checkboxes show/hide and require dependents (including dates) like the site
  - Inactive branches hidden and not required; no invented values
  - Compose with 005a shell without mixing multiple components in one file
  - Manual checklist vs site materials for inviting + fingerprint + minor branches
- **verification_commands:**
  - `cd apps/web && pnpm run lint && pnpm run build`
  - Manual: toggle company→hotel hides company fields; fingerprint date only when required; minor block only when IsMinor
- **sensitive_paths:** none

---

## PF-TASK-007

- **id:** PF-TASK-007
- **title:** API — 1:N Application.clientId + create Client on staff upsert
- **owner_layer:** `apps/api` `modules/apps`, `modules/clients`, `modules/database`
- **depends_on:** [PF-TASK-002b]
- **acceptance_criteria:**
  - Drop unique indexes on `applications.client_id` (migration + entity `@Index` non-unique + schema.bootstrap + worker mirror entity/bootstrap)
  - `AppsModule` imports `ClientsModule`; staff upsert **create** without real `clientId` creates CRM Client + `client_creation_debit` (reuse Clients.create debit semantics) then Application with that id
  - Upsert create **with** existing `clientId` verifies Client exists, attaches Application only (no new debit)
  - Never orphan `uid('cli')` without a `clients` row
  - `ClientsService.create` may still create Client+first Application; extract shared create-Client+debit helper if needed (file-separation)
  - Client list/detail helpers that assumed 1:1 use **most recently updated** Application when multiple exist
  - Jest coverage for create-with/without clientId; migration hand-authored
- **verification_commands:**
  - `cd apps/api && pnpm run lint && pnpm run build`
  - `cd apps/api && pnpm test -- --testPathPatterns=apps.service`
  - `cd apps/api && pnpm test -- --testPathPatterns=clients.service`
- **sensitive_paths:** TypeORM migration (DEC-PF-011 approved); FR-6 debit; Apps↔Clients DI

---

## PF-TASK-006

- **id:** PF-TASK-006
- **title:** Staff create + application detail — one page + Save all + Client picker
- **owner_layer:** `apps/web` `pages/staff-create-application`, `pages/application-detail`, `entities/client`
- **depends_on:** [PF-TASK-005b, PF-TASK-002b, PF-TASK-007]
- **acceptance_criteria:**
  - One scrollable portal page on staff create + detail (**AC-01, AC-10**)
  - Optional **existing Client picker** (list via `GET /clients`); empty → upsert creates Client (**DEC-PF-011**)
  - Detail load via real `clientId` + portal-form journey fields (**AC-11**)
  - Save all: create = upsert (with/without clientId) → passport → portal-form → upsert refresh; detail = passport → portal-form → upsert; per-step failure (**AC-12**)
  - Staff/agent only; no applicants[] SoT; no PII in console
  - Fix prior `as unknown as` empty defaults if still present
- **verification_commands:**
  - `cd apps/web && pnpm run lint && pnpm run build`
  - Manual: create without picker (new Client); create with picker (reuse Client); detail round-trip; partial failure step name
- **sensitive_paths:** FR-6 passport; staff ACL; PII in form state
