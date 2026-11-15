# VT-TASK-008 — Booking captcha probe/solve

| Field | Value |
|-------|-------|
| Task ID | `VT-TASK-008` |
| Title | Always probe captcha after Submit; reuse BLS captcha pipeline |
| owner_layer | `apps/workflow-worker` portal-fill |
| depends_on | VT-TASK-007 |
| Phase | B |
| Status | **DONE** |
| REQ/NFR | REQ-013, CON-006 |
| sensitive_paths | CapMonster keys; no captcha answers in logs |

## Acceptance criteria

- After Submit (and whenever DOM shows), probe `#captcha-main-div` / `.captcha-div` / `.main-div-container` and confirm `#btnVerify` path.
- If absent → continue to outcome detection (do not fail solely for missing captcha).
- If present → reuse `solvePortalBlsCaptcha` / `clickPortalCaptchaVerifyControl` / verified loop.
- Checkpoint `CAPTCHA_PENDING` / cleared on success.
- Fixture awareness: `book-appoinntment-captcha.html` (typo filename).

## verification_commands

```bash
cd apps/workflow-worker && npm run lint && npm run build
# optional: cd apps/workflow-worker && node scripts/verify-bls-captcha-fixture.mjs
```

## IMPLEMENTATION AGENT PROMPT

Wire existing captcha helpers into booking continue after Submit. Always probe; never assume. Pass captcha API key from booking client prep patterns. File-separation. Do not invent captcha DOM beyond materials.
