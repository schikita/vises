/** Null/undefined → empty control string (REQ-011). Does not invent non-empty values. */
export const nullToEmptyString = (value: string | null | undefined): string =>
  value ?? ''
