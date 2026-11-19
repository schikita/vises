# Spec — Application creation UI

| Field | Value |
|-------|-------|
| Feature id | `application-creation-ui` |
| Document home | **`docs/sdd/application-creation-ui/`** (authoritative) |
| Spec SoT | [`02-spec.md`](./02-spec.md) (this file) |
| Status | **APPROVED_WITH_PROPOSED_DEFAULTS** |
| Decision lock | **DEC-ACU-002** = **HUMAN_LOCKED** (2026-11-18). **DEC-ACU-001**, **003–008** = **APPROVED** (orchestrator-stamped defaults; human approved package 2026-11-18). |
| Human approval | **2026-11-18** — package approved; implementers authorized for ACU-TASK-001…005. |
| Updated | 2026-11-18 |
| Branch | `feature/second-frontend` |
| Discovery | [`00-discovery.md`](./00-discovery.md) |
| Plan | [`04-plan.md`](./04-plan.md) (**PENDING_HUMAN_APPROVAL**) |
| Tasks | [`05-tasks.md`](./05-tasks.md) (**PENDING_HUMAN_APPROVAL**) |
| Upstream / closest closed | [`specs/roles-and-applications/`](../../../specs/roles-and-applications/), [`specs/roles-and-applications-frontend/`](../../../specs/roles-and-applications-frontend/) (**CLOSED**) |
| Related live SDD | [`docs/sdd/portal-form-data-collection/`](../portal-form-data-collection/) (OQ-FE-001 soft-disable kept via **DEC-ACU-008**) |

> **PENDING_HUMAN_APPROVAL.** DEC-ACU-002 is human-locked (all three staff roles may create). DEC-ACU-001 / 003–008 are orchestrator-stamped product defaults captured from discovery. Human must explicitly approve this spec + plan/tasks package (or override a DEC) before production work.

---

## 1. Summary

`apps/web` needs a **hybrid** application-creation UX aligned with SoT backend create paths: **agents** keep the existing client-first Path A (`features/client-create` → `POST /clients`); **admin/superadmin** get a dedicated app-first create UI via Path B (`POST /apps` upsert when `id` is missing). Path A ACL stays agent-only (closed FR-5); **no backend ACL expand** this cycle. Applications list empty states gain role-correct CTAs; FE5 route cut reopens **only** for staff `/admin/apps/new`.

---

## 2. Actors and roles

| Actor | Role in this feature |
|-------|----------------------|
| Agent | Creates via Path A (existing Clients create); apps list empty CTA deep-links to Clients create; **no** `/app/apps/new` |
| Admin | Creates via Path B staff UI at `/admin/apps/new`; apps list empty CTA → create route |
| Superadmin | Same as admin for create UX (Path B) |
| `apps/web` | Routes, FSD create features, empty CTAs, credential display, post-create navigation |
| `apps/api` clients module | Existing `POST /clients` — agent-only; **unchanged ACL** |
| `apps/api` apps module | Existing `POST /apps` upsert create (JWT, no `@Roles` on upsert); **unchanged ACL** |
| Applicant / client identity | May receive one-time `issuedClientAccess` on staff Path B create; not a staff actor |

Staff role union (existing): `'superadmin' | 'admin' | 'agent'`.

---

## 3. Goal and scope

### 3.1 Goal

Enable **agent, admin, and superadmin** to create applications from the SPA (**DEC-ACU-002**) without inventing endpoints and without expanding `POST /clients` ACL. Prefer discoverability + enabling all three roles over blindly restoring full FE5 agent `apps/new`.

### 3.2 Preference rationale (normative for Decisions)

Path A is agent-only (closed FR-5 / AC-6). Expanding Path A ACL would alter that closed SoT. Path B upsert already allows authenticated staff create when `id` is missing. **Safe default:** Path B UI for admin/superadmin; keep Path A for agents; **Backend ACL change required? No** for this cycle.

### 3.3 In scope

1. Keep/enhance agent Path A: `features/client-create` + Clients page create → navigate client detail.
2. New staff Path B create: new FSD feature (e.g. `features/application-create`) + admin apps page; route **`/admin/apps/new`** only.
3. Applications list empty-state CTAs: staff → `/admin/apps/new`; agent → Clients create (deep-link). Align copy that already mentions “create”.
4. Partial FE5 reopen: update `App.route-cut.spec.tsx` so admin `apps/new` is allowed; agent `/app` still has **no** `apps/new`.
5. Surface `issuedClientAccess` when Path B upsert returns it (reuse leftover `staffCreate.*` i18n; store already merges credentials).
6. Post-create navigation: staff → application detail; agent → existing client detail (**DEC-ACU-008**).
7. Create always as **draft**; no staff-chosen initial status (**DEC-ACU-005**).
8. SPA create UX stays **1:1** primary; no “add another application” in v1 (**DEC-ACU-004**).
9. Conventions: FSD layers/slices named below; one concern per file; no `enum`; explicit return types.

### 3.4 Non-goals (explicit)

| Non-goal | Rationale |
|----------|-----------|
| Expand `POST /clients` for admin/superadmin | **DEC-ACU-003**; would alter closed FR-5 SoT |
| New `ApplicationsController` create endpoint | History/status only today; inventing APIs forbidden |
| New migrations | No schema change |
| Inventing new create APIs / contracts | Consume existing Path A / Path B |
| Full restore of agent `/app/apps/new` | **DEC-ACU-001** / **007** — staff only |
| “Add another application” / 1:N SPA create UX | **DEC-ACU-004**; API 1:N (DEC-PF-011) out of SPA create scope |
| Staff-chosen initial status on create | **DEC-ACU-005** |
| Production code in this documentation cycle | Spec/plan/tasks only; human approve before implementers |
| Changing portal-form soft-disable policy | Keep OQ-FE-001 soft path (**DEC-ACU-008**) |

---

## 4. Baseline and traceability

| Artifact | Relation |
|----------|----------|
| [`00-discovery.md`](./00-discovery.md) | Evidence, ACL comparison, stamped DEC-ACU-*, resolved OQs |
| `clients.controller.ts` `@Post()` | Path A — `@Roles(AGENT_ROLE)` only; FR-5 / AC-6 comment |
| `clients.service.ts` `create` | Client + debit + Application `draft` + `paymentAmount` in one txn |
| `apps.controller.ts` `@Post()` upsert | Path B — JWT/`@CurrentUser`; **no `@Roles` on upsert**; Delete is admin\|superadmin |
| `apps.service.ts` upsert create | `id` missing → create; default status `draft`; optional `issuedClientAccess`; DEC-PF-011 `clientId` attach / `createClientWithDebit` |
| `applications.controller.ts` | **No** HTTP create — out of create targets |
| `features/client-create` + `pages/clients` | Live agent create UX |
| `pages/applications` | List/detail; emptyText mentions create; **no CTA today** |
| `App.tsx` | `/app|admin/apps`, `/app|admin/apps/:id` only — no `apps/new` |
| `App.route-cut.spec.tsx` | Asserts `StaffCreateApplication` / `apps/new` absent — must update for **partial** reopen |
| `staffCreate.*` i18n | Leftover; reuse for credentials UX |
| `StoreProvider` / `UpsertAppResult` | Merges / types `issuedClientAccess` |
| Closed FE5 / FE9 | Route cut + agent client-create delivery |
| portal-form OQ-FE-001 | Soft-disable trip without `applicationId` — kept |

---

## 5. Functional requirements

| ID | Statement | Priority | Status |
|----|-----------|----------|--------|
| **REQ-ACU-001** | Deliver **hybrid-by-role** create UX: agents use Path A (`features/client-create` / `POST /clients`); admin/superadmin use a dedicated Path B create UI (`POST /apps` upsert create) (**DEC-ACU-001**, **DEC-ACU-003**). | Must | **Accepted** (pending human package approval) |
| **REQ-ACU-002** | Agent, admin, and superadmin must each be able to create applications from the SPA (**DEC-ACU-002**). Agents via Path A; admin/superadmin via Path B UI (Path A cannot serve staff without ACL change — out of cycle). | Must | **Accepted** (**DEC-ACU-002** human-locked) |
| **REQ-ACU-003** | Do **not** expand `POST /clients` `@Roles` beyond agent this cycle. Staff create Must use Path B only (**DEC-ACU-003**). **Backend ACL change required? No.** | Must | **Accepted** |
| **REQ-ACU-004** | Keep existing agent create flow: Clients “New client” / `postClientCreate` → on success navigate to client detail (existing behavior). Enhance only as needed for apps-list deep-links and empty CTAs. | Must | **Accepted** |
| **REQ-ACU-005** | Add staff create route **`/admin/apps/new`** under the admin shell only. Agent `/app` Must **not** mount `apps/new` (**DEC-ACU-001**, **DEC-ACU-007**). | Must | **Accepted** |
| **REQ-ACU-006** | Implement staff create as a new FSD feature slice (suggested: `features/application-create`) plus a page under admin applications. Suggested page home: `pages/applications` (or sibling page module) composing the feature. One concern per file. | Must | **Accepted** |
| **REQ-ACU-007** | Staff create Must call existing application upsert client (`POST /apps`) with **no** `id` (create). Do not invent a new create endpoint or ApplicationsController create. | Must | **Accepted** |
| **REQ-ACU-008** | Created applications always start as **draft** (API default). Staff create UI Must **not** offer an initial-status picker in v1 (**DEC-ACU-005**). | Must | **Accepted** |
| **REQ-ACU-009** | SPA create UX remains **1:1** primary: staff create UI Must **not** offer “add another application” for a client that already has one in v1. API 1:N (DEC-PF-011) remains out of SPA create scope (**DEC-ACU-004**). | Must | **Accepted** |
| **REQ-ACU-010** | Staff create May attach an existing `clientId` when the upsert contract already supports it (DEC-PF-011). Do not invent orphan client ids in the FE. Path B side effects (optional identity + debit helpers) Must not be documented/UX’d as identical to Path A’s single txn. | Must | **Accepted** |
| **REQ-ACU-011** | When Path B upsert response includes **`issuedClientAccess`**, staff UI Must show one-time credentials using leftover `staffCreate.*` i18n patterns (**DEC-ACU-006**). Store merge behavior already present may be reused. | Must | **Accepted** |
| **REQ-ACU-012** | Applications list empty state Must expose a create CTA: **admin/superadmin** → `/admin/apps/new`; **agent** → Clients create deep-link (not a fake apps/new). Fix the mismatch where copy mentions create but no control exists. | Must | **Accepted** |
| **REQ-ACU-013** | After successful create: **staff** navigate to application detail (`/admin/apps/:id`); **agent** keep navigate to client detail (**DEC-ACU-008**). | Must | **Accepted** |
| **REQ-ACU-014** | Keep portal-form **soft-disable** of trip subsection when `applicationId` is missing (OQ-FE-001 soft path). This feature does not reopen that policy (**DEC-ACU-008**). | Must | **Accepted** |
| **REQ-ACU-015** | Update `App.route-cut.spec.tsx` for **partial** FE5 reopen: allow admin staff create route / page wiring; continue asserting agent `/app` has no `apps/new` and do not restore cut client/owner/invite/payments/visits trees. | Must | **Accepted** |
| **REQ-ACU-016** | Follow workspace conventions: FSD slices below; `file-separation`, `react-components`, `typescript-conventions` (no `enum`; roles/statuses as unions / `as const`; explicit return types; const arrow components). | Must | **Accepted** |
| **REQ-ACU-017** | Add/adjust tests covering: (a) partial route-cut assertions, (b) role-correct empty CTA targets, (c) staff create happy-path smoke including credentials display when `issuedClientAccess` is present (mock). | Must | **Accepted** |

### Suggested FSD targets (normative naming for plan)

| Concern | Suggested home |
|---------|----------------|
| Agent create (existing) | `features/client-create`, `pages/clients` |
| Staff create (new) | `features/application-create` (or equivalent name) + admin applications page |
| Apps list empty CTAs | `pages/applications` (+ i18n keys as needed) |
| Upsert + `issuedClientAccess` typing | `entities/application` (existing upsert client / `UpsertAppResult`) |
| Store merge | `widgets/app-store` (existing `issuedClientAccess` merge — reuse, do not duplicate) |
| Routes | `app/App.tsx` — add `apps/new` under **admin** tree only |

---

## 6. Non-functional requirements

| ID | Statement |
|----|-----------|
| **NFR-ACU-001** | Auth: agent Path A gated by existing `@Roles(AGENT_ROLE)` on `POST /clients`. Staff Path B uses existing JWT upsert (no new public routes). FE Must hide staff create route from agents (admin shell RoleGuard). |
| **NFR-ACU-002** | PII / credentials: `issuedClientAccess` password/token is one-time sensitive; show once in UI; do not log credential values; do not persist plaintext secrets into analytics or long-lived local storage beyond existing store patterns. |
| **NFR-ACU-003** | No new migrations; no new Rabbit/event schemas. |
| **NFR-ACU-004** | Backwards compatibility: consume `@vises/contracts` client create + apps upsert DTOs; prefer no invent; gap only if FE typing for existing response fields is missing (additive typing only). |
| **NFR-ACU-005** | Observability: operator-safe API error copy; ids/codes only in logs. |
| **NFR-ACU-006** | Lint + build must pass for touched `apps/web` (and contracts only if additive typing lands). |
| **NFR-ACU-007** | Accessibility: create CTAs and credential dialog/panel keyboard-reachable; required fields marked accessibly. |
| **NFR-ACU-008** | Performance: single create request per submit (Path A or Path B); no N+1 invent. |

---

## 7. Constraints

| ID | Statement |
|----|-----------|
| **CON-ACU-001** | **Backend ACL change required? No.** Do not expand `POST /clients` for admin/superadmin this cycle. |
| **CON-ACU-002** | Do not add create to `ApplicationsController`. |
| **CON-ACU-003** | Do not invent new HTTP create APIs. |
| **CON-ACU-004** | Do not mount `/app/apps/new` for agents. |
| **CON-ACU-005** | Do not ship “add another application” SPA UX in v1. |
| **CON-ACU-006** | Do not allow staff-chosen initial status on create in v1. |
| **CON-ACU-007** | No migrations. |
| **CON-ACU-008** | file-separation / react-components / typescript-conventions / nestjs-structure apply to all new or edited TS/TSX in the later implementation cycle. |
| **CON-ACU-009** | Document home stays `docs/sdd/application-creation-ui/`; do not nest under unrelated SDD trees. |

### Convention notes (normative for implementers)

- **file-separation:** types → `*.types.ts`; constants → `*.constants.ts`; utils → `*.utils.ts` / domain files; one component per `.tsx`.
- **typescript-conventions:** no `enum`; roles `'admin' | 'superadmin' | 'agent'`; statuses BUSINESS union (create uses `draft`).
- **nestjs-structure:** no Nest module invent for create; consume existing clients/apps modules only.

---

## 8. Decisions and assumptions

### 8.1 Decisions

| ID | Decision | Origin | Status |
|----|----------|--------|--------|
| **DEC-ACU-001** | **Hybrid by role.** Agents → Path A (`features/client-create` / `POST /clients`). Admin/superadmin → dedicated Path B create UI (`POST /apps` upsert). Partial FE5 reopen **only** for staff `/admin/apps/new`; agent `/app` keeps no `apps/new`; apps empty CTAs for agents deep-link to Clients create. | Was OQ-ACU-001 / OQ-ACU-007; **orchestrator proposed default** after OQ-002 | **PROPOSED_DEFAULT** |
| **DEC-ACU-002** | Agents **and** admin **and** superadmin are capable of creating applications. | **Human** (2026-11-18) | **HUMAN_LOCKED** |
| **DEC-ACU-003** | **Role-split.** Agents: client-first (Path A). Staff: app-first via upsert; may attach existing `clientId` per DEC-PF-011. Do **not** expand `POST /clients` ACL this cycle. | Was OQ-ACU-003; **orchestrator proposed default** | **PROPOSED_DEFAULT** |
| **DEC-ACU-004** | SPA create UX stays **1:1** primary (closed FR-5). No “add another application” in v1 staff create; API 1:N (DEC-PF-011) out of SPA create scope. | Was OQ-ACU-004; **orchestrator proposed default** | **PROPOSED_DEFAULT** |
| **DEC-ACU-005** | Create always starts as **draft**. No staff-chosen initial status in v1. | Was OQ-ACU-005; **orchestrator proposed default** | **PROPOSED_DEFAULT** |
| **DEC-ACU-006** | If upsert returns `issuedClientAccess`, staff UI Must show one-time credentials (reuse leftover `staffCreate` i18n). | Was OQ-ACU-006; **orchestrator proposed default** | **PROPOSED_DEFAULT** |
| **DEC-ACU-007** | Covered by DEC-ACU-001 — staff `/admin/apps/new` only. | Was OQ-ACU-007; **orchestrator proposed default** | **PROPOSED_DEFAULT** |
| **DEC-ACU-008** | Keep portal-form soft-disable when no `applicationId`. Post-create navigate to application detail (staff) or client detail (agent). | Was OQ-ACU-008; **orchestrator proposed default** | **PROPOSED_DEFAULT** |

**Rationale (document):** Prefer discoverability + enabling create for all three roles over blindly restoring full FE5. Because Path A ACL is agent-only (closed FR-5), staff create requires Path B UI (or ACL expand). Safe default: Path B for staff **without** changing Path A ACL (preserves closed FR-5 SoT).

### 8.2 Assumptions (non-blocking)

| ID | Assumption |
|----|------------|
| **ASSUME-ACU-001** | Existing `@vises/contracts` upsert request/response already covers fields staff create needs for v1 (minimal create body + optional `clientId`); plan maps concrete fields without inventing wire keys. |
| **ASSUME-ACU-002** | Leftover `staffCreate.*` i18n EN/RU trees are sufficient to restore credential copy with light key reuse; wholesale copy rewrite is not required. |
| **ASSUME-ACU-003** | Admin RoleGuard (`roles={['superadmin', 'admin']}`) is sufficient to keep `/admin/apps/new` off agents; no separate route ACL invent. |
| **ASSUME-ACU-004** | Agent apps empty CTA can deep-link to the existing Clients create entry (same control/page agents already use). |

---

## 9. Route map

| Route | Who | Purpose | Change |
|-------|-----|---------|--------|
| `/app/apps` | Agent | Applications list | Empty CTA → Clients create |
| `/app/apps/:id` | Agent | Application detail | Unchanged |
| `/app/apps/new` | — | **Must not exist** | Keep absent |
| `/admin/apps` | Admin / superadmin | Applications list | Empty CTA → `/admin/apps/new` |
| `/admin/apps/new` | Admin / superadmin | Staff Path B create | **Add** |
| `/admin/apps/:id` | Admin / superadmin | Application detail | Post-create target for staff |
| Clients create (existing agent clients routes) | Agent | Path A create | Keep; target of agent apps empty CTA |

Route registration order note: `apps/new` Must be registered so it is not captured by `apps/:id` (static segment before param).

---

## 10. Data model impact

| Area | Impact |
|------|--------|
| DB / migrations | **None** |
| Client + Application rows | Created via existing Path A or Path B services only |
| Sensitive fields | `issuedClientAccess` (one-time credentials) may appear on Path B create response — FE display only |
| Contracts | Prefer consume-as-is; additive FE typing only if existing response fields lack types |
| Cardinality | API may remain 1:N (DEC-PF-011); SPA create UX 1:1 (**DEC-ACU-004**) |

---

## 11. API surface

**Backend ACL change required? No** for this cycle.

| Operation | Auth (SoT) | FE consumer | Notes |
|-----------|------------|-------------|-------|
| `POST /clients` | JWT + `@Roles(AGENT_ROLE)` only; admin/superadmin → `forbidden_role` | Agent `features/client-create` / `postClientCreate` | Path A — Client + Application `draft` + debit in one txn; returns `ClientDto` with `applicationId` |
| `POST /apps` (upsert create) | JWT / `@CurrentUser`; **no `@Roles` on upsert** | Staff `features/application-create` (new) | Path B — create when `id` missing; default `draft`; optional `issuedClientAccess`; optional existing `clientId` / staff client+debit helper |
| `DELETE /apps/:appId` | admin \| superadmin | Unchanged | Not part of create UX |
| Applications history/status | Existing | Unchanged | **No create** on ApplicationsController |

Reference contracts: `@vises/contracts` `ClientCreateDto` / `ClientDto`; apps upsert DTO + FE `UpsertAppResult` (includes optional `issuedClientAccess`).

### Error handling (operator-facing)

| Case | Expected UX |
|------|-------------|
| Agent calls `POST /clients` (happy) | Success → client detail |
| Admin/superadmin calls `POST /clients` | API `forbidden_role` — FE Must **not** use this path for staff |
| Staff Path B validation 400 | Field/form errors from API/`detail` |
| 401/403 | Existing session / forbidden handling |
| Debit / balance insufficient (Path A or Path B side effects) | Show API error; do not fake success |
| Network failure | Retryable error; retain form values |
| Upsert returns `issuedClientAccess` | Show one-time credentials before/while navigating detail (**DEC-ACU-006**) |
| Upsert without credentials | Navigate to application detail |

---

## 12. Edge cases and error handling

| Case | Expected behavior |
|------|-------------------|
| Agent opens apps list empty | CTA to Clients create; no `/app/apps/new` |
| Staff opens apps list empty | CTA to `/admin/apps/new` |
| Staff create without `clientId` | Allowed per Path B service rules; may create client/debit side effects — FE shows credentials if issued |
| Staff create with existing `clientId` | Attach per DEC-PF-011; v1 Must not pitch multi-app “add another” UX even if API allows 1:N |
| Agent bookmarks `/admin/apps/new` | Blocked by admin RoleGuard |
| Route-cut regression | Tests fail if agent `apps/new` returns or legacy cut trees reappear |
| Portal-form without `applicationId` | Trip remains soft-disabled; creation elsewhere then detail navigation supplies linkage |
| Credential dismiss without copy | Warn once if product copy already implies one-time; do not re-fetch secrets from API |

---

## 13. Out of scope

- Expanding `POST /clients` ACL for admin/superadmin
- `ApplicationsController` create endpoint
- New migrations / new Nest create modules
- Inventing create APIs or parallel FE-only wire shapes for payloads that already exist in contracts
- Full FE5 restore of agent `apps/new` / legacy `StaffCreateApplication` trees beyond staff admin route
- 1:N “add another app” SPA UX
- Staff-chosen initial status
- Changing portal-form soft-disable policy
- Production code before human approval of this package
- Event schema / RabbitMQ / deployment changes

---

## 14. Acceptance criteria

| ID | Criterion | Maps to |
|----|-----------|---------|
| **AC-ACU-001** | Agent can create via existing Clients create (Path A) and lands on client detail. | REQ-ACU-001, 002, 004, 013; DEC-ACU-001, 002 |
| **AC-ACU-002** | Admin and superadmin can open `/admin/apps/new`, submit Path B upsert create, and land on `/admin/apps/:id`. | REQ-ACU-002, 005, 007, 013; DEC-ACU-001, 002, 007 |
| **AC-ACU-003** | Agent SPA has **no** `/app/apps/new` route; route-cut tests enforce agent absence while allowing admin `apps/new`. | REQ-ACU-005, 015; DEC-ACU-001, 007 |
| **AC-ACU-004** | Staff create does **not** call `POST /clients`; agent create does **not** depend on Path B for the primary FR-5 flow. | REQ-ACU-003, 004, 007; CON-ACU-001 |
| **AC-ACU-005** | No backend ACL change to `POST /clients` ships in this cycle. | REQ-ACU-003; CON-ACU-001; DEC-ACU-003 |
| **AC-ACU-006** | Created app status is **draft**; staff create UI has no initial-status control. | REQ-ACU-008; DEC-ACU-005 |
| **AC-ACU-007** | Staff create UI has no “add another application” control in v1. | REQ-ACU-009; DEC-ACU-004 |
| **AC-ACU-008** | When mock/real upsert returns `issuedClientAccess`, credentials UI appears using `staffCreate` patterns. | REQ-ACU-011; DEC-ACU-006 |
| **AC-ACU-009** | Applications list empty state: staff CTA → `/admin/apps/new`; agent CTA → Clients create. | REQ-ACU-012 |
| **AC-ACU-010** | Portal-form trip remains soft-disabled without `applicationId`. | REQ-ACU-014; DEC-ACU-008 |
| **AC-ACU-011** | Tests for partial route-cut + role CTAs + staff create smoke (credentials case) exist and pass. | REQ-ACU-015, 017 |
| **AC-ACU-012** | Touched packages lint/build; no `enum`; one concern per new file. | REQ-ACU-016; NFR-ACU-006; CON-ACU-008 |

---

## 15. Open questions

| ID | Question | Notes |
|----|----------|-------|
| — | **None blocking.** OQ-ACU-001…008 resolved via DEC-ACU-001…008 in discovery. | Residual UI field-list for staff create form (exact inputs beyond minimal upsert) is a **plan-level** mapping under ASSUME-ACU-001, not a product OQ. |

Human may still **override** any PROPOSED_DEFAULT DEC before approving this package; until then status remains **PENDING_HUMAN_APPROVAL**.

---

## 16. Sensitive paths

| Path | Handling policy |
|------|-----------------|
| Auth / roles | Path A agent-only (`@Roles(AGENT_ROLE)`); Path B JWT upsert unchanged; FE admin shell for `/admin/apps/new` |
| Path A ACL expand | **Forbidden this cycle** (**CON-ACU-001**) |
| `issuedClientAccess` | One-time display; no logging of secrets; reuse existing store merge carefully |
| PII on create forms | Existing client/app field rules; no new public unauthenticated routes |
| Migrations | None |
| Event schemas | None |
| Public contracts | Prefer consume-as-is; additive typing only |
| Closed FR-5 SoT | Preserved by keeping Path A agent-only |

---

## 17. Affected packages

| Package / app | Touch |
|---------------|-------|
| `apps/web` | Routes, `features/application-create` (new), `features/client-create` / `pages/clients` (keep/enhance), `pages/applications` empty CTAs, i18n `staffCreate` reuse, route-cut tests, entities/application upsert usage |
| `apps/api` | **No ACL / endpoint invent** this cycle — consume as-is |
| `packages/contracts` | Prefer no change; additive typing only if gap proven |
| `docs/sdd/application-creation-ui` | This spec; plan/tasks after approval |

---

## 18. Traceability matrix (summary)

| DEC | REQs | ACs |
|-----|------|-----|
| DEC-ACU-001 | REQ-ACU-001, 005, 012, 015 | AC-ACU-001…003, 009 |
| DEC-ACU-002 | REQ-ACU-002 | AC-ACU-001, 002 |
| DEC-ACU-003 | REQ-ACU-001, 003 | AC-ACU-004, 005 |
| DEC-ACU-004 | REQ-ACU-009 | AC-ACU-007 |
| DEC-ACU-005 | REQ-ACU-008 | AC-ACU-006 |
| DEC-ACU-006 | REQ-ACU-011 | AC-ACU-008 |
| DEC-ACU-007 | REQ-ACU-005, 015 | AC-ACU-002, 003 |
| DEC-ACU-008 | REQ-ACU-013, 014 | AC-ACU-001, 002, 010 |

---

## 19. Next phase

1. **Human** approves this spec + [`04-plan.md`](./04-plan.md) / [`05-tasks.md`](./05-tasks.md) (or overrides PROPOSED_DEFAULT DECs) → status → `APPROVED` / `APPROVED_WITH_PROPOSED_DEFAULTS`.
2. Orchestrator dispatches frontend implementers for **ACU-TASK-001…005**.
3. Implementers change `apps/web` only (contracts only if a typing gap is proven).

No production code from this document alone.
