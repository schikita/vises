import type { PORTAL_SAVE_ALL_STEPS } from '../constants/portal-save-all-steps.constants'

export type PortalSaveAllStep =
  (typeof PORTAL_SAVE_ALL_STEPS)[keyof typeof PORTAL_SAVE_ALL_STEPS]

export type PortalSaveAllSuccess = {
  ok: true
}

export type PortalSaveAllFailure = {
  ok: false
  step: PortalSaveAllStep
  /** Operator-safe message — codes/status only; never field values. */
  message: string
}

export type PortalSaveAllResult = PortalSaveAllSuccess | PortalSaveAllFailure
