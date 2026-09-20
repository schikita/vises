# Module: `users`

**Path:** `backend/src/modules/users/`  
**HTTP:** yes  
**Purpose:** Admin-only user administration (list, create, patch, reissue credentials, delete).

## Main parts

| Part | Files | Role |
|------|-------|------|
| Controller | `users.controller.ts` | All routes under `/users`; JWT + admin role |
| Service | `users.service.ts` | CRUD + credential minting |
| DTOs | `dto/create-user.dto.ts`, `dto/patch-user.dto.ts` | Create / patch bodies |
| Types | `types/user-out.types.ts`, `user-credentials-out.types.ts`, `ensure-client-result.types.ts` | API shapes / client ensure |
| Utils | `utils/normalize-client-identity.util.ts` | Normalize login/email for clients |
| Constants | DI tokens | `USERS_SERVICE` |
| Interface | `interfaces/users.service.interface.ts` | `IUsersService` |

**Depends on:** `AuthModule` (guards), `User` entity.  
**Used by:** `AppsModule` (ensure/mint client on app upsert).

## API

All routes: **JWT + role `admin`**.

| Method | Path | Status | Body / notes | Response |
|--------|------|--------|--------------|----------|
| `GET` | `/api/users` | 200 | — | `UserOut[]` |
| `POST` | `/api/users` | **200** (not 201) | `CreateUserDto`: `name` (required), optional `email`, `login`, `role` | `UserCredentialsOut` |
| `PATCH` | `/api/users/:userId` | 200 | `PatchUserDto`: optional `name`, `login`, `email`, `role`, `active` | `UserOut` |
| `POST` | `/api/users/:userId/reissue` | 200 | Regenerates invite password / token | `UserCredentialsOut` |
| `DELETE` | `/api/users/:userId` | 200 | Actor from JWT; cannot remove self | `{ ok: true }` |

### Response shapes

**`UserOut`** (via `shared/types`): `id`, `name`, `login`, `email`, `role`, `active`, `inviteToken`, `createdAt`, `updatedAt`, `password` (usually empty except invite/reveal flows).

**`UserCredentialsOut`:** `{ user: UserOut, password: string, token: string }` — plaintext password returned once on create/reissue.
