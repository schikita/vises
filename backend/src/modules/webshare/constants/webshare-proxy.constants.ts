/**
 * Webshare Proxy List + lease defaults (webshare-portal-proxy DEC-002/007/008).
 * No named helper functions in this module.
 */

export const WEBSHARE_PROXY_LIST_BASE_URL =
  'https://proxy.webshare.io/api/v2/proxy/list/';

/**
 * Hardcoded connection mode: discrete `proxy_address` per lease (distinct egress
 * IP). Backbone (`p.webshare.io`) is weaker for distinct-IP leasing and is not
 * used by this app.
 */
export const WEBSHARE_PROXY_MODE = 'direct' as const;

/** Default list cache TTL (ms). */
export const WEBSHARE_PROXY_LIST_TTL_MS_DEFAULT = 60_000;

/** page_size for Proxy List pagination. */
export const WEBSHARE_PROXY_LIST_PAGE_SIZE = 100;

/** Safety cap on pagination pages (guards against next loops). */
export const WEBSHARE_PROXY_LIST_MAX_PAGES = 50;

/** Sleep before retry on HTTP 429 (ms); Webshare ~60 req/min. */
export const WEBSHARE_PROXY_LIST_429_BACKOFF_MS = 60_000;

/** Max retries after the first 429 response (total attempts = 1 + this). */
export const WEBSHARE_PROXY_LIST_429_MAX_RETRIES = 2;

/** Backbone connection host (kept for backbone helper utils). */
export const WEBSHARE_PROXY_BACKBONE_HOST = 'p.webshare.io';

/** Operator-facing Russian messages (fail closed; no secrets). */
export const WEBSHARE_PROXY_MSG_MISCONFIGURED =
  'WEBSHARE_API_KEY не задан — список прокси Webshare недоступен';
export const WEBSHARE_PROXY_MSG_AUTH =
  'Ошибка авторизации Webshare (проверьте API-ключ или план)';
export const WEBSHARE_PROXY_MSG_RATE_LIMITED =
  'Превышен лимит запросов Webshare Proxy List; повторите позже';
export const WEBSHARE_PROXY_MSG_EMPTY_POOL =
  'Нет доступных прокси Webshare для назначения';
export const WEBSHARE_PROXY_MSG_ALL_LEASED =
  'Все прокси Webshare заняты другими сессиями автозаполнения';
export const WEBSHARE_PROXY_MSG_LIST_FAILED =
  'Не удалось получить список прокси Webshare';
