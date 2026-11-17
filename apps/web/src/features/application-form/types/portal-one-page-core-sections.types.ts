import type { ReactNode } from 'react'

export type PortalOnePageCoreSectionsProps = {
  /**
   * Optional slot rendered after Personal Details (site section 2 — minors).
   * Used by PF-TASK-005b without reordering core banners.
   */
  afterPersonal?: ReactNode
  /**
   * Optional slot rendered after Address & Contact (site section 5 — other residence).
   */
  afterAddress?: ReactNode
  /**
   * Optional slot rendered after Travel Information (site sections 8–14).
   */
  afterTravel?: ReactNode
  /** Hide portal free-text destination when staff Settings select owns the field. */
  hideDestinationField?: boolean
}
