# Module: `auth`

**Path:** `backend/src/modules/auth/`  
**HTTP:** yes  
**Purpose:** Authentication sessions (JWT), current user, invite-password reveal, and exported guards used by other modules.

## Main parts

| Part | Files | Role |
|------|-------|------|
| Controllers | `auth.controller.ts`, `invite.controller.ts` | HTTP surface |
| Services | `auth.service.ts`, `jwt.service.ts` | Login / demo / invite; JWT mint & verify |
| Guards | `jwt-auth.guard.ts` (+ `shared/guards/roles.guard.ts`) | Bearer JWT; role checks (exported) |
| DTOs | `dto/login.dto.ts`, `dto/demo.dto.ts` | Request bodies |
| Types | `types/auth-session.types.ts`, `types/jwt-payload.types.ts`, `types/user-me-out.types.ts` | Session + JWT payload + me response |
| Constants | `constants/roles.constants.ts`, `jwt.constants.ts`, DI tokens | Roles, JWT config keys |
| Utils | `utils/is-demo-auth-enabled.util.ts`, `resolve-jwt-secret.util.ts` | Env-gated demo; secret resolution |
| Interface | `interfaces/auth.service.interface.ts` | `IAuthService` |

**Exports:** `AuthService`, `JwtTokenService`, `JwtAuthGuard`, `RolesGuard`, DI token `AUTH_SERVICE`.

## API

### `POST /api/auth/login`

- **Auth:** none  
- **Body (`LoginDto`):** `{ login: string, password: string }`  
- **Behavior:** Match user by login or email (case-insensitive); require `active`; verify password hash.  
- **Response (`AuthSession`):** `{ token, user }` where `user` is `UserOut`.

### `POST /api/auth/demo`

- **Auth:** none  
- **Body (`DemoDto`):** `{ role: string }` — one of `admin` \| `manager` \| `client`  
- **Behavior:** Allowed only when `DEMO_AUTH_ENABLED` permits it for current `NODE_ENV`. Issues JWT for first active user with that role.  
- **Response:** same as login (`AuthSession`).  
- **Errors:** `403` if disabled; `400` unknown role / no user.

### `GET /api/auth/me`

- **Auth:** JWT  
- **Response (`UserMeOut`):** current user projection (`UserOut` without `password`).

### `GET /api/invite/:token`

- **Auth:** none  
- **Behavior:** Resolve user by `inviteToken`; one-time reveal of plaintext invite password then clear stored invite password.  
- **Response (`UserOut`):** includes temporary `password` field when available.  
- **Errors:** `404` invalid link.

## Roles

`USER_ROLES = ['admin', 'manager', 'client']`. Default create role: `client`.
