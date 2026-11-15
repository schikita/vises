# Phase 0 — Discovery (Portal form data collection — FE)

| Field | Value |
|-------|-------|
| Feature id | `portal-form-data-collection` |
| Status | **Discovery** |
| Date | 2026-11-15 |
| Spec SoT | *(not yet — next: `02-spec.md`)* |
| Explorer | product request / SDD docs writer |
| Upstream | `applicant-portal-form-fields` (**DONE**; DEC-004 deferred FE UI) |
| Specs mirror | [`specs/portal-form-data-collection/`](../../../specs/portal-form-data-collection/) |

**Labeling:** **Fact** = verified in-repo / materials. **Assumption** = labeled ASSUME-*. **Provisional DEC** = product request for orchestrator approval (not yet stamped in a plan).

---

## 1. Purpose

Deliver the deferred **frontend collection UI** for all BLS portal form-fill data that backend feature `applicant-portal-form-fields` already persists and wires — so agents can enter every field needed for Edit Member + Visa Type Selection autofill on **one** CRM page, without new migrations.

---

## 2. Upstream baseline (Facts)

| Source | Fact |
|--------|------|
| `docs/sdd/applicant-portal-form-fields/README.md` | Feature **DONE** (APF-TASK-001…005); **FE UI out of scope (DEC-004)** |
| `docs/sdd/applicant-portal-form-fields/02-spec.md` | **DEC-004** APPROVED — contracts/API accept fields for future FE |
| `docs/sdd/applicant-portal-form-fields/04-plan.md` | Residual: “Frontend portal-form collection UI” |
| Contracts | `ClientPortalFormUpdateDto`, `ClientPortalFormDetailDto`, `ClientPortalFormConditionals`; `ApplicationDto.visaSubType` / upsert `visaSubType` in `packages/contracts` |
| API | `PATCH /clients/:clientId/portal-form`; `GET /clients/:clientId` returns `ClientDetailDto & ClientPortalFormDetailDto`; apps upsert accepts `visaSubType` + `category` |
| Completeness | `BLS_APPLICANT_COMPLETENESS_REQUIRED_FIELD_KEYS` in `apps/api` (+ worker mirror) |
| ASSUME-003 | Appointment For / Family derived from applicant count — **no new column** (APF spec) |

---

## 3. Materials inventory (Facts)

| Source | Role for this FE feature |
|--------|--------------------------|
| `site_materials/manage_applicants_appointments/` — `manage_applicant(form).html` + images + MD briefs/flow | **Primary UI target** — Edit Member form structure, labels, required `*`, conditionals, dropdowns |
| `site_materials/visa_type/` — HTML + MD | Location / Visa Type / Visa Sub Type / Category (booking selection); scrape option labels/values where present |
| `site_materials/successful_enter/` | Post-login home — **nav only**; not CRM field collection |
| `site_materials/email_data_protection/` | Privacy email consent — **not** CRM applicant fields |
| `site_materials/possible_site_issues/` | Error / stuck docs — **not** forms |
| `site_materials/calendar.html` + `calendar.jpg` | Kendo datepicker reference (visual/DOM); FE may use existing SPA date patterns |

---

## 4. Backend / contracts ready surface (Facts)

### 4.1 Portal-form PATCH / GET

| Endpoint | Evidence | Notes |
|----------|----------|-------|
| `PATCH /clients/:clientId/portal-form` | `apps/api/.../clients.controller.ts` | Roles admin/superadmin/agent; body `ClientPortalFormUpdateDto` |
| `GET /clients/:clientId` | same + `ClientDetailWithPortalFormDto` | FR-6 plaintext + portal-form fields for FE read |
| Passport | `PATCH` passport route (existing FR-6 unlock gate) | Do **not** stuff portal keys into passport DTO |

### 4.2 `CLIENT_PORTAL_FORM_STRING_FIELD_KEYS`

From `apps/api/.../client-portal-form-field-keys.constants.ts` (plus separate `portalFormConditionals` jsonb):

`address`, `homeAddressLine2`, `homeCountry`, `homeCity`, `homePostalCode`, `employerName`, `employerPhone`, `employerAddress`, `occupation`, `previousFingerPrintStatus`, `previousFingerPrintDate`, `blsInvitingAuthority`, inviting authority/contact block (incl. fax), `costCoveredBy`, `meansOfSupport`, `memberStateSecondDestination`.

### 4.3 Completeness-required keys

From `BLS_APPLICANT_COMPLETENESS_REQUIRED_FIELD_KEYS` (`apps/api/.../bls-applicant-completeness.constants.ts`):

Identity/passport FR-6 subset + `phone` + `address` + structured home (country/city/postal) + journey (`purpose`, `firstEntry`, `entries`, `durationDays`) + employer/occupation + inviting company+contact block + `costCoveredBy` / `meansOfSupport`.

**Not** completeness-gated (CON-004): Line2, fingerprint override, second destination, conditionals, fax.

### 4.4 Journey / contact on Client (not portal-form DTO)

| Keys | Store / API today | FE today |
|------|-------------------|----------|
| `email`, `phone`, `address`, `purpose`, `firstEntry`, `entries`, `durationDays`, `relationship` | `ClientCreateDto` / `ClientDto`; entity columns | Create form: **email, phone, address, purpose** only |
| Portal-form string keys | `ClientPortalFormUpdateDto` / GET detail merge | **No FE** |
| FR-6 identity/passport | `ClientPassportUpdateDto` / GET detail | `features/client-passport-edit` on `ClientDetailPage` |
| `visaType`, `category`, `visaSubType`, trip dates/cities | Application upsert | FE has `visaType` + `category`; **no `visaSubType`** |

---

## 5. Current FE inventory (Facts)

### 5.1 Agent CRM auth (analysis only — OUT of page scope)

| Surface | Fields | Paths |
|---------|--------|-------|
| Register | `firstName`, `lastName`, `login`, `email`, `password` | `features/auth-register`, `pages/register` (`/register`) |
| Login | `identifier`, `password` | `features/auth-login`, `pages/landing` (`/`) |

These are **staff/agent account** credentials — not BLS portal applicant profile. Do not fold into the portal-form collection page.

### 5.2 Applicant collection today (partial)

| Surface | What is collected | Gap vs portal completeness |
|---------|-------------------|----------------------------|
| Client create | `email`, `phone`, `address`, `purpose` | Missing structured home/employer/inviting/cost; missing `firstEntry` / `entries` / `durationDays` on create UI |
| Passport edit | Full FR-6 set on `ClientDetailPage` (`CLIENT_PASSPORT_FORM_FIELDS`) | Exists; dual-surface vs new one-page goal |
| Application detail form | Trip (`visaType`, `category`, dates, cities…) + `ApplicantFields` (identity / passport / contactJourney) | **No `visaSubType`** in schema/types; applicants kept in-memory on upsert — **not persisted to Client CRM** (`apps.service.ts`: applicants column dropped; body applicants in-memory only) |
| Portal-form UI / PATCH client | **None** | No `patchClientPortalForm` (or equivalent) under `entities/client`; no route |

### 5.3 Routes today

`apps/web/src/app/App.tsx`: `/app|admin/clients`, `/app|admin/clients/:clientId` — **no** `…/portal-form` child route.

---

## 6. Product decisions (provisional — for orchestrator)

Stamp or revise in plan/spec; treat as product request until approved:

| ID | Decision |
|----|----------|
| **PDEC-001** | **ONE page** collecting **all** data needed for all possible site fields (include conditionals UI + optional fields), not happy-path-only. |
| **PDEC-002** | Visual layout must match site materials as closely as practical; **Edit Member** (`manage_applicant(form).html`) is the primary structure. |
| **PDEC-003** | Align with existing backend contracts — **no new migrations**. |
| **PDEC-004** | Agent auth register/login is **OUT** of page scope (analysis only). Applicant portal profile collection **IS** the deliverable. |
| **PDEC-005** | Persist: portal extended fields via `PATCH …/portal-form`; passport via existing passport `PATCH` if shown on same page; journey/contact completeness keys must land on **Client CRM** (not apps-applicants-only); `visaSubType` / `category` / `visaType` via apps upsert if on page **or** document as linked trip section. |
| **PDEC-006** | UI placement: dedicated route under clients, e.g. `/app\|admin/clients/:clientId/portal-form` — **one page**. |
| **PDEC-007** | Appointment For / Family: keep **ASSUME-003** (derived from applicant count) — do not invent a new column. |
| **PDEC-008** | Dropdown option values: scrape labels/values from `manage_applicant(form).html` and visa_type HTML where present; free text where portal uses free text. |

---

## 7. Gap matrix (Facts → FE work)

| Gap | Evidence | Target direction (provisional) |
|-----|----------|--------------------------------|
| No portal-form FE | No entity helper / page / route | New page + `PATCH` client + GET hydrate |
| FE Application missing `visaSubType` | `application.types.ts` / detail schema have `visaType` + `category` only | Add field + upsert if trip section on page; else link to application detail |
| Dual surfaces (passport on detail vs new page) | `ClientPassportEditForm` on `ClientDetailPage` | Prefer **one page** with personal/passport sections mirroring portal; write correct APIs (passport PATCH + portal-form PATCH) |
| Apps applicants not → Client CRM | `apps.service.ts` in-memory applicants; journey on applicants UI | Journey/completeness keys must write Client columns (create/update or portal-form / dedicated client writes already supported) |
| Completeness optionals / conditionals | Contracts + CON-004 | Still collect on UI (PDEC-001); not start-gate required |
| Dropdown vocab | Materials HTML | Spec/task: extract option lists (PDEC-008) |

---

## 8. Open questions for spec

| ID | Question | Notes |
|----|----------|-------|
| OQ-001 | Exact route path + nav entry (clients list vs detail CTA) | PDEC-006 suggests `…/clients/:clientId/portal-form` |
| OQ-002 | Include full personal+passport on new page vs deep-link to existing passport form | Prefer include (PDEC-001/002); keep ClientDetail passport as secondary or deprecate later |
| OQ-003 | Trip / visaSubType / category: same page section vs link to application detail | Must document either apps upsert or linked trip (PDEC-005) |
| OQ-004 | How to update Client journey fields (`firstEntry`, `entries`, `durationDays`, `phone`, …) that are **not** on `ClientPortalFormUpdateDto` | Create DTO has them; need existing or extend write path **without migration** — verify create-only vs any client update API before inventing |
| OQ-005 | i18n: portal English labels vs RU SPA chrome | Materials are English portal; SPA is RU/EN i18n |

**Unverified until OQ-004 closed:** whether a non-create Client plaintext update endpoint already exists for `phone` / `purpose` / `firstEntry` / `entries` / `durationDays` beyond create + portal-form PATCH (portal-form includes `address` but not journey keys).

---

## 9. Artifact suggestion (adopted)

`docs/sdd/portal-form-data-collection/` — sibling to `applicant-portal-form-fields/`; implements deferred DEC-004 FE. Mirror: `specs/portal-form-data-collection/`.

**Next:** orchestrator stamps provisional PDECs → `02-spec.md` → plan/tasks. No production code in discovery.
