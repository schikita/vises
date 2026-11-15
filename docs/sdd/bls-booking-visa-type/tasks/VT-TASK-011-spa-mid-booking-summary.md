# VT-TASK-011 — SPA mid-booking summary (Phase C)

| Field | Value |
|-------|-------|
| Task ID | `VT-TASK-011` |
| Title | Optional staff SPA summary for consent/slots/unknown-next |
| owner_layer | `apps/web` entities/bls-workflow + widgets |
| depends_on | VT-TASK-002 |
| Phase | C |
| Status | DEFERRED |
| REQ/NFR | Phase C optional; NFR-003 FSD |
| sensitive_paths | No secrets in snapshot DTO |

## Acceptance criteria

- Surface safe checkpoint summary (consent done, lastCompletedStep, stuckCode) on workflow snapshot UI without PII/email bodies.
- Preserve existing `AWAITING_STAFF_BOOKING` handoff banner behavior.
- FSD: one component per file; types in model; no cross-layer violations.

## verification_commands

```bash
cd apps/web && npm run lint && npm run build
```

## IMPLEMENTATION AGENT PROMPT

Optional Phase C. Only after API snapshot fields exist if needed. Do not block Phase A/B. Follow FSD + file-separation. No WebSocket — poll patterns only.
