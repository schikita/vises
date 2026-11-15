# Discovery — Portal form data collection UI

| Field | Value |
|-------|-------|
| Feature id | `portal-form-data-collection` |
| Updated | 2026-11-15 |
| Explorer | `dc731253-0312-41ef-90b2-ed91ea2aca19` |
| Upstream (DONE) | `docs/sdd/applicant-portal-form-fields/` (APF — FE UI was DEC-004 out of scope) |
| Materials | `site_materials/manage_applicants_appointments/*`, `visa_type/*`, `successful_enter/*`, `calendar.*`, `possible_site_issues/*` |
| Confidence | high |

## Goal (user request)

Update `apps/web` so users enter **all** backend-required portal-fill data on **one page**, with form UI matching BLS site materials (primary: Edit Member).

## Current state (evidence)

### Backend / contracts (ready)

- `packages/contracts`: `ClientPortalFormUpdateDto`, conditionals bag, `ApplicationUpsertDto.visaSubType`
- `PATCH /clients/:clientId/portal-form` (+ GET client detail with portal form)
- Client entity columns + migration `1794739200000-AddClientApplicationPortalFormFields.ts`
- Worker: `mapClientToApplicantInput` → `EditMemberCrmApplicantSource`
- Completeness keys exist in `BLS_APPLICANT_COMPLETENESS_REQUIRED_FIELD_KEYS` (gate currently passes `applicants: []` stub)

### Frontend today (partial)

- `features/application-form`: identity/passport/phone + trip subset; multi-step/tabs; CRM light theme
- No `portal-form` API client in `apps/web`
- FE `Application` types omit `visaSubType` and portal extended keys
- Apps upsert still sends `applicants[]` that API discards (`applicants: []` on read)
- Auth register/login: CRM `login`/`email`/`password` only (not portal RegisterUser)
- Start-form Zod is a **subset** of backend completeness keys

### Site SoT (primary mirror)

- **Edit Member** `manage_applicant(form).html` — numbered sections, Kendo controls, English labels
- Manage list `1.png` — dark theme hub → Edit/Complete
- Location/Visa modal; Visa Type booking (Attention, Location, Visa Type, Sub Type, Category)
- Calendar Kendo month grid; email DP notice (not CRM fields)

## Gap matrix (summary)

| Area | FE today | Backend / worker | Site form |
|------|----------|------------------|-----------|
| Identity / passport / phone | Yes (partial soft-required) | Client passport + completeness | Edit Member required |
| Trip / destination / entries | Partial on Application | Application + completeness | Edit Member journey block |
| Home address structured | Freeform `address` only | Client portal-form columns | Home* required |
| Employer / occupation | Missing | Client portal-form | Required (happy path) |
| Inviting company + contact | Missing | Client portal-form | Required (company path) |
| Cost / means of support | Missing | Client portal-form | Required |
| Fingerprint status/date | Missing | Client portal-form | Radios + conditional date |
| Conditionals (minor, prior visa, EU family, …) | Missing | `portalFormConditionals` jsonb | Conditional sections |
| `visaSubType` / category | Category staff-only; no sub type | Application column + extras | Visa Type page |
| Portal form chrome | CRM light theme | N/A | Dark BLS + gold accents |
| Persist path | Apps upsert applicants (discarded) | Client PATCH portal-form + apps upsert trip | N/A |

## Affected areas

- `apps/web`: `features/application-form`, pages `new-application` / `staff-create-application` / `application-detail` / `client-application`, `entities/client`, `entities/application`
- `packages/contracts`: consume existing portal-form + `visaSubType` (likely no contract change)
- `apps/api`: consume existing clients/apps APIs; completeness Client→gate wiring may remain a follow-up
- No new migration expected if APF columns suffice

## Risks / open questions

See orchestrator report § Decisions needed. Critical:

1. Persist via Client portal-form PATCH (+ passport) + apps upsert vs resurrect applicants jsonb
2. Visual pixel/theme clone vs CRM-themed field parity
3. Staff-only vs client self-serve vs both
4. Edit Member only vs + Visa Type booking fields on same page
5. Primary-only vs multi-member family
6. Completeness gate Client wiring timeline
7. Happy-path adult+company only vs full conditionals v1

## Artifact home

Authoritative: `docs/sdd/portal-form-data-collection/`  
Mirror pointers: `specs/portal-form-data-collection/`
