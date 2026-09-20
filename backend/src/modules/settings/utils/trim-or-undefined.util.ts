/** Trim; return undefined when empty/absent. */
export const trimOrUndefined = (
  value: string | undefined,
): string | undefined => {
  if (value === undefined) return undefined;
  const t = value.trim();
  return t.length > 0 ? t : undefined;
};
