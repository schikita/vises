# Phase 4 — Execution plan

| Field | Value |
|-------|-------|
| Feature id | `application-creation-ui` |
| Status | **DONE** (human approved 2026-11-18; ACU-TASK-001…005 shipped + reviewed) |
| Date | 2026-11-18 |
| Spec | [`02-spec.md`](./02-spec.md) (**PENDING_HUMAN_APPROVAL**; DEC-ACU-002 HUMAN_LOCKED; DEC-ACU-001/003–008 PROPOSED_DEFAULT) |
| Discovery | [`00-discovery.md`](./00-discovery.md) |
| Tasks | [`05-tasks.md`](./05-tasks.md) |
| Branch | `feature/second-frontend` |
| Backend SoT reference | `feature/backend-restructure` for `apps/api` / contracts when comparing ACL — live branch ACL re-verified identical for Path A/B |

**Human decisions:** DEC-ACU-002 locked. Remaining DEC-ACU-* are orchestrator safe defaults. Context gate **pass**. **Backend ACL change required? No.**

---

## 1. Goal & measurable acceptance

Enable agent + admin + superadmin to create applications from `apps/web` via hybrid Path A / Path B; restore staff create discoverability without expanding `POST /clients` ACL or inventing endpoints. Match **AC-ACU-001…012**.

---

## 2. Strategy

1. **No backend / contracts invent** — consume existing `POST /clients` (agent) and `POST /apps` upsert create (staff). Prefer no `packages/contracts` change; additive FE typing only if a proven gap.
2. **Discoverability first** — role-correct Applications list empty CTAs (agents → Clients create; staff → `/admin/apps/new`).
3. **Staff Path B UI** — new FSD feature `features/application-create` + admin page; route under `/admin` RoleGuard only.
4. **Partial FE5 reopen** — register `apps/new` **before** `apps/:id` on admin tree only; update route-cut tests.
5. **Credentials** — when upsert returns `issuedClientAccess`, show one-time panel using leftover `staffCreate.*` i18n; then navigate to application detail.
6. **Agent Path A** — keep as-is; only wire deep-links from apps empty state.

---

## 3. Locked create-field mapping (ASSUME-ACU-001)

Staff v1 create form (Path B) submits via existing store/`toAppUpsertPayload` → `POST /apps` **without** `id`.

| UI field | Wire key | Required in v1? | Notes |
|----------|----------|-----------------|-------|
| Client email | `clientEmail` | **Yes** (for identity / access) | Matches leftover `staffCreate.fields.clientEmail*` |
| Existing CRM client (optional) | `clientId` | No | Attach if operator selects/knows id; empty → server `createClientWithDebit` per DEC-PF-011 |
| Status | `status` | **Do not send / no picker** | Server default `draft` (**DEC-ACU-005**) |
| Trip / questionnaire extras | `visaType`, `submitCity`, etc. | **Out of v1 create Must** | Fill on detail / portal-form after create |
| Applicants multi-add | — | **Out of v1** | No “add another application”; keep SPA 1:1 (**DEC-ACU-004**) |

**Do not** call `POST /clients` from staff create.

---

## 4. Affected packages & layers

| Package | Touch | Notes |
|---------|-------|-------|
| `apps/web` | **Primary** | Routes, feature, pages, i18n, tests |
| `apps/api` | None | ACL unchanged |
| `packages/contracts` | Prefer none | Additive typing only if gap proven |
| Docs | This SDD folder | Status after approval |

### Frontend FSD (normative)

| Slice / layer | Work |
|---------------|------|
| `features/application-create` | New — form UI, schema/constants/types/utils (one concern per file) |
| `pages/applications` | Empty CTA; compose staff create page if colocated, or sibling page module |
| `app/App.tsx` | Admin `apps/new` route only |
| `features/client-create` / `pages/clients` | Keep; target of agent deep-link |
| `entities/application` | Reuse upsert + `UpsertAppResult.issuedClientAccess` |
| `widgets/app-store` | Reuse existing `issuedClientAccess` merge — do not duplicate |
| `shared/i18n` | Reuse `staffCreate.*`; add apps-list CTA keys if needed |

---

## 5. Cross-cutting risks

| Risk | Mitigation |
|------|------------|
| Accidental agent `/app/apps/new` | Admin RoleGuard + route-cut assertions |
| `apps/:id` captures `new` | Register static `apps/new` **before** `apps/:id` |
| Staff calling Path A | FE never wires `postClientCreate` on staff create |
| Credential leakage | One-time UI; no secret logging (**NFR-ACU-002**) |
| Pretending Path A ≡ Path B | Copy/UX distinguish side effects; credentials only on Path B |
| Convention violations | file-separation + oxlint in every task |

---

## 6. Phasing

Single reviewable FE phase (no migrations, no ACL). Split tasks so each is independently reviewable; **do not** ship backend ACL expand in this phase.

If human overrides DEC-ACU-003 to expand Path A instead of Path B UI: **stop**, rewrite plan (backend ACL + tests become sensitive), and drop staff `/admin/apps/new` Must.

---

## 7. Decisions needed from human (approval gate)

1. Approve **DEC-ACU-001 / 003–008** as stamped (or override).
2. Approve this plan’s **minimal staff create fields** (email + optional `clientId` only in v1).
3. Explicit ACK: **no** `POST /clients` ACL expand this cycle.
4. After approval → flip spec/plan status → dispatch `sdd-frontend-implementer` per `05-tasks.md`.

---

## 8. Verification (package-level)

```bash
pnpm --filter @vises/web run lint
pnpm --filter @vises/web run test
pnpm --filter @vises/web run build
```

Scoped tests per task in `05-tasks.md`.

---

## 9. Next action after approval

1. Human sets status → `APPROVED_WITH_PROPOSED_DEFAULTS` (or `APPROVED` with overrides recorded).
2. Orchestrator dispatches frontend implementers starting with **ACU-TASK-001 ∥ ACU-TASK-002**.
3. Architecture review → code review per task; no parallel explorer.
