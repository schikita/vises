import { apiRequest } from '@/shared/api'
import type { Application } from '../types/application.types'

/** Load a single application by id (staff/client scoped by API). */
export const fetchAppById = (appId: string): Promise<Application> =>
  apiRequest<Application>(`/apps/${encodeURIComponent(appId)}`)
