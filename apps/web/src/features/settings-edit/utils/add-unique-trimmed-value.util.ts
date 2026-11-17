/** Append a trimmed value if non-empty and not already present. */
export const addUniqueTrimmedValue = (
  values: string[],
  raw: string,
): string[] => {
  const value = raw.trim()
  if (!value) return values
  if (values.includes(value)) return values
  return [...values, value]
}
