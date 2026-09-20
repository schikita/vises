# Shared layer: `shared`

**Path:** `backend/src/shared/`  
**Not a Nest feature module** — cross-cutting code used by API modules. Must **not** import feature modules (mappers stay here with type definitions).

## Main parts

| Area | Path | Role |
|------|------|------|
| Decorators | `decorators/current-user.decorator.ts`, `roles.decorator.ts` | `@CurrentUser()`, `@Roles(...)` |
| Guards | `guards/roles.guard.ts` | Enforce `@Roles` metadata |
| Filters | `filters/detail-exception.filter.ts` | Global HTTP exception shaping |
| Mappers | `mappers/user.mapper.ts`, `app.mapper.ts`, `settings.mapper.ts`, `extras-out.mapper.ts` | Entity → API camelCase DTOs |
| Types | `types/user-out.types.ts`, `app-out.types.ts`, `settings-out.types.ts` | Canonical API response shapes |
| Constants | password / invite / upload limits | Shared limits |
| Utils | hash/check password, invite password, uid, filenames, ISO dates, upload validation | Arrow helpers |

## How it relates to the API

- Controllers inject `@CurrentUser()` after `JwtAuthGuard` attaches the `User` entity.  
- Staff routes combine `JwtAuthGuard` + `RolesGuard` + `@Roles('admin' | 'manager')`.  
- JSON responses are mapped through shared mappers so snake_case columns become camelCase fields expected by the SPA.

## Ownership note

Feature modules re-export types from `shared/types` as facades (`users/types`, `apps/types`, `settings/types`) so consumers import from the owning module while physical definitions stay in `shared` (mapper dependency rule).
