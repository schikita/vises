/**
 * Stub / scaffolding literals for domain BLS clients (TASK-007).
 * Named constants only — no helper functions.
 */

/** Shared stub error code until TASK-008+ implement page automation. */
export const BLS_CLIENT_STUB_ERROR_CODE = 'bls_client_stub';

/** Operator-facing stub detail when a domain client is not yet implemented. */
export const BLS_CLIENT_STUB_ERROR_MESSAGE =
  'Клиент BLS ещё не реализован (заглушка)';

/** Dispatcher fallback when step/task key has no mapped client. */
export const BLS_CLIENT_UNKNOWN_TASK_ERROR_CODE = 'bls_client_unknown_task';

/** Operator-facing detail for unmapped task keys. */
export const BLS_CLIENT_UNKNOWN_TASK_ERROR_MESSAGE =
  'Неизвестный тип задачи workflow';

/** REGISTER: application has no applicant to map/fill. */
export const BLS_REGISTER_NO_APPLICANT_ERROR_CODE =
  'bls_register_no_applicant';

export const BLS_REGISTER_NO_APPLICANT_ERROR_MESSAGE =
  'В заявке нет заявителя для регистрации на портале';

/**
 * REGISTER: `#btnSubmit` may have applied without confirmed success page
 * (VERIFY_THEN_REPEAT).
 */
export const BLS_REGISTER_SUBMIT_AMBIGUOUS_ERROR_CODE =
  'bls_register_submit_ambiguous';

export const BLS_REGISTER_SUBMIT_AMBIGUOUS_ERROR_MESSAGE =
  'Отправка регистрации не подтверждена — требуется повторная проверка';

/** REGISTER: fill/captcha/OTP/config hard failure (SAFE_TO_REPEAT). */
export const BLS_REGISTER_PIPELINE_ERROR_CODE = 'bls_register_pipeline';

/**
 * REGISTER mid-run Core/Extended date defense (dates only, before browser).
 * Distinct from create/start/retry/resume start-gate 400 and from OTP pipeline
 * failures (DEC-003 / REQ-005 / REQ-006). Does not imply Completeness mid-run.
 */
export const BLS_REGISTER_MID_RUN_DATE_GATE_ERROR_CODE =
  'bls_register_mid_run_date_gate';

export const BLS_REGISTER_PORTAL_PASSWORD_EMAIL_ERROR_CODE =
  'bls_register_portal_password_email';

export const BLS_REGISTER_PORTAL_PASSWORD_EMAIL_ERROR_MESSAGE =
  'Не удалось получить пароль портала из письма после регистрации';

/**
 * LOGIN: password submit may have applied without confirmed authed landing
 * (VERIFY_THEN_REPEAT).
 */
export const BLS_LOGIN_SUBMIT_AMBIGUOUS_ERROR_CODE =
  'bls_login_submit_ambiguous';

export const BLS_LOGIN_SUBMIT_AMBIGUOUS_ERROR_MESSAGE =
  'Отправка пароля входа не подтверждена — требуется повторная проверка';

/** LOGIN: missing email/password/config or decoy/verify hard failure. */
export const BLS_LOGIN_PIPELINE_ERROR_CODE = 'bls_login_pipeline';

export const BLS_LOGIN_MISSING_EMAIL_ERROR_MESSAGE =
  'В заявке нет portalFormEmail для входа на портал';

export const BLS_LOGIN_MISSING_PASSWORD_ERROR_MESSAGE =
  'Пароль портала не найден в vault для входа';

/**
 * PASSWORD_CHANGE: submit may have applied without confirmed form absence
 * (VERIFY_THEN_REPEAT).
 */
export const BLS_PASSWORD_CHANGE_SUBMIT_AMBIGUOUS_ERROR_CODE =
  'bls_password_change_submit_ambiguous';

export const BLS_PASSWORD_CHANGE_SUBMIT_AMBIGUOUS_ERROR_MESSAGE =
  'Смена пароля не подтверждена — требуется повторная проверка';

/** PASSWORD_CHANGE: login/detect/fill/config hard failure (SAFE_TO_REPEAT). */
export const BLS_PASSWORD_CHANGE_PIPELINE_ERROR_CODE =
  'bls_password_change_pipeline';

export const BLS_PASSWORD_CHANGE_MISSING_EMAIL_ERROR_MESSAGE =
  'В заявке нет portalFormEmail для смены пароля на портале';

export const BLS_PASSWORD_CHANGE_MISSING_PASSWORD_ERROR_MESSAGE =
  'Текущий пароль портала не найден в vault для смены';

/** Orchestrator skipReason when forced-change UI is absent (REQ-012). */
export const BLS_PASSWORD_CHANGE_SKIP_REASON_NOT_PRESENTED =
  'Портал не запросил смену пароля';

/**
 * STATUS: edit submit may have applied without confirmed READY_TO_BOOK
 * (VERIFY_THEN_REPEAT).
 */
export const BLS_STATUS_SUBMIT_AMBIGUOUS_ERROR_CODE =
  'bls_status_submit_ambiguous';

export const BLS_STATUS_SUBMIT_AMBIGUOUS_ERROR_MESSAGE =
  'Статус заявителя после правки не подтверждён — требуется повторная проверка';

/** STATUS: login/navigate/scrape/config hard failure (SAFE_TO_REPEAT). */
export const BLS_STATUS_PIPELINE_ERROR_CODE = 'bls_status_pipeline';

export const BLS_STATUS_MISSING_EMAIL_ERROR_MESSAGE =
  'В заявке нет portalFormEmail для проверки статуса на портале';

export const BLS_STATUS_MISSING_PASSWORD_ERROR_MESSAGE =
  'Пароль портала не найден в vault для проверки статуса';

export const BLS_STATUS_MISSING_APPLICANT_ERROR_CODE =
  'bls_status_missing_applicant';

export const BLS_STATUS_MISSING_APPLICANT_ERROR_MESSAGE =
  'В заявке нет заявителя для проверки статуса на портале';

/** STATUS: normalized UNKNOWN — never success (REQ-018). */
export const BLS_STATUS_UNKNOWN_ERROR_CODE = 'bls_status_unknown';

export const BLS_STATUS_UNKNOWN_ERROR_MESSAGE =
  'Статус заявителя на портале неизвестен (UNKNOWN)';

/** STATUS: still FORM_FILLING_IN_PROGRESS or not READY_TO_BOOK. */
export const BLS_STATUS_NOT_READY_ERROR_CODE = 'bls_status_not_ready';

export const BLS_STATUS_NOT_READY_ERROR_MESSAGE =
  'Заявитель ещё не в статусе Ready To Book Appointment';

/** BOOK: login/navigate/open UI/config hard failure (SAFE_TO_REPEAT). */
export const BLS_BOOKING_PIPELINE_ERROR_CODE = 'bls_booking_pipeline';

export const BLS_BOOKING_MISSING_EMAIL_ERROR_MESSAGE =
  'В заявке нет portalFormEmail для бронирования на портале';

export const BLS_BOOKING_MISSING_PASSWORD_ERROR_MESSAGE =
  'Пароль портала не найден в vault для бронирования';

/** BOOK: Manage Applicants opened but booking selection UI not reached. */
export const BLS_BOOKING_UI_NOT_OPEN_ERROR_CODE = 'bls_booking_ui_not_open';

export const BLS_BOOKING_UI_NOT_OPEN_ERROR_MESSAGE =
  'UI выбора локации/типа визы для записи не открыт';

/**
 * BOOK: would advance past CON-006 VisaType submit / payment / Premium Lounge
 * (NOT_SAFE_TO_REPEAT — do not click).
 */
export const BLS_BOOKING_NOT_SAFE_ERROR_CODE = 'bls_booking_not_safe';

export const BLS_BOOKING_NOT_SAFE_ERROR_MESSAGE =
  'Действие бронирования за границей CON-006 — требуется персонал (без авто-клика Submit/оплаты)';
