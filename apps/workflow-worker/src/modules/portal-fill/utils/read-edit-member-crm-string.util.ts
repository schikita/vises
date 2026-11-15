/** Trimmed non-empty string from CRM source, or undefined. */
export const readEditMemberCrmString = (
  value: unknown,
): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};
