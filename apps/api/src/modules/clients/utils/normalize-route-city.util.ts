/**
 * Map application city field to list DTO route city (DEC-P11).
 * Empty / whitespace-only → null.
 */
export const normalizeRouteCity = (
  value: string | null | undefined,
): string | null => {
  const trimmed = (value ?? '').trim();
  return trimmed === '' ? null : trimmed;
};
