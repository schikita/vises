/**
 * Parse an analytics `from` / `to` query value.
 * Date-only `YYYY-MM-DD` expands to UTC day start (from) or end (to).
 * Full ISO datetimes are used as-is.
 */
export const parseAnalyticsDateBound = (
  raw: string,
  edge: 'start' | 'end',
): Date => {
  const trimmed = raw.trim();
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (dateOnly) {
    const year = Number(dateOnly[1]);
    const month = Number(dateOnly[2]);
    const day = Number(dateOnly[3]);
    if (edge === 'start') {
      return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    }
    return new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
  }
  return new Date(trimmed);
};
