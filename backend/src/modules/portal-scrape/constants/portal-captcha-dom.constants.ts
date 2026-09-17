/**
 * Portal BLS CAPTCHA DOM geometry / decoy heuristics (stay in portal-scrape per DEC-001).
 */

/**
 * Decoy `.box-label` text color on the portal CAPTCHA (AliceBlue / #F0F8FF).
 * Real TaskArgument labels do not use this color.
 */
export const PORTAL_CAPTCHA_DECOY_LABEL_COLOR_RGB = 'rgb(240, 248, 255)';

/** Row-band tolerance (px) when sorting visible cells top→bottom, left→right. */
export const PORTAL_CAPTCHA_CELL_SORT_ROW_TOLERANCE_PX = 40;
