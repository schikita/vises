/** Map API null/undefined plaintext into an empty form string. */
export const nullishToFormString = (
  value: string | null | undefined,
): string => value ?? ''
