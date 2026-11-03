/**
 * Shared users-list enrichment fields (qa-polish DEC-P5 / DEC-P6 / DEC-P13).
 *
 * Full user identity (`UserOut` / SPA `User`) remains app-local. Compose this
 * type with those shapes for `GET /users` list items:
 * `UserOut & UserListItemDto` / `User & UserListItemDto`.
 *
 * - `clientsCount` / `currentBalance`: populate for `role === 'agent'`;
 *   other roles may use `null` (DEC-P5). `currentBalance` is a decimal string.
 * - `totalRevenue`: for agents, decimal string sum of `ABS(amount)` for
 *   `client_creation_debit` ledger rows (empty → `"0.00"`); non-agents `null`.
 * - `latestAppId`: latest application id for row navigation; for agents resolve
 *   via `Client.agentId` ownership (DEC-P6), not email match alone.
 */
export type UserListItemDto = {
  latestAppId: string | null;
  clientsCount: number | null;
  currentBalance: string | null;
  totalRevenue: string | null;
};
