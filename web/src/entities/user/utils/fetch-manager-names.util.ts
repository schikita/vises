import { apiRequest } from '@/shared/api'
import type { ManagerNamesOut } from '../types/manager-names-out.types'

/** Staff GET /users/managers — active agent names for detail dropdown. */
export const fetchManagerNames = (): Promise<string[]> =>
  apiRequest<ManagerNamesOut>('/users/managers').then((data) => data.names)
