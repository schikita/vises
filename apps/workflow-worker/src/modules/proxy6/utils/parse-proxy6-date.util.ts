/**
 * Parse Proxy6 date string or unixtime (seconds) into a Date.
 * Returns null when the value is missing or unparseable.
 */
export const parseProxy6Date = (
  value: string | number | undefined | null,
): Date | null => {
  if (value === undefined || value === null) return null;
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value <= 0) return null;
    return new Date(value * 1000);
  }
  const trimmed = value.trim();
  if (trimmed === '') return null;
  if (/^\d+$/.test(trimmed)) {
    const n = Number(trimmed);
    if (!Number.isFinite(n) || n <= 0) return null;
    return new Date(n * 1000);
  }
  const parsed = new Date(trimmed.replace(' ', 'T'));
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};
