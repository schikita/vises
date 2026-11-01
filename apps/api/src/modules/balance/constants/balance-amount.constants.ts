/**
 * Signed money decimal string (scale ≤ 2). NFR-1 — no float encoding.
 * Examples: `180`, `180.00`, `-50.5`, `+10.25`.
 */
export const MONEY_DECIMAL_STRING_PATTERN = /^[+-]?\d+(\.\d{1,2})?$/;

/** Fixed fractional digits for balance / ledger numeric(14,2) (NFR-1). */
export const MONEY_DECIMAL_SCALE = 2;

/** Scale factor for integer-cent arithmetic (10^MONEY_DECIMAL_SCALE). */
export const MONEY_CENTS_PER_UNIT = 100n;
