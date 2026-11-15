# VT-TASK-003 — Mail subject filter + DP consent href extract

| Field | Value |
|-------|-------|
| Task ID | `VT-TASK-003` |
| Title | TemporaryEmailProvider subject wait + data-protection consent link extract |
| owner_layer | `apps/workflow-worker` temporary-email (+ browser-mail adapter) |
| depends_on | VT-TASK-002 |
| Phase | A |
| Status | DONE |
| REQ/NFR | REQ-003, REQ-004, REQ-005, CON-001, NFR-002 |
| sensitive_paths | Mail tokens/bodies must not be logged |

## Acceptance criteria

- Can wait/find a message whose subject contains `BLS - Data Protection Information` (stable substring).
- Extractor returns href for the green consent CTA text containing: `I have read and understood the information on data protection and I explicitly consent to the data treatment`.
- Extractor never returns the disagree CTA (`I disagree and don't give my consent`).
- Types/constants/utils separated; fixture `site_materials/email_data_protection/mail.html` usable for unit/fixture test if practical.
- No secrets in logs.

## verification_commands

```bash
cd apps/workflow-worker && npm run lint && npm run build
```

## IMPLEMENTATION AGENT PROMPT

Extend TemporaryEmailProvider retain stack (TASK-006) for DP consent: subject filter + HTML consent-link extract. Reuse browser-mail `subjectPreview` where helpful. Do not invent a second mail provider. Follow file-separation. Test against `mail.html` fixture text/anchors. Never log full body/token.
