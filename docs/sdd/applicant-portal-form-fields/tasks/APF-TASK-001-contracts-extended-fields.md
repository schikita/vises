# APF-TASK-001 — Contracts extended portal fields + visaSubType

| Field | Value |
|-------|-------|
| Task ID | `APF-TASK-001` |
| Title | Extend `@vises/contracts` for portal form Client fields + Application `visaSubType` |
| owner_layer | `packages/contracts` |
| depends_on | — |
| Phase | A |
| Status | **DONE** |
| REQ/NFR | REQ-001, REQ-003, REQ-004, REQ-007, REQ-010, DEC-002, DEC-004 |
| sensitive_paths | Shared wire types consumed by api + web + worker; do not invent runtime behavior |

## Acceptance criteria

- Add dedicated portal-form write/read types (recommended: `ClientPortalFormUpdateDto` + detail/list fields as needed) for happy-path Client gaps listed in [`02-database.md`](../02-database.md) §2.2 (camelCase wire keys).
- Expose optional `portalFormConditionals` (or equivalent) for jsonb bag — optional, not required.
- Extend Application-facing contracts so `visaSubType` is representable on upsert/read shapes used by FE/API alignment (if `ApplicationDto` stays minimal, document companion type or extend the types Nest already mirrors).
- Do **not** add new keys to any encrypted-field constant in contracts; plaintext optional strings only (DEC-002).
- Re-export from package barrels; `npm run build` green.
- One concern per file: types in `*.types.ts` (or existing `client.types.ts` / `application.types.ts` split if file-separation requires new files).

## verification_commands

```bash
cd packages/contracts && npm run lint && npm run build
```

## IMPLEMENTATION AGENT PROMPT

Extend `@vises/contracts` for future FE + current API. Prefer a dedicated `ClientPortalFormUpdateDto` (and matching detail fields) over stuffing non-passport keys into `ClientPassportUpdateDto`. Add `visaSubType` for application upsert/read alignment. Match naming to `EditMemberCrmApplicantSource` camelCase. No Nest classes, no enums, no FE. Follow file-separation and typescript-conventions. Reference [`02-spec.md`](../02-spec.md) REQ-001…004 and [`00-discovery.md`](../00-discovery.md).
