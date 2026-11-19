# Plan — Application form selectors

| Field | Value |
|-------|-------|
| Spec | [`02-spec.md`](./02-spec.md) |
| Tasks | [`05-tasks.md`](./05-tasks.md) |
| Discovery | Orchestrator evidence in this plan; explorer not required after the form and HTML bindings were located |

## Goal

Replace free-text inputs on the portal application-data form with the site’s dropdowns, calendar dates (`yyyy-MM-dd`), and digit-only phone numbers.

## Packages

- `apps/web` — `features/client-portal-form-edit`, `pages/clients/ClientPortalFormPage`, `shared/ui` only if a single-date control is shared. Prefer feature-local `PortalFormDateField` / `PortalFormSelectField` / `PortalFormPhoneField` so this stays inside the slice.
- `packages/contracts` — add optional `previousVisaIssuedCountry?: string | null` on `ClientPortalFormConditionals`. The API already assigns the jsonb object wholesale (`apply-portal-form-fields.util.ts`). No DTO class change and no migration.

## Frontend shape

FSD slice `features/client-portal-form-edit`:

- `constants/bls-*-options.constants.ts` — one file per data array. Each item is `{ value, label }` where both are the trimmed `Name`. Placeholder constant `--Select--` / `""` in its own constants file.
- `constants/portal-form-select-field-options.constants.ts` — maps field key → option list (no functions).
- `constants/portal-form-date-field-keys.constants.ts`
- `constants/portal-form-phone-field-keys.constants.ts`
- `utils/digits-only-phone.util.ts`
- `utils/format-portal-date-ymd.util.ts` — display/store `yyyy-MM-dd`
- `ui` components, one per file: `PortalFormSelectField`, `PortalFormDateField`, `PortalFormPhoneField`
- Section components choose the widget from the key sets. Do not uppercase select labels or dates or phones.
- Travel section order: purpose, destination, memberStateSecondDestination, firstEntry, entries, durationDays.
- `destination` joins trip keys, schema, hydration, and `ClientPortalFormPage` upsert (`destination: tripPatch.destination`).
- `previousVisaIssuedCountry` joins conditional string keys, schema, previous-visa section, and the contracts type.

## Dates

`PortalFormDateField`: read-only text showing `yyyy-MM-dd`, plus a button that opens `react-day-picker` (already a dependency; see `DateRangePicker`). On select, write `yyyy-MM-dd` through react-hook-form. Empty value stays empty.

## Phones

On change and when hydrating, `digitsOnlyPhone` removes every non-digit. Example `+34 600 000 000` → `34600000000`.

## Risks

- Happy-path required keys stay as they are. Do not add `destination` or `previousVisaIssuedCountry` to the completeness gate.
- Select must keep an unmatched current value as an extra option.
- `nationalityCountryData` vs `countryData` must not be collapsed.
- Do not edit `features/application-form`.

## Verification

- `pnpm --filter @vises/web exec vitest run src/features/client-portal-form-edit src/pages/clients`
- `pnpm --filter @vises/web exec oxlint src/features/client-portal-form-edit src/pages/clients/ClientPortalFormPage`
- `pnpm --filter @vises/contracts exec tsc -p tsconfig.json --noEmit` if that script exists; otherwise the package’s existing typecheck.
- Browser: open the portal form, open gender, marital status, passport type, occupation, purpose, a country list, cost, means, relationship; pick a date; type a symbol-laden phone.
