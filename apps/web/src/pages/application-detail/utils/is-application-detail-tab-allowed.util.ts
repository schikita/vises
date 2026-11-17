import { APPLICATION_DETAIL_ADMIN_ONLY_TAB_IDS } from '../constants'
import type { ApplicationDetailTabId } from '../types'

/** Whether a detail tab may be shown/activated for the current role gate. */
export const isApplicationDetailTabAllowed = (
  tabId: ApplicationDetailTabId,
  canAccessAdminTabs: boolean,
): boolean => {
  if (!APPLICATION_DETAIL_ADMIN_ONLY_TAB_IDS.includes(tabId)) return true
  return canAccessAdminTabs
}
