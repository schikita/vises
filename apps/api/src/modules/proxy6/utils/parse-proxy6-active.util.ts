/** Map Proxy6 `active` field variants to boolean (default true when absent). */
export const parseProxy6Active = (
  value: string | number | boolean | undefined | null,
): boolean => {
  if (value === undefined || value === null) return true;
  if (value === true || value === 1 || value === '1') return true;
  if (value === false || value === 0 || value === '0') return false;
  if (typeof value === 'string') {
    const lower = value.trim().toLowerCase();
    if (lower === 'yes' || lower === 'true' || lower === 'active') return true;
    if (lower === 'no' || lower === 'false' || lower === 'expired') return false;
  }
  return true;
};
