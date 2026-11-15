# Spec — Portal form data collection (frontend)

| Field | Value |
|-------|-------|
| Feature id | `portal-form-data-collection` |
| Document home | **`docs/sdd/portal-form-data-collection/`** (authoritative) |
| Spec SoT | [`02-spec.md`](./02-spec.md) (this file) |
| Status | **APPROVED** — DEC-FE-001…008 via feature request 2026-11-15 / user request to implement |
| Updated | 2026-11-15 |
| Upstream | `applicant-portal-form-fields` (**DONE**; APF DEC-004 FE deferred — this feature) |
| Materials | `site_materials/manage_applicants_appointments/manage_applicant(form).html` (primary visual SoT), images 1–12, `select_lolcation_and_visa_type.html`, `visa_type/*` |
| Mirror | [`specs/portal-form-data-collection/spec.md`](../../../specs/portal-form-data-collection/spec.md) |

---

## 1. Summary

Staff need a single `apps/web` page to collect every CRM value required to autofill BLS **Edit Member** and booking **Visa Type Selection** fields already persisted by the backend. This feature delivers that page: load existing Client + Application data, edit portal-form / passport / journey / trip fields, validate happy-path completeness keys client-side, and save via existing APIs (with a minimal DEC-FE-004 typing-gap extension where journey/phone are missing from portal-form DTOs).

UI section order, labels, required asterisks, and Bootstrap-like section structure follow `manage_applicant(form).html`; booking Location / Visa Type / Visa Sub Type / Category sit on the same page as an application-trip subsection.

---

## 2. Actors and roles

| Actor | Role |
|-------|------|
| Agent / Admin / Superadmin (staff SPA) | Open client portal-form page; enter/save data |
| `apps/web` | Form UX, API clients, validation, loading/error states |
| `apps/api` clients + apps modules | Existing GET/PATCH/POST; optional additive portal-form DTO keys only (DEC-FE-004 / DEC-FE-008) |
| Portal BLS | External visual/field SoT — never invent option values |

---

## 3. Goal and scope

### 3.1 Goal

One dedicated clients route where staff enter **all** applicant data needed for portal fill (Edit Member + booking visa-type fields), matching portal layout closely enough that operators recognize sections without training on a second mental model.

### 3.2 In scope

1. FSD feature + page for client portal form collection.
2. API client for `PATCH /clients/:id/portal-form` and typed GET client detail including portal fields.
3. Form sections matching portal: Personal (passport/identity via correct APIs), Home, Employer/Occupation, Travel/journey (purpose, firstEntry, entries, durationDays → Client), Fingerprint, Inviting authority (company + contact), Cost/support, Conditionals (minor, other residence, previous visa, entry permit, EU family) show/hide like portal.
4. Application trip fields on same page (or clearly linked subsection): `visaType`, `visaSubType`, `category`, `submitCity` / Location — persist via `POST /apps` upsert.
5. Visual styling approximating portal (section cards/headers, red required asterisks, uppercase text inputs where portal does).
6. `react-hook-form` + `zod`; one concern per file; FSD layers.
7. Tests for schema mapping and form happy-path smoke.

### 3.3 Non-goals (explicit)

| Non-goal | Rationale |
|----------|-----------|
| Agent CRM auth register/login changes | **DEC-FE-007** — analysis only if needed; not this page |
| New DB migrations | Columns already exist (APF) |
| Changing worker fill pipelines | APF already wired |
| Premium / payment / CON-006 submit | Unchanged; no booking submit from this page |
| Inventing portal dropdown values / GUID option lists | **REQ-FE-014** |
| Replacing existing client-create or application-detail forms wholesale | This is an additive dedicated page |
| Appointment For / members count UI as editable CRM | **DEC-FE-006** / APF ASSUME-003 — derived |

---

## 4. Functional requirements

| ID | Statement | Priority |
|----|-----------|----------|
| **REQ-FE-001** | Provide one dedicated page under the clients area for a given `clientId` that collects portal Edit Member + booking trip fields (**DEC-FE-001**). | Must |
| **REQ-FE-002** | On load, fetch client detail with FR-6 plaintext + portal-form fields (`GET /clients/:clientId`) and, when `applicationId` is present, load application trip fields needed for Location / Visa Type / Visa Sub Type / Category. | Must |
| **REQ-FE-003** | Persist portal-form body via `PATCH /clients/:clientId/portal-form` using `@vises/contracts` `ClientPortalFormUpdateDto` (all optional + conditionals bag). | Must |
| **REQ-FE-004** | Persist identity/passport edits via existing `PATCH /clients/:clientId/passport` (`ClientPassportUpdateDto`); do not send FR-6 keys on portal-form PATCH. | Must |
| **REQ-FE-005** | Persist journey CRM fields `purpose`, `firstEntry`, `entries`, `durationDays` and home contact `phone` onto **Client** (not `apps.applicants` in-memory) (**DEC-FE-005**). Prefer portal-form / existing client write paths; if wire keys are missing from `ClientPortalForm*`, apply **DEC-FE-008**. | Must |
| **REQ-FE-006** | Persist application trip fields `submitCity`, `visaType`, `visaSubType`, `category` via existing `POST /apps` upsert when an application id is available. | Must |
| **REQ-FE-007** | Collect **all** portal-form fields including optional fingerprint / second destination / fax and conditional sections (**DEC-FE-002**). Completeness UX highlights only happy-path required keys (see §8 / APF completeness set); optional keys remain saveable when empty. | Must |
| **REQ-FE-008** | Show/hide conditional blocks like portal: minor, other residence, previous Schengen visa, entry-permit (final destination), EU family — driven by flags in `portalFormConditionals` (+ fingerprint date when status requires it). | Must |
| **REQ-FE-009** | Section order and labels match `manage_applicant(form).html` closely (numbered portal sections 1–14 for Edit Member; trip subsection labeled from booking Location & Visa Type materials). | Must |
| **REQ-FE-010** | Mark required fields with accessible required indicators (visual red asterisk + programmatic association); do not rely on color alone. | Must |
| **REQ-FE-011** | Uppercase text inputs where the portal forces English/uppercase text entry for matching free-text fields; selects use stored CRM string/label values (never invent portal option GUIDs). | Must |
| **REQ-FE-012** | Surface loading, empty, save-success, and API error states with operator-safe copy (no PII values in logs or toast dumps). | Must |
| **REQ-FE-013** | Client-side validation (zod + react-hook-form) must be able to satisfy the happy-path completeness-required keys for adult + inviting=company via this page (+ passport section). Blocking save-on-incomplete is allowed for those keys; optional/conditional keys must not block happy-path save. | Must |
| **REQ-FE-014** | Never invent portal values; leave unset fields empty/null; do not fabricate dropdown codes. | Must |
| **REQ-FE-015** | Follow workspace file-separation, react-components, and typescript-conventions (no `enum`; const arrow components; explicit return types; one concern per file). Suggested FSD home: `features/client-portal-form-edit` + `pages/clients/...` + shared API utils. | Must |
| **REQ-FE-016** | Add tests covering (a) schema / DTO mapping utilities and (b) form happy-path smoke. | Must |
| **REQ-FE-017** | Entry from existing client detail: navigate to the portal-form page (link/button). Reuse passport unlock/debit semantics already enforced by passport PATCH (show API errors; do not bypass FR-6 gate). | Must |
| **REQ-FE-018** | Appointment For / member count is display-only or omitted; never stored as a new editable CRM column (**DEC-FE-006**). | Must |

---

## 5. Non-functional requirements

| ID | Statement |
|----|-----------|
| **NFR-FE-001** | Auth: same JWT + role gates as other clients/apps staff routes (agent/admin/superadmin per existing ACL). |
| **NFR-FE-002** | PII: FR-6 identity/passport remains encrypted at rest; portal-form/journey plaintext fields stay plaintext (APF DEC-002). Do not log field values — ids/codes/counts only. |
| **NFR-FE-003** | Audit: passport reads/writes continue via existing PII audit paths; portal-form PATCH does not require passport unlock. |
| **NFR-FE-004** | Backwards compatibility: consume existing endpoints; additive contract keys only under DEC-FE-008; no breaking rename of wire keys. |
| **NFR-FE-005** | Observability: operator-visible error messages from API `detail` / i18n keys; no new telemetry product requirement. |
| **NFR-FE-006** | Lint + build must pass for `apps/web` (and any touched contracts package if DEC-FE-008 lands). |
| **NFR-FE-007** | Accessibility: required markers announced; conditional regions use appropriate show/hide semantics; keyboard-reachable controls. |

---

## 6. Constraints

| ID | Statement |
|----|-----------|
| **CON-FE-001** | No new migrations. |
| **CON-FE-002** | No worker / fill-pipeline changes. |
| **CON-FE-003** | No CON-006 booking submit, Premium Lounge, or payment actions from this page. |
| **CON-FE-004** | Do not put FR-6 ciphertext or passport keys into `portalFormConditionals`. |
| **CON-FE-005** | Do not require conditional-section keys for happy-path completeness UX (align APF CON-004). |
| **CON-FE-006** | Prefer `@vises/contracts` types; Nest DTO class changes only when mirroring DEC-FE-008 additive keys. |
| **CON-FE-007** | Auth register/login UI changes out of scope (**DEC-FE-007**). |

---

## 7. Decisions and assumptions

| ID | Decision | Status |
|----|----------|--------|
| **DEC-FE-001** | One dedicated page route under clients for full portal data entry. | **APPROVED** |
| **DEC-FE-002** | Collect ALL fields including optional + conditionals; completeness still only requires happy-path keys. | **APPROVED** |
| **DEC-FE-003** | Match Edit Member layout from `site_materials` as primary visual SoT. | **APPROVED** |
| **DEC-FE-004** | No backend contract changes unless a clear FE typing gap; prefer consuming `@vises/contracts`. | **APPROVED** |
| **DEC-FE-005** | Persist journey CRM fields onto Client via portal-form and/or existing client update paths — not `apps.applicants` in-memory. | **APPROVED** |
| **DEC-FE-006** | Appointment For / members count remains derived (APF ASSUME-003). | **APPROVED** |
| **DEC-FE-007** | Auth register/login analysis only; not part of this page. | **APPROVED** |
| **DEC-FE-008** | **FE typing gap (verified):** `purpose` / `firstEntry` / `entries` / `durationDays` / `phone` already exist as Client columns and are completeness-required, but today are writable mainly on create and are **not** on `ClientPortalFormUpdateDto` / GET portal-form detail intersection. **Allowed fix:** additive optional keys on existing `ClientPortalFormUpdateDto` + `ClientPortalFormDetailDto` (and Nest portal-form DTO + GET detail mapping) — **no migration**. Address remains via portal-form as today. | **APPROVED** (under DEC-FE-004 + DEC-FE-005) |
| **ASSUME-FE-001** | `ClientDetailDto.applicationId` is the linkage for trip upsert; when absent, trip subsection shows a clear blocked state (see OQ-FE-001). | Assumed |
| **ASSUME-FE-002** | Staff enter portal **labels/codes as CRM strings** already understood by worker mapping (same as create forms today); SPA does not scrape live portal option lists. | Assumed |
| **ASSUME-FE-003** | Schengen Edit Member section set is the layout SoT; National verify-first remains worker-side (APF ASSUME-001). | Assumed |

---

## 8. Data model impact

| Area | Impact |
|------|--------|
| DB | **None** (APF columns already shipped) |
| Contracts | Prefer consume-as-is; **DEC-FE-008** may add optional `phone`, `purpose`, `firstEntry`, `entries`, `durationDays` to `ClientPortalForm*` |
| Sensitive fields | FR-6 passport/identity via passport PATCH; portal-form/journey plaintext; conditionals jsonb plaintext |
| Application | `visa_sub_type`, `visa_type`, `submit_city`, `extras.category` — existing |

---

## 9. API surface

| Operation | Auth | Request | Response | Notes |
|-----------|------|---------|----------|-------|
| `GET /clients/:clientId` | JWT + agent/admin/superadmin ACL | — | `ClientDetailDto` ∩ portal-form detail (Nest `ClientDetailWithPortalFormDto`) | Load form; after DEC-FE-008 includes journey/phone |
| `PATCH /clients/:clientId/portal-form` | same | `ClientPortalFormUpdateDto` | `ClientPortalFormDetailDto` | Primary save for home/employer/inviting/cost/fingerprint/conditionals (+ DEC-FE-008 keys) |
| `PATCH /clients/:clientId/passport` | same | `ClientPassportUpdateDto` | `ClientDto` | Identity + passport; FR-6 unlock / debit gate |
| `POST /apps` (upsert) | same | Existing upsert body incl. `visaSubType`, `visaType`, `submitCity`, `category` | Existing upsert response | Trip subsection; preserve other application fields per existing upsert semantics |
| Application read | existing apps GET/detail used by SPA today | — | includes `visaSubType` when mapped | Prefer existing FE application fetch patterns |

### Error handling (operator-facing)

| Case | Expected UX |
|------|-------------|
| 401/403 | Existing session / forbidden handling |
| 404 client | Entity-gone redirect / list notice (match client detail) |
| Passport 409 unlock / debit | Show API error; do not pretend portal-form save wrote passport |
| Validation 400 | Field or form-level error from API/`detail` |
| Network failure | Retryable error state; retain dirty form values |
| Missing `applicationId` | Trip subsection disabled + message (OQ-FE-001 UX) |

---

## 10. Field inventory matrix

Legend: **HP** = happy-path completeness-required (APF `BLS_APPLICANT_COMPLETENESS_REQUIRED_FIELD_KEYS`). **Opt** = optional. **Cond** = conditional bag.

### 10.1 Personal / passport (portal §1 + §3) — FR-6

| Portal label | Contracts key | API | FE section | Completeness |
|--------------|---------------|-----|------------|--------------|
| First Name (Given Name) | `firstName` | `PATCH .../passport` | Personal | HP |
| Surname (Family Name) | `lastName` | passport | Personal | HP |
| Surname At Birth | `lastNameAtBirth` | passport | Personal | HP |
| Last Name | `otherNames` (CRM mapping as today) | passport | Personal | Opt |
| Date of Birth | `dob` | passport | Personal | HP |
| Place Of Birth | `placeOfBirth` | passport | Personal | Opt* |
| Country Of Birth | `countryOfBirth` | passport | Personal | HP |
| Current Nationality | `nationality` | passport | Personal | Opt* |
| Nationality At Birth | `nationalityAtBirth` | passport | Personal | Opt* |
| Gender | `gender` | passport | Personal | Opt* |
| Marital Status | `maritalStatus` | passport | Personal | Opt* |
| National Identity Number | `nationalId` | passport | Personal | Opt |
| Passport Type | `passportType` | passport | Passport | HP |
| Passport No | `passportNumber` | passport | Passport | HP |
| Issue Date | `passportIssued` | passport | Passport | HP |
| Expiry Date | `passportExpires` | passport | Passport | HP |
| Issue Place | `passportIssuedBy` | passport | Passport | HP |
| Issue Country | `passportIssueCountry` | passport | Passport | HP |

\*Portal marks many identity fields `*`; start-gate HP set is the subset listed in APF completeness constants — FE must collect portal-visible identity fields on this page, but **blocking** completeness UX tracks the HP set.

### 10.2 Address & contact (portal §4) + journey travel (portal §7)

| Portal label | Contracts key | API | FE section | Completeness |
|--------------|---------------|-----|------------|--------------|
| Home Address Line1 | `address` | portal-form PATCH | Home | HP |
| Home Address Line2 | `homeAddressLine2` | portal-form | Home | Opt |
| Country | `homeCountry` | portal-form | Home | HP |
| City | `homeCity` | portal-form | Home | HP |
| Postal Code | `homePostalCode` | portal-form | Home | HP |
| Contact Number | `phone` | portal-form (**DEC-FE-008**) | Home | HP |
| Purpose Of Journey | `purpose` | portal-form (**DEC-FE-008**) | Travel | HP |
| Member State First Entry | `firstEntry` | portal-form (**DEC-FE-008**) | Travel | HP |
| Number Of Entries Requested | `entries` | portal-form (**DEC-FE-008**) | Travel | HP |
| Intended Stay Duration | `durationDays` | portal-form (**DEC-FE-008**) | Travel | HP |
| Member State Second Destination | `memberStateSecondDestination` | portal-form | Travel | Opt |
| Member State Destination / Travel Date / Intended Arrival–Departure | Application `destination` / `travelDate` / `returnDate` (existing) | apps upsert if already used by SPA | Travel / trip | Not in Client portal-form DTO — **see OQ-FE-002** |

### 10.3 Employer (portal §6)

| Portal label | Contracts key | API | FE section | Completeness |
|--------------|---------------|-----|------------|--------------|
| Employer Name | `employerName` | portal-form | Employer | HP |
| Employer Contact Number | `employerPhone` | portal-form | Employer | HP |
| Employer Address | `employerAddress` | portal-form | Employer | HP |
| Occupation | `occupation` | portal-form | Employer | HP |

### 10.4 Fingerprint (portal §9)

| Portal label | Contracts key | API | FE section | Completeness |
|--------------|---------------|-----|------------|--------------|
| Previous fingerprint status | `previousFingerPrintStatus` | portal-form | Fingerprint | Opt |
| Previous Finger Print Date | `previousFingerPrintDate` | portal-form | Fingerprint (shown when status requires) | Opt |

### 10.5 Inviting authority (portal §11) — company happy path

| Portal label | Contracts key | API | FE section | Completeness |
|--------------|---------------|-----|------------|--------------|
| Inviting radio | `blsInvitingAuthority` | portal-form | Inviting | HP |
| Company Name | `invitingAuthorityName` | portal-form | Inviting company | HP |
| Country / City / Zip / Address / Email / Contact No | `invitingCountry` … `invitingContactNo` | portal-form | Inviting company | HP |
| Fax No | `invitingFaxNo` | portal-form | Inviting company | Opt |
| Contact Name / Surname / Country / City / Zip / Address / Contact No / Email | `invitingContact*` | portal-form | Inviting contact | HP |
| Contact Fax | `invitingContactFaxNo` | portal-form | Inviting contact | Opt |

### 10.6 Cost / support (portal §12)

| Portal label | Contracts key | API | FE section | Completeness |
|--------------|---------------|-----|------------|--------------|
| Cost Covered By | `costCoveredBy` | portal-form | Cost | HP |
| Means of Support | `meansOfSupport` | portal-form | Cost | HP |

### 10.7 Conditionals (`portalFormConditionals`) — portal §2, §5, §8, §10, §13–14

| Portal control | Contracts key | API | Completeness |
|----------------|---------------|-----|--------------|
| Is Minor (+ parent fields) | `isMinor`, `minorParent*` | portal-form bag | Cond — not HP |
| Other residenceship | `hasOtherResidenceship`, `otherResidenceshipPermitValidUntil` | bag | Cond |
| Previous Schengen visa | `isVisaIssuedBefore`, `previousVisaValidFrom` / `To` | bag | Cond |
| Entry permit / final destination | `finalDestinationIssuedByCountry`, `finalDestinationValidFromDate` / `To` | bag | Cond |
| EU family citizen + relationship | `otherCitizen*` | bag | Cond |

Residual portal labels present in HTML but **not** in `ClientPortalFormConditionals` today (e.g. other-residence permit number, previous visa number / issued country) are **not inventable** here — see **OQ-FE-003**.

### 10.8 Application trip (booking Location & Visa Type)

| Portal label | Contracts / store | API | FE section | Completeness |
|--------------|-------------------|-----|------------|--------------|
| Location | `submitCity` | `POST /apps` upsert | Trip | Booking prefill (not Client HP set) |
| Visa Type | `visaType` | upsert | Trip | Booking |
| Visa Sub Type | `visaSubType` | upsert | Trip | Booking |
| Category | `extras.category` via `category` | upsert | Trip | Booking |
| Appointment For | derived applicant count | — | Trip (display-only / omit) | **DEC-FE-006** |

---

## 11. Edge cases and error handling

| Case | Handling |
|------|----------|
| Client has no passport unlock / unpaid create | Passport section save fails with existing API error; portal-form section remains savable |
| Partial save success (portal-form OK, trip fail) | Report which subsection failed; do not claim full-page success |
| Conditional flag on but nested fields empty | Allow save (not HP); optional client-side soft warnings only |
| Inviting authority ≠ company | Still collect company/contact fields for HP gate simplicity (APF start gate always requires company set); UI may show all inviting blocks like portal radios |
| Dirty form navigate away | Match existing SPA patterns (confirm if already used elsewhere; else leave as-is — no new product rule) |
| Uppercase transform | Apply on blur/input for free-text fields that portal uppercases; do not destroy intentional select values |
| Empty optional Line2 / fax / fingerprint | Persist omit/null; never invent |

---

## 12. Out of scope

- Auth register/login CRM changes (**DEC-FE-007**)
- New migrations; new Nest modules; worker changes
- Premium Lounge / payment / Visa Type **Submit** (CON-006)
- Inventing portal option catalogs or GUID maps
- Editable Appointment For / members count column
- Replacing application-detail applicant tabs as the sole data entry path (this page is the dedicated portal-collection SoT going forward for full Edit Member parity)
- Extending conditionals bag with keys not already in contracts (blocked on OQ-FE-003)

---

## 13. Acceptance criteria

| ID | Criterion | Maps to |
|----|-----------|---------|
| **AC-FE-01** | Staff can open one clients portal-form page for a client and enter/save all `ClientPortalFormUpdateDto` fields + conditionals. | REQ-FE-001…003, 007, 008 |
| **AC-FE-02** | Happy-path completeness-required keys can be satisfied via this page (+ passport section), including journey/phone after DEC-FE-008. | REQ-FE-004, 005, 013 |
| **AC-FE-03** | `visaSubType` (and Location / Visa Type / Category) editable and saved to application when application id is available; blocked UX documented when not. | REQ-FE-006, ASSUME-FE-001 |
| **AC-FE-04** | UI section order/labels match `manage_applicant(form).html` closely (numbered sections + required asterisks). | REQ-FE-009, 010, DEC-FE-003 |
| **AC-FE-05** | Conditional sections show/hide per portal flags without blocking happy-path save when hidden/empty. | REQ-FE-007, 008, CON-FE-005 |
| **AC-FE-06** | Loading / error / success states work; no PII values logged. | REQ-FE-012, NFR-FE-002 |
| **AC-FE-07** | Schema-mapping tests + form happy-path smoke tests exist and pass. | REQ-FE-016 |
| **AC-FE-08** | `apps/web` lint/build pass (and contracts if DEC-FE-008 touched). | NFR-FE-006, REQ-FE-015 |

---

## 14. Open questions

| ID | Question | Why it matters |
|----|----------|----------------|
| **OQ-FE-001** | Exact UX when `applicationId` is missing: disable trip subsection only vs block entire page save vs require staff to open/create application first? | Trip fields cannot upsert without application linkage |
| **OQ-FE-002** | Should Member State Destination / Travel Date / Intended Arrival–Departure on this page write Application `destination` / `travelDate` / `returnDate`, or remain only on existing application-detail form? | Present on portal Edit Member HTML; not listed in the feature trip bullet (visaType/visaSubType/category/submitCity) |
| **OQ-FE-003** | Residual conditional portal fields absent from `ClientPortalFormConditionals` (e.g. other-residence permit number, previous visa number / issued country): leave uncollected until a future APF contracts extension, or approve additive bag keys now (still no migration if jsonb)? | DEC-FE-002 wants all conditionals; contracts bag is incomplete vs HTML |
| **OQ-FE-004** | Exact route slug and nav label (e.g. `/clients/:clientId/portal-form` + RU/EN copy) — confirm product wording. | DEC-FE-001 fixed “under clients” but not slug/copy |

**Note:** OQ items do **not** block APPROVED FRs above except where AC-FE-03 already allows “document UX if linkage missing.” OQ-FE-002/003 fields are **not** accepted as Must until answered; page ships without inventing those keys.

---

## 15. Sensitive paths

| Path | Handling policy |
|------|-----------------|
| Auth / roles | Existing JWT + `@Roles` on clients/apps; no new public routes |
| FR-6 passport/identity | Passport GET/PATCH only; unlock/debit gate unchanged; audited decrypt |
| Portal-form plaintext PII | PATCH portal-form; no unlock gate; never log values |
| DEC-FE-008 journey/phone | Additive contracts/Nest mapping only; columns already exist |
| Conditionals jsonb | No secrets/ciphertext (**CON-FE-004**) |
| Application trip upsert | Existing staff upsert ACL; no booking submit |
| Public contracts | Prefer `@vises/contracts`; additive optional keys only |
| Migrations | Forbidden this feature |
| Event schemas / worker | Unchanged |

---

## 16. Suggested FE section order (visual SoT)

Align with `manage_applicant(form).html` card header **Edit Member**, then:

1. Personal Details  
2. Minors (conditional)  
3. Passport Details  
4. Address & Contact Details  
5. Other residenceship (conditional)  
6. Employer Details  
7. Travel Information (+ journey CRM fields)  
8. Previous Schengen Visa (conditional)  
9. Fingerprints  
10. Entry Permit / final destination (conditional)  
11. Inviting authority (company + contact)  
12. Cost of travelling / means of support  
13–14. EU family citizen + relationship (conditional)  
15. **Trip / booking** subsection: Location, Visa Type, Visa Sub Type, Category (materials: `select_lolcation_and_visa_type.html` / visa_type booking) — Appointment For display-only or omitted  

Primary actions: Save portal-form (+ passport if dirty) and Save trip (or single Save coordinating subsection APIs with clear per-subsection results).
