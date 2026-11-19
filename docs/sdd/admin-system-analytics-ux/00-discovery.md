# Discovery — Admin Система / Analytics UX

| Field | Value |
|-------|-------|
| Feature id | `admin-system-analytics-ux` |
| Updated | 2026-11-17 |
| Branch | `feature/first-frontend` |
| Explorer | `2c9cd70c-66b6-4ad4-83ee-b39f33d293bd` |
| Artifact home | **`docs/sdd/admin-system-analytics-ux/`** (`specs/` tree **not present** in this workspace) |
| Confidence | high |

## Goal (product request)

1. Differentiate **Система** (`/admin` OwnerHome) from **Analytics** (`/admin/analytics`): operational snapshot vs period-filtered deep dive.
2. Enrich agent metrics with **balance**, **registered** (clients under agent), **paid** (paid apps via agent’s clients); rename «Клиенты по агентам» → **«Показатели агентов»** with pagination on Analytics; keep short top-agents teaser on Система.
3. Remove Users row actions «Новый пароль», «Отключить», «Удалить»; keep list/view/sort.
4. Fix Users → agent applications false-negative («нет заявок» when agent owns clients via `Client.agentId`).
5. RBAC: only admin|superadmin may delete applications and see «Оплата и документы»; user block stays admin|superadmin (API already; FE removes buttons).
6. Visits: reduce search input / city select height inconsistency.

## Current state (evidence)

### Система — OwnerHome (Fact)

- Route: `/admin` index → `OwnerHome` (`apps/web/src/pages/owner-home/OwnerHome.tsx`).
- Loads **both**:
  - `GET /stats/dashboard` → operational lists (`recentUsers`, `upcomingVisits`, `cities`, counts including `paidTotal`/`unpaidTotal`).
  - `GET /stats/roles-applications` → Analytics DTO (`global`, `clientsPerAgent`) for KPIs, status breakdown, top agents.
- Copy title `Система` in `owner-home-copy.constants.ts`.
- Renders: KPI summary, status breakdown, top agents (limit **5** via `OWNER_HOME_TOP_AGENTS_LIMIT`), recent users, **«Ближайшие визиты»**, cities.
- FE comment on `OwnerDashboardStatsOut`: do **not** render money fields (`paidTotal`/`unpaidTotal`) as the primary story on Система.

### Analytics page (Fact)

- Route: `/admin/analytics` → `AnalyticsPage`.
- Same Analytics API with optional `bookedAt` `from`/`to` (`AnalyticsQueryDto`).
- Shows status buckets + full `clientsPerAgent` as **«Клиенты по агентам»** (`analytics-copy.constants.ts`).
- **No pagination** — full array rendered (`AnalyticsClientsPerAgentCard.tsx`).

### Analytics / stats backend (Fact)

- Module: `apps/api/src/modules/analytics/` — joins applications ↔ `clients.agent_id`; builds `perAgent`, `global`, `clientsPerAgent`.
- Contracts: `packages/contracts/src/types/analytics.types.ts` — `AnalyticsClientsPerAgentDto` is `{ agentId, count, percentage }` only (no balance / paid / registered).
- Module: `apps/api/src/modules/stats/` — `OwnerDashboardStatsOut` includes `upcomingVisits`, money totals, recent users, cities.
- Agent ownership for analytics is via **`Client.agentId`**, not an `agentId` on Application.

### Balance (Fact)

- `User.balance` column (`user.entity.ts`); ledger `balance_transactions`.
- API: `balance.controller.ts` — admin|superadmin top-up/adjust; agent self-read.
- Contracts: `BalanceTopUpDto`, `BalanceAdjustDto`, `BalanceTransactionDto`; `UserMeDto.balance`.
- **`UserOut` / users list omit `balance`.**
- No dedicated `features/balance-*` FE slices found in working tree (architecture.md mentions may be stale).

### Payments (Fact)

- No separate `payments` Nest module; `PaymentsController` under `apps` module (`GET /payments`, roles admin|superadmin|agent).
- Application fields: `paymentPaid`, `paymentAmount`, `paymentNote`.

### Users → applications navigation bug (Fact)

- Users row click uses `latestAppId`; if null and role `agent`, shows `USERS_NO_APPS_MESSAGE` («У этого пользователя пока нет заявок.») — `Users.tsx` + `users-list.constants.ts`.
- Resolution matches **`application.clientEmail` == user email/login**, not `clients.agent_id`:
  - API: `resolve-latest-app-id-for-user-identity.util.ts`
  - FE mirror: `entities/application/utils/resolve-latest-app-id-for-user.util.ts`
- Agents who own clients via `agentId` but whose email is not the application `clientEmail` get a false empty message.

### Users page actions (Fact)

- Row actions in `UsersRender.tsx`: «Ссылка», **«Новый пароль»**, **«Отключить»/«Включить»**, **«Удалить»**.
- Create dialog «Новый пользователь» also present.
- Route is admin-oriented; API `PATCH`/`DELETE /users` already RolesGuard admin|superadmin.

### Application delete + payment tab (Fact)

- FE: «Удалить» always shown on application detail (`ApplicationDetailRender.tsx`).
- API: `DELETE /apps/:appId` Roles `admin|superadmin|agent` (`apps.controller.ts`); service has no further role check.
- Tab **«Оплата и документы»** always in `APPLICATION_DETAIL_TABS` — no FE role gate.

### Roles (Fact)

- Staff: `StaffRole = 'superadmin' | 'admin' | 'agent'` (contracts). No staff role `applicant` (applicants ≈ clients).
- Shell: admin/superadmin → `/admin`; agent → `/app`.

### Visits control height (Fact)

- `VisitsRender.tsx`: search is `<label className="field … py-0">` + input `py-[11px]`; city is `<select className="field">`.
- Global `.field` padding `11px 13px` in `apps/web/src/index.css` → tall / inconsistent controls.

### Prior SDD / specs (Fact)

- Workspace has **no `specs/` tree**.
- No existing `docs/sdd/*application-status*` / `*admin-ux*` / dedicated analytics feature folder.
- ASAU references appear in code comments only (e.g. ASAU-011).
- Related: `docs/sdd/date-range-picker/` (Analytics period picker).
- Historical pointer in `docs/sdd/README.md` to closed `specs/roles-and-applications*` — paths missing here.

## Gap matrix

| Area | Today | Target |
|------|-------|--------|
| Система vs Analytics | Overlapping status + clients-per-agent from same Analytics DTO; Система also shows upcoming visits + money fields available but discouraged | Система = ops snapshot (recent users, cities, compact KPIs, ≤5 top agents with balance/registered/paid); **no** upcoming visits; no full agent list / deep status parity. Analytics = period-filtered funnel + «Показатели агентов» + additional period analytics |
| Agent card title | «Клиенты по агентам» / «Топ агентов по клиентам» | Analytics: **«Показатели агентов»** (paginated). Система: short «Топ агентов» teaser aligned to same metrics |
| Agent metrics | `count` + `percentage` clients only | `balance`, `registered`, `paid` (+ paidAmount if cheap) from existing columns |
| Pagination | None on clientsPerAgent | v1 **client-side** page size **10** if API still returns full array; note server pagination follow-up |
| Users actions | Новый пароль / Отключить / Удалить | Remove those three UI buttons; keep viewing/sorting/list |
| Agent apps discovery | Email match only → false empty | Resolve via `clients.agent_id` → applications; latest by updatedAt/createdAt |
| Delete app ACL | API+FE allow agent | admin\|superadmin only (FE + API) |
| Payment tab | Ungated on FE | Visible only to admin\|superadmin |
| Visits filters | Tall / inconsistent `.field` padding | Compact control height |

## Affected areas

| Area | Package / path | Role |
|------|----------------|------|
| Система | `apps/web/src/pages/owner-home/**` | Remove upcoming; reshape KPIs/top agents |
| Analytics | `apps/web/src/pages/analytics/**` | Rename, paginate, richer metrics, new cards |
| Analytics API + contracts | `apps/api/src/modules/analytics/**`, `packages/contracts/.../analytics.types.ts` | Extend agent performance DTO |
| Owner dashboard API | `apps/api/src/modules/stats/**` | May still supply lists; upcoming unused on Система FE |
| Users | `apps/web/src/pages/users/**`, `apps/api/src/modules/users/**` | Action cleanup + latestAppId fix |
| Application detail + apps delete | `apps/web/src/pages/application-detail/**`, `apps/api/src/modules/apps/**` | RBAC tighten |
| Balance (read for metrics) | `apps/api/src/modules/balance/**`, `User.balance` | Existing data; compute into analytics DTO |
| Visits | `apps/web/src/pages/visits/VisitsRender.tsx`, `index.css` | Control height |
| Nav | `widgets/shell` | Labels already Система / Analytics |

## Risks

1. **False empty agent apps** remains if only FE is patched but API `latestAppId` still email-only (or vice versa).
2. **Система/Analytics overlap** persists if status breakdown or full agent list stays on both pages.
3. **Contracts churn**: extending `clientsPerAgent` (or replacing with `agentPerformance[]`) affects agent-scoped analytics responses and tests.
4. **Monetary exposure**: surface `balance` / `paidAmount` only to roles that already may see money (admin|superadmin on Система/Analytics; agent self-scope only).
5. **Delete ACL tightening** is a breaking behavior change for agents who can delete today.
6. Removing Users mutation buttons without removing create dialog may leave «Новый пользователь» — confirm product intent (see OQs if create stays).

## Artifact home

Authoritative: `docs/sdd/admin-system-analytics-ux/`  
Do **not** invent a `specs/` tree for this feature; align with other live packages under `docs/sdd/<feature>/`.
