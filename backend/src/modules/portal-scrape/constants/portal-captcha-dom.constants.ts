/**
 * Portal BLS CAPTCHA DOM geometry / decoy heuristics (stay in portal-scrape per DEC-001).
 */

/**
 * Decoy `.box-label` text is camouflaged with near-white / floral-white color
 * (e.g. #fffaf0), not `display:none`. Labels at or above these RGB channels
 * are treated as unreadable decoys on the light captcha background.
 */
export const PORTAL_CAPTCHA_CAMOUFLAGED_LABEL_MIN_R = 240;
export const PORTAL_CAPTCHA_CAMOUFLAGED_LABEL_MIN_G = 240;
export const PORTAL_CAPTCHA_CAMOUFLAGED_LABEL_MIN_B = 230;

/** Row-band tolerance (px) when sorting visible cells top→bottom, left→right. */
export const PORTAL_CAPTCHA_CELL_SORT_ROW_TOLERANCE_PX = 40;
