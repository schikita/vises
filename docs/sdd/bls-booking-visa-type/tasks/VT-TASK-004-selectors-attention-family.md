# VT-TASK-004 — Selectors + Attention + Family helpers

| Field | Value |
|-------|-------|
| Task ID | `VT-TASK-004` |
| Title | Extend booking selectors; wire Attention; Family disclaimer helper |
| owner_layer | `apps/workflow-worker` portal-fill |
| depends_on | VT-TASK-002 |
| Phase | A |
| Status | DONE |
| Verification note | 2026-11-14 — orchestrator re-ran `npm run build` after VT-TASK-003 landed: **PASS**; arch+code review OKAY |
| REQ/NFR | REQ-008, REQ-009, REQ-010, CON-008 |
| sensitive_paths | Do not confuse with Manage `#visaTypeModal` |

## Acceptance criteria

- `PORTAL_BOOKING_SELECTORS` (or sibling constants) include Visa Sub Type, Number Of Members, Category, slots banner text, Try Again, captcha roots, Family `#familyDisclaimer` cues.
- Booking wait prefers full-page heading + VisaType form action (document CON-008).
- Booking pipeline can call `acceptPortalAttentionModal` when `#scamAlert` shown.
- Dedicated Family Accept helper (success Accept on `#familyDisclaimer`) — **not** Premium Accept.
- Premium/payment forbid cues remain listed for detection.

## verification_commands

```bash
cd apps/workflow-worker && npm run lint && npm run build
```

## IMPLEMENTATION AGENT PROMPT

Extend portal-booking constants/helpers per `visa_type_agent_brief.md` / flow.md. Wire Attention into booking path. Add Family modal Accept helper. Keep Premium Accept forbidden. One concern per file. Do not click Submit yet (VT-TASK-007).
