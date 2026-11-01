/**
 * Whole-number decimal strings only (int `default_price` column; no silent rounding).
 * Allows `180` or `180.00`.
 */
export const PRICE_PER_CLIENT_PATTERN = /^\d+(\.00)?$/;

export const PRICE_PER_CLIENT_PATTERN_MESSAGE =
  'price_per_client must be a non-negative whole-number decimal string (e.g. 180 or 180.00)';
