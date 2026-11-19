# Phase 0 — Discovery (Application creation UI)

| Field | Value |
|-------|-------|
| Feature id | `application-creation-ui` |
| Status | **Discovery complete — spec/plan/tasks drafted; PENDING_HUMAN_APPROVAL** |
| Date | 2026-11-18 |
| Decisions stamped | 2026-11-18 (**DEC-ACU-001…008**); ACL re-verified 2026-11-18 |
| Branch under study | `feature/second-frontend` |
| Spec SoT | [`02-spec.md`](./02-spec.md) (**PENDING_HUMAN_APPROVAL**) |
| Plan / tasks | [`04-plan.md`](./04-plan.md) / [`05-tasks.md`](./05-tasks.md) |
| Explorer | product request / SDD docs writer (exploration summary + code verification) |
| Artifact home | **`docs/sdd/application-creation-ui/`** |
| Closest closed specs | [`specs/roles-and-applications/`](../../../specs/roles-and-applications/) (**CLOSED**); [`specs/roles-and-applications-frontend/`](../../../specs/roles-and-applications-frontend/) (**CLOSED**) |
| Related live SDD | [`docs/sdd/portal-form-data-collection/`](../portal-form-data-collection/) (**OQ-FE-001** — missing `applicationId`) |
| Confidence | **high** on API/FE inventory + stamped hybrid ACL; product UX locked via DEC-ACU-* |

**Labeling:** **Fact** = verified in-repo. **Historical** = closed roles-and-applications* record (may predate BUSINESS status rename / DEC-PF-011). **Assumption** = labeled ASSUME-*. Stamped decisions: **DEC-ACU-***.

---

## 1. Purpose

Clarify whether `apps/web` needs a **dedicated application-creation UI** (e.g. restore `apps/new` / staff create), or whether the existing **agent client-create** path already is the product creation UX — and align any FE work with the **source-of-truth** backend/contracts create surfaces on `feature/second-frontend`.

This discovery documents **what exists today** and the **stamped hybrid product decision** (agents Path A; admin/superadmin Path B). Spec work follows; this file does not invent endpoints.

---

## 2. Goal (product request — resolved intent)

Add or restore application creation UI in `apps/web` on `feature/second-frontend`, consistent with SoT backend/contracts.

**Resolved (2026-11-18):** Hybrid by role — agents keep client-first Path A; admin/superadmin get dedicated application-create UI via Path B (`POST /apps` upsert). See **§ Decisions (DEC-ACU-*)**.

---

## 3. Backend / contracts — two create paths (Facts)

### 3.1 Path A — Agent-only `POST /clients` (primary product path per closed roles-and-applications)

| Item | Evidence |
|------|----------|
| Controller | `apps/api/src/modules/clients/clients.controller.ts` — `@Post()`, `@Roles(AGENT_ROLE)`; comment: agent-only create (FR-5 / AC-6); admin/superadmin → `forbidden_role` |
| Service txn | `clients.service.ts` `create`: settings `price_per_client` → `paymentAmount`; one transaction: Client + ledger debit + `Application` with `status: 'draft'` + `paymentAmount`; returns `ClientDto` with `applicationId` |
| Contracts | `packages/contracts` `ClientCreateDto` / `ClientDto` (FR-5 / FR-6 comments) |
| Specs (Historical) | `specs/roles-and-applications/spec.md` **FR-5**: client create + application create in one txn; agent-only; hard 1:1; status named `drafting` in closed text — **live code uses BUSINESS `draft`** |

**Fact:** This is the only HTTP path that creates **Client + Application (draft) + debit** together for agents.

### 3.2 Path B — Staff JWT `POST /apps` upsert (create when `id` missing)

| Item | Evidence |
|------|----------|
| Controller | `apps/api/src/modules/apps/apps.controller.ts` — `@Post()` upsert; JWT/`@CurrentUser`; **no `@Roles` on upsert** (unlike `@Delete(':appId')` which is admin\|superadmin) |
| Create detection | `apps.service.ts`: `appId = body.id \|\| uid('app')`; `isCreate = !row` |
| Default status | `DEFAULT_APP_STATUS = 'draft'` (`apps/.../app-status.constants.ts`); upsert uses `body.status ?? DEFAULT_APP_STATUS` for staff |
| Staff identity side-effect | On create + staff: `usersService.ensureClientForIdentity` may set `issuedClientAccess` (password/token) when a login user is newly created |
| CRM `clientId` (DEC-PF-011) | `resolveUpsertCreateClientId` / `createClientWithDebit`: attach existing `clientId`, or staff create **Client + debit without Application**; never invent orphan client id |
| Specs / comments | DEC-PF-011 / PF-TASK-007 in clients + apps modules; `pick-most-recently-updated-application.util.ts` documents Client with **multiple Applications (1:N)** |

**Fact:** Upsert create can produce an Application without going through agent `POST /clients`. Staff create without `clientId` debits via `createClientWithDebit` (**no** nested Application in that helper — the Application row is the upsert itself).

### 3.3 Applications module — no create

| Item | Evidence |
|------|----------|
| Controller | `apps/api/src/modules/applications/applications.controller.ts` — `GET :applicationId/history`, `POST :applicationId/status` only |

**Fact:** Status/history live under Applications; **HTTP create of applications is not here**.

### 3.4 ACL comparison — Path A vs Path B (re-checked 2026-11-18)

| | Path A — `POST /clients` | Path B — `POST /apps` upsert |
|--|--------------------------|------------------------------|
| Controller | `clients.controller.ts` | `apps.controller.ts` |
| Auth | JWT + `@Roles(AGENT_ROLE)` only | JWT / `@CurrentUser` only — **no `@Roles` on upsert** |
| Who can create | Agent | Any authenticated JWT that reaches upsert (agent / admin / superadmin in practice) |
| Admin/superadmin | **`forbidden_role`** | Allowed when `id` missing (create) |
| Creates | Client + Application (`draft`) + debit in one txn | Application (default `draft`); may attach existing `clientId` or staff `createClientWithDebit` + optional `issuedClientAccess` |
| Expand for staff create? | Would require a **backend ACL change** | **No backend ACL change** for staff create via Path B |

**Backend ACL change required for stamped hybrid?** **No** — staff use Path B. **Yes** only if a later product decision insists admins create via `POST /clients`.

---

## 4. Current frontend inventory (Facts)

### 4.1 Routes — list/detail only for apps

`apps/web/src/app/App.tsx` (FE5/FE12 comment): `/app|admin/apps` → `Applications`; `/app|admin/apps/:id` → `ApplicationDetail`.

**No** `apps/new` (or equivalent create) route. Comment explicitly excludes `apps/new` trees.

### 4.2 Intentional FE5 route cut

`apps/web/src/app/App.route-cut.spec.tsx` (**App route cut (FE5)**): asserts source does **not** contain `StaffCreateApplication` and does **not** match `path=['"]apps/new['"]`.

Closed board: `specs/roles-and-applications-frontend/tasks.md` **FE5** — shells + route map; cut client/owner/legacy routes (**done**).

**Stamped reopen (partial):** DEC-ACU-001 / DEC-ACU-007 — reopen FE5 cut **only** for staff create under admin apps tree (e.g. `/admin/apps/new`). Agent `/app` keeps no `apps/new`.

### 4.3 Agent creation UX — `features/client-create` (FR-5)

| Surface | Behavior | Evidence |
|---------|----------|----------|
| Feature | `apps/web/src/features/client-create` | FSD feature; used from `ClientsPage` |
| API | `postClientCreate` → `POST /clients` | `entities/client` util |
| After success | Navigate to client detail `…/clients/:id` | `ClientsPage.tsx` |
| ACL UX | Agent “New client”; staff empty copy says clients appear after agents create them | i18n `clients.create` / `clients.list.emptyTextStaff` |
| Closed FE | FR-5 agent create; FE9 clients + passport | `specs/roles-and-applications-frontend/spec.md` FR-5; tasks FE9 |

**Historical (closed FE):** FR-5 = agent client create is the creation UX; FR-6 applications = list / status / history / detail (1:1 with client; no separate create FR). Live status union has since moved to BUSINESS six values — closed FR-6 still lists the old five-value set.

**Stamped:** Agents continue on this path (DEC-ACU-001 / DEC-ACU-003). Apps empty-state CTAs for agents deep-link to Clients create.

### 4.4 Applications list — empty copy mentions create; no CTA

| Item | Evidence |
|------|----------|
| Empty copy | `applications.list.emptyText`: EN “Clear filters or create an application.” / RU “Сбросьте фильтр или создайте заявку.” |
| Create control | `pages/applications/**` — **no** create button / route link found |

### 4.5 Leftover `staffCreate.*` i18n

| Item | Evidence |
|------|----------|
| Catalogs | `en-locale.constants.ts` / `ru-locale.constants.ts` — full `staffCreate` tree (“Create application”, steps, issued-access copy, etc.) |
| Live usage | Essentially leftover: `ApplicationDetailRender.tsx` reuses `t('staffCreate.fields.clientEmail')` only |

**Stamped:** Reuse leftover `staffCreate` i18n patterns for one-time credentials when Path B returns `issuedClientAccess` (DEC-ACU-006).

### 4.6 `issuedClientAccess` still in FE store path

`widgets/app-store/.../StoreProvider.tsx` still merges `issuedClientAccess` from upsert save results. Staff Path B create UI must surface credentials when present (DEC-ACU-006).

### 4.7 Portal-form trip gated on `applicationId`

`ClientPortalFormPage`: `tripDisabled = !applicationId` (plan/spec **OQ-FE-001**: disable trip subsection when linkage missing). Downstream of creation: without an application id on the client, trip upsert cannot run.

**Stamped:** Keep soft-disable; after successful create navigate to application detail (staff Path B) or existing client-detail flow (agent Path A) (DEC-ACU-008).

### 4.8 Related FE (not a create route)

`features/application-form` — detail/applicant field schemas used on application detail / related forms; **not** an `apps/new` page.

---

## 5. Related SDD / specs map (Facts)

| Source | Role for this topic |
|--------|---------------------|
| `specs/roles-and-applications/` (**CLOSED**) | Backend FR-5 creation + 1:1 cardinality (Historical literals: `drafting`, unique `clientId`) |
| `specs/roles-and-applications-frontend/` (**CLOSED**) | FE FR-5 client create; FR-6 apps list/status/history/detail; FE5 route cut; FE9 client-create delivery |
| `docs/sdd/portal-form-data-collection/` | Live FE assumes existing `applicationId` for trip; **OQ-FE-001** soft path kept (DEC-ACU-008) |
| `docs/sdd/demo-seed-volume/` | Seed models client↔application pairs (mini path described as 1:1) |
| Booking / manage-applicants / APF SDDs | Assume an **existing** application/client linkage for fill — not application creation UI |
| **This folder** | Discovery + stamped DEC-ACU-*; **`02-spec.md` next** |

`AGENTS.md` — **not found** at repo root at discovery time (Unverified / absent).

**Relevant rules (do not rewrite):** `.cursor/rules` — `file-separation`, `react-components`, `typescript-conventions`, `nestjs-structure`.

---

## 6. Gap matrix (Facts → stamped direction)

| Area | Today (Fact) | Stamped direction |
|------|--------------|-------------------|
| Primary create UX | Agent `POST /clients` → draft Application + debit + navigate client detail | **Keep for agents** (DEC-ACU-001 / 003); apps empty CTAs → Clients create |
| Dedicated apps create FE | Cut by FE5 (`StaffCreateApplication` / `apps/new` asserted absent) | **Partial reopen for staff only** — e.g. `/admin/apps/new` (DEC-ACU-001 / 007) |
| Staff create API | `POST /apps` upsert create exists (JWT, no `@Roles`); may `ensureClientForIdentity` + DEC-PF-011 client attach/debit | Wire staff FE to Path B; **no** `POST /clients` ACL expand |
| ApplicationsController | History + status only | Not the FE create target |
| Cardinality | Closed FR-5: hard 1:1; live DEC-PF-011 allows Client **1:N** Applications | SPA create UX stays **1:1** primary (DEC-ACU-004); API 1:N out of SPA create scope |
| Status on create | Live draft on both paths | Always **draft**; no staff-chosen initial status in v1 (DEC-ACU-005) |
| Portal-form | Trip disabled without `applicationId` | Soft-disable kept; post-create navigate to detail flows (DEC-ACU-008) |
| i18n / store leftovers | `staffCreate.*`, `issuedClientAccess` handling | Reuse for Path B credential display (DEC-ACU-006) |

---

## 7. Risks

1. **Partial FE5 reopen** must update `App.route-cut.spec.tsx` carefully so agent `/app` still has no `apps/new` while admin staff route is allowed.
2. **Staff using `POST /apps` upsert create** has different side effects than agent `POST /clients` (identity user + optional `issuedClientAccess`; `createClientWithDebit` without nested Application helper) — FE must not pretend the paths are equivalent.
3. **1:1 SPA vs 1:N API:** DEC-ACU-004 keeps SPA create 1:1; do not expose “add another application” in v1 staff create while DEC-PF-011 remains on the API.
4. **Empty-state copy vs missing CTA** already misleads operators (“create an application” with no control) — fix as part of hybrid UX.
5. **Restoring issued-client-access UX** resurfaces credential display/copy risks; required when Path B returns `issuedClientAccess` (DEC-ACU-006).
6. **Convention conflict risk:** any new FE must follow FSD + file-separation (one component/types/constants/utils per file); do not document mixed concern files as intended.
7. **Do not expand Path A ACL** in this cycle (DEC-ACU-003); expanding `POST /clients` for admin would be a separate backend change.

---

## 8. Open questions → resolved

Blocking list cleared 2026-11-18. Historical OQ text retained for audit; resolution points at DEC-ACU-*.

| ID | Question (historical) | Resolution |
|----|----------------------|------------|
| **OQ-ACU-001** | Agent client-create only vs dedicated apps create surface? | **RESOLVED** → **DEC-ACU-001** (hybrid by role) |
| **OQ-ACU-002** | Who may create? | **RESOLVED (human, 2026-11-18):** *“Agents AND admin AND superadmin are capable of creating applications.”* → **DEC-ACU-002** |
| **OQ-ACU-003** | Client-first vs app-first? | **RESOLVED** → **DEC-ACU-003** (role-split; no Path A ACL expand) |
| **OQ-ACU-004** | 1:1 vs 1:N product rule? | **RESOLVED** → **DEC-ACU-004** (SPA 1:1 create UX; API 1:N out of scope) |
| **OQ-ACU-005** | Draft-only vs other initial statuses? | **RESOLVED** → **DEC-ACU-005** |
| **OQ-ACU-006** | Restore `issuedClientAccess` staff UX? | **RESOLVED** → **DEC-ACU-006** |
| **OQ-ACU-007** | Reopen FE5 for `apps/new`? | **RESOLVED** → **DEC-ACU-001** / **DEC-ACU-007** (staff `/admin/apps/new` only) |
| **OQ-ACU-008** | Portal-form OQ-FE-001 interaction? | **RESOLVED** → **DEC-ACU-008** |

---

## 9. Decisions (DEC-ACU-*) — stamped 2026-11-18

| ID | Decision | Origin |
|----|----------|--------|
| **DEC-ACU-001** | **Hybrid by role.** Agents create via existing Path A (`features/client-create` / `POST /clients`). Admin/superadmin get a dedicated application-create UI via Path B (`POST /apps` upsert create). Reopen FE5 cut **only for staff** create route under admin apps tree (e.g. `/admin/apps/new`); agent `/app` keeps no `apps/new` — apps empty state CTAs deep-link to Clients create. | Was OQ-ACU-001 / OQ-ACU-007; orchestrator default after OQ-002 |
| **DEC-ACU-002** | Agents **and** admin **and** superadmin are capable of creating applications. | **Human** (2026-11-18): *“Agents AND admin AND superadmin are capable of creating applications.”* |
| **DEC-ACU-003** | **Role-split.** Agents: **client-first** (Path A). Staff: **app-first** via upsert; may attach existing `clientId` per DEC-PF-011. Do **not** expand `POST /clients` ACL in this cycle. | Was OQ-ACU-003 |
| **DEC-ACU-004** | SPA product rule remains **1:1** primary UX (closed FR-5). Staff create UI in v1 does **not** offer “add another application” for a client that already has one; API 1:N (DEC-PF-011) stays out of SPA create scope. | Was OQ-ACU-004 |
| **DEC-ACU-005** | Create always starts as **draft** (live default). No staff-chosen initial status on create in v1. | Was OQ-ACU-005 |
| **DEC-ACU-006** | If upsert create response includes **`issuedClientAccess`**, staff UI must show one-time credentials (reuse leftover `staffCreate` i18n patterns). | Was OQ-ACU-006 |
| **DEC-ACU-007** | Covered under DEC-ACU-001 (partial FE5 reopen for `/admin/apps/new` only). | Was OQ-ACU-007 |
| **DEC-ACU-008** | Keep portal-form **soft-disable** trip when no `applicationId` (OQ-FE-001 soft path). After successful create, navigate to application detail (staff Path B) or existing client-detail flow (agent Path A). | Was OQ-ACU-008 |

**Backend ACL:** No change required for this hybrid (staff Path B). Expanding Path A for admins is out of cycle.

---

## 10. Affected areas (approved create UI)

| Area | Path | Role under DEC-ACU-* |
|------|------|----------------------|
| Agent create (exists) | `apps/web/src/features/client-create/**`, `pages/clients/**` | Path A SoT; empty-state deep-links from apps list |
| Staff create page (new) | New FSD feature + route e.g. `/admin/apps/new` | Path B upsert create; admin/superadmin |
| Apps list empty / nav | `pages/applications/**`, shell nav, i18n | Staff CTA → create route; agent CTA → clients create |
| Apps upsert client | `entities/application` + store `issuedClientAccess` | Path B + DEC-ACU-006 credentials UX |
| API | `clients` create; `apps` upsert; not `applications` create | Consume existing contracts; **no** Path A ACL expand |
| Contracts | `@vises/contracts` client + application upsert DTOs | Prefer no invent; gap only if FE typing missing |
| Tests | `App.route-cut.spec.tsx` | Update for **partial** FE5 reopen (admin `apps/new` only) |

---

## 11. Recommendations for next SDD phase

1. ~~Spec-writer produces `02-spec.md`~~ — **done** ([`02-spec.md`](./02-spec.md)).
2. ~~Plan/tasks~~ — **drafted** ([`04-plan.md`](./04-plan.md), [`05-tasks.md`](./05-tasks.md)); await **human approval** of the package.
3. After approval: dispatch frontend implementers (**ACU-TASK-001…005**). Do not invent endpoints or expand `POST /clients` ACL.
4. Partial FE5 reopen scope and route-cut test updates are in plan TASK-003.
5. Approved FE must obey existing rules: FSD slices, file-separation, react-components, typescript-conventions.

---

## 12. Artifact suggestion (adopted)

`docs/sdd/application-creation-ui/` — sibling to `portal-form-data-collection/`, `admin-system-analytics-ux/`, etc. Decisions live in this discovery (§9); no separate `01-decisions.md` (siblings do not use that file).

| Doc | Role |
|-----|------|
| [`00-discovery.md`](./00-discovery.md) | Phase 0 evidence + stamped DEC-ACU-* |
| [`02-spec.md`](./02-spec.md) | Spec — PENDING_HUMAN_APPROVAL |
| [`04-plan.md`](./04-plan.md) / [`05-tasks.md`](./05-tasks.md) | Plan/tasks — PENDING_HUMAN_APPROVAL |

**Next step:** Human approves spec + plan package; then implementers. No production code from discovery alone.
