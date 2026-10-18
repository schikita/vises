/**
 * Server validation reference day `D` = UTC calendar date of `now` as
 * `YYYY-MM-DD` (DEC-004 / NFR-003). Do not import from `stats`.
 */
export const resolveUtcReferenceDateYmd = (now: Date = new Date()): string => {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};
