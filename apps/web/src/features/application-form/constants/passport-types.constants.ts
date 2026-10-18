/**
 * Authoritative BLS RegisterUser PassportType option labels (CON-002).
 * Keep in sync with backend `portal-passport-types.constants.ts` and feature CON-002.
 * Stored/submitted values are these English strings; RU labels live in i18n.
 */
export const PASSPORT_TYPES = [
  'Ordinary Passport',
  'Collective Passport',
  'Diplomatic Passport',
  'D. Viaje Apatridas C. New York',
  'Government official on duty',
  'National laissez-passer',
  'Official Passport',
  'Passport of foreigners',
  'Protection passport',
  'Refugee Travel Document (Geneva Convention)',
  'Seaman book',
  'UN laissez-passer',
] as const
