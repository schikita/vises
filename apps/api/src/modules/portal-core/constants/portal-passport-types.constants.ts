/**
 * Authoritative BLS RegisterUser PassportType option labels (CON-002).
 * Keep in sync with web `passport-types.constants.ts` and feature CON-002.
 * Exact English portal match strings only — no Russian option labels here.
 */
export const PORTAL_PASSPORT_TYPES = [
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
] as const;
