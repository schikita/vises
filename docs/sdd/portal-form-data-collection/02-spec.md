# Spec — Portal form data collection UI

| Field | Value |
|-------|-------|
| Feature id | `portal-form-data-collection` |
| Document home | **`docs/sdd/portal-form-data-collection/`** (authoritative) |
| Spec SoT | [`02-spec.md`](./02-spec.md) (this file) |
| Status | **APPROVED** |
| Human approval date | **2026-11-15** |
| Updated | 2026-11-15 |
| Upstream (DONE) | `docs/sdd/applicant-portal-form-fields/` (APF — FE deferred by **DEC-004**) |
| Materials | `site_materials/manage_applicants_appointments/*` (primary: `manage_applicant(form).html`), `site_materials/visa_type/*` |
| Discovery | [`00-discovery.md`](./00-discovery.md) (explorer `dc731253-0312-41ef-90b2-ed91ea2aca19`) |
| Prior draft | [`02-spec.DRAFT.md`](./02-spec.DRAFT.md) — superseded by this file on 2026-11-15 |

> **APPROVED** on 2026-11-15. DEC-PF-001…011 and OQ-PF-001…007 are resolved as recorded in §7, §8, and §14. **DEC-PF-011 APPROVED** (human 2026-11-15): CRM **1 Client : N Applications**; A-style apps upsert creates Client when `clientId` absent; approved index-drop migration only. Implement against this SoT; mirror pointer: `specs/portal-form-data-collection/spec.md`.

---

## 1. Summary

Staff and agents get **one page in `apps/web`** to enter **all CRM data** needed for workflow-worker to fill BLS portal forms (full Edit Member coverage + booking Location / Visa Type / Sub Type / Category). The form **structurally and visually mirrors** the BLS site Edit Member form, including **site-like conditionals** (inviting company / hotel / person and other branches). Persistence uses Client portal-form / passport paths and apps upsert — not discarded `applicants[]` jsonb. CRM is **1 Client : N Applications** (**DEC-PF-011**). **v1 is staff/agent only**; client self-serve is deferred.

---

## 2. Actors and roles

| Actor | Role |
|-------|------|
| Staff / agent (admin, superadmin, agent) | **Sole editors in v1.** Enter all portal-fill data on application create + application detail |
| Client user | **Out of scope for v1** — no client self-serve wiring; no separate client portal clone (**DEC-PF-001** / **OQ-PF-003**) |
| `apps/web` | Collect, validate, load, and persist fields |
| `apps/api` clients + apps modules | Persist/read endpoints; **extend** portal-form GET/PATCH (+ contracts) for journey/contact fields per **OQ-PF-001** |
| `apps/workflow-worker` | Downstream consumer of Client + Application columns (fill mapping unchanged by this feature’s UI) |
| Portal BLS | External SoT for labels, options, visibility/required `*` semantics |

---

## 3. Goal and scope

### 3.1 Goal

Agents enter **every site-relevant field** needed for portal fill — not a happy-path-only subset that leaves gaps. Conditional UI mirrors `site_materials` (controlling radios/checkboxes drive **visibility and requiredness** of dependent fields, including dates). Empty inactive branches must not invent values and must not be required.

### 3.2 In scope

- One-page collection surface on **staff** application create + application detail (**DEC-PF-001**).
- Collect register/login-related identity already gathered today **plus** APF extended Client portal-form fields, Application booking fields, **and** all other site-relevant Edit Member fields/branches (company, hotel, person inviting paths; minor / prior visa / fingerprint date / other residence / entry permit / EU family; full contact + journey set) (**DEC-PF-004** as strengthened for full coverage).
- Persist via portal-form PATCH, passport/create paths, apps upsert — **not** applicants jsonb (**DEC-PF-002**).
- **Extend** `ClientPortalFormUpdateDto` / portal-form PATCH + GET detail (contracts + API) so FE can read/update after create: `phone`, `purpose`, `firstEntry`, `entries`, `durationDays` (and any other create-only Client fields needed for Edit Member journey/contact parity) (**OQ-PF-001**). Prefer portal-form over a separate Client PATCH.
- Themed form region mirroring BLS Edit Member (dark + gold, English labels, numbered section banners) inside the CRM shell (**DEC-PF-003**).
- FE start/validation schemas expanded toward `BLS_APPLICANT_COMPLETENESS_REQUIRED_FIELD_KEYS`, with **branch-aware** requiredness for the selected inviting path and other active conditionals (**DEC-PF-010**, **DEC-PF-006/007**).
- Single **Save all** with create/update sequencing per **DEC-PF-011** / **OQ-PF-005** (apps upsert may create Client when `clientId` absent; then passport + portal-form; per-step failure reporting).
- Optional Client picker on staff create; no selection ⇒ create-Client path (**DEC-PF-011**).
- CRM cardinality **1 Client : N Applications**; drop unique `applications.client_id` indexes only (**DEC-PF-011** / amended **CON-001**).
- FSD + one-concern-per-file; consume `@vises/contracts` (**DEC-PF-009**).

### 3.3 Non-goals (explicit)

| Non-goal | Rationale |
|----------|-----------|
| Full third-party site chrome / logo / iframe clone | **DEC-PF-003** — form fidelity region only |
| Client self-serve / separate client portal clone in v1 | **DEC-PF-001** / **OQ-PF-003** |
| Multi-member “Add New Member” family UI | **DEC-PF-005** |
| Live captcha, Premium / CON-006, slot booking UI | **DEC-PF-004** |
| Email DP consent as a collected CRM field | **DEC-PF-004** |
| New DB migrations beyond **DEC-PF-011** | **DEC-PF-009** / APF shipped columns; OQ-PF-001 uses existing Client columns. **Exception (DEC-PF-011):** drop unique indexes on `applications(client_id)` only — see amended **CON-001** |
| Inventing portal values when empty | APF **REQ-009** / MA OQ-007 — unchanged |
| Fixing backend completeness gate `applicants: []` stub in this release | **OQ-PF-006** — FE validation is enough for Done; backend stub is follow-up |
| CRM auth RegisterUser / portal password as BLS RegisterUser fields | CRM login remains CRM `login`/`email`/`password`; portal RegisterUser email remains existing `portalFormEmail` paths if already modeled |
| Second CRM column for Intended Date of Arrival | **OQ-PF-002** — both UI controls may map to `Application.travelDate` until a second store exists |

---

## 4. Baseline and traceability

| Artifact | Relation |
|----------|----------|
| APF **DEC-004** | Explicitly deferred this FE UI; this feature is that deferred work |
| APF inventory / completeness keys | Normative base set for start completeness; **branch-aware** extensions for selected inviting path and active conditionals |
| `ClientPortalFormUpdateDto` / `ClientPortalFormDetailDto` / conditionals | Write/read for extended portal Client columns — **extend** for journey/phone per **OQ-PF-001** |
| `PATCH /clients/:clientId/portal-form`, `PATCH …/passport`, `GET …/:clientId` | Persist + load identity / portal-form |
| `UpsertAppDto` / apps upsert | Trip, `visaType`, `visaSubType`, `submitCity`, `category`, dates |
| `buildEditMemberFillInput` | Date mapping SoT: TravelDate + IntendedDateOfArrival ← `travelDate`; IntendedDateOfDeparture ← `returnDate`; stay ← `durationDays` |
| Site `manage_applicant(form).html` | Visual + structural mirror (sections 1–14, English labels, inviting 0/1/2 branches) |
| Visa Type materials | Booking fields Location / Visa Type / Sub Type / Category on the same page |

---

## 5. Functional requirements

| ID | Statement | Priority | Status |
|----|-----------|----------|--------|
| **REQ-001** | Provide **one page** (single scrollable view; not multi-step wizard as the primary UX) that collects **all site-relevant** Edit Member fields + Application booking fields listed in §8 for the **primary applicant** linked to `Application.clientId`. Agents must be able to enter every field needed for portal fill; do not ship a happy-path-only subset that leaves site-required gaps for unselected branches the operator cannot fill. | Must | **Accepted** |
| **REQ-002** | Form region **structurally and visually mirrors** BLS Edit Member: numbered section banners (1–14 as on site), English portal labels, field grouping/order, required `*` markers, radio/checkbox conditionals for all common branches (including inviting company / hotel / person), dark theme + gold accents. Embed inside CRM shell (CRM header/nav may remain). | Must | **Accepted** |
| **REQ-003** | Include Application booking fields on the same page: location/`submitCity`, `visaType`, `visaSubType`, `category`, and Appointment For only if already modeled (else derive/display from primary-only count per APF ASSUME-003 — do not invent a new column). | Must | **Accepted** |
| **REQ-004** | On save, persist using: `PATCH /clients/:id/portal-form` for extended portal Client fields (including journey/phone once extended); identity/passport via existing passport (and create) paths; trip / `visaSubType` / category / destination / travel dates via apps upsert. **Do not** resurrect applicants jsonb. Stop treating discarded `applicants[]` as source of truth for portal-extended fields after save. | Must | **Accepted** |
| **REQ-005** | Collect inviting authority **site-like / conditional** (`blsInvitingAuthority`: company / hotel / person). When a branch is selected, collect and require that branch’s fields (and dates where site requires them) for completeness of the selected path; when a branch is not selected, do **not** collect, invent, or require that branch’s data. Completeness follows the **selected** branch — not always-company. | Must | **Accepted** (**DEC-PF-006** as amended) |
| **REQ-006** | Conditionals are **first-class**: controlling radios/checkboxes drive **visibility and requiredness** of dependent fields (including dates) for minor / prior visa / fingerprint date when status requires / other residence / entry permit / EU family / inviting branches as typed. Empty inactive branches must not invent values and must not be required. Persist via `portalFormConditionals` and related Client columns as applicable. | Must | **Accepted** (**DEC-PF-007** as amended) |
| **REQ-007** | Date mapping (fill SoT): show **both** Travel Date and Intended Date of Arrival as on the site; until a second CRM column exists, **both may map to** `Application.travelDate` (document clearly in UI/implementation notes — do not invent a second store). Intended departure maps to `Application.returnDate`; intended stay duration maps to Client `durationDays`. Never invent dates. | Must | **Accepted** (**OQ-PF-002**) |
| **REQ-008** | Consume `@vises/contracts`. **In scope:** extend portal-form update/detail DTOs (+ Nest mirrors + PATCH/GET) for `phone`, `purpose`, `firstEntry`, `entries`, `durationDays` (and any other create-only Client fields needed for journey/contact parity) per **OQ-PF-001**. Prefer extending portal-form over a separate Client PATCH. **No new columns/tables** (use existing Client columns). Schema change limited to the **DEC-PF-011** unique-index drop on `applications(client_id)` per amended **CON-001**. | Must | **Accepted** |
| **REQ-009** | Expand FE start/validation schemas so required keys match `BLS_APPLICANT_COMPLETENESS_REQUIRED_FIELD_KEYS` (plus phone 9-digit rule), with **branch-aware** requiredness for the selected inviting path and other active conditionals. Soft-required on the one page before Start / save-for-start. Backend completeness still passes `applicants: []` stub — FE validation matching completeness keys is enough for this feature’s Done (**OQ-PF-006**); FE must still write Client columns correctly. | Must | **Accepted** |
| **REQ-010** | Collect fill-required identity fields already on passport/create paths (including site-required fields the start gate may omit, e.g. place of birth / nationality / gender / marital when already modeled) without inventing defaults. | Must | **Accepted** |
| **REQ-011** | Load existing Client + Application values into the form on detail (GET client detail with portal-form + apps read), including journey/phone fields once exposed on portal-form detail. Null = empty control. | Must | **Accepted** |
| **REQ-012** | Follow FSD slice discipline and one-concern-per-file; no `enum` keyword for roles/statuses (unions / `as const`); explicit return types per project TypeScript conventions. | Must | **Accepted** |
| **REQ-013** | Never log PII field values (ids/codes/counts only). Do not put FR-6 ciphertext into conditionals. | Must | **Accepted** |
| **REQ-014** | Wire FE API clients for portal-form PATCH/GET (including extended journey/phone fields) and typed upsert fields such as `visaSubType` under entities/features per FSD. | Must | **Accepted** |
| **REQ-015** | Dropdown / option sources use English labels / worker-mappable CRM strings (as FE purpose lists today). Do **not** introduce portal GUID option tables in FE (**OQ-PF-004**). | Must | **Accepted** |
| **REQ-016** | Provide a single **Save all** action that reports **per-step** failure to the operator. Do not invent a new backend multi-resource transaction API (**OQ-PF-005**). **Create sequence (**DEC-PF-011**):** staff create UI offers an **optional Client picker**. (a) **No client selected / no `clientId`:** apps upsert runs first and **creates a new Client + attaches Application** (A-style); reuse **existing debit-on-client-create** once for that new Client (not per Application); then passport + portal-form against the returned `clientId`. (b) **Existing `clientId` selected:** apps upsert creates/updates **Application only** (no new Client, no new debit); then passport + portal-form on that Client. **Update / detail Save all:** passport + portal-form + apps upsert (existing Client). Never mint orphan synthetic `uid('cli')` without a `clients` row. BLS portal person need not exist yet. | Must | **Accepted** (**DEC-PF-011**) |
| **REQ-017** | Fingerprint radios default to **empty** (no invented status). Show/require fingerprint date only when the site requires it for the selected status. Do not invent fingerprint values for storage (**OQ-PF-007**). | Must | **Accepted** |

---

## 6. Non-functional requirements

| ID | Statement |
|----|-----------|
| **NFR-001** | Auth: portal-form and passport writes remain role-gated as today (staff roles on clients module). **v1 staff/agent only** — do not grant `client` role access in this feature (**OQ-PF-003**). |
| **NFR-002** | Passport plaintext continues under FR-6 unlock / debit gate; portal-form PATCH must **not** be conflated with that gate (APF DEC-002). |
| **NFR-003** | New FE fields stay off encrypted PII sets unless they are existing FR-6 passport/identity keys. Journey/phone remain plaintext Client columns (existing APF posture). |
| **NFR-004** | Accessibility: labels associated with controls; required state announced (including when conditionals change requiredness); keyboard operable within the themed region. |
| **NFR-005** | Performance: one-page form must remain usable with all sections mounted (lazy-mount inactive conditionals OK; do not require a multi-route wizard for v1). |
| **NFR-006** | Backwards compatibility: existing apps upsert payloads that still send `applicants[]` must not break the API; FE must not **rely** on read-back of `applicants[]` for portal-extended data. Additive portal-form DTO fields must remain optional on write (partial update). |
| **NFR-007** | Observability: client errors for 4xx/5xx on save surfaced to operator with which Save-all step failed; no PII in console/telemetry payloads. |
| **NFR-008** | Lint/build gates for touched `apps/web`, and for `packages/contracts` + `apps/api` when portal-form DTO/API is extended. |

---

## 7. Constraints

| ID | Statement |
|----|-----------|
| **CON-001** | No new tables/columns in this feature (existing Client/Application columns only). **Amended by DEC-PF-011:** one approved migration may **drop** unique indexes `uq_applications_client_id` and `IDX_19b187ccdbeb753c44a3a0be30` on `applications(client_id)` and may keep a non-unique index on `client_id` if useful. No other migrations. |
| **CON-002** | Do not resurrect `applications.applicants` jsonb as SoT. |
| **CON-003** | Do not invent portal dropdown/radio values; empty stays empty / validation fails closed for required keys of the **active** branch. |
| **CON-004** | Completeness UX must **not** require keys belonging to **inactive** conditional branches. Active branch keys (including inviting company / hotel / person path fields and conditional dates when their control requires them) **are** required per site semantics. |
| **CON-005** | Out of scope: captcha, Premium/CON-006 surfaces, live slot booking, email DP consent field. |
| **CON-006** | v1 primary applicant only; no Add New Member. |
| **CON-007** | Do not invent a second CRM store for Intended Date of Arrival in v1; dual UI controls may share `Application.travelDate` (**OQ-PF-002**). |
| **CON-008** | v1 staff/agent only; no client ACL expansion. |

---

## 8. Decisions and assumptions

### 8.1 Approved decisions

| ID | Decision | Status |
|----|----------|--------|
| **DEC-PF-001** | Primary surface is staff/agent application create + application detail **one-page** form. **v1 = staff/agent only.** Agents enter all data. Client self-serve deferred. Do **not** build a separate client-only portal clone in v1. | **APPROVED** (strengthened 2026-11-15) |
| **DEC-PF-002** | Write via: `PATCH /clients/:id/portal-form` for extended portal fields (incl. journey/phone once extended); passport/identity via existing passport/create paths; trip / `visaSubType` / category via apps upsert. Do **not** resurrect applicants jsonb. On save, FE must stop treating discarded `applicants[]` as SoT for portal-extended fields. | **APPROVED** |
| **DEC-PF-003** | Structural + visual mirror of BLS Edit Member (dark theme, gold accents, English portal labels, section banners matching `manage_applicant(form).html` / screenshots). Embed as a themed form region inside CRM shell. Not a full third-party site iframe clone of chrome/logo beyond form fidelity. | **APPROVED** |
| **DEC-PF-004** | One page collects **all site-relevant** Edit Member fields (full coverage, not happy-path-only) + Application booking fields needed for full fill (location/`submitCity`, `visaType`, `visaSubType`, `category`, Appointment For if already modeled). Out of scope: live captcha, Premium/CON-006, slot booking UI, email DP consent as a collected field. | **APPROVED** (full-coverage intent 2026-11-15) |
| **DEC-PF-005** | v1 = primary applicant linked to `Application.clientId` (under **1 Client : N Applications** per **DEC-PF-011**). Multi-member Add New Member deferred. | **APPROVED** |
| **DEC-PF-006** | Inviting authority is **site-like / conditional**, **not** always-company. Collect inviting authority (and other branch controls) like the site; when company, hotel, or person is selected, collect that branch’s fields; when not selected, do not collect/require that branch’s data/dates. Completeness follows the **selected** branch. | **APPROVED as amended** (2026-11-15) |
| **DEC-PF-007** | Conditionals are **first-class**: controlling radios/checkboxes drive **visibility and requiredness** of dependent fields (including dates). Empty inactive branches must not invent values and must not be required. Persist optional `portalFormConditionals` UI for common site branches (minor / prior visa / fingerprint date when needed / other residence / entry permit / EU family / inviting). | **APPROVED as amended** (2026-11-15) |
| **DEC-PF-008** | Collect TravelDate + IntendedDateOfArrival/Departure aligned to Application `travelDate`/`returnDate` (+ portal intended stay / `durationDays`). Map clearly in §9.3. Show both Travel and Arrival controls per site (**OQ-PF-002**). | **APPROVED** |
| **DEC-PF-009** | Prefer consume existing `packages/contracts`; **contracts + API extension for OQ-PF-001 journey/phone fields is in scope**. No new tables/columns (portal-form DTO maps existing Client columns). Index-drop migration only as allowed by **DEC-PF-011** / amended **CON-001**. | **APPROVED** |
| **DEC-PF-010** | Expand FE start/validation schemas to match `BLS_APPLICANT_COMPLETENESS_REQUIRED_FIELD_KEYS` with branch-aware requiredness. Backend stub (`applicants: []`) remains follow-up — FE validation is enough for Done (**OQ-PF-006**). FE still saves Client columns correctly. | **APPROVED** |
| **DEC-PF-011** | CRM cardinality is **1 Client : N Applications** (not 1:1). Drop the unique-`applications.client_id` assumption. BLS portal person need not exist yet. **Create without `clientId`:** system creates a new Client and attaches the Application; reuse **existing debit-on-client-create** once per new Client (not per Application). **Create with selected existing `clientId`:** Application only — no new Client, no new debit. Never mint orphan synthetic `uid('cli')` without a `clients` row. Staff create UI: **optional Client picker**; if none selected → create-Client path. **Implementation note (A-style):** apps upsert creates Client when `clientId` is absent (prefer A over FE `POST /clients` then upsert) so FR-6 / debit-on-client-create stays correct. **Migration approved:** drop unique indexes `uq_applications_client_id` and `IDX_19b187ccdbeb753c44a3a0be30` on `applications(client_id)`; keep a non-unique index if useful. Amends **CON-001** for this migration only. | **APPROVED** (human 2026-11-15) |

### 8.2 Inherited assumptions (from APF; not reopened here)

| ID | Assumption |
|----|------------|
| **ASSUME-APF-001** | Schengen Edit Member ids/labels apply; National verify-first remains. |
| **ASSUME-APF-002** | Staff trip category semantics = portal booking Category (Normal / Premium / Prime Time). |
| **ASSUME-APF-003** | Appointment For / family still derived from applicant count (no new column); v1 primary-only ⇒ single-member semantics. |

---

## 9. Data model impact

### 9.1 Schema

- **No new tables/columns** (**DEC-PF-009** / CON-001).
- Consume APF Client portal-form columns + existing Client journey/phone columns + `applications.visa_sub_type` + existing Application trip/extras fields.
- **Cardinality (**DEC-PF-011**):** `applications.client_id` is **many Applications per Client** (1:N). Unique constraint/indexes on `applications(client_id)` are removed by the approved migration below.
- **Approved migration (**DEC-PF-011** / amended CON-001):** drop unique indexes `uq_applications_client_id` and `IDX_19b187ccdbeb753c44a3a0be30` on `applications(client_id)`; optionally retain a non-unique index on `client_id`. No other schema changes.
- Sensitive: FR-6 passport/identity remain encrypted at rest; portal-form extended fields and journey/phone remain plaintext nullable (APF DEC-002). Debit-on-client-create fires once per **new Client**, not per Application.

### 9.2 Contracts / API impact (in scope)

- Extend `ClientPortalFormUpdateDto` and `ClientPortalFormDetailDto` (and Nest mirrors) so FE can read/update after create: `phone`, `purpose`, `firstEntry`, `entries`, `durationDays` (and any other create-only Client fields needed for full Edit Member journey/contact parity).
- Prefer portal-form PATCH + GET detail over inventing a separate Client PATCH surface.
- Map portal-form DTO fields to existing Client columns (no new columns).
- Apps upsert: when `clientId` is absent, **create Client + Application** (A-style, **DEC-PF-011**); when present, Application only. Never return/persist a synthetic client id without a `clients` row.

### 9.3 FE model impact (logical)

- Application/entity types in `apps/web` must include `visaSubType` and stop using local `applicants[]` as SoT for portal-extended Client fields after migration of the form.
- Form state may still stage identity fields for passport PATCH; persistence destinations are Client/Application columns, not applicants jsonb.
- Conditional form state must track active branches so inactive fields are neither required nor persisted as invented values.

### 9.4 Field inventory — persist map (full coverage + booking)

#### A. Identity / passport (FR-6) — Client via passport/create

| Portal label / control | CRM store | API |
|------------------------|-----------|-----|
| First Name / Surname / Surname at Birth / Last Name | Client encrypted names / otherNames | `PATCH /clients/:id/passport` |
| Date of Birth, Place/Country of Birth, Nationality(+at birth), Gender, Marital Status, National ID | Client encrypted FR-6 set | passport PATCH |
| Passport Type/No/Issue/Expiry/Place/Country | Client encrypted passport set | passport PATCH |

#### B. Contact + structured home + employer + inviting + cost + fingerprint — Client portal-form

| Portal label / control | CRM store | API |
|------------------------|-----------|-----|
| Home Address Line1 | `clients.address` | `PATCH …/portal-form` |
| Home Address Line2 | `home_address_line2` | portal-form |
| Country / City / Postal | `home_country` / `home_city` / `home_postal_code` | portal-form |
| Employer Name/Phone/Address, Occupation | `employer_*` / `occupation` | portal-form |
| Inviting authority radio (company / hotel / person) | `bls_inviting_authority` | portal-form |
| Inviting company/hotel auth block (when company or hotel selected) | `inviting_*` | portal-form |
| Inviting contact-person block (when company or person selected) | `inviting_contact_*` | portal-form |
| Cost covered by / Means of support | `cost_covered_by` / `means_of_support` | portal-form |
| Fingerprint status/date | `previous_finger_print_*` | portal-form |
| Second destination | `member_state_second_destination` | portal-form |
| Conditionals (minor, other residence, prior visa, entry permit, EU family) | `portal_form_conditionals_json` | portal-form |

**Inviting branch visibility (site mirror):**

| `blsInvitingAuthority` | Auth block (`inviting_*`) | Contact block (`invitingContact*`) |
|------------------------|---------------------------|------------------------------------|
| company (`0`) | visible + required | visible + required |
| hotel (`1`) | visible + required | hidden / not required |
| person (`2`) | hidden / not required | visible + required |
| unset / empty | do not invent; do not require branch fields until selected | same |

#### C. Journey + phone — Client via extended portal-form (**OQ-PF-001 resolved**)

| Portal label / control | CRM store | API |
|------------------------|-----------|-----|
| Contact Number (home) | `clients.phone` | portal-form PATCH + GET detail (**extend DTO**) |
| Purpose of journey | `clients.purpose` | portal-form (**extend**) |
| Member state first entry | `clients.first_entry` | portal-form (**extend**) |
| Number of entries | `clients.entries` | portal-form (**extend**) |
| Intended stay duration | `clients.duration_days` | portal-form (**extend**) |

#### D. Application trip / booking

| Portal / booking use | CRM store | API |
|----------------------|-----------|-----|
| Member state destination | `applications.destination` | apps upsert |
| Travel Date | `applications.travel_date` | apps upsert |
| Intended date of arrival | **same** `applications.travel_date` (worker fill SoT today; dual UI per **OQ-PF-002**) | apps upsert |
| Intended date of departure | `applications.return_date` | apps upsert |
| Location | `applications.submit_city` (+ country as today) | apps upsert |
| Visa Type | `applications.visa_type` | apps upsert |
| Visa Sub Type | `applications.visa_sub_type` | apps upsert (`visaSubType`) |
| Category | `applications.extras.category` | apps upsert (`category`) |
| Appointment For | Derived from applicant count (ASSUME-APF-003); v1 primary-only | no new column |

#### E. Date mapping detail (**DEC-PF-008** / **OQ-PF-002**)

| Portal field | CRM field | Notes |
|--------------|-----------|-------|
| `TravelDate` | `Application.travelDate` | Required for fill; show as its own control |
| `IntendedDateOfArrival` | `Application.travelDate` | Show as its own control; **same store** until a second CRM column exists — document clearly; do not invent a second store |
| `IntendedDateOfDeparture` | `Application.returnDate` | Required for fill |
| `IntendedStayDuration` | `Client.durationDays` | Completeness-required; persist via extended portal-form |

If the operator enters divergent Travel vs Arrival values while both map to one column, last-write / Save-all sequencing must leave a single consistent `travelDate` (prefer documenting that both controls stay synchronized to one value in v1).

---

## 10. API surface

### 10.1 Consumed / extended endpoints

| Method | Path | Auth | Body / response | Use |
|--------|------|------|-----------------|-----|
| `GET` | `/clients/:clientId` | admin, superadmin, agent | `ClientDetailWithPortalFormDto` (detail ∩ portal-form) | Load FR-6 plaintext + portal-form fields **including extended journey/phone** |
| `PATCH` | `/clients/:clientId/passport` | admin, superadmin, agent | `ClientPassportUpdateDto` → `ClientDto` | Identity/passport write (FR-6 gated) |
| `PATCH` | `/clients/:clientId/portal-form` | admin, superadmin, agent | `ClientPortalFormUpdateDto` → `ClientPortalFormDetailDto` | Extended portal fields (+ `address` + journey/phone after extension) |
| `POST` | `/clients` | agent (+ roles as coded) | `ClientCreateDto` → `ClientDto` | Available if needed; **create-without-client path prefers A-style apps upsert** (**DEC-PF-011**), not FE `POST /clients` then upsert |
| Apps upsert | existing apps upsert route | staff per apps rules | `UpsertAppDto` incl. `visaSubType`, trip, `category`; `clientId` optional on create | Booking/trip fields; **absent `clientId` ⇒ create Client + Application** (A-style); present ⇒ Application only (**DEC-PF-011**) |
| Apps read | existing get/list | as today | Application incl. trip; ensure `visaSubType` on FE types; many apps may share one `clientId` | Prefill |

### 10.2 Contracts reference

- `@vises/contracts`: `ClientPortalFormUpdateDto`, `ClientPortalFormDetailDto`, `ClientPortalFormConditionals`, `ClientPassportUpdateDto`, `ApplicationUpsertDto.visaSubType`, application read `visaSubType`.
- **In scope additive fields** on portal-form update/detail: `phone`, `purpose`, `firstEntry`, `entries`, `durationDays` (names align to existing Client camelCase).
- Nest mirrors DTOs under clients/apps modules — FE should align to contracts names.

### 10.3 Auth requirements

- Staff roles only (admin, superadmin, agent) for portal-form and passport routes in v1.
- No client-role ACL change in this feature.

### 10.4 Error responses (FE handling)

| Case | Expected handling |
|------|-------------------|
| Validation 400 | Surface field/messages; do not invent values |
| Passport not unlocked | Block identity save step; keep portal-form / apps steps independent in Save-all reporting |
| 401/403 | Standard session/ACL handling; do not bypass roles |
| 404 client/app | Operator-visible error; no silent create of fake data; never mint orphan `uid('cli')` |
| Partial multi-call Save-all failure | Fail closed for operator; report **which step** failed (apps / passport / portal-form as ordered for create vs update); do not claim completeness |
| Create without client selected | Apps upsert creates Client + Application first; debit once; then passport + portal-form (**DEC-PF-011**) |
| Create with existing client selected | Application only via upsert; no new debit; then passport + portal-form (**DEC-PF-011**) |

---

## 11. Edge cases and error handling

| Case | Handling |
|------|----------|
| Empty optional Line2 / fax / second destination / inactive conditionals | Persist null/omit; do not invent |
| Fingerprint radios empty by default | Allowed; date control only when selected status requires it; no invented status/date (**OQ-PF-007**) |
| Minor / prior visa / other residence / EU family unchecked | Hide/disable dependents; do not require them; do not send invented conditional payloads; clear or omit bag keys per partial-update semantics |
| Inviting = company | Require auth + contact blocks |
| Inviting = hotel | Require auth block only; do not require contact-person block |
| Inviting = person | Require contact-person block only; do not require auth block |
| Inviting unset | Do not invent company default for storage; do not require branch fields until operator selects a path; Start/completeness fails closed until a valid path is complete |
| Switching inviting branch | Newly inactive branch fields are not required; do not invent values for the newly active branch |
| `applicants[]` still sent on upsert for legacy coerce | Allowed for API compatibility; **must not** be read back as SoT for portal-extended fields |
| Backend completeness stub `applicants: []` | FE validation still enforces completeness keys client-side; backend Client wiring is follow-up (**OQ-PF-006**) |
| TravelDate vs IntendedDateOfArrival dual UI | Both controls shown; both map to `travelDate` until a second store exists; keep values consistent — do not invent a second column (**OQ-PF-002**) |
| English-only portal text constraints | Prefer Latin/English input consistent with site `validateEnglish` behavior already mirrored in FE helpers; labels/options are English worker-mappable strings (**OQ-PF-004**) |
| Save-all ordering | **Create, no `clientId`:** apps upsert (creates Client + Application) → passport → portal-form. **Create, existing `clientId` / detail update:** apps upsert (Application only when client exists) with passport + portal-form per **REQ-016**; passport unlock required before passport PATCH; report per-step failures (**OQ-PF-005** / **DEC-PF-011**) |
| Orphan synthetic client id | Forbidden — every Application `clientId` must reference a real `clients` row (**DEC-PF-011**) |
| Second Application for same Client | Allowed (1:N); no unique `client_id` constraint; no extra debit for the additional Application (**DEC-PF-011**) |

---

## 12. Out of scope

- Pixel-perfect clone of entire BLS site chrome, logos, Attention scam modal automation, iframe host window.
- Client self-serve / client-role ACL expansion / separate client-only portal product clone.
- Multi-member family Add New Member.
- Live captcha solving / display as a collected CRM field.
- Premium / payment / CON-006 forbidden booking surfaces.
- Calendar slot picking / Book New Appointment UI.
- Email data-protection consent checkbox as CRM-collected field.
- Migrations other than the **DEC-PF-011** unique-index drop on `applications(client_id)`; resurrecting applicants jsonb.
- Second CRM column for Intended Date of Arrival (document dual-map to `travelDate` instead).
- Fixing worker/API completeness gate Client→applicant wiring in this release (follow-up; not a Done blocker for FE validation + columns saved correctly).

---

## 13. Acceptance criteria

| ID | Criterion | Maps to |
|----|-----------|---------|
| **AC-01** | Staff can open create and/or application detail and see **one page** containing full Edit Member sections (all site-relevant fields/branches) + booking fields (Location, Visa Type, Sub Type, Category). | REQ-001, REQ-003 |
| **AC-02** | Themed form region matches site structure: numbered banners, English labels, grouping, required markers, inviting company/hotel/person branches; CRM shell may remain outside the region. | REQ-002, REQ-005 |
| **AC-03** | Saving persists portal-form fields via `PATCH …/portal-form`, identity via passport/create paths, trip/`visaSubType`/category via apps upsert; no dependency on applicants jsonb read-back for those fields. | REQ-004, REQ-014 |
| **AC-04** | Inviting authority is site-like: selecting company / hotel / person shows and requires **only** that branch’s fields; inactive branch fields are neither required nor invented. Completeness follows the selected branch. | REQ-005, REQ-006, REQ-009 |
| **AC-05** | Conditional sections are first-class: controlling radios/checkboxes drive visibility **and** requiredness of dependents (including dates); inactive branches persist without invented values and are not required for Start. | REQ-006, REQ-017 |
| **AC-06** | UI shows both Travel Date and Intended Date of Arrival; both map to `Application.travelDate` until a second store exists; departure/stay mapping matches §9.4.E. | REQ-007 |
| **AC-07** | FE validation schemas require the keys in `BLS_APPLICANT_COMPLETENESS_REQUIRED_FIELD_KEYS` (phone digit rule included) plus active-branch inviting/conditional keys before Start. | REQ-009 |
| **AC-08** | No new tables/columns; only the **DEC-PF-011** unique-index drop on `applications(client_id)` is allowed; contracts consumed/extended only for OQ-PF-001 fields; FE types include `visaSubType` and portal-form fields needed for the wired calls. | REQ-008, CON-001, DEC-PF-011 |
| **AC-09** | FSD + one-concern-per-file; no PII values in logs. | REQ-012, REQ-013 |
| **AC-10** | Primary-only: no Add New Member UI in v1. Staff/agent only: no client self-serve form wiring in v1. | REQ-001, DEC-PF-001, DEC-PF-005 |
| **AC-11** | Phone + purpose + firstEntry + entries + durationDays round-trip load/save from Client for an existing application via extended portal-form GET/PATCH. | REQ-008, REQ-011 |
| **AC-12** | Single Save all follows **REQ-016** / **DEC-PF-011** create vs update sequencing (apps-first create-Client path when no picker selection; Application-only when existing client selected) and reports which step failed on partial failure. | REQ-016, DEC-PF-011 |
| **AC-15** | Staff create offers optional Client picker; create without selection yields a real `clients` row + Application and one debit-on-client-create; create with selection yields Application only and no new debit; multiple Applications may share one Client; no orphan synthetic client ids. | REQ-016, DEC-PF-011 |
| **AC-13** | Option lists use English worker-mappable strings; no GUID option tables. | REQ-015 |
| **AC-14** | Fingerprint radios empty by default; date only when selected status requires it; no invented fingerprint values. | REQ-017 |

---

## 14. Open questions

All previously blocking open questions are **RESOLVED** as of 2026-11-15. **DEC-PF-011** is **APPROVED** (not an open question). None remain blocking for accepted FRs.

| ID | Resolution | Status |
|----|------------|--------|
| **OQ-PF-001** | Extend portal-form (and/or Client detail + PATCH) so FE can read/update after create: `phone`, `purpose`, `firstEntry`, `entries`, `durationDays` (and any other create-only Client fields needed for full Edit Member journey/contact parity). Prefer extending `ClientPortalFormUpdateDto` / portal-form PATCH + GET detail. Contracts + API work is **in scope**. | **RESOLVED** |
| **OQ-PF-002** | Show **both** Travel Date and Intended Date of Arrival as on the site. Until a second CRM column exists, both may map to `Application.travelDate` (document clearly). Do not invent a second store. | **RESOLVED** |
| **OQ-PF-003** | **v1 = staff/agent only.** Agents enter all data. Client self-serve deferred. No separate client portal clone. | **RESOLVED** |
| **OQ-PF-004** | English labels / worker-mappable strings; no GUID tables. | **RESOLVED** |
| **OQ-PF-005** | Single **Save all** with per-step failure reporting; create/update sequencing per **REQ-016** / **DEC-PF-011** (A-style apps upsert creates Client when `clientId` absent). | **RESOLVED** |
| **OQ-PF-006** | FE validation matching completeness keys is enough for Done; backend completeness stub remains follow-up. | **RESOLVED** |
| **OQ-PF-007** | Fingerprint radios empty by default; date only when site requires for selected status; no invented values. | **RESOLVED** |

---

## 15. Sensitive paths

| Path | Handling policy |
|------|-----------------|
| Auth / roles on clients passport + portal-form | Keep existing Jwt + Roles guards; **staff-only in v1**; no client-role grant (**OQ-PF-003**) |
| FR-6 passport plaintext | Unlock/debit gate unchanged; never log values; never put ciphertext in conditionals |
| Portal-form plaintext PII (address, employer, inviting, phone, journey) | Persist via approved portal-form / passport APIs only; null = not collected; no encryption expansion unless product reopens APF DEC-002 |
| Migrations | **Only** the **DEC-PF-011** drop of unique indexes `uq_applications_client_id` and `IDX_19b187ccdbeb753c44a3a0be30` on `applications(client_id)` (optional non-unique `client_id` index retained); no new tables/columns (**CON-001** amended) |
| Client : Application cardinality | **1:N**; debit-on-client-create once per new Client; never orphan synthetic `uid('cli')` (**DEC-PF-011**) |
| Event / public contracts | Additive DTO fields for **OQ-PF-001** are in scope; prefer existing contracts otherwise (**DEC-PF-009**); apps upsert create-without-`clientId` must keep FR-6 / debit posture correct (A-style) |
| applicants[] | Discarded on read; not SoT; do not reintroduce column |
| Completeness gate stub | Documented risk; FE validates for Done; backend Client wiring is follow-up (**OQ-PF-006**) |
| Dual Travel/Arrival → one column | Documented dual-map; no second store invented (**OQ-PF-002**) |

---

## 16. Visual / section mirror checklist (Edit Member)

Mirror section banners and grouping from `manage_applicant(form).html`:

1. Personal Details  
2. Minors / parental authority (conditional — first-class visibility/requiredness)  
3. Passport Details (+ Travel Date in site layout)  
4. Address & Contact Details  
5. Residence other than nationality (conditional)  
6. Employer Details  
7. Travel Information (incl. dual Travel Date + Intended Date of Arrival controls)  
8. Previous Schengen Visa (conditional)  
9. Fingerprints previously collected (radios empty by default; date when required)  
10. Entry permit final destination (conditional)  
11. Inviting person / company / hotel details — **all three site paths** (company auth+contact; hotel auth only; person contact only)  
12. Cost of travelling and living  
13–14. EU family personal data / relationship (conditional)

Plus on the same page (booking block, not a separate wizard): Location / Visa Type / Visa Sub Type / Category.

---

## 17. Approval record

| Item | Outcome | Date |
|------|---------|------|
| DEC-PF-001…005, 008, 009, 010 | **APPROVED** | 2026-11-15 |
| DEC-PF-006 | **APPROVED as amended** (site-like inviting, not always-company) | 2026-11-15 |
| DEC-PF-007 | **APPROVED as amended** (first-class conditionals) | 2026-11-15 |
| **DEC-PF-011** | **APPROVED** — 1 Client : N Applications; A-style upsert creates Client when `clientId` absent; `applications.client_id` non-unique in initial migration `1793558272305` (separate drop migration removed — no prod) | **2026-11-15** |
| OQ-PF-001…007 | **RESOLVED** as in §14 | 2026-11-15 |
| Spec promotion | Draft → this **APPROVED** `02-spec.md` | 2026-11-15 |
| Spec amend | Record **DEC-PF-011** in SoT (REQ-016, CON-001, data model, AC-12/15) | 2026-11-15 |
