/**
 * Booking Category from `applications.extras.category` (DEC-003).
 * Returns undefined when missing/blank — never invents a default.
 */
export const readApplicationExtrasCategory = (
  extras: Record<string, unknown> | null | undefined,
): string | undefined => {
  if (extras == null || typeof extras !== 'object') {
    return undefined;
  }
  const raw = extras.category;
  if (typeof raw !== 'string') {
    return undefined;
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};
