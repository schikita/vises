# Tasks — portal-form-data-collection

| Field | Value |
|-------|-------|
| Feature id | `portal-form-data-collection` |
| Plan | [`04-plan.md`](./04-plan.md) |
| Spec | [`02-spec.md`](./02-spec.md) |
| Status | **DONE** — PFDC-TASK-001…007 architecture OKAY + code OKAY |
| Plan review | Cycle 1 **NEEDS_REVISION** addressed; implementation complete 2026-11-15 |

---

## Task index

| id | title | owner_layer | depends_on | status |
|----|-------|-------------|------------|--------|
| PFDC-TASK-001 | Contracts: journey/phone on portal-form DTOs | contracts | — | done |
| PFDC-TASK-002 | Nest: portal-form keys + map/apply for DEC-FE-008 | backend | PFDC-TASK-001 | done |
| PFDC-TASK-003 | FE entities API: portal-form + typed detail + visaSubType | frontend | PFDC-TASK-001, PFDC-TASK-002 | done |
| PFDC-TASK-004 | Feature schema, mappers, section constants | frontend | PFDC-TASK-003 | done |
| PFDC-TASK-005 | Portal-matching section UI components | frontend | PFDC-TASK-004 | done |
| PFDC-TASK-006 | Page, routing, entry link, save orchestration | frontend | PFDC-TASK-005 | done |
| PFDC-TASK-007 | Tests + lint/build sweep | frontend | PFDC-TASK-006 | done |

---

## PFDC-TASK-001

```yaml
id: PFDC-TASK-001
title: Contracts — add phone/purpose/firstEntry/entries/durationDays to ClientPortalForm*
owner_layer: contracts
fsd_or_module: packages/contracts
depends_on: []
status: pending
architecture: —
code: —
human_checkpoint: DEC-FE-008 approved in 02-spec.md; additive optional keys only; no migration; no worker changes
sensitive_paths:
  - packages/contracts/src/types/client-portal-form.types.ts
  - packages/contracts/src/index.ts
acceptance_criteria:
  - ClientPortalFormUpdateDto and ClientPortalFormDetailDto include optional phone, purpose, firstEntry, entries, durationDays (DEC-FE-008)
  - Detail type uses string | null for those keys (match existing portal detail style)
  - UpdateDto keeps all fields optional (partial PATCH)
  - Exported from packages/contracts public API
  - No migration; no worker changes
verification_commands:
  - pnpm --filter @vises/contracts build
  - pnpm --filter @vises/contracts lint
```

---

## PFDC-TASK-002

```yaml
id: PFDC-TASK-002
title: Nest — extend portal-form DTO, field keys, pick/apply/map for DEC-FE-008
owner_layer: backend
fsd_or_module: apps/api/src/modules/clients
depends_on: [PFDC-TASK-001]
status: pending
architecture: —
code: —
human_checkpoint: DEC-FE-008 approved in 02-spec.md; additive keys only; CON-FE-001 no migration; nestjs-structure one concern per file
sensitive_paths:
  - apps/api/src/modules/clients/dto/client-portal-form-update.dto.ts
  - apps/api/src/modules/clients/constants/client-portal-form-field-keys.constants.ts
  - apps/api/src/modules/clients/utils/pick-portal-form-update-fields.util.ts
  - apps/api/src/modules/clients/utils/apply-portal-form-fields.util.ts
  - apps/api/src/modules/clients/utils/map-client-to-portal-form-detail-dto.util.ts
  - apps/api/src/modules/clients/types/client-detail-with-portal-form.types.ts
acceptance_criteria:
  - Nest ClientPortalFormUpdateDto mirrors contracts keys including DEC-FE-008
  - CLIENT_PORTAL_FORM_STRING_FIELD_KEYS includes phone, purpose, firstEntry, entries, durationDays
  - pick/apply/map persist and return those Client columns on PATCH and GET portal detail
  - Existing portal-form unit specs updated/green; one concern per file; no enum; no new migration
verification_commands:
  - pnpm --filter @vises/api lint
  - pnpm --filter @vises/api test -- pick-portal-form-update-fields.util.spec.ts apply-portal-form-fields.util.spec.ts map-client-to-portal-form-detail-dto.util.spec.ts
```

---

## PFDC-TASK-003

```yaml
id: PFDC-TASK-003
title: FE entities — portal-form PATCH + typed client detail + application visaSubType
owner_layer: frontend
fsd_or_module: entities/client + entities/application
depends_on: [PFDC-TASK-001, PFDC-TASK-002]
status: pending
architecture: —
code: —
sensitive_paths:
  - apps/web/src/entities/client/**
  - apps/web/src/entities/application/**
acceptance_criteria:
  - Primary API home is entities/client (mirror fetchClientDetail / patchClientPassport patterns): patchClientPortalForm util + types
  - GET client detail typing includes portal-form detail fields (contracts ClientPortalFormDetailDto / Nest ClientDetailWithPortalForm-compatible)
  - entities/application types and upsert body include visaSubType (plus existing visaType, submitCity, category)
  - Do not duplicate client HTTP helpers under shared/api unless re-exporting the entity util (existing pattern only)
  - One concern per file; types in *.types.ts; utils in dedicated util files
verification_commands:
  - pnpm --filter @vises/web lint
```

---

## PFDC-TASK-004

```yaml
id: PFDC-TASK-004
title: Feature model — zod schema, mappers, section constants
owner_layer: frontend
fsd_or_module: features/client-portal-form-edit (types/, constants/, utils/)
depends_on: [PFDC-TASK-003]
status: pending
architecture: —
code: —
sensitive_paths:
  - apps/web/src/features/client-portal-form-edit/**
acceptance_criteria:
  - Slice layout matches client-passport-edit: types/, constants/, utils/, components/ (+ public index.ts) — not model/lib
  - Zod schema covers portal-form fields + conditionals + passport fields + journey/phone + trip subsection fields
  - Mappers: form values ↔ portal-form PATCH, passport PATCH, apps upsert trip patch
  - Happy-path required keys aligned with BLS completeness set for client-side validation
  - Constants for section titles/labels from manage_applicant(form).html; inviting authority values 0|1|2 as portal; no invented GUIDs
  - Types/constants/utils not mixed in component files
verification_commands:
  - pnpm --filter @vises/web lint
  - pnpm --filter @vises/web build
```

---

## PFDC-TASK-005

```yaml
id: PFDC-TASK-005
title: UI — Edit Member section components matching site_materials layout
owner_layer: frontend
fsd_or_module: features/client-portal-form-edit/components
depends_on: [PFDC-TASK-004]
status: pending
architecture: —
code: —
decisions:
  - OQ-FE-003: only ClientPortalFormConditionals keys (no invented bag keys)
  - Spec §16 / REQ-FE-009: numbered section order from manage_applicant(form).html
sensitive_paths:
  - apps/web/src/features/client-portal-form-edit/components/**
acceptance_criteria:
  - One React component per section file under features/client-portal-form-edit/components:
      PortalFormPersonalSection, PortalFormPassportSection, PortalFormHomeSection,
      PortalFormEmployerSection, PortalFormTravelSection, PortalFormFingerprintSection,
      PortalFormInvitingSection, PortalFormCostSection,
      PortalFormMinorSection, PortalFormOtherResidenceSection, PortalFormPreviousVisaSection,
      PortalFormEntryPermitSection, PortalFormEuFamilySection, PortalFormTripSection
  - Form container + Render split like ClientPassportEditForm
  - Required asterisks + uppercase free-text where portal uppercases
  - Conditionals show/hide per flags; fingerprint date when status requires
  - Visual structure matches numbered Edit Member section order (AC-FE-04)
  - REQ-FE-018 / DEC-FE-006: trip subsection omits editable Appointment For / members count (display-only or absent); never new CRM column
  - export const Component = (props): React.ReactElement => …
verification_commands:
  - pnpm --filter @vises/web lint
  - pnpm --filter @vises/web build
```

---

## PFDC-TASK-006

```yaml
id: PFDC-TASK-006
title: Page + routes + client-detail link + multi-API save orchestration
owner_layer: frontend
fsd_or_module: pages/clients + app routes
depends_on: [PFDC-TASK-005]
status: pending
architecture: —
code: —
decisions:
  - OQ-FE-001: missing applicationId → disable trip subsection only; portal-form/passport still savable
  - OQ-FE-002: destination/dates stay on application-detail; trip here = Location/VisaType/VisaSubType/Category
  - OQ-FE-004: route slug /clients/:clientId/portal-form under /app and /admin
sensitive_paths:
  - apps/web/src/pages/clients/**
  - apps/web/src/app/App.tsx
acceptance_criteria:
  - Route /clients/:clientId/portal-form under both /app and /admin (pages/clients ClientPortalFormPage)
  - Page loads GET client (+ application when applicationId present)
  - Save: passport PATCH (if dirty) → portal-form PATCH → apps upsert trip when applicationId (subsection errors isolated)
  - Missing applicationId disables trip subsection with clear message
  - Link/button from ClientDetailPage to portal-form page; existing client-detail passport editor remains (do not remove)
  - Loading / error / success states; no PII in logs
  - REQ-FE-018: no editable Appointment For / members CRM field on page
verification_commands:
  - pnpm --filter @vises/web lint
  - pnpm --filter @vises/web build
```

---

## PFDC-TASK-007

```yaml
id: PFDC-TASK-007
title: Tests + lint/build sweep
owner_layer: frontend
fsd_or_module: features/client-portal-form-edit + pages/clients
depends_on: [PFDC-TASK-006]
status: pending
architecture: —
code: —
sensitive_paths:
  - apps/web/src/features/client-portal-form-edit/**
  - apps/web/src/pages/clients/**
acceptance_criteria:
  - Unit tests for mapper utils (form ↔ DTO)
  - Form happy-path smoke test (render + submit path mocked)
  - AC-FE-07 satisfied; lint/build green for @vises/web; contracts/api still green if touched
verification_commands:
  - pnpm --filter @vises/web lint
  - pnpm --filter @vises/web build
  - pnpm --filter @vises/web test -- src/features/client-portal-form-edit
```

---

## Review tracking

| task | retries | architecture | code | notes |
|------|---------|--------------|------|-------|
| PFDC-TASK-001 | 0 | OKAY | OKAY | DEC-FE-008 contracts |
| PFDC-TASK-002 | 0 | OKAY | OKAY | Nest portal-form keys |
| PFDC-TASK-003 | 0 | OKAY | OKAY | entities API |
| PFDC-TASK-004 | 0 | OKAY | OKAY | schema/mappers |
| PFDC-TASK-005 | 0 | OKAY | OKAY | section UI |
| PFDC-TASK-006 | 0 | OKAY | OKAY | page + routes |
| PFDC-TASK-007 | 0 | OKAY | OKAY | 10 tests green |
