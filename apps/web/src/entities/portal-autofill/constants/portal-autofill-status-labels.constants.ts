/**
 * Ordered pipeline stage tokens (mirrors backend PORTAL_AUTOFILL_PIPELINE_STAGE).
 * Used to derive “passed” stages from the current checkpoint.
 */
export const PORTAL_AUTOFILL_PIPELINE_STAGE_ORDER = [
  'pre_browser',
  'navigating',
  'blocking_page_guard',
  'form_ready',
  'consent',
  'field_fill',
  'screenshot',
  'capmonster_verify',
  'capmonster_verified_loop',
  'otp',
  'terminal',
] as const

/** Russian labels for pipeline stage tokens (REQ-017). */
export const PORTAL_AUTOFILL_PIPELINE_STAGE_LABEL_RU: Record<string, string> = {
  pre_browser: 'Подготовка',
  navigating: 'Переход на портал',
  blocking_page_guard: 'Проверка блокирующей страницы',
  form_ready: 'Форма готова',
  consent: 'Согласие',
  field_fill: 'Заполнение полей',
  screenshot: 'Скриншот',
  capmonster_verify: 'Решение капчи',
  capmonster_verified_loop: 'Проверка Verified',
  otp: 'Код из email',
  terminal: 'Завершение',
}

/** Russian labels for run lifecycle status (REQ-017). */
export const PORTAL_AUTOFILL_RUN_STATUS_LABEL_RU: Record<string, string> = {
  in_progress: 'Выполняется',
  succeeded: 'Успешно',
  failed: 'Ошибка',
  abandoned: 'Прервано',
}

/** Russian labels for CapMonster CB state (REQ-017). */
export const PORTAL_AUTOFILL_CB_STATE_LABEL_RU: Record<string, string> = {
  closed: 'замкнут',
  open: 'разомкнут',
  'half-open': 'полуоткрыт',
}

/** Staff action button labels by impliedMode (DEC-008 / REQ-017). */
export const PORTAL_AUTOFILL_ACTION_LABEL_RU = {
  resume: 'Продолжить',
  start_new: 'Запустить автозаполнение',
  supersede: 'Запустить заново',
  captcha_new_run: 'Повторить решение капчи (новый запуск)',
  busy: 'Выполняется автозаполнение…',
} as const

/** Client portal-send state labels (REQ-003 / REQ-017). */
export const PORTAL_CLIENT_SEND_LABEL_RU: Record<string, string> = {
  not_started: 'Не отправлено на портал',
  in_progress: 'Автозаполнение выполняется',
  attempted: 'Отправлено на автозаполнение',
  succeeded: 'Автозаполнение завершено успешно',
  failed: 'Автозаполнение завершено с ошибкой',
}

/** Client site-outcome labels (REQ-005 / REQ-017). */
export const PORTAL_SITE_OUTCOME_LABEL_RU: Record<string, string> = {
  not_available: 'недоступно',
  approved: 'одобрено',
  rejected: 'отклонено',
  unknown: 'неизвестно',
}
