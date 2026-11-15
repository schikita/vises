# MA-TASK-005 — Full required section fill

| Field | Value |
|-------|-------|
| Task ID | `MA-TASK-005` |
| Title | Replace minimal edit fill with full Schengen section pipeline |
| owner_layer | `apps/workflow-worker` portal-fill |
| depends_on | MA-TASK-003 |
| Phase | A |
| Status | **DONE** (arch OKAY + code OKAY cycle 2, 2026-11-14) |
| REQ/NFR | REQ-007–012, REQ-017, REQ-027, NFR-003 |
| sensitive_paths | `apps/workflow-worker/.../portal-fill/**` (extends edit fill — not a new orchestrator) |

## Acceptance criteria

- Replace/extend `fillPortalApplicantEditForm` so it fills full happy-path required set inside iframe.
- Sections: personal, passport, address, employer, travel, fingerprint/inviting, cost.
- Text: sanctioned fill + read-back; English-safe; skip already-correct identity prefill.
- Dropdowns: listbox UI; dates: widget then `commitDateViaCalendarUi`; radios by name+value.
- Defaults: fingerprint `2`, inviting `0` unless data says otherwise.
- Conditionals only when flags true.
- After each section: update `fieldProgress` (ids only); on resume skip completed when safe.
- Never type into readonly datepickers.
- Extends status edit fill pipeline only — **no** parallel orchestrator (**REQ-027**).

## verification_commands

```bash
cd apps/workflow-worker && npm run lint && npm run build
```

## IMPLEMENTATION AGENT PROMPT

Reuse register Kendo/calendar helpers; extend maps from MA-TASK-004. Split section fillers into separate util files (file-separation). Fail closed on stale `0001-01-01`. Reference agent brief §1.4–1.5 and flow.md §§5–10.
