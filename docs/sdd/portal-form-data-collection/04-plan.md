# Phase 4 — Execution plan

| Field | Value |
|-------|-------|
| Feature id | `portal-form-data-collection` |
| Status | **DONE** (rev 3 — DEC-PF-011 + PF-TASK-006/007 closed) |
| Date | 2026-11-15 |
| Spec | [`02-spec.md`](./02-spec.md) (**APPROVED** 2026-11-15) |
| Discovery | [`00-discovery.md`](./00-discovery.md) |
| Tasks | [`05-tasks.md`](./05-tasks.md) |
| Plan review | cycle 1 → NEEDS_REVISION; this rev addresses blocking findings |

**Unlocked by:** human approval of DEC-PF-001…010 (with DEC-PF-006/007 amendments) and OQ-PF-001…007 resolutions.

---

## 1. Goal & measurable acceptance

Staff/agents enter **all** site-relevant BLS Edit Member + booking fields on **one page** in `apps/web`, with site-like conditionals (inviting company/hotel/person and other branches). Persist via extended portal-form PATCH + passport + apps upsert. Matches **AC-01…AC-14** in `02-spec.md`. No new migration. Backend completeness `applicants: []` stub remains follow-up (**OQ-PF-006**).

---

## 2. Strategy

1. **Contracts** — extend portal-form Update/Detail DTOs with journey/contact fields (`phone`, `purpose`, `firstEntry`, `entries`, `durationDays`).
2. **API** — Nest DTO + pick/apply/map so GET detail and PATCH portal-form round-trip those Client columns (existing DB columns; no migration).
3. **FE entities** — portal-form API client; Application `visaSubType`; stop treating `applicants[]` as SoT for portal-extended fields.
4. **FE form model** — Zod schemas + option/constants + branch-aware refinements. Completeness key SoT: **mirror** `BLS_APPLICANT_COMPLETENESS_REQUIRED_FIELD_KEYS` (+ phone digit length) into `features/application-form` constants with an explicit key-parity AC (do **not** import `apps/api` from `apps/web`).
5. **FE UI (split)** — BLS-mirrored themed sections in two reviewable tasks: core sections, then conditionals/inviting/cost/EU family.
6. **FE pages** — wire one-page form into staff create + application detail; **Save all** sequences create-client (if needed) → passport → portal-form → apps upsert.

Prefer extending existing slices (`features/application-form` uses existing `components/` segment — do not introduce a parallel `ui/` folder). Match surrounding FSD patterns.

---

## 3. DAG

```
PF-TASK-001 → 002 → 002b → 003 → 004 → 005a → 005b
                              └─► PF-TASK-007 (1:N + create Client on upsert)
                                        └─► PF-TASK-006 (pages + Save all + Client picker)
```

| Order | ID | Title | Depends | Package |
|------|-----|-------|---------|---------|
| … | 001…005b | (DONE) | … | … |
| next | PF-TASK-007 | API 1:N + create Client on upsert | 002b | `apps/api` |
| last | PF-TASK-006 | Staff one-page + Save all + Client picker | 005b, 007 | `apps/web` |

---

## 4. Affected packages / FSD

| Package / layer | Touch |
|-----------------|-------|
| `packages/contracts` | `ClientPortalFormUpdateDto` / `DetailDto` (+ exports) |
| `apps/api` `modules/clients` | Nest DTO, field-key constants, pick/apply/map utils, service (no new routes), Jest tests |
| `apps/web` `entities/client` | `patchClientPortalForm`, detail types with journey fields |
| `apps/web` `entities/application` | `visaSubType` on types + upsert mapper |
| `apps/web` `features/application-form` | schemas, constants (incl. mirrored completeness keys), utils, themed components under existing `components/` |
| `apps/web` `pages/staff-create-application`, `pages/application-detail` | one-page composition + Save all |
| `apps/workflow-worker` | **None** this cycle |

### Completeness key SoT (AC-07)

- Normative list today: `apps/api/src/modules/bls-workflow/constants/bls-applicant-completeness.constants.ts` → `BLS_APPLICANT_COMPLETENESS_REQUIRED_FIELD_KEYS` + phone digit length.
- FE **mirrors** that list into `features/application-form/constants/*completeness*.constants.ts` with a comment citing the API path.
- PF-TASK-004 AC requires key-set parity with that file (manual or unit assert of the array contents).
- Branch-aware inviting/conditional keys are **additional** FE refinements beyond the always-required company-centric API list (API gate remains follow-up per OQ-PF-006).

### Create vs detail Save-all sequencing (**DEC-PF-011 APPROVED**)

| Mode | Sequence |
|------|----------|
| Detail (real `clientId`) | passport PATCH → portal-form PATCH → apps upsert |
| Create **without** selected Client | **apps upsert** creates CRM `Client` + debit (reuse Clients.create debit semantics, once per new Client) + Application with that `clientId` → passport PATCH → portal-form PATCH → apps upsert refresh |
| Create **with** selected existing `clientId` | apps upsert attaches new Application only (no new Client, no new debit) → passport → portal-form → upsert refresh |
| Failure | Report which step failed; fail closed; no invented values |

**Never** mint orphan `uid('cli')` without a `clients` row.

**A-style:** `AppsModule` imports `ClientsModule`; upsert create path creates/links Client. `POST /clients` remains available for agent CRM create (still creates Client+first Application).

**Migration (human-approved via DEC-PF-011):** folded into initial migration `1793558272305-Migration` — `applications.client_id` index is **non-unique** from the start (no separate drop migration; no prod yet). Entity `@Index` non-unique; bootstrap heals local DBs that still have the old unique index. Debit remains **once per new Client**.

**FE:** optional Client picker (list `GET /clients`); empty selection → upsert without authoritative clientId so API creates Client.

Primary UX: **one scrollable page** on staff create + detail.

---

## 5. Backend / contracts notes

- Journey/contact columns already on `clients` (no column add).
- **Migration approved (DEC-PF-011):** drop unique `applications.client_id` indexes only; keep searchable non-unique index.
- Portal-form PATCH remains **not** FR-6 gated.
- Partial update semantics unchanged; inactive branch fields omitted/null — **never invent**.
- Completeness gate Client→applicant wiring **out of scope** (**OQ-PF-006**).
- Client list `applicationId`/status for 1:N: use **most recently updated** Application for display (minimal change; not a new product surface).

### Human-visible checkpoint (sensitive paths)

- PF-TASK-001/002 journey fields: approved 2026-11-15.
- **DEC-PF-011** migration + Client create-on-upsert + debit-once-per-Client: approved 2026-11-15.

---

## 6. Sensitive paths

| Path | Policy |
|------|--------|
| Auth / roles | Staff-only (admin/superadmin/agent) — **OQ-PF-003** |
| FR-6 passport | Unlock/debit unchanged; separate Save-all step |
| Portal-form plaintext PII | Approved APIs only; no value logging |
| Migrations | **DEC-PF-011 only** — drop unique `applications.client_id` indexes |
| Public contracts | Additive optional fields on portal-form DTOs only (checkpoint above) |
| applicants[] | Not SoT |

---

## 7. Validation commands

| Scope | Command | Note |
|-------|---------|------|
| Contracts | `cd packages/contracts && pnpm run lint && pnpm run build` | lint may be no-op; build is real |
| API | `cd apps/api && pnpm run lint && pnpm run build` | lint may be no-op |
| API tests | `cd apps/api && pnpm test -- --testPathPattern=portal-form` | **Jest** (not Vitest) |
| Web | `cd apps/web && pnpm run lint && pnpm run build` | **oxlint** enforces conventions |

Manual checklists for conditional UI / section mirror / Save-all partial failure are required in tasks 004–006 (lint+build alone cannot prove them).

---

## 8. Human approval log

| Item | Decision | Date |
|------|----------|------|
| DEC-PF-001…005, 008…010 | **APPROVED** | 2026-11-15 |
| DEC-PF-006 amended (site-like inviting) | **APPROVED** | 2026-11-15 |
| DEC-PF-007 amended (first-class conditionals) | **APPROVED** | 2026-11-15 |
| OQ-PF-001…007 | **RESOLVED** per human feedback | 2026-11-15 |
| DEC-PF-011 1:N + create Client on upsert + unique drop | **APPROVED** | 2026-11-15 |
| Debit once per new Client (not per Application) | **APPROVED** (reuse Clients.create) | 2026-11-15 |
| Contracts/API additive OQ-PF-001 fields | **APPROVED** checkpoint | 2026-11-15 |

---

## 9. Risks

| Risk | Mitigation |
|------|------------|
| Large FE surface | Split UI into 005a / 005b |
| Completeness still company-centric on API | FE branch-aware validation; API stub follow-up |
| Dual Travel/Arrival → same `travelDate` | Both controls synchronized; short UI note |
| Save-all partial failure | Per-step error reporting |
| Create still multi-step today | PF-TASK-006 replaces primary UX with one page + documented create sequence |

---

## 10. Decisions needed from human

**none** — DEC-PF-011 **APPROVED** 2026-11-15 (1:N; A-style create-Client on upsert; debit once per new Client; unique index drop). Escalate only if site HTML reveals a field with no CRM column.
