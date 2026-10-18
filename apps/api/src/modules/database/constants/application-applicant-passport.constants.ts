/**
 * Defaults + one-time legacy → CON-002 map for `applications.applicants` jsonb.
 * Keep portal English labels in sync with portal-core CON-002 / CON-003.
 */
export const APPLICATION_APPLICANT_DEFAULT_PASSPORT_TYPE =
  'Ordinary Passport' as const;

export const APPLICATION_APPLICANT_DEFAULT_PASSPORT_ISSUE_COUNTRY =
  'Belarus' as const;

/**
 * Known pre-CON-002 stored values → exact portal PassportType labels.
 * Applied only in schema bootstrap backfill (not at autofill runtime).
 */
export const APPLICATION_APPLICANT_LEGACY_PASSPORT_TYPE_MAP = {
  'Ordinary passport': APPLICATION_APPLICANT_DEFAULT_PASSPORT_TYPE,
  'Обычный паспорт': APPLICATION_APPLICANT_DEFAULT_PASSPORT_TYPE,
  'Diplomatic passport': 'Diplomatic Passport',
  'Дипломатический паспорт': 'Diplomatic Passport',
  'Official passport': 'Official Passport',
  'Официальный паспорт': 'Official Passport',
} as const;
