# Phase 4 — Execution plan

| Field | Value |
|-------|-------|
| Feature id | `portal-form-data-collection` |
| Status | **DONE** (PFDC-TASK-001…007 complete; plan-review cycle-1 fixes applied) |
| Date | 2026-11-15 |
| Spec | [`02-spec.md`](./02-spec.md) (**APPROVED**) |
| Discovery | [`00-discovery.md`](./00-discovery.md) |
| Tasks | [`05-tasks.md`](./05-tasks.md) |
| Upstream | `docs/sdd/applicant-portal-form-fields/` **DONE** (APF DEC-004 FE deferred → this feature) |

---

## 1. Goal & measurable acceptance

Deliver **one** staff page in `apps/web` that collects and saves all CRM data needed to fill BLS Edit Member + booking Visa Type Selection fields, matching `site_materials` Edit Member layout. Satisfy **AC-FE-01…08**. Prefer consuming existing APIs; apply **DEC-FE-008** additive optional keys only (no migration).

---

## 2. Strategy

1. **Contracts + Nest mirror (DEC-FE-008)** — add `phone`, `purpose`, `firstEntry`, `entries`, `durationDays` to `ClientPortalFormUpdateDto` / `ClientPortalFormDetailDto` + Nest DTO/field-key list + GET/PATCH mapping (columns already exist).
2. **FE API layer** — typed GET client-with-portal-form + `PATCH .../portal-form` util; application fetch/upsert including `visaSubType`.
3. **Feature model** — zod schema, DTO mappers, option/label constants from HTML materials (string labels only — no invented GUIDs).
4. **UI sections** — one component per portal section (Personal/Passport reuse pattern, Home, Employer, Travel, Fingerprint, Inviting, Cost, Conditionals, Trip).
5. **Page + route** — `/app|admin/clients/:clientId/portal-form` + link from client detail.
6. **Tests + lint/build**.

Prefer extending `features/client-passport-edit` patterns over greenfield form architecture.

---

## 3. DAG

```
PFDC-TASK-001 (contracts DEC-FE-008)
   └─► PFDC-TASK-002 (Nest portal-form keys + map)
          └─► PFDC-TASK-003 (FE API clients + types)
                 ├─► PFDC-TASK-004 (schema + mappers + constants) ─┐
                 └─► (004 before 005)                              │
                        └─► PFDC-TASK-005 (section UI components) ─┤
                               └─► PFDC-TASK-006 (page + route + save orchestration)
                                      └─► PFDC-TASK-007 (tests + lint/build sweep)
```

| Order | ID | Title | Depends | Owner |
|------|-----|-------|---------|-------|
| 1 | PFDC-TASK-001 | Contracts journey/phone on portal-form DTOs | — | contracts |
| 2 | PFDC-TASK-002 | Nest DTO + field keys + map/apply for DEC-FE-008 | 001 | backend |
| 3 | PFDC-TASK-003 | FE shared API: portal-form PATCH + typed GET + visaSubType | 001 (types); prefer after 002 | frontend |
| 4 | PFDC-TASK-004 | Feature schema, mappers, section constants | 003 | frontend |
| 5 | PFDC-TASK-005 | Portal-matching section UI components | 004 | frontend |
| 6 | PFDC-TASK-006 | Page, routing, client-detail entry, save orchestration | 005 | frontend |
| 7 | PFDC-TASK-007 | Tests + lint/build | 006 | frontend |

**Parallelism:** None recommended across packages after 001/002 land; FE tasks are serial on the same feature folder. 003 may start after 001 if Nest is delayed, but save of journey keys will 400 until 002 lands — **do not merge FE-only before 002**.

---

## 4. Affected packages

| Package | Touch |
|---------|-------|
| `packages/contracts` | DEC-FE-008 additive optional keys on portal-form types |
| `apps/api` | Nest portal-form DTO, `CLIENT_PORTAL_FORM_STRING_FIELD_KEYS`, pick/apply/map utils + specs |
| `apps/web` | Feature + page + API utils + route |
| `apps/workflow-worker` | **None** (already maps Client columns) |

### Frontend FSD targets

| Layer / slice | Role |
|---------------|------|
| `entities/client` | `patchClientPortalForm`, typed GET detail with portal fields (SoT; mirror passport helpers) |
| `entities/application` | `visaSubType` on types / upsert body |
| `features/client-portal-form-edit` | `types/`, `constants/`, `utils/`, `components/` (+ index) — match `client-passport-edit` |
| `pages/clients` | `ClientPortalFormPage` (+ export) |
| `app/App.tsx` | Routes under `/app` and `/admin` |

### Backend module target

| Module | Role |
|--------|------|
| `apps/api/src/modules/clients` | Portal-form DTO + constants + mappers only |

---

## 5. Sensitive paths

| Path | Policy |
|------|--------|
| Migration | **None** — CON-FE-001 |
| FR-6 / passport PATCH | Keep separate; reuse unlock/debit errors |
| Portal-form plaintext PII | Never log values |
| CON-006 / payment | Do not add booking submit |
| Auth register/login | Out of scope (DEC-FE-007) |

---

## 6. Decisions needed from human (recorded resolutions)

| Topic | Resolution for this plan |
|-------|--------------------------|
| OQ-FE-001 missing `applicationId` | Disable trip subsection + operator message; portal-form/passport still savable |
| OQ-FE-002 destination/dates | Keep on application-detail for now; this page trip subsection = Location/VisaType/VisaSubType/Category only |
| OQ-FE-003 missing conditionals keys | Collect only keys already in `ClientPortalFormConditionals`; document residual HTML-only fields as gap |
| OQ-FE-004 route slug | `/clients/:clientId/portal-form` under both app and admin prefixes |
| Auth analysis | Document in discovery/spec only — no code |

---

## 7. Risks

| Risk | Mitigation |
|------|------------|
| Large form surface / file-separation violations | One section component per file; constants/types/utils split |
| Dual passport UIs | New page owns full Edit Member personal/passport; keep existing client-detail passport editor; link between them |
| Partial save (portal OK, trip fail) | Orchestrate saves; surface subsection errors (spec §11) |
| Option catalogs | Free-text / static label lists from HTML; ASSUME-FE-002 |

---

## 8. Verification (feature-level)

- `pnpm --filter @vises/contracts build`
- `pnpm --filter @vises/api test --` scoped portal-form util specs after TASK-002 (Jest)
- `pnpm --filter @vises/web lint` / `build` / `test -- src/features/client-portal-form-edit`
- Manual: open page, fill happy-path, save, reload; toggle conditionals; trip disabled without applicationId

---

## 9. Out of scope (plan)

- Worker changes, migrations, auth UI, inventing conditionals keys, CON-006 submit
