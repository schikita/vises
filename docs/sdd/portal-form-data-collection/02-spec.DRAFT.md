# Spec — Portal form data collection UI

> **SUPERSEDED** on **2026-11-15** by the approved SoT: [`02-spec.md`](./02-spec.md).  
> Do not implement from this draft. DEC-PF / OQ resolutions and full-coverage amendments live only in `02-spec.md`.

| Field | Value |
|-------|-------|
| Feature id | `portal-form-data-collection` |
| Document home | **`docs/sdd/portal-form-data-collection/`** (authoritative) |
| Spec SoT (approved) | [`02-spec.md`](./02-spec.md) |
| This artifact | **`02-spec.DRAFT.md`** — **SUPERSEDED** (kept for history) |
| Status | **SUPERSEDED** — replaced by APPROVED `02-spec.md` on 2026-11-15 |
| Updated | 2026-11-15 |
| Upstream (DONE) | `docs/sdd/applicant-portal-form-fields/` (APF — FE deferred by **DEC-004**) |
| Materials | `site_materials/manage_applicants_appointments/*` (primary: `manage_applicant(form).html`), `site_materials/visa_type/*` |
| Discovery | [`00-discovery.md`](./00-discovery.md) (explorer `dc731253-0312-41ef-90b2-ed91ea2aca19`) |

> **Historical only.** The content below is the pre-approval draft. Human approvals on 2026-11-15 amended DEC-PF-006/007, strengthened DEC-PF-001 (staff-only), resolved OQ-PF-001…007, and required full site field coverage. See [`02-spec.md`](./02-spec.md).

---

## 1. Goal and scope

### 1.1 Goal

Give staff (and optionally clients, if ACL allows) **one page in `apps/web`** to enter **all CRM data** needed for workflow-worker to fill BLS portal forms (Edit Member happy path + booking Location / Visa Type / Sub Type / Category), with UI that **structurally and visually mirrors** the BLS site Edit Member form — without inventing portal values and without resurrecting discarded `applicants[]` jsonb.

### 1.2 In scope

- One-page collection surface on staff application create + application detail (primary); optional reuse of the same form component for client self-serve only if ACL already allows the required APIs (**DEC-PF-001**).
- Collect register/login-related identity already gathered today **plus** APF extended Client portal-form fields and Application booking fields needed for full fill (**DEC-PF-004**).
- Persist via existing APIs: portal-form PATCH, passport/create paths, apps upsert — **not** applicants jsonb (**DEC-PF-002**).
- Themed form region mirroring BLS Edit Member (dark + gold, English labels, numbered section banners) inside the CRM shell (**DEC-PF-003**).
- FE start/validation schemas expanded toward `BLS_APPLICANT_COMPLETENESS_REQUIRED_FIELD_KEYS` (**DEC-PF-010**).
- FSD + one-concern-per-file; consume `@vises/contracts` (**DEC-PF-009**).

### 1.3 Non-goals (explicit)

| Non-goal | Rationale |
|----------|-----------|
| Full third-party site chrome / logo / iframe clone | **DEC-PF-003** — form fidelity region only |
| Separate client-only portal clone in v1 | **DEC-PF-001** |
| Multi-member “Add New Member” family UI | **DEC-PF-005** |
| Live captcha, Premium / CON-006, slot booking UI | **DEC-PF-004** |
| Email DP consent as a collected CRM field | **DEC-PF-004** |
| New DB migration | **DEC-PF-009** / APF already shipped columns |
| Inventing portal values when empty | APF **REQ-009** / MA OQ-007 — unchanged |
| Fixing backend completeness gate `applicants: []` stub | **DEC-PF-010** notes follow-up risk; FE still saves Client columns correctly |
| CRM auth RegisterUser / portal password collection as BLS RegisterUser fields | CRM login remains CRM `login`/`email`/`password`; portal RegisterUser email remains existing `portalFormEmail` paths if already modeled |

---

## 2. Actors

| Actor | Role |
|-------|------|
| Staff / agent (admin, superadmin, agent) | Primary editors of the one-page portal form on create + detail |
| Client user | May use the same form component **only if** existing ACL allows the write/read APIs used by the form; no separate client-only clone in v1 |
| `apps/web` | Collect, validate, load, and persist fields |
| `apps/api` clients + apps modules | Existing persist/read endpoints (consumed, not redesigned except if OQ forces a contracts gap fix) |
| `apps/workflow-worker` | Downstream consumer of Client + Application columns (unchanged by this FE feature) |
| Portal BLS | External SoT for labels, options, and required `*` semantics |

---

## 3. Baseline and traceability

| Artifact | Relation |
|----------|----------|
| APF **DEC-004** | Explicitly deferred this FE UI; this feature is that deferred work |
| APF inventory / completeness keys | Normative happy-path field set for start completeness |
| `ClientPortalFormUpdateDto` / `ClientPortalFormDetailDto` / conditionals | Write/read for extended portal Client columns |
| `PATCH /clients/:clientId/portal-form`, `PATCH …/passport`, `GET …/:clientId` | Persist + load identity / portal-form |
| `UpsertAppDto` / apps upsert | Trip, `visaType`, `visaSubType`, `submitCity`, `category`, dates |
| `buildEditMemberFillInput` | Date mapping SoT: TravelDate + IntendedDateOfArrival ← `travelDate`; IntendedDateOfDeparture ← `returnDate`; stay ← `durationDays` |
| Site `manage_applicant(form).html` | Visual + structural mirror (sections 1–14, English labels) |
| Visa Type materials | Booking fields Location / Visa Type / Sub Type / Category on the same page |

---

## 4. Requirements

Requirements below are **accepted only where they do not depend on unresolved open questions**. Items blocked by OQs are marked **BLOCKED** and must not be implemented as accepted until the OQ is resolved.

| ID | Statement | Priority | Status |
|----|-----------|----------|--------|
| **REQ-001** | Provide **one page** (single scrollable view; not multi-step wizard as the primary UX) that collects all happy-path Edit Member fields + Application booking fields listed in §8 for the **primary applicant** linked to `Application.clientId`. | Must | Accepted if **DEC-PF-001/004/005** approved |
| **REQ-002** | Form region **structurally and visually mirrors** BLS Edit Member: numbered section banners (1–14 as on site), English portal labels, field grouping/order, required `*` markers, radio/checkbox conditionals for common branches, dark theme + gold accents. Embed inside CRM shell (CRM header/nav may remain). | Must | Accepted if **DEC-PF-003** approved |
| **REQ-003** | Include Application booking fields on the same page: location/`submitCity`, `visaType`, `visaSubType`, `category`, and Appointment For only if already modeled (else derive/display from primary-only count per APF ASSUME-003 — do not invent a new column). | Must | Accepted if **DEC-PF-004** approved |
| **REQ-004** | On save, persist using existing APIs only: `PATCH /clients/:id/portal-form` for extended portal Client fields; identity/passport via existing passport (and create) paths; trip / `visaSubType` / category / destination / travel dates via apps upsert. **Do not** resurrect applicants jsonb. Stop treating discarded `applicants[]` as source of truth for portal-extended fields after save. | Must | Accepted if **DEC-PF-002** approved; see **OQ-PF-001** for journey/phone gap |
| **REQ-005** | Always collect inviting authority as **company** (`blsInvitingAuthority` company value) and require company + contact blocks for start-completeness parity with APF. | Must | Accepted if **DEC-PF-006** approved |
| **REQ-006** | Persist optional `portalFormConditionals` UI for common site branches (minor / prior visa / fingerprint date when status requires / other residence / entry permit / EU family as already typed). Do not invent values. Completeness must **not** require conditionals. | Must | Accepted if **DEC-PF-007** approved |
| **REQ-007** | Date mapping (fill SoT): collect Travel Date + intended arrival/departure aligned to Application `travelDate` / `returnDate`; collect intended stay duration as Client `durationDays` (as today). Map per §8.3. Never invent dates. | Must | Accepted if **DEC-PF-008** approved; UI duplication of Travel vs Arrival → **OQ-PF-002** |
| **REQ-008** | Prefer consuming existing `packages/contracts` types (`ClientPortalFormUpdateDto`, conditionals, `ApplicationUpsertDto.visaSubType`, etc.). Contracts/API task only if FE cannot type or call an existing field. **No new migration.** | Must | Accepted if **DEC-PF-009** approved |
| **REQ-009** | Expand FE start/validation schemas so required happy-path keys match `BLS_APPLICANT_COMPLETENESS_REQUIRED_FIELD_KEYS` (plus phone 9-digit rule). Soft-required on the one page before Start / save-for-start. Note backend completeness still passes `applicants: []` stub as follow-up risk — FE must still write Client columns correctly. | Must | Accepted if **DEC-PF-010** approved |
| **REQ-010** | Collect fill-required identity fields already on passport/create paths (including site-required fields the start gate may omit, e.g. place of birth / nationality / gender / marital when already modeled) without inventing defaults. | Must | Accepted |
| **REQ-011** | Load existing Client + Application values into the form on detail (GET client detail with portal-form + apps read). Null = empty control. | Must | Partially **BLOCKED** by **OQ-PF-001** for phone/journey fields missing from detail DTO |
| **REQ-012** | Follow FSD slice discipline and one-concern-per-file; no `enum` keyword for roles/statuses (unions / `as const`); explicit return types per project TypeScript conventions. | Must | Accepted |
| **REQ-013** | Never log PII field values (ids/codes/counts only). Do not put FR-6 ciphertext into conditionals. | Must | Accepted |
| **REQ-014** | Wire FE API clients for portal-form PATCH (and any missing typed upsert fields such as `visaSubType`) under entities/features per FSD. | Must | Accepted if **DEC-PF-002/009** approved |

---

## 5. Non-functional

| ID | Statement |
|----|-----------|
| **NFR-001** | Auth: portal-form and passport writes remain role-gated as today (staff roles on clients module). Client reuse requires ACL confirmation (**OQ-PF-003**). |
| **NFR-002** | Passport plaintext continues under FR-6 unlock / debit gate; portal-form PATCH must **not** be conflated with that gate (APF DEC-002). |
| **NFR-003** | New FE fields stay off encrypted PII sets unless they are existing FR-6 passport/identity keys. |
| **NFR-004** | Accessibility: labels associated with controls; required state announced; keyboard operable within the themed region. |
| **NFR-005** | Performance: one-page form must remain usable with all sections mounted (lazy-mount conditionals OK; do not require a multi-route wizard for v1). |
| **NFR-006** | Backwards compatibility: existing apps upsert payloads that still send `applicants[]` must not break the API; FE must not **rely** on read-back of `applicants[]` for portal-extended data. |
| **NFR-007** | Observability: client errors for 4xx/5xx on save surfaced to operator; no PII in console/telemetry payloads. |
| **NFR-008** | Lint/build gates for touched `apps/web` (and contracts only if touched). |

---

## 6. Constraints

| ID | Statement |
|----|-----------|
| **CON-001** | No new migration in this feature. |
| **CON-002** | Do not resurrect `applications.applicants` jsonb as SoT. |
| **CON-003** | Do not invent portal dropdown/radio values; empty stays empty / validation fails closed for required keys. |
| **CON-004** | Completeness UX must not require conditional-section keys for happy-path adult (APF CON-004). |
| **CON-005** | Out of scope: captcha, Premium/CON-006 surfaces, live slot booking, email DP consent field. |
| **CON-006** | v1 primary applicant only; no Add New Member. |
| **CON-007** | Do not decide unresolved OQs in implementation; escalate. |

---

## 7. Decisions and assumptions

### 7.1 Proposed decisions (awaiting human approval)

| ID | Decision | Status |
|----|----------|--------|
| **DEC-PF-001** | Primary surface is staff/agent application create + application detail **one-page** form. Client self-serve may reuse the same form component if ACL allows; do **not** build a separate client-only portal clone in v1. | **PROPOSED** |
| **DEC-PF-002** | Write via existing APIs: `PATCH /clients/:id/portal-form` for extended portal fields; passport/identity via existing passport/create paths; trip / `visaSubType` / category via apps upsert. Do **not** resurrect applicants jsonb. On save, FE must stop treating discarded `applicants[]` as SoT for portal-extended fields. | **PROPOSED** |
| **DEC-PF-003** | Structural + visual mirror of BLS Edit Member (dark theme, gold accents, English portal labels, section banners matching `manage_applicant(form).html` / screenshots). Embed as a themed form region inside CRM shell. Not a full third-party site iframe clone of chrome/logo beyond form fidelity. | **PROPOSED** |
| **DEC-PF-004** | One page collects Edit Member happy-path fields + Application booking fields needed for full fill (location/`submitCity`, `visaType`, `visaSubType`, `category`, Appointment For if already modeled). Out of scope: live captcha, Premium/CON-006, slot booking UI, email DP consent as a collected field. | **PROPOSED** |
| **DEC-PF-005** | v1 = primary applicant linked to `Application.clientId`. Multi-member Add New Member deferred. | **PROPOSED** |
| **DEC-PF-006** | Match APF happy path — always collect inviting=`company` + company/contact block required for start completeness. | **PROPOSED** |
| **DEC-PF-007** | Persist optional `portalFormConditionals` UI for common branches visible on site (minor / prior visa / fingerprint date when needed, etc.); do not invent values. Completeness does not require conditionals. | **PROPOSED** |
| **DEC-PF-008** | Collect TravelDate + IntendedDateOfArrival/Departure aligned to Application `travelDate`/`returnDate` (+ portal intended stay / `durationDays` as today). Map clearly in §8.3. | **PROPOSED** |
| **DEC-PF-009** | Prefer consume existing `packages/contracts`; contracts task only if FE types missing. No new migration. | **PROPOSED** |
| **DEC-PF-010** | Expand FE start/validation schemas to match `BLS_APPLICANT_COMPLETENESS_REQUIRED_FIELD_KEYS`. Note known backend stub (`applicants: []`) as follow-up risk — FE still saves Client columns correctly. | **PROPOSED** |

### 7.2 Inherited assumptions (from APF; not reopened here)

| ID | Assumption |
|----|------------|
| **ASSUME-APF-001** | Schengen Edit Member ids/labels apply; National verify-first remains. |
| **ASSUME-APF-002** | Staff trip category semantics = portal booking Category (Normal / Premium / Prime Time). |
| **ASSUME-APF-003** | Appointment For / family still derived from applicant count (no new column); v1 primary-only ⇒ single-member semantics. |

---

## 8. Data model impact

### 8.1 Schema

- **No new tables/columns** (**DEC-PF-009** / CON-001).
- Consume APF Client portal-form columns + `applications.visa_sub_type` + existing Application trip/extras fields.
- Sensitive: FR-6 passport/identity remain encrypted at rest; portal-form extended fields remain plaintext nullable (APF DEC-002).

### 8.2 FE model impact (logical)

- Application/entity types in `apps/web` must include `visaSubType` and stop using local `applicants[]` as SoT for portal-extended Client fields after migration of the form.
- Form state may still stage identity fields for passport PATCH; persistence destinations are Client/Application columns, not applicants jsonb.

### 8.3 Field inventory — persist map (happy path + booking)

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
| Inviting authority + company/contact (+ optional fax) | `bls_inviting_authority` + inviting_* | portal-form |
| Cost covered by / Means of support | `cost_covered_by` / `means_of_support` | portal-form |
| Fingerprint status/date | `previous_finger_print_*` | portal-form |
| Second destination | `member_state_second_destination` | portal-form |
| Conditionals (minor, other residence, prior visa, entry permit, EU family) | `portal_form_conditionals_json` | portal-form |

#### C. Journey plaintext on Client — **gap**

| Portal label / control | CRM store | API today | Spec status |
|------------------------|-----------|-----------|-------------|
| Contact Number (home) | `clients.phone` | Create via `ClientCreateDto`; **not** on portal-form PATCH; **not** on `ClientDetailDto` | **OQ-PF-001** |
| Purpose of journey | `clients.purpose` | Create only (same gap) | **OQ-PF-001** |
| Member state first entry | `clients.first_entry` | Create only | **OQ-PF-001** |
| Number of entries | `clients.entries` | Create only | **OQ-PF-001** |
| Intended stay duration | `clients.duration_days` | Create only | **OQ-PF-001** |

Until **OQ-PF-001** is resolved, collecting these on the page is allowed for UX parity, but **accepted persist/load requirements for them remain BLOCKED**.

#### D. Application trip / booking

| Portal / booking use | CRM store | API |
|----------------------|-----------|-----|
| Member state destination | `applications.destination` | apps upsert |
| Travel Date | `applications.travel_date` | apps upsert |
| Intended date of arrival | **same** `applications.travel_date` (worker fill SoT today) | apps upsert |
| Intended date of departure | `applications.return_date` | apps upsert |
| Location | `applications.submit_city` (+ country as today) | apps upsert |
| Visa Type | `applications.visa_type` | apps upsert |
| Visa Sub Type | `applications.visa_sub_type` | apps upsert (`visaSubType`) |
| Category | `applications.extras.category` | apps upsert (`category`) |
| Appointment For | Derived from applicant count (ASSUME-APF-003); v1 primary-only | no new column |

#### E. Date mapping detail (**DEC-PF-008**)

| Portal field | CRM field | Notes |
|--------------|-----------|-------|
| `TravelDate` | `Application.travelDate` | Required for fill |
| `IntendedDateOfArrival` | `Application.travelDate` | Worker maps arrival from **same** `travelDate` today |
| `IntendedDateOfDeparture` | `Application.returnDate` | Required for fill |
| `IntendedStayDuration` | `Client.durationDays` | Completeness-required; persist blocked by **OQ-PF-001** |

UI may show separate Travel vs Arrival controls only if product confirms (**OQ-PF-002**); if one control, label must make both portal meanings clear without inventing a second stored value.

---

## 9. API surface

### 9.1 Consumed endpoints (existing)

| Method | Path | Auth (today) | Body / response | Use |
|--------|------|--------------|-----------------|-----|
| `GET` | `/clients/:clientId` | admin, superadmin, agent | `ClientDetailWithPortalFormDto` (detail ∩ portal-form) | Load FR-6 plaintext + portal-form fields |
| `PATCH` | `/clients/:clientId/passport` | admin, superadmin, agent | `ClientPassportUpdateDto` → `ClientDto` | Identity/passport write (FR-6 gated) |
| `PATCH` | `/clients/:clientId/portal-form` | admin, superadmin, agent | `ClientPortalFormUpdateDto` → `ClientPortalFormDetailDto` | Extended portal fields (+ `address`) |
| `POST` | `/clients` | agent (+ roles as coded) | `ClientCreateDto` → `ClientDto` | Create-time phone/purpose/journey if used |
| Apps upsert | existing apps upsert route | staff / client per apps rules | `UpsertAppDto` incl. `visaSubType`, trip, `category` | Application booking/trip fields |
| Apps read | existing get/list | as today | Application incl. trip; ensure `visaSubType` on FE types | Prefill |

### 9.2 Contracts reference

- `@vises/contracts`: `ClientPortalFormUpdateDto`, `ClientPortalFormDetailDto`, `ClientPortalFormConditionals`, `ClientPassportUpdateDto`, `ApplicationUpsertDto.visaSubType`, application read `visaSubType`.
- Nest mirrors DTOs under clients/apps modules — FE should align to contracts names.

### 9.3 Error responses (FE handling)

| Case | Expected handling |
|------|-------------------|
| Validation 400 | Surface field/messages; do not invent values |
| Passport not unlocked | Block identity save; keep portal-form save independent |
| 401/403 | Standard session/ACL handling; do not bypass roles |
| 404 client/app | Operator-visible error; no silent create of fake data |
| Partial multi-call save failure | Fail closed for operator (report which step failed); do not claim completeness |

### 9.4 Gaps requiring human decision before “wired correctly” for all fields

See **OQ-PF-001** (journey/phone read+write) and **OQ-PF-003** (client ACL).

---

## 10. Edge cases and error handling

| Case | Handling |
|------|----------|
| Empty optional Line2 / fax / second destination / conditionals | Persist null/omit; do not invent |
| Fingerprint radio requires date when status=`0` | Show date; validate when that branch selected; still not completeness-required |
| Minor / prior visa / other residence / EU family unchecked | Do not send invented conditional payloads; clear or omit bag keys per partial-update semantics |
| Inviting non-company selected | **Out of happy-path product policy** under **DEC-PF-006** — UI should keep company selected / required; do not implement hotel/person as alternate start path in v1 unless OQ reopens |
| `applicants[]` still sent on upsert for legacy coerce | Allowed for API compatibility; **must not** be read back as SoT for portal-extended fields |
| Backend completeness stub `applicants: []` | Start may still fail closed or pass incorrectly server-side; FE validation still enforces completeness keys client-side (**DEC-PF-010**) |
| TravelDate vs IntendedDateOfArrival diverge in UI | Forbidden unless **OQ-PF-002** introduces a second store; until then keep single stored `travelDate` |
| English-only portal text constraints | Prefer Latin/English input consistent with site `validateEnglish` behavior already mirrored in FE helpers |
| Multi-save ordering | Passport unlock required before passport PATCH; portal-form and apps upsert independent — define operator-visible save that sequences existing calls without inventing a new backend transaction API |

---

## 11. Out of scope

- Pixel-perfect clone of entire BLS site chrome, logos, Attention scam modal automation, iframe host window.
- Multi-member family Add New Member.
- Live captcha solving / display as a collected CRM field.
- Premium / payment / CON-006 forbidden booking surfaces.
- Calendar slot picking / Book New Appointment UI.
- Email data-protection consent checkbox as CRM-collected field.
- New migrations; resurrecting applicants jsonb.
- Fixing worker/API completeness gate Client→applicant wiring (track as follow-up; not this FE acceptance blocker for “columns saved correctly”).
- Separate client-only portal product clone.

---

## 12. Acceptance criteria

| ID | Criterion | Maps to |
|----|-----------|---------|
| **AC-01** | Staff can open create and/or application detail and see **one page** containing Edit Member happy-path sections + booking fields (Location, Visa Type, Sub Type, Category). | REQ-001, REQ-003 |
| **AC-02** | Themed form region matches site structure: numbered banners, English labels, grouping, required markers; CRM shell may remain outside the region. | REQ-002 |
| **AC-03** | Saving persists portal-form fields via `PATCH …/portal-form`, identity via passport/create paths, trip/`visaSubType`/category via apps upsert; no dependency on applicants jsonb read-back for those fields. | REQ-004, REQ-014 |
| **AC-04** | Inviting company + contact required fields are collected and validated for start completeness. | REQ-005, REQ-009 |
| **AC-05** | Conditional sections can be filled and persisted in `portalFormConditionals` when used; start validation does not require them for adult happy path. | REQ-006 |
| **AC-06** | Travel/return/stay mapping documented in UI behavior matches §8.3 (arrival uses `travelDate` store unless OQ changes it). | REQ-007 |
| **AC-07** | FE validation schemas require the happy-path keys in `BLS_APPLICANT_COMPLETENESS_REQUIRED_FIELD_KEYS` (phone digit rule included) before Start. | REQ-009 |
| **AC-08** | No new migration; contracts consumed; FE types include `visaSubType` and portal-form fields needed for the wired calls. | REQ-008 |
| **AC-09** | FSD + one-concern-per-file; no PII values in logs. | REQ-012, REQ-013 |
| **AC-10** | Primary-only: no Add New Member UI in v1. | REQ-001, DEC-PF-005 |

**Blocked ACs (do not claim done until OQ resolved):**

| ID | Criterion | Blocked by |
|----|-----------|------------|
| **AC-B1** | Phone + purpose + firstEntry + entries + durationDays round-trip load/save from Client for an existing application. | **OQ-PF-001** |
| **AC-B2** | Client self-serve uses the same form end-to-end against portal-form/passport APIs. | **OQ-PF-003** |

---

## 13. Open questions

| ID | Question | Why it blocks / matters |
|----|----------|-------------------------|
| **OQ-PF-001** | How should FE **read and update** Client `phone`, `purpose`, `firstEntry`, `entries`, `durationDays` after create? Today they are on `ClientCreateDto` only; **not** on `ClientPortalFormUpdateDto`; **not** returned on `ClientDetailDto` / portal-form detail. Extend portal-form DTO+PATCH+GET, add a dedicated Client PATCH, or another existing path? | Without this, journey/phone cannot be “wired correctly” for edit flows despite being completeness-required and Edit Member required. |
| **OQ-PF-002** | Should the UI show **two** date controls (Travel Date vs Intended Date of Arrival) that both write `Application.travelDate`, or **one** control covering both portal labels? | Worker fill uses the same CRM field for both; product visual parity vs single store. |
| **OQ-PF-003** | For client self-serve reuse (**DEC-PF-001**): grant `client` role access to portal-form / passport / detail endpoints, or keep v1 **staff-only** and defer client wiring? | Current clients controller roles are staff-only for these routes. |
| **OQ-PF-004** | Dropdown option sources: continue CRM English **labels** (as FE purpose lists today) vs portal GUIDs? Worker resolution already expects CRM strings it can map — confirm no change. | Avoid inventing GUID tables in FE without SoT. |
| **OQ-PF-005** | Save UX: single “Save all” that sequences passport + portal-form + apps upsert, vs separate section saves? | Partial failure handling and operator clarity. |
| **OQ-PF-006** | Timeline to fix backend completeness gate still passing `applicants: []` — FE-only validation acceptable for this feature’s Done, or must API gate read Client columns in the same release? | **DEC-PF-010** already notes follow-up risk; confirm release bar. |
| **OQ-PF-007** | Fingerprint: always show radios (optional for completeness) with default empty vs default site-like value? Must not invent if empty for fill-required radio — confirm empty allowed until operator chooses. | Worker currently defaults fingerprint when CRM empty; FE must not silently invent for storage. |

---

## 14. Sensitive paths

| Path | Handling policy |
|------|-----------------|
| Auth / roles on clients passport + portal-form | Keep existing Jwt + Roles guards; staff-only until **OQ-PF-003** |
| FR-6 passport plaintext | Unlock/debit gate unchanged; never log values; never put ciphertext in conditionals |
| Portal-form plaintext PII (address, employer, inviting, phone if added) | Persist via approved APIs only; null = not collected; no encryption expansion unless product reopens APF DEC-002 |
| Migrations | **None** in this feature |
| Event / public contracts | Prefer existing contracts; any additive DTO fields only if **OQ-PF-001** / **DEC-PF-009** force a contracts task |
| applicants[] | Discarded on read; not SoT; do not reintroduce column |
| Completeness gate stub | Documented risk; FE validates; backend Client wiring is follow-up unless **OQ-PF-006** elevates it |

---

## 15. Visual / section mirror checklist (Edit Member)

Mirror section banners and grouping from `manage_applicant(form).html`:

1. Personal Details  
2. Minors / parental authority (conditional)  
3. Passport Details (+ Travel Date in site layout)  
4. Address & Contact Details  
5. Residence other than nationality (conditional)  
6. Employer Details  
7. Travel Information  
8. Previous Schengen Visa (conditional)  
9. Fingerprints previously collected  
10. Entry permit final destination (conditional)  
11. Inviting person/company/hotel details (v1: company path)  
12. Cost of travelling and living  
13–14. EU family personal data / relationship (conditional)

Plus on the same page (booking block, not a separate wizard): Location / Visa Type / Visa Sub Type / Category.

---

## 16. Approval checklist (human)

- [x] Approve or amend **DEC-PF-001…010** → see APPROVED [`02-spec.md`](./02-spec.md)
- [x] Resolve **OQ-PF-001** … **OQ-PF-007** → see APPROVED [`02-spec.md`](./02-spec.md)
- [x] Authorize promotion of this draft → `02-spec.md` + thin pointer under `specs/portal-form-data-collection/`
