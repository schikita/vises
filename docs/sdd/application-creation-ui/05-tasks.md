# Tasks index — application-creation-ui

| Field | Value |
|-------|-------|
| Feature id | `application-creation-ui` |
| Status | **DONE** (all ACU-TASK-001…005 architecture OKAY + code OKAY) |
| Date | 2026-11-18 |
| Spec SoT | [`02-spec.md`](./02-spec.md) |
| Plan | [`04-plan.md`](./04-plan.md) |

## Execution order

| ID | Title | Owner | Depends | Status | Arch | Code |
|----|-------|-------|---------|--------|------|------|
| ACU-TASK-001 | Apps list empty CTAs (role-correct discoverability) | frontend | — | **DONE** | OKAY | OKAY |
| ACU-TASK-002 | Staff Path B create feature (`features/application-create`) | frontend | — | **DONE** | OKAY | OKAY |
| ACU-TASK-003 | Admin route `/admin/apps/new` + partial FE5 route-cut | frontend | 002 | **DONE** | OKAY | OKAY |
| ACU-TASK-004 | `issuedClientAccess` one-time credentials UX | frontend | 002 | **DONE** | OKAY | OKAY |
| ACU-TASK-005 | Integration smoke: CTAs + create + credentials + route-cut | frontend | 001, 003, 004 | **DONE** | OKAY | OKAY |

Parallel after approval: **001 ∥ 002**; then **003 ∥ 004**; then **005**.

## Hard constraints (all tasks)

- One concern per file; one component per `.tsx`
- No `enum`; explicit return types; const arrow components
- No `POST /clients` ACL expand; staff Must not call Path A create
- No migrations; no new Nest create endpoints
- No agent `/app/apps/new`
- No staff initial-status picker; no “add another application” in v1
- Sensitive: credential display (**ACU-TASK-004**) — no secret logging

---

## ACU-TASK-001 — Apps list empty CTAs (role-correct discoverability)

| Field | Value |
|-------|-------|
| **id** | `ACU-TASK-001` |
| **title** | Role-correct Applications empty-state create CTAs |
| **owner_layer** | `apps/web` → `pages/applications` + `shared/i18n` |
| **depends_on** | none |
| **sensitive_paths** | none (navigation only) |

### Acceptance criteria

- [ ] Admin/superadmin empty state exposes CTA → `/admin/apps/new` (link may 404 until TASK-003; prefer relative admin apps create path)
- [ ] Agent empty state exposes CTA → existing Clients create entry (deep-link under `/app/clients` create UX — same control agents already use)
- [ ] Copy no longer promises create without a control (**REQ-ACU-012**, **AC-ACU-009**)
- [ ] One concern per file; i18n keys for CTA labels if missing
- [ ] Unit/component test asserts role → target mapping

### Verification commands

```bash
pnpm --filter @vises/web run lint
pnpm --filter @vises/web exec vitest run src/pages/applications
```

---

## ACU-TASK-002 — Staff Path B create feature

| Field | Value |
|-------|-------|
| **id** | `ACU-TASK-002` |
| **title** | New `features/application-create` Path B form (minimal fields) |
| **owner_layer** | `apps/web` → `features/application-create` (+ page compose under applications pages) |
| **depends_on** | none |
| **sensitive_paths** | Create form may collect client email (PII) — no secret logging |

### Acceptance criteria

- [ ] New FSD feature `features/application-create` with separated types / constants / utils / components (file-separation)
- [ ] Form fields per plan §3: required `clientEmail`; optional `clientId`; **no** status picker; **no** multi-app add
- [ ] Submit calls existing upsert path (`POST /apps` via store/`toAppUpsertPayload`) with **no** `id`
- [ ] Does **not** import or call `postClientCreate` / `POST /clients`
- [ ] Loading / validation / API error states with operator-safe copy
- [ ] Reuses `staffCreate.*` title/field strings where they match (**ASSUME-ACU-002**)
- [ ] Happy-path unit/smoke test with mocked upsert

### Verification commands

```bash
pnpm --filter @vises/web run lint
pnpm --filter @vises/web exec vitest run src/features/application-create
```

---

## ACU-TASK-003 — Admin route + partial FE5 route-cut

| Field | Value |
|-------|-------|
| **id** | `ACU-TASK-003` |
| **title** | Mount `/admin/apps/new` and update route-cut for partial FE5 reopen |
| **owner_layer** | `apps/web` → `app/App.tsx`, `App.route-cut.spec.tsx`, applications page entry |
| **depends_on** | `ACU-TASK-002` |
| **sensitive_paths** | Route ACL relies on admin `RoleGuard` — do not mount under `/app` |

### Acceptance criteria

- [ ] Admin tree registers `apps/new` **before** `apps/:id`, rendering staff create page
- [ ] Agent `/app` tree still has **no** `apps/new`
- [ ] On successful create (without blocking credentials step): navigate to `/admin/apps/:id` (**DEC-ACU-008**)
- [ ] `App.route-cut.spec.tsx` updated: allow admin staff create wiring; continue forbidding agent `apps/new` and other FE5 cut trees (**REQ-ACU-015**, **AC-ACU-003**)
- [ ] Comment in `App.tsx` updated to describe partial reopen (admin only)

### Verification commands

```bash
pnpm --filter @vises/web run lint
pnpm --filter @vises/web exec vitest run src/app/App.route-cut.spec.tsx
```

---

## ACU-TASK-004 — issuedClientAccess credentials UX

| Field | Value |
|-------|-------|
| **id** | `ACU-TASK-004` |
| **title** | Show one-time credentials when Path B returns `issuedClientAccess` |
| **owner_layer** | `apps/web` → `features/application-create` (+ reuse store merge) |
| **depends_on** | `ACU-TASK-002` |
| **sensitive_paths** | One-time passwords/tokens — **no logging of secrets**; human-visible ACK on review |

### Acceptance criteria

- [ ] When upsert result includes `issuedClientAccess`, UI shows login/password (and copy helpers) using leftover `staffCreate.*` patterns (**DEC-ACU-006**, **AC-ACU-008**)
- [ ] Reuses `widgets/app-store` merge behavior; do not invent a second credential store
- [ ] Operator can proceed to application detail after viewing/dismissing (**goToApp** / equivalent)
- [ ] No credentials UI when response omits `issuedClientAccess`
- [ ] Test covers mock response with and without credentials
- [ ] No `console.log` / telemetry of password values

### Verification commands

```bash
pnpm --filter @vises/web run lint
pnpm --filter @vises/web exec vitest run src/features/application-create
```

---

## ACU-TASK-005 — Integration smoke (CTAs + create + credentials + route-cut)

| Field | Value |
|-------|-------|
| **id** | `ACU-TASK-005` |
| **title** | Cross-slice smoke covering AC-ACU package |
| **owner_layer** | `apps/web` → tests spanning pages/features/app |
| **depends_on** | `ACU-TASK-001`, `ACU-TASK-003`, `ACU-TASK-004` |
| **sensitive_paths** | none beyond credential mock (no real secrets) |

### Acceptance criteria

- [ ] Tests cover: role CTA targets; admin create happy path → detail; credentials branch; agent has no `apps/new`; portal-form soft-disable policy untouched (no regression edit required unless accidentally changed)
- [ ] `pnpm --filter @vises/web run lint` / `test` / `build` pass for the touched surface
- [ ] AC-ACU-001…012 satisfied or explicitly deferred with human note (none expected deferred)

### Verification commands

```bash
pnpm --filter @vises/web run lint
pnpm --filter @vises/web run test
pnpm --filter @vises/web run build
```
