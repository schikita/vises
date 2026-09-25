import {
  APPLICATION_APPLICANT_DEFAULT_PASSPORT_ISSUE_COUNTRY,
  APPLICATION_APPLICANT_DEFAULT_PASSPORT_TYPE,
} from '../../database/constants';
import {
  SEED_BIRTH_PLACES,
  SEED_FIRST_NAMES_FEMALE,
  SEED_FIRST_NAMES_MALE,
  SEED_LAST_NAMES_FEMALE,
  SEED_LAST_NAMES_MALE,
  SEED_MARITAL_STATUSES,
} from '../constants';
import type { SeedApplicant, SeedRng } from '../types';
import { formatSeedPassportNumber } from './format-seed-passport-number.util';
import { formatSeedPhone } from './format-seed-phone.util';
import { pickSeedDateString } from './pick-seed-date-string.util';
import { pickSeedItem } from './pick-seed-item.util';

/** Build one random applicant payload for a seeded application. */
export const buildSeedApplicant = (
  id: string,
  rng: SeedRng,
): SeedApplicant => {
  const gender = rng() < 0.5 ? 'female' : 'male';
  const firstName = pickSeedItem(
    gender === 'female' ? SEED_FIRST_NAMES_FEMALE : SEED_FIRST_NAMES_MALE,
    rng,
  );
  const lastName = pickSeedItem(
    gender === 'female' ? SEED_LAST_NAMES_FEMALE : SEED_LAST_NAMES_MALE,
    rng,
  );
  const placeOfBirth = pickSeedItem(SEED_BIRTH_PLACES, rng);
  const passportIssued = pickSeedDateString(2018, 2024, rng);
  const issuedYear = Number(passportIssued.slice(0, 4));

  return {
    id,
    firstName,
    lastName,
    lastNameAtBirth: lastName,
    dob: pickSeedDateString(1970, 2004, rng),
    placeOfBirth,
    countryOfBirth: 'Беларусь',
    nationality: 'Беларусь',
    gender,
    maritalStatus: pickSeedItem(SEED_MARITAL_STATUSES, rng),
    passportType: APPLICATION_APPLICANT_DEFAULT_PASSPORT_TYPE,
    // CON-003 / DEC-010 — exact portal BirthCountry label.
    passportIssueCountry: APPLICATION_APPLICANT_DEFAULT_PASSPORT_ISSUE_COUNTRY,
    passportNumber: formatSeedPassportNumber(rng),
    passportIssued,
    passportExpires: `${issuedYear + 10}${passportIssued.slice(4)}`,
    passportIssuedBy: `РУЭП ${placeOfBirth}`,
    phone: formatSeedPhone(rng),
  };
};
