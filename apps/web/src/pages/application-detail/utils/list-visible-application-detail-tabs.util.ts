import { APPLICATION_DETAIL_TABS } from '../constants'
import type { VisibleApplicationDetailTab } from '../types'
import { isApplicationDetailTabAllowed } from './is-application-detail-tab-allowed.util'

/** Tabs shown in the application detail tablist for the current role gate. */
export const listVisibleApplicationDetailTabs = (
  canAccessAdminTabs: boolean,
): VisibleApplicationDetailTab[] =>
  APPLICATION_DETAIL_TABS.filter((tab) =>
    isApplicationDetailTabAllowed(tab.id, canAccessAdminTabs),
  )
