/**
 * Staff-facing Russian messages for portal login prep (REQ-014).
 * Secret-safe — never embed API keys, proxy passwords, or tokens.
 */
export const PORTAL_LOGIN_PREP_MSG_APP_NOT_FOUND = 'Заявка не найдена';

export const PORTAL_LOGIN_PREP_MSG_MISSING_PORTAL_EMAIL =
  'Для подготовки входа на портал не задан email формы регистрации (portalFormEmail)';

export const PORTAL_LOGIN_PREP_MSG_BASE_URL =
  'Адрес портала не задан (VISES_PORTAL_BASE_URL)';

export const PORTAL_LOGIN_PREP_MSG_LOGIN_PATH =
  'Путь страницы входа не задан (VISES_PORTAL_LOGIN_PATH)';

export const PORTAL_LOGIN_PREP_MSG_INVALID_CONFIG =
  'Некорректная конфигурация портала для страницы входа';

/** Evidence root under UPLOAD_DIR for optional login-prep screenshots. */
export const PORTAL_LOGIN_PREP_EVIDENCE_SUBDIR = 'portal-login-prep';
