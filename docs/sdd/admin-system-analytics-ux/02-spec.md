# Spec — Admin Система / Analytics UX

| Field | Value |
|-------|-------|
| Feature id | `admin-system-analytics-ux` |
| Document home | **`docs/sdd/admin-system-analytics-ux/`** (authoritative) |
| Spec SoT | [`02-spec.md`](./02-spec.md) (this file) |
| Status | **APPROVED_WITH_PROPOSED_DEFAULTS** |
| Decision lock | **DEC-ASAU-001…007** = **PROPOSED_DEFAULT** (locked); human override rights retained |
| Human approval | **2026-11-17** — full SDD orchestration request on `feature/first-frontend` authorized proceed-under-assumption + invent/propose analytics |
| Updated | 2026-11-17 |
| Branch | `feature/first-frontend` |
| Discovery | [`00-discovery.md`](./00-discovery.md) (explorer `2c9cd70c-66b6-4ad4-83ee-b39f33d293bd`) |
| Plan | [`04-plan.md`](./04-plan.md) |
| Tasks | [`05-tasks.md`](./05-tasks.md) |

> **APPROVED_WITH_PROPOSED_DEFAULTS** on 2026-11-17. DEC-ASAU-001…007 are locked for implementation unless the human overrides a DEC.

---

## 1. Summary

Admin **Система** becomes an operational command center (compact KPIs, recent users, cities, short top-agents teaser with balance/registered/paid) and stops duplicating Analytics deep dives and «Ближайшие визиты». **Analytics** becomes the period-filtered workspace (status funnel, **«Показатели агентов»** with pagination and richer metrics, plus additional period analytics built from existing data). Users row mutation buttons are removed; agent→applications resolution is fixed via `Client.agentId`; application delete and the payment-docs tab are admin|superadmin-only; Visits filters get compact control height.

---

## 2. Actors and roles

| Actor | Role |
|-------|------|
| Admin / superadmin | Use Система and Analytics; manage applications (including delete + payment/docs); view users list (no password/disable/delete buttons in this cycle) |
| Agent | Use agent app surfaces (`/app`); may see agent-scoped analytics / own pipeline metrics where already exposed; must **not** delete applications or open «Оплата и документы» |
| Applicant / client | Not a staff actor; appears as Client / application subject data only |
| Система (OwnerHome) | Operational snapshot UI at `/admin` |
| Analytics page | Period-filtered analytical workspace at `/admin/analytics` |
| Users page | Staff user list/view/sort at admin users route |
| Application detail | Staff application editor; RBAC gates delete + payment tab |
| Visits page | Visit list filters (search + city) |

Staff role union (existing): `'superadmin' | 'admin' | 'agent'`.

---

## 3. Goal and scope

### 3.1 Goal

Clear product split between ops home and analytics; trustworthy agent performance metrics; safer ACL on money/delete surfaces; fewer false-empty agent app navigations; tighter Visits filter chrome.

### 3.2 In scope

- Система / Analytics content differentiation (**DEC-ASAU-001**).
- Rename + paginate agent performance card; align Система teaser metrics (**DEC-ASAU-002**, **DEC-ASAU-003**).
- Extend analytics agent rows with balance / registered / paid (+ paidAmount when cheap) from existing columns (**DEC-ASAU-003**).
- Propose and ship additional Analytics cards from existing data (admin + agent-scoped where applicable) (**DEC-ASAU-001**).
- Users FE cleanup (**DEC-ASAU-004**).
- Agent applications resolution fix (**DEC-ASAU-005**).
- Delete + payment-tab RBAC tighten FE + API (**DEC-ASAU-006**).
- Visits search/city compact height (**DEC-ASAU-007**).
- Contracts/API shape updates needed for agent performance fields; prefer no new DB columns/migrations.

### 3.3 Non-goals (explicit)

| Non-goal | Rationale |
|----------|-----------|
| Writing `04-plan.md` / `05-tasks.md` in this step | Orchestrator after human review |
| Production code in this documentation step | Spec-only |
| New ledger / balance mutation UX on Система or Analytics | Balance APIs already exist; this cycle is read metrics |
| Putting «Ближайшие визиты» back on Система | **DEC-ASAU-001** |
| Full duplicate clients-per-agent list on Система | Teaser ≤5 only |
| Primary money story from dashboard `paidTotal`/`unpaidTotal` on Система | Prefer Analytics deep-dive |
| Removing backend Users password/disable/delete endpoints (unless trivial) | FE removal is Must; API prune optional later |
| Server-side pagination of agent performance as v1 Must | Client-side page of 10 if API already returns full list (**DEC-ASAU-003**) |
| New DB columns for registered/paid counters | Derive from existing Client / Application / User fields |
| Broader Visits redesign beyond filter control height | **DEC-ASAU-007** only |
| BLS portal / `docs/sdd/frontend` workflow work | Separate SDD tree |

---

## 4. Baseline and traceability

| Artifact | Relation |
|----------|----------|
| `OwnerHome.tsx` / `OwnerHomeRender.tsx` | Система composition; upcoming visits block to remove |
| `OWNER_HOME_COPY` / `OWNER_HOME_TOP_AGENTS_LIMIT` | Copy + teaser size ≤5 |
| `AnalyticsPage` / `AnalyticsClientsPerAgentCard` | Rename/paginate/enrich |
| `ANALYTICS_COPY.clientsTitle` | Today «Клиенты по агентам» |
| `packages/contracts/.../analytics.types.ts` | Extend or replace clients-per-agent shape |
| `User.balance`, `paymentPaid`, `paymentAmount`, `Client.agentId` | Metric sources |
| `resolve-latest-app-id-for-user-identity.util.ts` | Email-match root cause |
| `UsersRender.tsx` row actions | Buttons to remove |
| `apps.controller.ts` `DELETE` Roles | Tighten to admin\|superadmin |
| `APPLICATION_DETAIL_TABS` payment tab | Gate by role |
| `VisitsRender.tsx` + `.field` | Height fix |
| Explorer `2c9cd70c-66b6-4ad4-83ee-b39f33d293bd` | Discovery inventory |

---

## 5. Differentiation table (Система vs Analytics)

| Concern | Система (`/admin`) | Analytics (`/admin/analytics`) |
|---------|--------------------|--------------------------------|
| Purpose | Operational command center | Period-filtered analytical workspace |
| Period filter | No Analytics `from`/`to` Apply UX required | `bookedAt` from/to (+ current totals mode) |
| Compact KPI counts | Apps / users (or agents) snapshot | Period (or current) apps / agents totals |
| Status analytics | Prefer **not** the same deep status funnel Analytics owns; at most a light operational hint if already present and not duplicative | Status funnel / status buckets over period (**Must**) |
| Agent metrics | Short **«Топ агентов»** teaser ≤5 with **balance + registered + paid** (same definitions) | Full **«Показатели агентов»** card with pagination + same metrics |
| Full clients-per-agent / agentPerformance list | **Do not** show | **Show** (paginated) |
| «Ближайшие визиты» | **Remove entirely** | Not required here; agent upcoming workload may live on agent surfaces only |
| Recent users | **Keep** | Out of scope |
| Cities overview | **Keep** (ops snapshot) | City distribution as **period analytics** card (proposed) |
| Money totals | Do **not** render dashboard `paidTotal`/`unpaidTotal` as primary analytics story; optional tiny unpaid ops hint only if already designed — prefer leave money deep-dive to Analytics | Paid volume leaderboard, unpaid vs booked, payment completeness (**proposed**) |
| Additional invented analytics | None beyond ops teaser | See §5.1 |

### 5.1 Additional Analytics (proposed; in scope)

**Admin / superadmin Analytics**

| Card / view | Data basis (existing) | Intent |
|-------------|----------------------|--------|
| Conversion / status mix over period | `AnalyticsDto.global.byStatus` (+ period filter) | Funnel / share of statuses in range |
| Booked visits vs unpaid apps | Apps with visit/booked signals vs `paymentPaid === false` in period | Ops risk / revenue follow-up |
| City distribution over period | Application city fields already used by stats/visits | Geographic mix |
| Agent leaderboard by paid volume | Sum `paymentAmount` where `paymentPaid` for apps under agent’s clients | Money ranking (decimal string display) |
| Document / payment completeness rate | `paymentPaid` (+ document fields already on app if present; if only payment flags exist, report payment completeness and label honestly) | Completeness KPI |

**Agent** (when agent hits analytics or their dashboard equivalent — **not** back onto Система)

| Card / view | Intent |
|-------------|--------|
| Own pipeline status mix | Agent-scoped `perAgent` / global-for-self |
| Own clients registered vs paid | Same metric defs, scoped to self |
| Own upcoming workload | Only on agent surfaces if already exposable; **never** reintroduce upcoming visits on Система |

---

## 6. Functional requirements

| ID | Statement | Priority | Status |
|----|-----------|----------|--------|
| **REQ-001** | Система must remain an operational command center for admin\|superadmin: keep recent users, cities overview, compact KPI counts (apps/users or equivalent snapshot), and a short top-agents teaser (≤5) showing **balance**, **registered**, and **paid** per **DEC-ASAU-003**. | Must | **Accepted** (**DEC-ASAU-001**, **DEC-ASAU-002**, **DEC-ASAU-003**) |
| **REQ-002** | Система must **remove** the «Ближайшие визиты» block entirely (no empty-state placeholder for that block). | Must | **Accepted** (**DEC-ASAU-001**) |
| **REQ-003** | Система must **not** show the same full agent-performance list or the same deep period status analytics that Analytics owns. Prefer operational snapshot over period-filtered deep dive. | Must | **Accepted** (**DEC-ASAU-001**) |
| **REQ-004** | Система must **not** render dashboard `paidTotal` / `unpaidTotal` as the primary analytics story. Optional tiny unpaid ops hint only if already designed; otherwise omit. Money deep-dive belongs on Analytics. | Must | **Accepted** (**DEC-ASAU-001**) |
| **REQ-005** | Analytics must remain a period-filtered workspace (`bookedAt` from/to / current totals) and must show status funnel / status buckets over the selected period (or current totals mode). | Must | **Accepted** (**DEC-ASAU-001**) |
| **REQ-006** | The Analytics card currently titled «Клиенты по агентам» must be renamed to **«Показатели агентов»** (Agent performance). It is the primary home for the full agent metrics list. | Must | **Accepted** (**DEC-ASAU-002**) |
| **REQ-007** | «Показатели агентов» must display per agent: **balance**, **registered**, **paid**, and **paidAmount** sum when available cheaply from existing `paymentAmount` fields; keep a clear identity column (agent id and/or display name if already available). | Must | **Accepted** (**DEC-ASAU-003**) |
| **REQ-008** | Metric definitions (normative): **balance** = `User.balance` for that agent (decimal string per existing NFR); **registered** = count of `Client` rows with `agentId` = that agent; **paid** = count of applications linked to that agent’s clients where `paymentPaid === true` (or equivalent existing flag); **paidAmount** = sum of those apps’ `paymentAmount` when exposed. Prefer compute from existing columns — no new DB columns/migrations unless proven necessary. | Must | **Accepted** (**DEC-ASAU-003**) |
| **REQ-009** | Pagination for «Показатели агентов»: **v1 = client-side pagination on FE** over the API-returned full agent array, **page size 10**. Document server-side pagination as a follow-up if lists grow. Система teaser remains ≤5, not a second paginated list. | Must | **Accepted** (**DEC-ASAU-003**) |
| **REQ-010** | Analytics must add the additional **admin** analytics listed in §5.1 (status conversion/mix, booked vs unpaid, city distribution, paid-volume leaderboard, payment/document completeness), using existing data only. | Must | **Accepted** (**DEC-ASAU-001**) |
| **REQ-010a** | Agent-scoped §5.1 variants (own pipeline / own registered vs paid / own upcoming on agent surfaces) are **deferred** to a follow-up cycle; not Must for this package. Existing agent-scoped `perAgent` / self analytics behavior may remain as-is. | Could | **Deferred** (**DEC-ASAU-008**) |
| **REQ-011** | Extend Analytics DTO (`clientsPerAgent` and/or replace with `agentPerformance[]`) so FE can render the metrics in **REQ-007** without N+1 balance round-trips from the browser. Prefer one analytics response payload. | Must | **Accepted** (**DEC-ASAU-003**) |
| **REQ-012** | Users page Must remove UI buttons **«Новый пароль»**, **«Отключить»** (and «Включить» toggle sibling), and **«Удалить»**. Keep viewing, sorting, and list. Users continue to be created via application workflow as the product path of record; do not remove backend user endpoints in this cycle unless trivial. | Must | **Accepted** (**DEC-ASAU-004**) |
| **REQ-013** | When an admin clicks an **agent** user row, the UI must not claim «нет заявок» solely because email-matched `latestAppId` is null. Resolve agent-owned applications via `Client.agentId` → applications. Preferred: navigate to applications list filtered by agent **or** open the latest owned app (latest by `updatedAt`/`createdAt`). Show the empty message only when the agent truly owns zero apps. | Must | **Accepted** (**DEC-ASAU-005**) |
| **REQ-014** | Only **admin\|superadmin** may delete an application: tighten FE visibility and API `Roles` on `DELETE /apps/:appId` (remove `agent`). | Must | **Accepted** (**DEC-ASAU-006**) |
| **REQ-015** | Only **admin\|superadmin** may block/deactivate system users at the product ACL layer (API already). FE removal of disable/delete buttons per **REQ-012** satisfies the Users UI side in this cycle. | Must | **Accepted** (**DEC-ASAU-006**, **DEC-ASAU-004**) |
| **REQ-016** | Application detail tab **«Оплата и документы»** must be visible only to **admin\|superadmin**. Agents must not see or activate that tab. | Must | **Accepted** (**DEC-ASAU-006**) |
| **REQ-017** | Visits page search input and city select must use a compact control height (fix label+input padding inconsistency with global `.field`). | Must | **Accepted** (**DEC-ASAU-007**) |
| **REQ-018** | Follow project conventions: one concern per file; no TypeScript `enum` (unions / `as const`); explicit return types on exported functions/components; Nest module boundaries; roles/statuses as string unions. | Must | **Accepted** |

---

## 7. Non-functional requirements

| ID | Statement |
|----|-----------|
| **NFR-001** | Monetary fields (`balance`, `paidAmount`, completeness rates involving money) are decimal **strings** (or existing project money helpers), never binary floats in contracts; display uses existing money formatters where present. |
| **NFR-002** | Balance / paidAmount on Analytics and Система are sensitive: expose only to admin\|superadmin on those admin pages; agent-scoped payloads may include the agent’s own balance/metrics only, never other agents’ balances. |
| **NFR-003** | No new PII fields. Do not log passwords, invite tokens, or full payment notes in analytics metrics. |
| **NFR-004** | Prefer **no migrations** / no new columns; derive metrics from `User.balance`, `Client.agentId`, `Application.paymentPaid` / `paymentAmount`. |
| **NFR-005** | Backwards compatibility: extend Analytics DTO additively where practical; if renaming `clientsPerAgent` → `agentPerformance`, keep a compatibility alias for one cycle **or** update all known FE consumers in the same change set (OwnerHome teaser + Analytics card + tests). |
| **NFR-006** | Performance: client-side page of 10 is acceptable for v1 given current full-array API; avoid extra per-row HTTP calls for balance. |
| **NFR-007** | Observability: keep / extend unit tests for analytics DTO builders, latest-app resolution for agents, and Roles on delete; no new Rabbit event schemas required. |
| **NFR-008** | Accessibility: paginated agent card remains keyboard operable; Visits controls remain labeled. |
| **NFR-009** | Lint/build gates for touched `apps/web`, `apps/api`, and `packages/contracts`. |
| **NFR-010** | Audit: deleting an application remains an existing sensitive action; ACL tighten must fail closed for agents (403). |

---

## 8. Constraints

| ID | Statement |
|----|-----------|
| **CON-001** | Do not reintroduce «Ближайшие визиты» on Система. |
| **CON-002** | Do not invent new DB columns for registered/paid without proving existing fields insufficient. |
| **CON-003** | Do not weaken Roles below admin\|superadmin for application delete or payment-docs tab visibility. |
| **CON-004** | Do not remove Users list viewing/sorting as part of cleanup. |
| **CON-005** | Document home stays `docs/sdd/admin-system-analytics-ux/`; do not nest under `docs/sdd/frontend`. |
| **CON-006** | file-separation / react-components / typescript-conventions / nestjs-structure rules apply to all new or edited TS/TSX in the later implementation cycle. |
| **CON-007** | Server pagination of agent performance is out of scope for v1 Must (follow-up note only). |

### Convention notes (normative for implementers)

- **file-separation:** copy → `*.constants.ts`; types → `*.types.ts`; utils separate; one component per `.tsx`.
- **typescript-conventions:** no `enum`; roles remain `'admin' \| 'superadmin' \| 'agent'`.
- **nestjs-structure:** analytics/stats/users/apps/balance stay in their modules; shared helpers in `src/shared` when cross-cutting.

---

## 9. Decisions and assumptions

### 9.1 Proposed-default decisions (locked unless human overrides)

| ID | Decision | Status |
|----|----------|--------|
| **DEC-ASAU-001** | **Система** = operational command center (recent users, cities, compact KPIs, ≤5 top-agents teaser with balance/registered/paid). **Remove** «Ближайшие визиты». **Do not** duplicate Analytics’ full agent list or deep status analytics. **Do not** use dashboard paid/unpaid totals as primary money story. **Analytics** = period-filtered workspace with status funnel, «Показатели агентов», and additional §5.1 analytics. Agent upcoming workload only on agent surfaces. | **PROPOSED_DEFAULT** |
| **DEC-ASAU-002** | Rename «Клиенты по агентам» → **«Показатели агентов»**. Full card lives on Analytics with pagination. Система keeps a short top-agents teaser aligned to the same metric definitions. | **PROPOSED_DEFAULT** |
| **DEC-ASAU-003** | Metric defs: **balance** = `User.balance`; **registered** = Client count by `agentId`; **paid** = apps under those clients with `paymentPaid === true`; expose **paidAmount** sum if cheap. Extend DTO / replace `clientsPerAgent` with richer agent performance rows. **v1 pagination = FE client-side, page size 10**; server pagination is a follow-up. Prefer existing columns — avoid migrations. | **PROPOSED_DEFAULT** |
| **DEC-ASAU-004** | Remove Users UI buttons «Новый пароль», «Отключить», «Удалить». Keep list/view/sort. Do not require backend endpoint deletion this cycle. | **PROPOSED_DEFAULT** |
| **DEC-ASAU-005** | Fix agent empty-apps false-negative: resolve via `clients.agent_id` join to applications; pick latest by `updatedAt`/`createdAt` when deep-linking; or navigate to applications filtered by agent. Empty message only when truly zero owned apps. | **PROPOSED_DEFAULT** |
| **DEC-ASAU-006** | Only admin\|superadmin: delete application (FE + API Roles); block/deactivate users (API already; FE buttons removed per DEC-ASAU-004); «Оплата и документы» tab visible only to admin\|superadmin. | **PROPOSED_DEFAULT** |
| **DEC-ASAU-007** | Visits search + city select use compact control height (fix `.field` / label padding inconsistency). | **PROPOSED_DEFAULT** |
| **DEC-ASAU-008** | Agent-scoped §5.1 analytics variants are **out of Must scope** this cycle (REQ-010a deferred). Admin Analytics §5.1 remains Must. | **PROPOSED_DEFAULT** |
| **DEC-ASAU-009** | Exact `AnalyticsDto` §5.1 field names (locked for contracts): keep `clientsPerAgent` (additive metrics); add `bookedVsUnpaid: AnalyticsBookedVsUnpaidDto`; `cityDistribution: AnalyticsCityBucketDto[]`; `paymentCompleteness: AnalyticsPaymentCompletenessDto`; `paidVolumeByAgent: AnalyticsPaidVolumeAgentDto[]`. Status mix continues via existing `global.byStatus`. | **PROPOSED_DEFAULT** |

### 9.2 Assumptions (non-blocking)

| ID | Assumption |
|----|------------|
| **ASSUME-ASAU-001** | Current Analytics API returns the full `clientsPerAgent` array at modest seed volumes, so client-side paging is acceptable for v1. |
| **ASSUME-ASAU-002** | «Document completeness» may degrade to **payment completeness** if document-presence fields are incomplete; card title/copy must match what is actually measured. |
| **ASSUME-ASAU-003** | «Ссылка» (invite link copy) on Users may remain unless product later asks to remove it; not named in DEC-ASAU-004. |
| **ASSUME-ASAU-004** | «Новый пользователь» create dialog may remain in this cycle unless product later forbids all user creation from Users; DEC-ASAU-004 names only the three row buttons. |
| **ASSUME-ASAU-005** | Agent dashboard `/app` may already show upcoming visits; removing them from Система does not require removing them from agent surfaces. |

---

## 10. Data model impact

| Item | Change |
|------|--------|
| `User.balance` | Read-only for metrics; no schema change |
| `Client.agentId` | Ownership join for registered + agent apps resolution |
| `Application.paymentPaid` / `paymentAmount` | Source for paid count / paidAmount |
| New columns / migrations | **None expected** |
| Sensitive fields newly surfaced on Analytics DTO | `balance`, `paidAmount` (admin analytics; agent self-scope only for agents) |

---

## 11. API surface

| Surface | Change | Auth |
|---------|--------|------|
| `GET /stats/roles-applications` (`AnalyticsDto`) | Extend `clientsPerAgent` additively: `balance`, `registered`, `paid`, `paidAmount`. Add §5.1 fields per **DEC-ASAU-009**: `bookedVsUnpaid`, `cityDistribution`, `paymentCompleteness`, `paidVolumeByAgent`. Period filter unchanged (`from`/`to` on `bookedAt`). | Existing staff analytics ACL; agent-scoped responses must not leak other agents’ balances |
| `GET /stats/dashboard` | No Must change; Система stops consuming `upcomingVisits` in UI. Money fields remain unused as primary story. | admin\|superadmin as today |
| Users list / `latestAppId` resolution | Fix agent path via clients.agentId → applications (API and/or coordinated FE). | admin\|superadmin |
| `DELETE /apps/:appId` | Roles **admin\|superadmin only** (remove `agent`). | Jwt + Roles |
| Payments / payment fields on `POST /apps` | No new endpoints required; FE hides payment tab from agents. Backend write ACL for payment fields should fail closed for agents if not already (if currently writable by agents, tighten to match tab policy or record as follow-up — see OQ). | admin\|superadmin for payment-docs UX |
| Balance mutate APIs | Unchanged | Existing |

### Error responses

| Case | Expected |
|------|----------|
| Agent calls `DELETE /apps/:appId` | **403** Forbidden |
| Agent opens payment tab deep-link | Tab absent; no payment panel; no silent privilege |
| Agent user with zero owned apps | Empty message allowed |
| Agent user with owned apps but null email-match `latestAppId` | Must still navigate / resolve successfully |

Reference contracts: `packages/contracts` analytics (+ balance decimal-string NFR). Prefer updating shared DTO types rather than inventing parallel FE-only shapes for API payloads.

---

## 12. Edge cases and error handling

| Case | Expected behavior |
|------|-------------------|
| Agent with clients but no applications | registered > 0, paid = 0; empty-apps message only for apps navigation |
| Agent with many apps | Latest by updatedAt/createdAt when deep-linking; or filtered apps list |
| Analytics empty period | Existing empty states; pagination hidden or disabled |
| Agent performance list length ≤ 10 | Single page; no confusing pager |
| Система analytics fetch fails | Existing error copy; do not invent fake metrics |
| Non-admin staff on Users | Unchanged route protection; removed buttons simply absent |
| Agent on application detail | No delete control; no payment tab; other tabs as today |
| paidAmount null/undefined on unpaid apps | Treat as 0 in sums |
| Balance missing on non-agent users | Not shown in agent performance rows |

---

## 13. Out of scope

- `04-plan.md` / `05-tasks.md` (deferred)
- Production code in this documentation step
- New migrations / new ledger tables
- Server-side agentPerformance pagination (follow-up)
- Removing Users create dialog / invite «Ссылка» (unless product later expands DEC-ASAU-004)
- Rebuilding agent `/app` home beyond §5.1 agent analytics notes
- Event schema / RabbitMQ changes
- Deployment config changes
- BLS portal SDD work

---

## 14. Acceptance criteria

| ID | Criterion | Maps to |
|----|-----------|---------|
| **AC-001** | Система shows recent users, cities, compact KPIs, and ≤5 top agents with balance/registered/paid; does **not** show «Ближайшие визиты». | REQ-001, REQ-002, DEC-ASAU-001 |
| **AC-002** | Система does not render the full «Показатели агентов» list. Система must **remove or demote** any Analytics-parity deep status funnel/breakdown card (e.g. `OwnerHomeStatusBreakdownCard` fed from analytics `byStatus`) so it is not the same deep period status analytics Analytics owns; at most a light ops KPI hint is allowed. | REQ-003, DEC-ASAU-001 |
| **AC-003** | Система does not present dashboard paidTotal/unpaidTotal as the main money analytics story. | REQ-004 |
| **AC-004** | Analytics shows status buckets for the selected period/mode and a card titled **«Показатели агентов»**. | REQ-005, REQ-006, DEC-ASAU-002 |
| **AC-005** | Each agent performance row shows balance, registered, paid (and paidAmount when exposed); definitions match REQ-008. | REQ-007, REQ-008, DEC-ASAU-003 |
| **AC-006** | «Показатели агентов» paginates client-side with page size 10 when more than 10 agents are returned. | REQ-009 |
| **AC-007** | Analytics includes the §5.1 **admin** additional cards for `bookedVsUnpaid`, `cityDistribution`, `paymentCompleteness`, `paidVolumeByAgent` (plus existing status mix via `global.byStatus`). Agent §5.1 variants are not required this cycle (**DEC-ASAU-008**). | REQ-010, DEC-ASAU-008, DEC-ASAU-009 |
| **AC-008** | Analytics API/DTO supplies the richer agent metrics without requiring the browser to N+1 balance endpoints for the table. | REQ-011 |
| **AC-009** | Users row UI no longer offers «Новый пароль», «Отключить»/«Включить», or «Удалить»; list/view/sort still work. | REQ-012, DEC-ASAU-004 |
| **AC-010** | Clicking an agent who owns apps via `Client.agentId` never shows the false «нет заявок» empty solely due to email mismatch; empty only when zero owned apps. | REQ-013, DEC-ASAU-005 |
| **AC-011** | Agent cannot delete an application (FE hidden + API 403); admin\|superadmin can. | REQ-014, DEC-ASAU-006 |
| **AC-012** | «Оплата и документы» tab visible only to admin\|superadmin. | REQ-016, DEC-ASAU-006 |
| **AC-013** | Visits search and city controls render at a compact, consistent height (no tall label+`.field` mismatch). | REQ-017, DEC-ASAU-007 |
| **AC-014** | No new DB migration required for metric counters; roles/statuses remain unions / `as const` (no `enum`). | REQ-008, REQ-018, NFR-004 |

---

## 15. Open questions

Residual / non-blocking for accepted REQs (PROPOSED_DEFAULT DECs already choose a path):

| ID | Question | Notes |
|----|----------|-------|
| **OQ-ASAU-001** | Agent row click: prefer **filtered applications list** vs **latest owned app deep-link** as the default UX? | Both satisfy REQ-013; plan may pick one. |
| **OQ-ASAU-002** | Keep Users **«Ссылка»** and **«Новый пользователь»** create dialog in this cycle? | ASSUME-ASAU-003/004 say yes; human may expand cleanup. |
| **OQ-ASAU-003** | If agents can still **write** payment fields via `POST /apps` today, tighten API write ACL in the same cycle as the tab hide? | Tab hide is Must; write ACL parity recommended — confirm if not already restricted. |
| **OQ-ASAU-004** | Exact Russian labels for new §5.1 Analytics cards. | Copy can be finalized in plan/UI without reopening metric DECs. |
| **OQ-ASAU-005** | Additive fields on `clientsPerAgent` vs new `agentPerformance[]` field name. | **Closed** by **DEC-ASAU-009** (additive on `clientsPerAgent`). |

No accepted Must REQ depends on an unresolved product blocker. Critical DECs are locked as **PROPOSED_DEFAULT** / **APPROVED_WITH_PROPOSED_DEFAULTS**.

---

## 16. Sensitive paths

| Path | Handling |
|------|----------|
| Auth / roles | JwtAuthGuard + RolesGuard; delete + payment tab = admin\|superadmin only (**DEC-ASAU-006**) |
| User block/deactivate | API already admin\|superadmin; FE buttons removed (**DEC-ASAU-004**) |
| Balance / money | Decimal strings; admin Analytics/Система teaser; agent sees only own scope; do not log ledger secrets |
| Application delete | Fail closed for agents (403) |
| Migrations | None expected; flag if implementer discovers need |
| PII | No new PII; Users list still shows emails/logins as today |
| Event schemas | None |
| Public contracts (`packages/contracts`) | Analytics DTO extension is a public contract change — version carefully / update consumers in same PR |
| Users password reissue | UI removed; endpoint may remain unused this cycle |

---

## 17. Affected packages

| Package / app | Touch |
|---------------|-------|
| `apps/web` | owner-home, analytics, users, application-detail, visits (+ entities/utils as needed) |
| `apps/api` | analytics (DTO build), users (latestAppId / agent ownership), apps (delete Roles), possibly stats unused fields only |
| `packages/contracts` | Analytics agent performance types |
| `docs/sdd/admin-system-analytics-ux` | This package |

---

## 18. Traceability matrix (summary)

| DEC | REQs | ACs |
|-----|------|-----|
| DEC-ASAU-001 | REQ-001…005, REQ-010 | AC-001…004, AC-007 |
| DEC-ASAU-002 | REQ-001, REQ-006 | AC-001, AC-004 |
| DEC-ASAU-003 | REQ-007…009, REQ-011 | AC-005, AC-006, AC-008, AC-014 |
| DEC-ASAU-004 | REQ-012, REQ-015 | AC-009 |
| DEC-ASAU-005 | REQ-013 | AC-010 |
| DEC-ASAU-006 | REQ-014…016 | AC-011, AC-012 |
| DEC-ASAU-007 | REQ-017 | AC-013 |
