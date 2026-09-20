/** Seed settings row when table empty (parity with FastAPI seed). */
export const SEED_SETTINGS_ID = 1;
export const SEED_COMPANY = 'Vises';
export const SEED_DEFAULT_PRICE = 180;
/** Locked submit/scraper cities (owner-console-ux DEC-011). */
export const SEED_CITIES = ['Минск'] as const;
export const SEED_DESTINATIONS = [
  'Испания',
  'Кипр',
  'Франция',
  'Италия',
] as const;
/** Retained columns; effective enablement is credentials-only (DEC-002). */
export const SEED_WEBSHARE_PROXY_ENABLED = true;
export const SEED_WEBSHARE_PLAN_ID = '';
export const SEED_EMAIL_OTP_ENABLED = true;
