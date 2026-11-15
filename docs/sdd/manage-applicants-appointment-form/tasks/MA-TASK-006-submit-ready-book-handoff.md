# MA-TASK-006 — Submit + Ready + BOOK handoff

| Field | Value |
|-------|-------|
| Task ID | `MA-TASK-006` |
| Title | Submit dialog, re-scrape Ready, persist status, BOOK handoff |
| owner_layer | `apps/workflow-worker` portal-fill + bls-clients/status |
| depends_on | MA-TASK-005 |
| Phase | A |
| Status | **DONE** (arch OKAY + code OKAY cycle 2, 2026-11-14) |
| REQ/NFR | REQ-001, REQ-003, REQ-013, REQ-014, REQ-024, REQ-026, REQ-027, CON-004, this-spec CON-006, OQ-006 |
| sensitive_paths | Upstream CON-006 / this-spec CON-004 payment boundary; Ready-only Book gate |

## Acceptance criteria

- Dialog listener registered before Submit; accept `Edited family member successfully.`
- Settle + re-scrape Manage Applicants; persist `READY_TO_BOOK` (or still Form Filling → `bls_status_not_ready` / SAFE_TO_REPEAT).
- Ambiguous submit → VERIFY_THEN_REPEAT; re-scrape first.
- When scraped status is already `READY_TO_BOOK`, **skip form fill** and proceed to BOOKING_ENTRY / existing BOOK client (**REQ-003**).
- Ready recognition: prefer **exact portal label text**; CSS class secondary (OQ-006); analyze/reuse current scrape helpers.
- Manage Applicants remains branching SoT after login continuity (**REQ-001**).
- When Ready: STATUS_APPLICANT success; BOOK uses existing `clickPortalBookNewAppointment` / safe-stop only (**REQ-026**).
- Never click VisaType submit / premium / payment (**CON-004** / upstream CON-006).
- Book CTA only when Ready (**this-spec CON-006**).
- Still extending STATUS_VALIDATE only (**REQ-027**).

## verification_commands

```bash
cd apps/workflow-worker && npm run lint && npm run build
```

## IMPLEMENTATION AGENT PROMPT

Keep BOOK client unchanged except verifying Ready gate. Do not expand into `site_materials/visa_type/` automation. Align with TASK-012 CON-006 semantics and terminal `AWAITING_STAFF_BOOKING`.
