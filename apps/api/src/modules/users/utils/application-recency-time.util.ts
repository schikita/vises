/**
 * Convert an application recency timestamp to epoch ms (0 if unusable).
 */
export const applicationRecencyTime = (
  value: Date | string | null | undefined,
): number => {
  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isNaN(ms) ? 0 : ms;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const ms = Date.parse(value);
    return Number.isNaN(ms) ? 0 : ms;
  }
  return 0;
};
