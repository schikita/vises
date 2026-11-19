# Tasks — Application form selectors

## FE-SEL-001 — Portal form selectors, calendar dates, digit phones

- **id:** FE-SEL-001
- **title:** Site dropdowns, yyyy-MM-dd calendar, digit-only phones on the portal application form
- **owner_layer:** frontend (`apps/web` `features/client-portal-form-edit`, `pages/clients/ClientPortalFormPage`) plus one additive optional property on `packages/contracts` `ClientPortalFormConditionals`
- **depends_on:** none
- **sensitive_paths:** `packages/contracts/src/types/client-portal-form-conditionals.types.ts` (additive optional string only). No migrations, no API service edits, no worker edits, no `features/application-form`.
- **acceptance_criteria:**
  - Spec selector map is implemented with lists parsed from `manage_applicant(form).html` `var *Data` arrays. Trim `Name`. Preserve order. First option `--Select--` value `""`.
  - Counts after trim: gender 2, marital 6, passport 12, occupation 35, journey 11, schengen 31, cost 2, means 8, family relation 4, entries 3, `countryData` 190, `nationalityCountryData` 191.
  - `minorParentNationality` uses `countryData`. Schengen fields use `schengenCountryData`. Other country fields use `nationalityCountryData`.
  - `destination` and `previousVisaIssuedCountry` added as specified and round-trip through hydration/save mapping.
  - Date fields use a calendar button and display `yyyy-MM-dd`.
  - Phone fields listed in the spec store digits only.
  - Unmatched current values remain visible as an extra option.
  - One concern per file. No `enum`. Const arrow components with explicit return types. Barrels only re-export.
  - Unit tests updated for the new widgets, digit stripping, date format, and option counts (spot-check first/last labels, not a snapshot of GUIDs).
- **verification_commands:**
  - `pnpm --filter @vises/web exec vitest run src/features/client-portal-form-edit src/pages/clients`
  - `pnpm --filter @vises/web exec oxlint src/features/client-portal-form-edit src/pages/clients/ClientPortalFormPage packages/contracts/src/types/client-portal-form-conditionals.types.ts`
- **status:** done
- **architecture:** OKAY
- **code:** OKAY
- **verification:** vitest 28 passed; oxlint passed; browser on `/admin/clients/cli-93bd56cd/portal-form` confirmed selectors, `2026-11-15` from the calendar, and phone `+34 600-000-000` → `34600000000`
