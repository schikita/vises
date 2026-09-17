/** Digits-only phone length required by portal mapper (REQ-002). */
export const portalAutofillPhoneDigits = (phone: string | undefined): string =>
  (phone ?? '').replace(/\D/g, '')
