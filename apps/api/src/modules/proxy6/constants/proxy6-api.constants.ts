/**
 * Proxy6 HTTP API constants (https://proxy6.net/developers).
 * Rate-limit / backoff: DEC-008.
 */

/** Official API origin (key + method in path). */
export const PROXY6_API_BASE_URL = 'https://px6.link/api';

/** Steady-state min spacing between outbound Proxy6 calls (≤3 req/s). */
export const PROXY6_MIN_REQUEST_SPACING_MS = 350;

/** Bounded 429 backoff delays (ms); length = max attempts including first try. */
export const PROXY6_429_BACKOFF_MS = [400, 800, 1600] as const;

/** Max attempts for a single method call when HTTP 429 is returned. */
export const PROXY6_429_MAX_ATTEMPTS = PROXY6_429_BACKOFF_MS.length;

/** Default Proxy6 IP version for buy/price/count/country (IPv4). */
export const PROXY6_DEFAULT_VERSION = 4;

/** Default proxy type for buy (Patchright maps auto → http://host:port). */
export const PROXY6_DEFAULT_TYPE = 'auto' as const;

export const PROXY6_API_ERROR_NAME = 'Proxy6ApiError';

export const PROXY6_MSG_MISCONFIGURED =
  'PROXY6_API_KEY не задан — операции Proxy6 недоступны';
export const PROXY6_MSG_AUTH =
  'Неверный ключ Proxy6 API (ошибка авторизации)';
export const PROXY6_MSG_RATE_LIMITED =
  'Превышен лимит запросов Proxy6 (не более 3 в секунду). Повторите позже';
export const PROXY6_MSG_NO_MONEY = 'Недостаточно средств на балансе Proxy6';
export const PROXY6_MSG_NO_STOCK =
  'Недостаточно доступных прокси Proxy6 для покупки';
export const PROXY6_MSG_NOT_FOUND = 'Объект Proxy6 не найден';
export const PROXY6_MSG_BAD_METHOD = 'Неверный метод Proxy6 API';
export const PROXY6_MSG_REQUEST_FAILED =
  'Не удалось выполнить запрос к Proxy6 API';
