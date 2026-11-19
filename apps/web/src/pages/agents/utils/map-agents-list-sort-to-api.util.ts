import type { AgentsListSortKey } from '../types/agents-list-sort.types'

/**
 * Map SPA agents sort keys to SoT `GET /users` sort (`user|role|status|created`).
 * Metric columns are not sortable server-side yet → fall back to `user`.
 */
export const mapAgentsListSortToApi = (
  key: AgentsListSortKey,
): 'user' | 'role' | 'status' | 'created' => {
  if (key === 'name') {
    return 'user'
  }
  return 'user'
}
