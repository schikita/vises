# Phase 0 — Discovery (Applicant portal form fields)

| Field | Value |
|-------|-------|
| Feature id | `applicant-portal-form-fields` |
| Status | **Complete** |
| Date | 2026-11-15 |
| Spec SoT | [`02-spec.md`](./02-spec.md) |
| Explorer | `6645dba5` / product request |
| Upstream | `manage-applicants-appointment-form` (**VERIFYING**); `bls-booking-visa-type` (**READY_FOR_REVIEW**) |

**Labeling:** **Fact** = verified in-repo / materials. **Assumption** = labeled ASSUME-*.

---

## 1. Purpose

Establish which portal autofill fields are already stored and mapped vs which CRM gaps cause `UNSKIPPABLE_GAP` / empty booking prefill on the happy path (adult + inviting=company), so this cycle can persist and wire them without building FE UI.

---

## 2. Materials (Facts)

| Source | Role |
|--------|------|
| `site_materials/manage_applicants_appointments/*` | Edit Member required / conditional field map |
| `site_materials/visa_type/*` | Visa Type Selection (Location, Visa Type, Sub Type, Category, Appointment For) |
| MA `02-spec.md` / OQ-002 | Prior policy: expand schema only if product already collected — **overridden by DEC-001** |
| VT booking fill | Prefill already supports `visaSubType` + `category` on `PortalBookingPrefillHint` |

---

## 3. Baseline code (Facts)

| Area | Evidence | Gap |
|------|----------|-----|
| Client entity | `apps/api` + worker `client.entity.ts` — identity/passport FR-6 encrypted; plaintext `phone`/`address`/`purpose`/`firstEntry`/`entries`/`durationDays`/`relationship` | No home structured / employer / inviting / cost / fingerprint columns |
| Application entity | `visa_type`, `submit_city`, `destination`, dates; `extras` jsonb (`category` via `extrasIn`) | No `visa_sub_type` column |
| Contracts | `ClientCreateDto` / `ClientPassportUpdateDto` / `ClientDetailDto`; minimal `ApplicationDto` | No portal extended fields; no `visaSubType` |
| Nest apps | `UpsertAppDto` has `category` → `extras.category`; no `visaSubType` | Booking cannot read sub type from CRM |
| Edit Member CRM type | `EditMemberCrmApplicantSource` already types extended keys | Status client does **not** pass them (only core identity/passport/travel) |
| Builder | `buildEditMemberFillInput` plans required home/employer/occupation/inviting/cost/fingerprint from CRM | Missing CRM → `UNSKIPPABLE_GAP` |
| Status client | `bls-status-client.service.ts` builds fill from subset of `ApplicantInput` | Extended keys never reach builder |
| `mapClientToApplicantInput` | Copies plaintext + FR-6 decrypt only | No extended columns to copy |
| Booking client | `bls-booking-client.service.ts` prefill: `submitCity`, `visaType`, `applicantCount` only | Omits `category` + `visaSubType` despite hint type |
| Prefill util | `prefill-portal-booking-selection-fields.util.ts` already applies `visaSubType` + `category` when hint set | Wiring gap only |
| Completeness | `BLS_APPLICANT_COMPLETENESS_REQUIRED_FIELD_KEYS` = identity/passport/phone + home/employer/occupation/inviting-company block/cost + Client travel (`address`, `purpose`, `firstEntry`, `entries`, `durationDays`) (APF-TASK-005) | Optional Line2 / fingerprint / second destination / conditionals still excluded (CON-004) |
| PII set | `PII_ENCRYPTED_FIELD_KEYS` = FR-6 identity/passport only | Phone/address stay plaintext (DEC-002 baseline) |

---

## 4. Inventory — already stored + mapped (Facts)

### Client → Edit Member

| CRM / Client | Portal / use | Completeness gated (APF-TASK-005) |
|--------------|--------------|-----------------------------------|
| names, DOB, birth place/country, nationality(+at birth), gender, marital, nationalId, otherNames | Identity block | Yes for names/DOB/`countryOfBirth` (subset already gated); gender/marital/nationality not in start gate |
| passport block (FR-6) | Passport block | Yes (number/issued/expires/type/issue country/issued by) |
| phone | Home contact + related | Yes (+ 9-digit rule) |
| freeform `address` | `#HomeAddressLine1` | Yes |
| purpose, firstEntry, entries, durationDays | Journey / stay | Yes |
| `homeCountry`, `homeCity`, `homePostalCode` | Home country/city/postal | Yes |
| `employerName`, `employerPhone`, `employerAddress`, `occupation` | Employer + occupation | Yes |
| `blsInvitingAuthority` + company auth/contact block | Inviting (happy-path company) | Yes (company set always required at start gate) |
| `costCoveredBy`, `meansOfSupport` | Cost / support | Yes |
| `homeAddressLine2`, `previousFingerPrint*`, `memberStateSecondDestination`, fax fields, `portalFormConditionals` | Optional / conditional | No (CON-004) |

### Application → portal

| CRM / Application | Portal / use |
|-------------------|--------------|
| `submitCity` | Booking Location; Edit modal Location |
| `visaType` | Booking Visa Type; Edit modal Visa Type |
| `destination`, `travelDate`, `returnDate` | Edit Member destination / dates |
| `extras.category` | **Stored** via upsert; **not** passed to booking prefill today |
| Applicant count (clients on application) | Appointment For / Members (ASSUME-003) |

---

## 5. Gaps that MUST be persisted (happy-path Edit Member `*`)

| Gap group | Keys (CRM / proposed columns) | Portal | Completeness (APF-TASK-005) |
|-----------|-------------------------------|--------|------------------------------|
| Structured home | `homeCountry`, `homeCity`, `homePostalCode`, `homeAddressLine2` (optional) | Country/City/Postal; Line2 optional | Required: country/city/postal (+ `address` Line1). Not: Line2 |
| Employer | `employerName`, `employerPhone`, `employerAddress`, `occupation` | Employer + `#CurrentOccupationId` | Required |
| Inviting authority | `blsInvitingAuthority` + company/contact block (typed on `EditMemberCrmApplicantSource`) | Radio + company/contact fields | Required: authority + full company auth+contact set always at start gate (happy-path simplicity; not authority-branched). Not: fax fields |
| Cost / support | `costCoveredBy`, `meansOfSupport` | `#CostCoveredById`, `#MeansOfSupportId` | Required |
| Fingerprint override | `previousFingerPrintStatus` (optional); `previousFingerPrintDate` when status=`0` (optional) | Radio + conditional date | Not required (builder default / CON-004) |
| Second destination | `memberStateSecondDestination` (optional) | Optional dropdown | Not required |

Conditional sections (minor / other residence / prev visa / EU family): store optional flags+fields so they can fill when present; **not** required by completeness gate for happy-path adult. Prefer jsonb bag `portal_form_conditionals_json` (DEC in database plan).

---

## 6. Booking gaps (Facts)

| Need | Today | Target |
|------|-------|--------|
| `visaSubType` | Hint type + prefill util exist; no DB/DTO; booking client omits | `applications.visa_sub_type` + `UpsertAppDto.visaSubType` + prefill |
| Category | `extras.category` stored | Pass into `PortalBookingPrefillHint.category` from booking client |

---

## 7. Open questions carried to spec

None blocking — product request stamps DEC-001…005 and ASSUME-001…003. Residual implementer choices (exact PATCH route name / create vs post-paid write) recorded as recommendations in REQ-004.

---

## 8. Artifact suggestion (adopted)

`docs/sdd/applicant-portal-form-fields/` — sibling to MA / VT feature folders; do not reopen closed durable-bls-workflow review.
