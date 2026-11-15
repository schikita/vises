# MA-TASK-003 — Visa modal + iframe + Attention

| Field | Value |
|-------|-------|
| Task ID | `MA-TASK-003` |
| Title | Wire `#visaTypeModal`, iframe frame context, Attention into status pipeline |
| owner_layer | `apps/workflow-worker` portal-fill + bls-clients/status |
| depends_on | MA-TASK-004 |
| Phase | A |
| Status | **DONE** (arch OKAY + code OKAY, 2026-11-14) |
| REQ/NFR | REQ-001, REQ-002, REQ-005, REQ-006, REQ-021–023, REQ-027, NFR-003 |
| sensitive_paths | `apps/workflow-worker/.../portal-fill/**` (coordinate — serial after 004) |

## Acceptance criteria

- After AUTHENTICATED path, STATUS_VALIDATE navigates Manage Applicants via existing resolve/wait helpers (**REQ-001**).
- On `FORM_FILLING_IN_PROGRESS`: Edit → wait `#visaTypeModal` → select Location\* + Visa Type\* via Kendo listbox → Proceed (**REQ-002**).
- After Proceed: operate inside `iframe.k-content-frame`; detect `#myForm` ManageApplicant + `#FirstName`.
- Accept `#scamAlert` via existing Attention helper; wait hidden.
- Wait overlays (`.preloader`, `#global-overlay`) before clicks.
- Checkpoint `lastCompletedStep` advances OPEN_EDIT → VISA_TYPE_MODAL → EDIT_FRAME_READY.
- Cancel/Close not clicked on happy path.
- Extends `runPortalStatusValidatePipeline` / status client only — **no** parallel orchestrator or new Must step key (**REQ-027**).

## verification_commands

```bash
cd apps/workflow-worker && npm run lint && npm run build
```

## IMPLEMENTATION AGENT PROMPT

Extend `runPortalStatusValidatePipeline` (do not invent parallel orchestrator). Reuse booking/register listbox helpers; do not fork. Prefer title + `iframe.k-content-frame` over ephemeral `#popup_N`. Persist steps via MA-TASK-002 helpers. Materials: agent brief §1.1–1.3.
