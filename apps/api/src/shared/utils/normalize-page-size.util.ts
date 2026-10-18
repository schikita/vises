import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../constants/pagination.constants';

/**
 * Clamp page size to `[1, MAX_PAGE_SIZE]`; missing/invalid values use
 * `DEFAULT_PAGE_SIZE` (DEC-002).
 */
export const normalizePageSize = (raw: unknown): number => {
  if (raw === undefined || raw === null || String(raw).trim() === '') {
    return DEFAULT_PAGE_SIZE;
  }
  const parsed =
    typeof raw === 'number'
      ? raw
      : Number.parseInt(String(raw).trim(), 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return DEFAULT_PAGE_SIZE;
  }
  return Math.min(Math.floor(parsed), MAX_PAGE_SIZE);
};
