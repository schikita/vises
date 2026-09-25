/**
 * Start Completeness field set, phone digit rule, and Russian operator messages
 * (REQ-002, DEC-001, DEC-006). Named constants only — no helper functions.
 * Field list mirrors FE Start Completeness (NFR-006); normative set in feature spec.
 */

/** Portal Mobile mapping: national phone digit count after `\D` strip. */
export const BLS_APPLICANT_COMPLETENESS_PHONE_DIGITS_LENGTH = 9;

/** Separator for aggregated Completeness `{ detail }` (align with date gate). */
export const BLS_APPLICANT_COMPLETENESS_DETAIL_SEPARATOR = '; ';

/**
 * Per-applicant required string fields (trim; empty/whitespace = missing).
 * `phone` also has a digit-length format rule after the required check.
 */
export const BLS_APPLICANT_COMPLETENESS_REQUIRED_FIELD_KEYS = [
  'firstName',
  'lastName',
  'lastNameAtBirth',
  'dob',
  'countryOfBirth',
  'passportNumber',
  'passportIssued',
  'passportExpires',
  'passportType',
  'passportIssueCountry',
  'passportIssuedBy',
  'phone',
] as const;

export const BLS_APPLICANT_COMPLETENESS_MSG_FIRST_NAME_MISSING = 'Укажите имя';

export const BLS_APPLICANT_COMPLETENESS_MSG_LAST_NAME_MISSING =
  'Укажите фамилию';

export const BLS_APPLICANT_COMPLETENESS_MSG_LAST_NAME_AT_BIRTH_MISSING =
  'Укажите фамилию при рождении';

export const BLS_APPLICANT_COMPLETENESS_MSG_DOB_MISSING =
  'Укажите дату рождения';

export const BLS_APPLICANT_COMPLETENESS_MSG_COUNTRY_OF_BIRTH_MISSING =
  'Укажите страну рождения';

export const BLS_APPLICANT_COMPLETENESS_MSG_PASSPORT_NUMBER_MISSING =
  'Укажите номер паспорта';

export const BLS_APPLICANT_COMPLETENESS_MSG_PASSPORT_ISSUED_MISSING =
  'Укажите дату выдачи паспорта';

export const BLS_APPLICANT_COMPLETENESS_MSG_PASSPORT_EXPIRES_MISSING =
  'Укажите срок действия паспорта';

export const BLS_APPLICANT_COMPLETENESS_MSG_PASSPORT_TYPE_MISSING =
  'Укажите тип паспорта';

export const BLS_APPLICANT_COMPLETENESS_MSG_PASSPORT_ISSUE_COUNTRY_MISSING =
  'Укажите страну выдачи паспорта';

export const BLS_APPLICANT_COMPLETENESS_MSG_PASSPORT_ISSUED_BY_MISSING =
  'Укажите кем выдан паспорт';

export const BLS_APPLICANT_COMPLETENESS_MSG_PHONE_MISSING = 'Укажите телефон';

export const BLS_APPLICANT_COMPLETENESS_MSG_PHONE_INVALID_DIGITS =
  'Телефон должен содержать ровно 9 цифр';

export const BLS_APPLICANT_COMPLETENESS_MSG_CLIENT_EMAIL_MISSING =
  'Укажите email клиента';
