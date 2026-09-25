# Phase 2 — API contract → frontend mapping

| Field | Value |
|-------|-------|
| Feature id | `bls-workflow-frontend` |
| Status | **DESIGNED** |
| Date | 2026-09-22 |
| Upstream contract | `docs/sdd/03-workflow-api.md` |
| Spec | REQ-005–010, REQ-016–019, NFR-003, NFR-005, CON-002, CON-003 |
| Realtime | **DEC-001** (snapshot + events poll; no WS) |

---

## 1. Transport strategy

| Concern | Choice |
|---------|--------|
| HTTP client | Existing `@/shared/api` (`apiRequest` / `apiRequestRaw`) — REQ-019 |
| Auth | Bearer JWT from existing session; staff routes only |
| Realtime | **Poll only** — DEC-001 |
| Snapshot interval | `BLS_WORKFLOW_POLL_INTERVAL_MS = 3000` (keep) |
| Events interval | Same tick as snapshot while non-terminal |
| Stop condition | Terminal statuses per existing `isBlsWorkflowStatusTerminal` (includes `AWAITING_STAFF_BOOKING`) |
| Silent failure | Do not clear snapshot on poll network error (TASK-015 behavior) |
| Cache | React local state in `BlsWorkflowPanel` (no React Query / SWR required — Fact: store uses Context; workflow already local). After successful **mutations**, immediately `refresh()` snapshot + reset events cursor if `workflowId` changes |
| New deps | **Forbidden** for WS/SSE (NFR-005) |

**Assumption:** No global query cache library is required for this feature; local panel state is sufficient.

---

## 2. Endpoint → FE mapping

| Method | Path | FE helper (entity util) | Consumer | Notes |
|--------|------|-------------------------|----------|-------|
| GET | `/api/apps/:applicationId/bls-workflow` | `fetchBlsWorkflow` (**exists**) | Panel load + poll | Latest snapshot; 404 → empty |
| GET | `/api/apps/:applicationId/bls-workflow/:workflowId` | Optional `fetchBlsWorkflowById` (**new if needed**) | Prefer application-scoped GET | Only if explicit id refresh required |
| GET | `/api/apps/:applicationId/bls-workflow/:workflowId/events` | `fetchBlsWorkflowEvents` (**new** FE-TASK-001) | Dual poll + timeline | Query: `sinceEventId`, `limit` |
| POST | `/api/apps/:applicationId/bls-workflow` | `startBlsWorkflow` (**exists**) | Start / supersede | Body `{ supersede?: boolean }`; 201 |
| POST | `…/:workflowId/retry` | `retryBlsWorkflow` (**exists**; extend body usage) | Default + targeted retry | Body `{ taskId?: string }` after DEC-003 |
| POST | `…/:workflowId/resume` | `resumeBlsWorkflow` (**exists**) | Resume control | |
| POST | `…/:workflowId/pause` | `pauseBlsWorkflow` (**exists**) | Pause control | |
| POST | `…/:workflowId/cancel` | `cancelBlsWorkflow` (**exists**) | Cancel control | |

Legacy (unchanged primary path):

| Method | Path | Owner | Notes |
|--------|------|-------|-------|
| POST | `…/portal-autofill` | — (hard-cut) | **410 Gone**; registration via BLS workflow only |
| GET | `…/portal-autofill-runs` | Store / portal-autofill entity | Evidence list API retained; no staff start UI |
| GET | `…/portal-autofill-runs/:runId/screenshot` | `openPortalAutofillScreenshot` | Opened from workflow `AUTOFILL_RUN_LINKED` |

---

## 3. TypeScript types location (FSD)

All under `web/src/entities/bls-workflow/`:

| Type module | Contents |
|-------------|----------|
| `types/bls-workflow.types.ts` | Snapshot, step, task (**extend** with `id?`, `maxAttempts?`), start/control bodies — **extend existing** |
| `types/bls-workflow-events.types.ts` | **New** — `BlsWorkflowEvent`, `BlsWorkflowEventsOut`, event type union / const map |
| `types/bls-workflow-payload-safe.types.ts` | **New** — allowlisted display shape for `payloadSafe` |
| `types/index.ts` | Barrel public types only |

Constants:

| Module | Contents |
|--------|----------|
| `constants/bls-workflow.constants.ts` | Poll interval, events default/max limit mirrors |
| `constants/bls-workflow-labels.constants.ts` | Status / step / task RU |
| `constants/bls-workflow-event-labels.constants.ts` | **New** — eventType → RU |
| `constants/bls-workflow-payload-safe.constants.ts` | **New** — allowlisted keys |

Utils (one arrow per file):

| Util | Role |
|------|------|
| `fetch-bls-workflow-events.util.ts` | GET events |
| `pick-bls-workflow-payload-safe-display.util.ts` | Allowlist |
| `find-bls-workflow-current-task.util.ts` | **Fix** ambiguity (REQ-012) |
| `resolve-bls-workflow-applicant-label.util.ts` | id + optional name |
| existing start/retry/… | Keep |

Widget types stay in `web/src/widgets/bls-workflow-panel/types/` for panel props only (e.g. optional `applicants` prop).

---

## 4. Backend DTO extension (DEC-003) — scoped

**Additive only** to `BlsWorkflowTaskOut` / SPA `BlsWorkflowTask`:

```ts
{
  id: string;           // NEW — task PK for retry body.taskId
  maxAttempts: number;  // NEW — display attempts budget
  // …existing fields unchanged
}
```

| Change site (implementer) | Notes |
|---------------------------|-------|
| `backend/.../types/bls-workflow-api.types.ts` | Type |
| Snapshot mapper / service that builds `BlsWorkflowOut` | Include id + maxAttempts from entity |
| `docs/sdd/03-workflow-api.md` | Note additive fields (optional doc touch in FE-TASK-003) |
| SPA `bls-workflow.types.ts` | Mirror |

No new endpoints. No vault fields.

---

## 5. Poll / stream strategy (DEC-001 detail)

```
state:
  snapshot: BlsWorkflowSnapshot | null
  events: BlsWorkflowEvent[]          // bounded ring
  sinceEventId: number                // cursor; start 0
  workflowIdWatch: string | null

on applicationId change:
  reset all; load snapshot; if workflowId → events since 0

on interval (3s) if non-terminal && !busy:
  silent snapshot refresh
  if snapshot.workflowId:
    if workflowId changed: reset events + cursor
    silent events fetch(sinceEventId)
    append events with id > cursor
    sinceEventId = latestEventId ?? sinceEventId

on mutation success:
  await snapshot refresh (non-silent ok)
  optionally events catch-up
```

**Not a stream:** each request is independent HTTP GET. Cursor gaps → empty page OK; resync via snapshot (edge 11).

---

## 6. Cache invalidation / refresh rules

| Event | Action |
|-------|--------|
| Start / supersede 201 | Set snapshot from follow-up GET; reset events cursor |
| Retry / resume / pause / cancel | Follow-up GET; keep cursor (new events will appear) |
| Terminal detected | Clear interval; final snapshot retained |
| Tab unmount / applicationId change | Clear interval; abort in-flight via cancelled flag |

No service-worker cache. No optimistic status inventing beyond disabling controls while `busy`.

---

## 7. Error mapping

| HTTP | FE behavior |
|------|-------------|
| 404 snapshot | Empty state (not fatal banner if “no workflow yet”) |
| 400 / 409 controls | Show `detail` Russian string in `actionError` |
| 503 crypto | Show `detail` |
| Network poll | Silent retain |

---

## 8. Phase gate

Phase 2 API mapping: **DESIGNED**. Next: [`03-fsd-component-design.md`](./03-fsd-component-design.md).
