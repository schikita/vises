# Phase 2 — Database (checkpoint persistence)

| Field | Value |
|-------|-------|
| Feature id | `manage-applicants-appointment-form` |
| Status | **APPROVED** (OQ-001, 2026-11-14) — IMPLEMENTING via MA-TASK-001 |
| Date | 2026-11-14 |
| Spec | REQ-015…018, NFR-007, DEC-003, OQ-001 |
| Stuck contract | `site_materials/possible_site_issues/stuck_state_db_contract.md` |

---

## 1. Goal

Persist per-applicant portal status and mid-form resume checkpoints for STATUS_VALIDATE without storing raw field values or secrets.

---

## 2. Proposed schema (DEC-proposed-003)

Additive columns on **`bls_workflow_tasks`** (api + worker entity mirrors):

| Column | Type | Nullable | Purpose |
|--------|------|----------|---------|
| `portal_status` | `varchar(64)` | yes | `FORM_FILLING_IN_PROGRESS` \| `READY_TO_BOOK` \| `UNKNOWN` |
| `portal_checkpoint_json` | `jsonb` | yes | Checkpoint bag (below) |

**No** new tables. **No** new workflow step keys. **No** changes to `portal_autofill_runs` as STATUS SoT.

### Checkpoint JSON shape (logical)

```ts
// ids / statuses only — NEVER field values
{
  lastCompletedStep: string; // e.g. FORM_FILLING | VISA_TYPE_MODAL | …
  locationId?: string;       // portal option id if known
  visaTypeId?: string;
  applicantId: string;
  fieldProgress: {
    filled: string[];   // field ids
    skipped: string[];
    failed: Array<{ fieldId: string; reasonCode: string }>;
  };
  memberBranch?: 'EDIT_EXISTING' | 'ADD_NEW_MEMBER'; // only when pre-start family members (OQ-005)
}
```

Mirror register semantics from `PortalAutofillCheckpoint` / `field_progress_json` summarizers — do not copy PII.

### Attempt / events

- Attempts: continue `lastErrorClass` / code / message ≤500; optional safe summary in existing notes if present.
- Events: `payload_safe` may include `{ portalStatus, lastCompletedStep, fieldProgressCounts }` — **no values**.

---

## 3. CRM / Client mapping (OQ-002 / OQ-007 — approved)

- Fill from data already entered in our system using portal-aligned form shape.
- Map existing user-entered fields → portal `#id`s; **never invent**.
- Optional/conditional empty → **skip** (leave unchecked/empty).
- Staff/fail only for portal-required `*` with no source and cannot skip.
- Schema expansion only if product already collects a field we cannot map today.

---

## 4. Migration strategy

1. ~~Human approves DEC-003 / OQ-001~~ — **done** 2026-11-14 ([`04-plan.md`](./04-plan.md) §7).
2. Additive TypeORM migration in `apps/api` (+ worker entity sync) — **MA-TASK-001**.
3. Update `schema.bootstrap.ts` if used.
4. Backfill: null checkpoints = “resume from scrape” (compatible with today).
5. No destructive drops.

---

## 5. Alternatives considered (OQ-001)

| Option | Pros | Cons |
|--------|------|------|
| **A. Task columns (proposed)** | Per-applicant STATUS_APPLICANT natural home; resume without parsing events | Needs migration |
| B. Attempt-only jsonb | No task schema change | Lost when attempts rotate; harder resume |
| C. Events-only | Zero schema | Not a durable SoT for resume |
| D. Reuse portal_autofill_runs | Prior art | Dual SoT; REGISTER-shaped; conflates features |

**Recommendation:** Option A.
