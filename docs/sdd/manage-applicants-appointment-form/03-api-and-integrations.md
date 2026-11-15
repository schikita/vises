# Phase 3 — API & integrations

| Field | Value |
|-------|-------|
| Feature id | `manage-applicants-appointment-form` |
| Status | **DESIGNED** |
| Date | 2026-11-14 |
| Spec | §11, REQ-026…029, CON-004 |

---

## 1. HTTP API (Phase A/B)

| Surface | Change |
|---------|--------|
| GET workflow snapshot | **No Must change** for A/B |
| Events / retry / resume / pause / cancel | Unchanged contracts |
| Staff auth | Unchanged |

Checkpoint is worker↔DB; staff already sees task `lastError*` and status.

### Phase C (optional — DEC-proposed-005)

Additive snapshot fields on tasks (safe):

- `portalStatus?: string`
- `portalCheckpointSummary?: { lastCompletedStep?: string; filledCount: number; failedCount: number }`

No secrets. Update `apps/web` entity types only if Phase C ships. `packages/contracts` only if message DTOs include snapshot shapes (today they likely do not — confirm at Phase C).

---

## 2. Worker integrations (Must)

| Integration | Action |
|-------------|--------|
| Portal Manage Applicants | Existing URL resolve + wait + scrape |
| `#visaTypeModal` | New status-path: Location/Visa via Kendo listbox + Proceed |
| Edit Member iframe | Frame switch; Attention; full fill; Submit; dialog |
| BOOK | Existing `runPortalBookingSafeStopPipeline` after Ready |
| CapMonster / Mail.tm / Proxy6 | Unchanged; login wall → login pipeline |
| Vault | Existing password load for status client |

**Hard stop:** never VisaType submit / Premium Lounge / payment (`site_materials/visa_type/` follow-on only).

---

## 3. Field-name / helper reuse

| Existing | Change |
|----------|--------|
| Register `PortalFieldName` | Extend map **or** accept Edit Member `#id` strings in shared date/dropdown commit helpers (prefer one calendar path — brief OQ13) |
| Booking location/visa prefill | Reuse listbox patterns; do not merge BOOK payment UI into STATUS |
| Status labels / normalize | Reuse; persist after scrape |

---

## 4. Public contract risk

| Risk | Phase |
|------|-------|
| Snapshot DTO additive fields | C only |
| Migration-visible DB | A (internal) |
| Event payload_safe shape | A (additive keys only) |
