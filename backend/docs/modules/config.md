# Module: `config`

**Path:** `backend/src/modules/config/`  
**HTTP:** no  
**Purpose:** Global Nest `ConfigModule` — load env file, validate with Zod, expose typed `ConfigService<AppEnv>`.

## Env file resolution

Prefers `backend/.env.dev` or `backend/.env.prod` from `NODE_ENV`:

| NODE_ENV value | File |
|----------------|------|
| `dev` or `development` | `.env.dev` |
| `prod` or `production` | `.env.prod` |
| missing / other | `.env` (fallback) |

| Mode | Typical file | How loaded |
|------|--------------|------------|
| Host Nest | `.env.dev` + optional `.env.dev.local` | dotenv (+ `*.local` override) + ConfigModule |
| Compose dev | `backend/.env.dev` | Compose `env_file` (no `*.local`) |
| Compose prod | `backend/.env.prod` | Compose `env_file` |

Samples: `.env.dev.example` / `.env.prod.example` / `.env.dev.local.example` (copy to local, never commit secrets). Images do not bake `.env*`. Keep Docker hostnames/paths in `.env.dev`; put host overrides (`127.0.0.1`, `./uploads`, `./logs`) only in gitignored `.env.dev.local`.

`isProdNodeEnv` treats both `prod` and `production` as production for JWT / demo-auth / portal headed checks.

## Main parts

| Part | Files | Role |
|------|-------|------|
| Module | `config.module.ts` (`AppConfigModule`) | `ConfigModule.forRoot({ isGlobal, validate })` |
| Bootstrap | `bootstrap-env.ts` | Early dotenv load before Nest |
| Schema | `schemas/app-env.schema.ts` | Zod bag of required keys |
| Types | `types/app-env.types.ts` | Inferred `AppEnv` |
| Utils | `validate-env.util.ts`, `resolve-backend-env-path.util.ts`, `resolve-env-file-suffix.util.ts`, `is-prod-node-env.util.ts` | Validate + path + prod check |

## Validated env keys (`AppEnv`)

| Key | Role |
|-----|------|
| `NODE_ENV` | Environment mode (`dev` / `prod`; Nest CLI long names still accepted) |
| `POSTGRES_USER` / `PASSWORD` / `DB` | Compose DB credentials |
| `DATABASE_URL` | TypeORM connection URL |
| `JWT_SECRET` | Auth JWT signing |
| `DEMO_AUTH_ENABLED` | Demo login gate |
| `UPLOAD_DIR` | Application document uploads |
| `VISES_PORTAL_BASE_URL` | Portal origin |
| `VISES_PORTAL_REGISTER_PATH` | RegisterUser path |
| `VISES_PORTAL_LOGIN_PATH` | Portal login path (e.g. `/Global/account/login`) |
| `CAPMONSTER_API_KEY` | Captcha |
| `PROXY6_API_KEY` | Portal Proxy6 lease (empty → direct browser) |
| `MAILTM_API_BASE_URL` | Mail.tm API origin |
| `VISES_SECRETS_MASTER_KEY` | BLS vault master key (DEC-005): empty **or** base64 of exactly 32 bytes; empty ⇒ crypto fail-closed at use (503). Samples leave blank — never commit a real key |
| `LOG_DIR` | Winston log root (required non-empty) |

Application code should use `ConfigService`, not raw `process.env`.

Generate a local key (do not commit):  
`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`  
Operator details: [portal-scrape](portal-scrape.md) (durable BLS workflow).
