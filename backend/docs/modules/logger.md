# Module: `logger`

**Path:** `backend/src/modules/logger/`  
**HTTP:** no  
**Purpose:** Global Winston-backed Nest `LoggerService` (console + daily rotating files under `LOG_DIR`).

## Main parts

| Part | Files | Role |
|------|-------|------|
| Module | `logger.module.ts` (`@Global`) | Provide / export `WinstonLoggerService` |
| Service | `winston-logger.service.ts` | Nest `LoggerService` bridge |
| Interface | `interfaces/app-logger.interface.ts` | `IAppLogger` → Nest `LoggerService` |
| Types | `types/winston-logger.types.ts` | Winston info / channel types |
| Constants | levels, channel names, DI token `APP_LOGGER` | Layout config |
| Utils | create Winston instance, daily rotate transport, level filter, format line, ensure dirs | One helper per file |

## Behavior

- Wired in `main.ts` via `app.useLogger(app.get(WinstonLoggerService))`.  
- Must register **after** `AppConfigModule` so `LOG_DIR` is available.  
- File layout: `{LOG_DIR}/{channel}/{YYYY-MM}/{YYYY-MM-DD}.log` (common / error / warn / info style channels).
- Console: part-colored lines (cyan time, bold level color, magenta context, bright message; error/warn message inherits level color). Files stay plain text.

No HTTP endpoints.
