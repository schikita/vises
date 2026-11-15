# Phase 4 — Execution plan

| Field | Value |
|-------|-------|
| Feature id | `applicant-portal-form-fields` |
| Status | **DONE** (APF-TASK-001…005 complete 2026-11-15) |
| Date | 2026-11-15 |
| Spec | [`02-spec.md`](./02-spec.md) |
| Database | [`02-database.md`](./02-database.md) |
| Discovery | [`00-discovery.md`](./00-discovery.md) (explorer `6645dba5`) |
| Tasks | [`05-tasks.md`](./05-tasks.md) + [`tasks/`](./tasks/) |

**Phase 7 unlocked:** DEC-001…005 + ASSUME-001…003 stamped below. APF-TASK-001 may proceed.

---

## 1. Goal & measurable acceptance

Persist and wire every portal-required CRM field for happy-path adult + inviting=company so Edit Member fill and Visa Type Selection booking prefill no longer hit data gaps for those keys; BLS start completeness fails closed if new required keys are missing. Matches AC-01…AC-07. FE UI remains out of scope (DEC-004).

---

## 2. Strategy

1. **Contracts first** — extend Client/Application wire types (portal form DTO + `visaSubType`).
2. **Schema** — additive migration + bootstrap + worker entity mirror (human-approved).
3. **API persist/read** — Nest DTOs/services aligned to contracts; dedicated portal-form PATCH preferred.
4. **Worker wiring** — map Client → ApplicantInput; status pass-through; booking category + visaSubType.
5. **Completeness gate** — expand required keys + messages after API can store fields.

Prefer extending existing modules over new packages.

---

## 3. DAG

```
APF-TASK-001 (contracts)
   └─► APF-TASK-002 (entities + migration + bootstrap)
          └─► APF-TASK-003 (api DTO / persist / read)
                 └─► APF-TASK-004 (worker CRM + booking wiring)
                        └─► APF-TASK-005 (completeness gate api + worker mirrors)
```

Preferred serial: **001 → 002 → 003 → 004 → 005**.

| Order | ID | Title | Depends | Phase |
|------|-----|-------|---------|-------|
| 1 | APF-TASK-001 | Contracts extended portal + visaSubType | — | A |
| 2 | APF-TASK-002 | Client/Application schema + migration | 001 (types) / DEC-005 | A |
| 3 | APF-TASK-003 | Nest DTO + persistence/read | 001, 002 | A |
| 4 | APF-TASK-004 | Worker map + status/booking wiring | 003 | B |
| 5 | APF-TASK-005 | Completeness required keys (api + worker) | 003, 004 | C |

**Parallelism:** 002 may start after 001 contracts land (entity property names should match). Do **not** parallelize 003∥002 on the same entity files. Do **not** parallelize 004∥005 — both touch `apps/workflow-worker` (plan-review: worker duplicates start completeness gate).

---

## 4. Affected packages

| Package | Touch |
|---------|-------|
| `packages/contracts` | Client portal form types; Application/`visaSubType`; detail/create as needed |
| `apps/api` | Entities, migration, bootstrap, clients/apps DTOs+services, completeness |
| `apps/workflow-worker` | Client(+Application) entity mirror; map; status/booking clients |
| `apps/web` | **None** this cycle |

---

## 5. Sensitive paths

| Path | Policy |
|------|--------|
| TypeORM migration | **Human-approved** (DEC-005) — APF-TASK-002 |
| PII / vault / FR-6 | Do not add new keys to `PII_ENCRYPTED_FIELD_KEYS`; never log values |
| Passport PATCH | Do not conflate portal form with FR-6 unlock gate |
| CON-006 / payment | Unchanged |
| FE | Explicitly out of scope |

---

## 6. Validation commands

| Scope | Command |
|-------|---------|
| Contracts | `cd packages/contracts && npm run lint && npm run build` |
| API | `cd apps/api && npm run lint && npm run build` |
| Worker | `cd apps/workflow-worker && npm run lint && npm run build` |
| Migration | After DEC-005: hand-authored additive migration + `npm run build`; `npm run migration:run` only in approved env |

**Note:** `npm run lint` in api/worker/contracts is currently a no-op stub — still required as the convention gate.

---

## 7. Human approval log

| Item | Decision | Date / by |
|------|----------|-----------|
| DEC-001 schema expansion | **APPROVED** — expand Client/Application for portal CRM gaps; overrides MA OQ-002 “schema only if already collected” | 2026-11-15 / product request |
| DEC-002 plaintext | **APPROVED** — new fields plaintext nullable; not in `PII_ENCRYPTED_FIELD_KEYS` | 2026-11-15 / product request |
| DEC-003 booking category + sub type | **APPROVED** — `extras.category` + new `visa_sub_type` column wired to prefill | 2026-11-15 / product request |
| DEC-004 FE OOS | **APPROVED** — contracts/API only; no collection UI | 2026-11-15 / product request |
| DEC-005 migration | **APPROVED** — additive migration authorized by this feature request | 2026-11-15 / product request |
| ASSUME-001 Schengen ids | **ACCEPTED** — National verify-first remains | 2026-11-15 |
| ASSUME-002 category semantics | **ACCEPTED** — staff category = portal Category | 2026-11-15 |
| ASSUME-003 Appointment For | **ACCEPTED** — derive from applicant count | 2026-11-15 |

---

## 8. Risks

| Risk | Mitigation |
|------|------------|
| Completeness too strict before FE can collect | Gate expands after API write path (005 after 003); FE still OOS — staff/API clients must supply fields |
| Large clients DDL review noise | Additive nullable only; document matrix in discovery/spec |
| Status client forgets new keys | APF-TASK-004 AC + explicit pass-through list |
| Booking omits category again | APF-TASK-004 AC cites `bls-booking-client.service.ts` prefill object |
| Conditionals jsonb becomes dumping ground | Happy-path stays first-class columns (database plan) |

---

## 9. Non-goals

- Frontend portal-form collection UI
- Encrypting employer/home/inviting fields
- New Appointment For persistence column
- Rebuilding fill pipelines beyond data wiring
