/**
 * Start Completeness field set, phone digit rule, and Russian operator messages
 * (REQ-002, DEC-001, DEC-006, APF REQ-008). Named constants only — no helper functions.
 * Field list mirrors Edit Member happy-path `*` (adult + inviting=company); normative
 * set in feature spec. Inviting company auth+contact block is always required at the
 * start gate (happy-path simplicity; not authority-branched).
 */

/** Portal Mobile mapping: national phone digit count after `\D` strip. */
export const BLS_APPLICANT_COMPLETENESS_PHONE_DIGITS_LENGTH = 9;

/** Separator for aggregated Completeness `{ detail }` (align with date gate). */
export const BLS_APPLICANT_COMPLETENESS_DETAIL_SEPARATOR = '; ';

/**
 * Per-applicant required string fields (trim; empty/whitespace = missing).
 * `phone` also has a digit-length format rule after the required check.
 * Excludes: homeAddressLine2, previousFingerPrint*, memberStateSecondDestination,
 * inviting fax fields, portalFormConditionals (CON-004).
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
  'address',
  'homeCountry',
  'homeCity',
  'homePostalCode',
  'purpose',
  'firstEntry',
  'entries',
  'durationDays',
  'employerName',
  'employerPhone',
  'employerAddress',
  'occupation',
  'blsInvitingAuthority',
  'invitingAuthorityName',
  'invitingCountry',
  'invitingCity',
  'invitingZipCode',
  'invitingAddress',
  'invitingEmail',
  'invitingContactNo',
  'invitingContactName',
  'invitingContactSurname',
  'invitingContactCountry',
  'invitingContactCity',
  'invitingContactZipCode',
  'invitingContactAddress',
  'invitingContactContactNo',
  'invitingContactEmail',
  'costCoveredBy',
  'meansOfSupport',
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

export const BLS_APPLICANT_COMPLETENESS_MSG_ADDRESS_MISSING =
  'Укажите адрес проживания';

export const BLS_APPLICANT_COMPLETENESS_MSG_HOME_COUNTRY_MISSING =
  'Укажите страну проживания';

export const BLS_APPLICANT_COMPLETENESS_MSG_HOME_CITY_MISSING =
  'Укажите город проживания';

export const BLS_APPLICANT_COMPLETENESS_MSG_HOME_POSTAL_CODE_MISSING =
  'Укажите почтовый индекс';

export const BLS_APPLICANT_COMPLETENESS_MSG_PURPOSE_MISSING =
  'Укажите цель поездки';

export const BLS_APPLICANT_COMPLETENESS_MSG_FIRST_ENTRY_MISSING =
  'Укажите страну первого въезда';

export const BLS_APPLICANT_COMPLETENESS_MSG_ENTRIES_MISSING =
  'Укажите количество въездов';

export const BLS_APPLICANT_COMPLETENESS_MSG_DURATION_DAYS_MISSING =
  'Укажите срок пребывания';

export const BLS_APPLICANT_COMPLETENESS_MSG_EMPLOYER_NAME_MISSING =
  'Укажите название работодателя';

export const BLS_APPLICANT_COMPLETENESS_MSG_EMPLOYER_PHONE_MISSING =
  'Укажите телефон работодателя';

export const BLS_APPLICANT_COMPLETENESS_MSG_EMPLOYER_ADDRESS_MISSING =
  'Укажите адрес работодателя';

export const BLS_APPLICANT_COMPLETENESS_MSG_OCCUPATION_MISSING =
  'Укажите род занятий';

export const BLS_APPLICANT_COMPLETENESS_MSG_BLS_INVITING_AUTHORITY_MISSING =
  'Укажите тип приглашающей стороны';

export const BLS_APPLICANT_COMPLETENESS_MSG_INVITING_AUTHORITY_NAME_MISSING =
  'Укажите название приглашающей организации';

export const BLS_APPLICANT_COMPLETENESS_MSG_INVITING_COUNTRY_MISSING =
  'Укажите страну приглашающей организации';

export const BLS_APPLICANT_COMPLETENESS_MSG_INVITING_CITY_MISSING =
  'Укажите город приглашающей организации';

export const BLS_APPLICANT_COMPLETENESS_MSG_INVITING_ZIP_CODE_MISSING =
  'Укажите индекс приглашающей организации';

export const BLS_APPLICANT_COMPLETENESS_MSG_INVITING_ADDRESS_MISSING =
  'Укажите адрес приглашающей организации';

export const BLS_APPLICANT_COMPLETENESS_MSG_INVITING_EMAIL_MISSING =
  'Укажите email приглашающей организации';

export const BLS_APPLICANT_COMPLETENESS_MSG_INVITING_CONTACT_NO_MISSING =
  'Укажите телефон приглашающей организации';

export const BLS_APPLICANT_COMPLETENESS_MSG_INVITING_CONTACT_NAME_MISSING =
  'Укажите имя контактного лица';

export const BLS_APPLICANT_COMPLETENESS_MSG_INVITING_CONTACT_SURNAME_MISSING =
  'Укажите фамилию контактного лица';

export const BLS_APPLICANT_COMPLETENESS_MSG_INVITING_CONTACT_COUNTRY_MISSING =
  'Укажите страну контактного лица';

export const BLS_APPLICANT_COMPLETENESS_MSG_INVITING_CONTACT_CITY_MISSING =
  'Укажите город контактного лица';

export const BLS_APPLICANT_COMPLETENESS_MSG_INVITING_CONTACT_ZIP_CODE_MISSING =
  'Укажите индекс контактного лица';

export const BLS_APPLICANT_COMPLETENESS_MSG_INVITING_CONTACT_ADDRESS_MISSING =
  'Укажите адрес контактного лица';

export const BLS_APPLICANT_COMPLETENESS_MSG_INVITING_CONTACT_CONTACT_NO_MISSING =
  'Укажите телефон контактного лица';

export const BLS_APPLICANT_COMPLETENESS_MSG_INVITING_CONTACT_EMAIL_MISSING =
  'Укажите email контактного лица';

export const BLS_APPLICANT_COMPLETENESS_MSG_COST_COVERED_BY_MISSING =
  'Укажите кем покрываются расходы';

export const BLS_APPLICANT_COMPLETENESS_MSG_MEANS_OF_SUPPORT_MISSING =
  'Укажите средства к существованию';

export const BLS_APPLICANT_COMPLETENESS_MSG_CLIENT_EMAIL_MISSING =
  'Укажите email клиента';
