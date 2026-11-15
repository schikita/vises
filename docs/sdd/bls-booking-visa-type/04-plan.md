# Phase 4 — Execution plan

| Field | Value |
|-------|-------|
| Feature id | `bls-booking-visa-type` |
| Status | **READY_FOR_REVIEW** (Phase A/B VT-TASK-001…010+012 DONE; VT-TASK-011 DEFERRED; DEC/OQ approved 2026-11-14) |
| Date | 2026-11-14 |
| Spec | [`02-spec.md`](./02-spec.md) |
| Architecture | [`01-target-architecture.md`](./01-target-architecture.md) |
| Database | [`02-database.md`](./02-database.md) |
| Tasks | [`05-tasks.md`](./05-tasks.md) + [`tasks/`](./tasks/) |

**Phase 7 gate cleared:** DEC-001…008 and OQ-001…007 accepted defaults stamped 2026-11-14 (`product owner continue`). Submit allowlist (VT-TASK-007) unblocked. DEC-003 = Option A reuse — if VT-TASK-001 finds columns missing, **stop and report** (do not invent migration).

---

## 1. Goal & measurable acceptance

From Ready To Book: email DP consent → Visa Type Selection fill → Submit → captcha probe → slots-unavailable first-class branch (or staff on unknown-next), without Premium/payment automation. Matches AC-01…AC-10.

---

## 2. Strategy

1. **Policy + types** — document DEC; booking checkpoint types; classifier allowlist prep.
2. **Mail consent** — TemporaryEmailProvider subject/link extract + consent step.
3. **Selectors + Attention + Family** — extend PORTAL_BOOKING_SELECTORS; wire Attention; Family modal helper.
4. **Fill** — Sub Type / Members / Category Prefer Normal.
5. **Submit + captcha + slots** — revise safe-stop pipeline; wire captcha; slots detector.
6. **Terminal / advance** — stop open-UI-as-success; staff on unknown-next.
7. **Verification sweep** — lint/build; static no-payment; optional fixture scripts.

Prefer evolving booking fill pipeline over a new orchestrator.

---

## 3. DAG

```
VT-TASK-001 (checkpoint persistence — human gate if migration)
   └─► VT-TASK-002 (booking checkpoint types + persist helpers)
          ├─► VT-TASK-003 (mail subject wait + consent link extract)     ← may ∥ 004 after 002 if files disjoint
          └─► VT-TASK-004 (selectors + Attention + Family helpers)
                 └─► VT-TASK-005 (extended form fill + Prefer Normal)
                        └─► VT-TASK-006 (email consent step wired into BOOK client)
                               └─► VT-TASK-007 (Submit allowlist + click Submit)  ← needs DEC-001
                                      └─► VT-TASK-008 (post-submit captcha probe/solve)
                                             └─► VT-TASK-009 (slots-unavailable detector + Try Again)
                                                    └─► VT-TASK-010 (advance/terminal policy + classifier finalize)
                                                           └─► VT-TASK-012 (verification sweep)

VT-TASK-011 (Phase C SPA stuck summary) — optional; after 002
```

| Order | ID | Title | Depends | Phase |
|------|-----|-------|---------|-------|
| 1 | VT-TASK-001 | Booking checkpoint persistence (reuse or migrate) | Human DEC-003 | A |
| 2 | VT-TASK-002 | Checkpoint types + load/save | 001 | A |
| 3 | VT-TASK-003 | Mail subject filter + DP consent href extract | 002 | A |
| 4 | VT-TASK-004 | Selectors + Attention + Family helpers | 002 | A |
| 5 | VT-TASK-005 | Extended Visa Type form fill | 004 | A |
| 6 | VT-TASK-006 | Wire email consent before booking entry | 003, 005 | A |
| 7 | VT-TASK-007 | Submit automation + classifier allowlist | 006, **DEC-001** | B |
| 8 | VT-TASK-008 | Captcha probe after submit | 007 | B |
| 9 | VT-TASK-009 | Slots unavailable + Try Again | 008 | B |
| 10 | VT-TASK-010 | Terminal/advance + unsafe classifier finalize | 009 | B |
| 11 | VT-TASK-011 | Optional SPA mid-booking summary | 002 | C |
| 12 | VT-TASK-012 | Lint/build/regression sweep | 010 | B |

**First implementer batch (after human gate):** VT-TASK-001 → VT-TASK-002 → (VT-TASK-003 ∥ VT-TASK-004 if disjoint files) → VT-TASK-005.

**Parallelism:** VT-TASK-003 may parallel VT-TASK-004 after 002 only with disjoint paths: `temporary-email/**` (+ browser-mail adapter) vs `portal-fill/**` booking selectors/helpers. Do **not** parallelize 004∥005 or 007∥008 (same booking pipeline ownership).

---

## 4. Affected packages

| Package | Touch |
|---------|-------|
| `apps/workflow-worker` | portal-fill, bls-clients/booking, temporary-email, bls-workflow classify/advance |
| `apps/api` | Entity/migration if needed; classifier mirror; optional snapshot |
| `apps/web` | Phase C only |
| `packages/contracts` | No Must (DEC-005) |

---

## 5. Sensitive paths

| Path | Policy |
|------|--------|
| CON-006 Submit revision | Human DEC-001 before VT-TASK-007 |
| Premium / payment | Remain forbidden; static review |
| TypeORM migration | Human DEC-003 |
| Mail secrets | NFR-002 |
| Closed TASK-012 history | Reference only; DEC supersession |

---

## 6. Validation commands

| Scope | Command |
|-------|---------|
| Worker | `cd apps/workflow-worker && npm run lint && npm run build` |
| API (if touched) | `cd apps/api && npm run lint && npm run build` |
| Captcha fixture (optional) | `cd apps/workflow-worker && node scripts/verify-bls-captcha-fixture.mjs` |

---

## 7. Human approval log

| Item | Status | Date / note |
|------|--------|-------------|
| DEC-001 Submit + captcha + slots in scope; Premium/payment forbidden | **approved** | 2026-11-14 — product owner continue |
| DEC-002 Consent mandatory before Book | **approved** | 2026-11-14 — product owner continue |
| DEC-003 Checkpoint reuse vs migration | **approved** | 2026-11-14 — product owner continue; **Option A reuse**; stop+report if columns missing. **VT-TASK-001 verified Option A columns present** (`portal_status` + `portal_checkpoint_json` on api+worker entities + migration `1794676457503-AddBlsWorkflowTaskPortalCheckpoint`). |
| DEC-004 Terminal not on open-UI-only | **approved** | 2026-11-14 — product owner continue |
| DEC-005 No Must Rabbit changes | **approved** | 2026-11-14 — product owner continue |
| DEC-006 Prefer Normal | **approved** | 2026-11-14 — product owner continue |
| DEC-007 Family in scope | **approved** | 2026-11-14 — product owner continue |
| DEC-008 Slots auto + backoff | **approved** | 2026-11-14 — product owner continue |
| OQ-001 DP email timing | **approved** (accepted default) | 2026-11-14 — wait/poll mailbox before Book; skip if already consented |
| OQ-002 Slots staff timing | **approved** (accepted default) | 2026-11-14 — slots auto retry (align DEC-008) |
| OQ-003 Family v1 narrow? | **approved** (accepted default) | 2026-11-14 — Family in v1 (align DEC-007) |
| OQ-004 New statuses? | **approved** (accepted default) | 2026-11-14 — reuse statuses/checkpoints; add only if TASK-001/002 need |
| OQ-005 MA dependency | **approved** (accepted default) | 2026-11-14 — MA not hard dependency for BOOK continue |
| OQ-006 Mail API shape | **approved** (accepted default) | 2026-11-14 — implementer freedom within TemporaryEmailProvider |
| OQ-007 Unknown-next → staff | **approved** (accepted default) | 2026-11-14 — unknown-next after captcha → staff gate |
