import { PORTAL_CAPMONSTER_UNSOLVABLE_BACKOFF_STEP_MS } from '../constants';

/**
 * Progressive unsolvable backoff delay after counted try `n` (DEC-011 / REQ-013).
 * Returns `n * STEP` for `n ∈ {1..9}`; otherwise `0` (try-1 pre-delay / after try 10).
 */
export const computePortalCapmonsterUnsolvableBackoffMs = (
  unsolvableTryCount: number,
): number => {
  if (unsolvableTryCount < 1 || unsolvableTryCount > 9) {
    return 0;
  }
  return unsolvableTryCount * PORTAL_CAPMONSTER_UNSOLVABLE_BACKOFF_STEP_MS;
};
