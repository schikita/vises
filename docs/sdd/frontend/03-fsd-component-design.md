# Phase 3 — FSD component design

| Field | Value |
|-------|-------|
| Feature id | `bls-workflow-frontend` |
| Status | **DESIGNED** |
| Date | 2026-09-22 |
| Spec | REQ-020, NFR-006, CON-008 |
| Baseline | TASK-015 entity + widget (extend; no giant SPA redesign) |

---

## 1. Principles

- **Extend** existing slices; do not create a parallel workflow app shell.
- Container / render split for panel UI.
- Types in `types/`, constants in `constants/`, utils one-arrow-per-file with barrels.
- No business logic in Expo-style thin routes — N/A for Vite SPA; keep `ApplicationDetail.tsx` as page container only.
- Prefer presentational subcomponents under the widget when files grow; optional `features/` only if a reusable scenario hook is clearly shared — **default: keep logic in widget container + entity utils**.

---

## 2. Proposed file layout

```txt
web/src/
  entities/bls-workflow/
    types/
      bls-workflow.types.ts              # extend: task.id, maxAttempts
      bls-workflow-events.types.ts       # NEW
      bls-workflow-payload-safe.types.ts # NEW
      index.ts
    constants/
      bls-workflow.constants.ts          # poll + events limits
      bls-workflow-labels.constants.ts
      bls-workflow-event-labels.constants.ts      # NEW
      bls-workflow-payload-safe.constants.ts    # NEW
      index.ts
    utils/
      fetch-bls-workflow.util.ts         # exists
      fetch-bls-workflow-events.util.ts  # NEW
      find-bls-workflow-current-task.util.ts  # FIX
      resolve-bls-workflow-applicant-label.util.ts  # NEW
      pick-bls-workflow-payload-safe-display.util.ts  # NEW
      format-bls-workflow-next-run-at.util.ts  # NEW optional
      …existing control/eligibility/label utils
      index.ts
    index.ts

  widgets/bls-workflow-panel/
    BlsWorkflowPanel.tsx                 # container: dual poll, mutations
    BlsWorkflowPanelRender.tsx           # compose sections
    BlsWorkflowStepRailRender.tsx        # NEW — step viz (presentational)
    BlsWorkflowTaskListRender.tsx        # NEW — tasks + optional retry
    BlsWorkflowEventsFeedRender.tsx      # NEW — compact timeline
    BlsWorkflowBookingHandoffRender.tsx  # NEW — CON-006 banner
    types/
      bls-workflow-panel.types.ts        # extend props: applicants?
      index.ts
    constants/
      bls-workflow-panel-copy.constants.ts  # extend RU strings
      index.ts
    index.ts

  pages/application-detail/
    ApplicationDetailRender.tsx         # pass applicants into panel; dual-mode heading
    …unchanged tab constants

  widgets/portal-autofill-evidence/     # optional: highlight runId (Should)
    …minimal prop for highlightedRunId if FE-TASK-007/008 needs it
```

**Not required:** new `features/bls-workflow/` unless implementer extracts a `useBlsWorkflowPanel` hook for testability — allowed as optional refactor inside FE-TASK-004, still colocated under widget or `features/bls-workflow/model/`.

---

## 3. Container vs render

| File | Responsibility |
|------|----------------|
| `BlsWorkflowPanel.tsx` | State, dual poll (DEC-001), eligibility, mutations, error strings, pass derived view-model props |
| `BlsWorkflowPanelRender.tsx` | Layout composition only |
| `*Render.tsx` sections | Pure presentation from props |
| Entity utils | Pure domain helpers / HTTP |

---

## 4. Props contract (panel)

```ts
// widget types — illustrative
type BlsWorkflowPanelProps = {
  applicationId: string
  /** Optional CRM applicants for REQ-011 Should labels (DEC-004). */
  applicants?: Array<{
    id: string
    firstName?: string
    lastName?: string
  }>
  /** Optional: scroll/highlight legacy evidence run (REQ-018). */
  onAutofillRunLinked?: (runId: string) => void
}
```

Page wires `applicants={form.applicants}` (field names match existing form types — implementer verifies).

---

## 5. Dual-mode page composition (DEC-002)

```tsx
// ApplicationDetailRender autofill tab — conceptual
<section>
  <BlsWorkflowPanel applicationId={form.id} applicants={form.applicants} />
  <h3>{/* «Диагностика RegisterUser» */}</h3>
  <PortalAutofillEvidenceSection … highlightedRunId={…} />
</section>
```

No removal of legacy widget.

---

## 6. Styling

- Reuse existing Tailwind / `Btn` / panel spacing from TASK-015.
- Step rail: simple ordered list or flex row with status color tokens already used for badges — avoid new design system.
- CON-006 banner: success-oriented (e.g. emerald/soft positive), not red error.

---

## 7. Out of scope for FSD this feature

- Reworking `StoreProvider` to own workflow APIs (entity pattern already correct).
- New admin dashboard page.
- Client-role UI.
- Monorepo / GraphQL.

---

## 8. Phase gate

Phase 3 FSD design: **DESIGNED**. Implementation follows [`04-plan.md`](./04-plan.md) + [`tasks/`](./tasks/).
