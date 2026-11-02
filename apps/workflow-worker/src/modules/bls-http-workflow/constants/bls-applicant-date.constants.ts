/**
 * Applicant / passport date gate limits and Russian operator messages
 * (REQ-003, REQ-010, DEC-001, DEC-002, DEC-005).
 * Named constants only — no helper functions.
 */

/** Core (c): minimum remaining passport validity from reference day `D`. */
export const BLS_APPLICANT_DATE_MIN_VALIDITY_DAYS = 180;

/** Extended e4: passport must be issued within this many years before `D`. */
export const BLS_APPLICANT_DATE_MAX_ISSUE_AGE_YEARS = 10;

/** Extended e3: passport must remain valid this many months after return date. */
export const BLS_APPLICANT_DATE_RETURN_VALIDITY_MONTHS = 3;

/** Separator for aggregated start-gate `{ detail }` (DEC-006). */
export const BLS_APPLICANT_DATE_DETAIL_SEPARATOR = '; ';

export const BLS_APPLICANT_DATE_MSG_DOB_MISSING = 'Дата рождения не указана';

export const BLS_APPLICANT_DATE_MSG_DOB_UNPARSEABLE =
  'Дата рождения имеет некорректный формат';

export const BLS_APPLICANT_DATE_MSG_DOB_NOT_BEFORE_TODAY =
  'Дата рождения не может быть сегодня или позже';

export const BLS_APPLICANT_DATE_MSG_PASSPORT_ISSUED_MISSING =
  'Дата выдачи паспорта не указана';

export const BLS_APPLICANT_DATE_MSG_PASSPORT_ISSUED_UNPARSEABLE =
  'Дата выдачи паспорта имеет некорректный формат';

export const BLS_APPLICANT_DATE_MSG_PASSPORT_ISSUED_FUTURE =
  'Дата выдачи паспорта не может быть в будущем';

export const BLS_APPLICANT_DATE_MSG_PASSPORT_EXPIRES_MISSING =
  'Срок действия паспорта не указан';

export const BLS_APPLICANT_DATE_MSG_PASSPORT_EXPIRES_UNPARSEABLE =
  'Срок действия паспорта имеет некорректный формат';

export const BLS_APPLICANT_DATE_MSG_PASSPORT_EXPIRES_LT_180_DAYS =
  'Срок действия паспорта должен быть не менее 180 дней';

export const BLS_APPLICANT_DATE_MSG_PASSPORT_ISSUED_AFTER_EXPIRES =
  'Дата выдачи паспорта не может быть позже срока действия';

export const BLS_APPLICANT_DATE_MSG_PASSPORT_ISSUED_BEFORE_DOB =
  'Дата выдачи паспорта не может быть раньше даты рождения';

export const BLS_APPLICANT_DATE_MSG_PASSPORT_EXPIRES_LT_RETURN_PLUS_3M =
  'Срок действия паспорта должен быть не менее 3 месяцев после даты возвращения';

export const BLS_APPLICANT_DATE_MSG_PASSPORT_ISSUED_OLDER_THAN_10Y =
  'Паспорт выдан более 10 лет назад';
