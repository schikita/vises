export type ClientPortalFormSaveResult = {
  passportError: string
  portalFormError: string
  tripError: string
  /** True only when every attempted subsection succeeded. */
  ok: boolean
}
