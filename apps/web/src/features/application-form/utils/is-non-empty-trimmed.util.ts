export const isNonEmptyTrimmed = (
  value: string | null | undefined,
): boolean => {
  return (value ?? '').trim().length > 0
}
