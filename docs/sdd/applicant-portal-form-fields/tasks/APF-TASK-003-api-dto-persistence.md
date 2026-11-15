# APF-TASK-003 — API DTO + persistence/read for portal fields

| Field | Value |
|-------|-------|
| Task ID | `APF-TASK-003` |
| Title | Nest clients/apps DTOs + services to persist and read new portal fields |
| owner_layer | `apps/api` (`modules/clients`, `modules/apps`) |
| depends_on | APF-TASK-001, APF-TASK-002 |
| Phase | A |
| Status | **DONE** |
| REQ/NFR | REQ-003, REQ-004, REQ-009, REQ-010, DEC-002, DEC-004 |
| sensitive_paths | Clients passport unlock gate; PII audit logging; apps upsert |

## Acceptance criteria

- Nest DTO(s) align with contracts: prefer `ClientPortalFormUpdateDto` + PATCH route under clients module (or create + post-paid portal PATCH — document choice in task notes). Do **not** conflate with FR-6 `ClientPassportUpdateDto` / passport unlock 409 gate.
- Persist/read all new Client columns (including conditionals jsonb when provided).
- `UpsertAppDto` (+ map-out) accepts/returns `visaSubType` mapped to `applications.visa_sub_type`.
- `ClientDetailDto` / create responses expose new fields as needed for future FE (DEC-004) without logging values.
- Utils for pick/apply live in `*.utils.ts`; DTOs in `*.dto.ts`; no mixed concerns.
- Never log PII values; never invent missing fields.

## verification_commands

```bash
cd packages/contracts && npm run lint && npm run build
cd apps/api && npm run lint && npm run build
```

## IMPLEMENTATION AGENT PROMPT

Wire Nest persistence/read for portal form Client fields and Application `visaSubType` per [`02-spec.md`](../02-spec.md) REQ-003/004. Align with `@vises/contracts` from APF-TASK-001 and entities from APF-TASK-002. Prefer dedicated portal-form PATCH. Follow Nest structure + file-separation. No FE. No completeness gate changes here (APF-TASK-005). No worker wiring (APF-TASK-004).

## Notes (code review cycle 1)

- **Route choice:** dedicated `PATCH` portal-form under clients (not passport unlock path).
- **Review fix:** `getById` service spec sets portal columns on the fixture and asserts mapped detail (`toBeNull` / concrete values / `toHaveProperty`) so `mapClientToPortalFormDetailDto` is exercised on GET detail.
- **Review fix:** deterministic `visaSubType` coverage — `apps.service` upsert persist + omit-preserve; `appOut` + `mapApplicationToDto` map-out.
- `ClientPortalFormStringFieldKey` moved to `types/` (constants keep the key array only).
