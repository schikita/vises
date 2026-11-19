# Spec — Application form selectors, dates, and phone digits

| Field | Value |
|-------|-------|
| Feature id | `application-form-selectors` |
| Status | **APPROVED_FOR_IMPLEMENTATION** (orchestrator, user asked to ship the UI) |
| UI target | `apps/web` `features/client-portal-form-edit` on `ClientPortalFormPage` (`/app\|admin/clients/:clientId/portal-form`) |
| Materials | `site_materials/manage_applicants_appointments/manage_applicant(form).html` and `selector_*.png` |
| Related | `docs/sdd/portal-form-data-collection/`, `docs/sdd/application-creation-ui/` (create navigates here), `docs/sdd/applicant-portal-form-fields/` |

## 1. Why this form

Agents and staff do not type the BLS Edit Member fields on `features/application-create` or `features/client-create`. After create, staff land on the portal form. That page is the only UI that already has Occupation, Purpose Of Journey, Cost Covered By, Means Of Support, contact-person country, and EU-family relationship. Those fields are free-text today. `features/application-form` `ApplicantFields` is a different schema (`gender: 'female' \| 'male'`, no occupation/cost/means columns) and is **out of scope**.

The saved HTML has **no** `<select>`/`<option>` tags. Options live in `var <name>Data = [...]` and are bound with `kendoDropDownList` (`dataTextField: "Name"`, `optionLabel: "--Select--"`). Screenshots confirm labels and order.

## 2. Decisions

| ID | Decision |
|----|----------|
| **DEC-SEL-001** | Stored option value is the site `Name` with leading/trailing whitespace removed. Do not persist Kendo `Id` GUIDs. The worker matches portal dropdowns by visible label. |
| **DEC-SEL-002** | Every bound dropdown includes a first option `--Select--` with value `""`. |
| **DEC-SEL-003** | Option order is the JavaScript array order after trim. Do not sort. Do not translate option labels. |
| **DEC-SEL-004** | `nationalityCountryData` (191) and `countryData` (190) stay distinct. Schengen destinations use `schengenCountryData` (31), not the full country list. |
| **DEC-SEL-005** | Visible date format is `yyyy-MM-dd` (Kendo `format:"{0:yyyy-MM-dd}"`). A calendar button opens the picker. Do not use `<input type="date">`. |
| **DEC-SEL-006** | Phone/contact-number fields keep digits only, including country code. Strip `+`, spaces, dashes, parentheses, and any other non-digit on input and when showing a stored value. |
| **DEC-SEL-007** | No migration. `previousVisaIssuedCountry` is an optional string on the existing `portalFormConditionals` jsonb. `destination` (Member State Destination) is the existing application `destination` string, saved by the trip upsert. |
| **DEC-SEL-008** | `relationshipData` (Daughter/Father/…) is declared in the HTML and is **not** bound to a widget. Do not add a field for it. Family relationship uses `familyRelationData`. |

## 3. Selector map

| Form field | Site control | Data array |
|------------|--------------|------------|
| `countryOfBirth` | CountryOfBirthId | `nationalityCountryData` |
| `nationality` | NationalityId | `nationalityCountryData` |
| `nationalityAtBirth` | NationalityAtBirthId | `nationalityCountryData` |
| `gender` | GenderId | `genderData` |
| `maritalStatus` | MaritalStatusId | `maritalStatusData` |
| `minorParentNationality` | MinorParentNationalityId | `countryData` |
| `passportType` | PassportType | `passportTypeData` |
| `passportIssueCountry` | IssueCountryId | `nationalityCountryData` |
| `homeCountry` | HomeAddressCountryId | `nationalityCountryData` |
| `occupation` | CurrentOccupationId | `occupationData` |
| `purpose` | PurposeOfJourneyId | `journeyPurposeData` |
| `destination` | MemberStateDestinationId | `schengenCountryData` |
| `memberStateSecondDestination` | MemberStateSecondDestinationId | `schengenCountryData` |
| `firstEntry` | MemberStateFirstEntryId | `schengenCountryData` |
| `entries` | NumberOfEntriesRequested | `noOfEntriesData` |
| `previousVisaIssuedCountry` | PreviousVisaIssuedCountryId | `nationalityCountryData` |
| `finalDestinationIssuedByCountry` | FinalDestinationIssuedByCountryId | `nationalityCountryData` |
| `invitingCountry` | InvitingCountryId | `nationalityCountryData` |
| `invitingContactCountry` | InvitingContactCountryId | `nationalityCountryData` |
| `costCoveredBy` | CostCoveredById | `costCoveredData` |
| `meansOfSupport` | MeansOfSupportId | `meansOfSupportData` |
| `otherCitizenNationality` | OtherCitizenNationalityId | `nationalityCountryData` |
| `otherCitizenFamilyRelationship` | OtherCitizenFamilyRelationshipId | `familyRelationData` |

`destination` is new on this page (trip/application field). `previousVisaIssuedCountry` is new on conditionals. Travel section order must follow the site: purpose, destination, second destination, first entry, entries, duration (duration stays a text/number input).

## 4. Dates

Calendar button + `yyyy-MM-dd` display for: `dob`, `passportIssued`, `passportExpires`, `previousFingerPrintDate`, `otherResidenceshipPermitValidUntil`, `previousVisaValidFrom`, `previousVisaValidTo`, `finalDestinationValidFromDate`, `finalDestinationValidToDate`, `otherCitizenDateOfBirth`.

Intended arrival/departure stay on application detail (`travelDate` / `returnDate`, OQ-FE-002). Do not move them.

## 5. Phones

Digit-only: `phone`, `employerPhone`, `invitingContactNo`, `invitingContactContactNo`.

Fax fields (`invitingFaxNo`, `invitingContactFaxNo`) stay text. The site labels them "Fax No Text".

## 6. Non-goals

- No new tables or columns.
- No worker fill changes.
- No change to `ApplicantFields` gender union or Belarus phone widget.
- No visa-type / location option lists (those are not Kendo sources in this HTML).
- No commit.

## 7. Acceptance

1. Each row in the selector map renders a `<select>` whose options are `--Select--` plus every trimmed `Name` from that array, in array order.
2. Country selectors use the full HTML list, not a short subset. Minor-parent nationality uses `countryData`. Schengen fields use `schengenCountryData`.
3. Picking a date shows `yyyy-MM-dd`.
4. Typing `+34 600-000-000` into a phone field leaves `34600000000`.
5. Existing free-text that is not in the list remains selectable so save does not wipe it.
6. File separation, no `enum`, const arrow components with explicit return types.
