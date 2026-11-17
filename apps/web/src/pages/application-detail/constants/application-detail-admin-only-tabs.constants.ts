import type { ApplicationDetailTabId } from '../types'

/** Tabs visible only to admin|superadmin (REQ-016 / DEC-ASAU-006). */
export const APPLICATION_DETAIL_ADMIN_ONLY_TAB_IDS: ReadonlyArray<ApplicationDetailTabId> =
  ['payment']
