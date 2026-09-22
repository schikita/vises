/**
 * Proxy6 fair lease defaults (DEC-003 / DEC-004).
 */

/** Soft lease deadline; stale rows reclaimed on next acquire. */
export const PROXY6_LEASE_STALE_MS = 45 * 60 * 1000;

export const PROXY6_MSG_EMPTY_POOL =
  'Нет доступных прокси Proxy6 для назначения';
export const PROXY6_MSG_ALL_LEASED =
  'Все прокси Proxy6 заняты другими сессиями автозаполнения';
export const PROXY6_MSG_REPLACE_PARTIAL =
  'Прокси куплены, но удаление заменяемых не удалось. Новые сохранены в инвентаре; удалите старые вручную через API';
