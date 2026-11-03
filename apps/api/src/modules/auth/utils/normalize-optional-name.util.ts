/** Trim optional name input; empty becomes `null` for nullable DB columns. */
export const normalizeOptionalName = (
  value: string | undefined,
): string | null => {
  const trimmed = (value ?? '').trim();
  return trimmed.length > 0 ? trimmed : null;
};
