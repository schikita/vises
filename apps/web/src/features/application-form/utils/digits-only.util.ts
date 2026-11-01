/** Strip non-digits from a phone (or similar) string. */
export const digitsOnly = (value: string | undefined): string =>
  (value ?? '').replace(/\D/g, '')
