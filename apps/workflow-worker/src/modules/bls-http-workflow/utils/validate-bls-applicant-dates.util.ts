import {
  BLS_APPLICANT_DATE_MAX_ISSUE_AGE_YEARS,
  BLS_APPLICANT_DATE_MIN_VALIDITY_DAYS,
  BLS_APPLICANT_DATE_MSG_DOB_MISSING,
  BLS_APPLICANT_DATE_MSG_DOB_NOT_BEFORE_TODAY,
  BLS_APPLICANT_DATE_MSG_DOB_UNPARSEABLE,
  BLS_APPLICANT_DATE_MSG_PASSPORT_EXPIRES_LT_180_DAYS,
  BLS_APPLICANT_DATE_MSG_PASSPORT_EXPIRES_LT_RETURN_PLUS_3M,
  BLS_APPLICANT_DATE_MSG_PASSPORT_EXPIRES_MISSING,
  BLS_APPLICANT_DATE_MSG_PASSPORT_EXPIRES_UNPARSEABLE,
  BLS_APPLICANT_DATE_MSG_PASSPORT_ISSUED_AFTER_EXPIRES,
  BLS_APPLICANT_DATE_MSG_PASSPORT_ISSUED_BEFORE_DOB,
  BLS_APPLICANT_DATE_MSG_PASSPORT_ISSUED_FUTURE,
  BLS_APPLICANT_DATE_MSG_PASSPORT_ISSUED_MISSING,
  BLS_APPLICANT_DATE_MSG_PASSPORT_ISSUED_OLDER_THAN_10Y,
  BLS_APPLICANT_DATE_MSG_PASSPORT_ISSUED_UNPARSEABLE,
  BLS_APPLICANT_DATE_RETURN_VALIDITY_MONTHS,
} from '../constants/bls-applicant-date.constants';
import type {
  BlsApplicantDateViolation,
  ValidateBlsApplicantDatesInput,
} from '../types/bls-applicant-date.types';
import { addCalendarDays } from './add-calendar-days.util';
import { addCalendarMonths } from './add-calendar-months.util';
import { addCalendarYears } from './add-calendar-years.util';
import { buildBlsApplicantDateIdentityLabel } from './build-bls-applicant-date-identity-label.util';
import { compareDateOnlyYmd } from './compare-date-only-ymd.util';
import { formatDateOnlyParts } from './format-date-only-parts.util';
import { parseDateOnly } from './parse-date-only.util';

/**
 * Core a/b/c + Extended e1–e4 for one applicant (DEC-001, DEC-002, DEC-007).
 * Aggregates every failed rule (DEC-006). e3 skipped when returnDate unparseable.
 */
export const validateBlsApplicantDates = (
  input: ValidateBlsApplicantDatesInput,
): BlsApplicantDateViolation[] => {
  const { applicant, referenceDateYmd, returnDateRaw } = input;
  const applicantId = String(applicant.id).trim();
  const applicantLabel = buildBlsApplicantDateIdentityLabel(applicant);
  const violations: BlsApplicantDateViolation[] = [];

  const push = (
    ruleId: BlsApplicantDateViolation['ruleId'],
    message: string,
  ): void => {
    violations.push({ ruleId, applicantId, applicantLabel, message });
  };

  const referenceParsed = parseDateOnly(referenceDateYmd);
  const dobParsed = parseDateOnly(applicant.dob);
  const issuedParsed = parseDateOnly(applicant.passportIssued);
  const expiresParsed = parseDateOnly(applicant.passportExpires);
  const returnParsed = parseDateOnly(returnDateRaw);

  if (dobParsed.status === 'missing') {
    push('dob_missing', BLS_APPLICANT_DATE_MSG_DOB_MISSING);
  } else if (dobParsed.status === 'unparseable') {
    push('dob_unparseable', BLS_APPLICANT_DATE_MSG_DOB_UNPARSEABLE);
  } else if (compareDateOnlyYmd(dobParsed.ymd, referenceDateYmd) >= 0) {
    push('dob_not_before_today', BLS_APPLICANT_DATE_MSG_DOB_NOT_BEFORE_TODAY);
  }

  if (issuedParsed.status === 'missing') {
    push('passport_issued_missing', BLS_APPLICANT_DATE_MSG_PASSPORT_ISSUED_MISSING);
  } else if (issuedParsed.status === 'unparseable') {
    push(
      'passport_issued_unparseable',
      BLS_APPLICANT_DATE_MSG_PASSPORT_ISSUED_UNPARSEABLE,
    );
  } else if (compareDateOnlyYmd(issuedParsed.ymd, referenceDateYmd) > 0) {
    push('passport_issued_future', BLS_APPLICANT_DATE_MSG_PASSPORT_ISSUED_FUTURE);
  }

  if (expiresParsed.status === 'missing') {
    push(
      'passport_expires_missing',
      BLS_APPLICANT_DATE_MSG_PASSPORT_EXPIRES_MISSING,
    );
  } else if (expiresParsed.status === 'unparseable') {
    push(
      'passport_expires_unparseable',
      BLS_APPLICANT_DATE_MSG_PASSPORT_EXPIRES_UNPARSEABLE,
    );
  } else if (referenceParsed.status === 'ok') {
    const minExpiryYmd = formatDateOnlyParts(
      addCalendarDays(
        referenceParsed.parts,
        BLS_APPLICANT_DATE_MIN_VALIDITY_DAYS,
      ),
    );
    if (compareDateOnlyYmd(expiresParsed.ymd, minExpiryYmd) < 0) {
      push(
        'passport_expires_lt_180_days',
        BLS_APPLICANT_DATE_MSG_PASSPORT_EXPIRES_LT_180_DAYS,
      );
    }
  }

  if (issuedParsed.status === 'ok' && expiresParsed.status === 'ok') {
    if (compareDateOnlyYmd(issuedParsed.ymd, expiresParsed.ymd) > 0) {
      push(
        'passport_issued_after_expires',
        BLS_APPLICANT_DATE_MSG_PASSPORT_ISSUED_AFTER_EXPIRES,
      );
    }
  }

  if (issuedParsed.status === 'ok' && dobParsed.status === 'ok') {
    if (compareDateOnlyYmd(issuedParsed.ymd, dobParsed.ymd) < 0) {
      push(
        'passport_issued_before_dob',
        BLS_APPLICANT_DATE_MSG_PASSPORT_ISSUED_BEFORE_DOB,
      );
    }
  }

  if (returnParsed.status === 'ok' && expiresParsed.status === 'ok') {
    const minAfterReturnYmd = formatDateOnlyParts(
      addCalendarMonths(
        returnParsed.parts,
        BLS_APPLICANT_DATE_RETURN_VALIDITY_MONTHS,
      ),
    );
    if (compareDateOnlyYmd(expiresParsed.ymd, minAfterReturnYmd) < 0) {
      push(
        'passport_expires_lt_return_plus_3m',
        BLS_APPLICANT_DATE_MSG_PASSPORT_EXPIRES_LT_RETURN_PLUS_3M,
      );
    }
  }

  if (issuedParsed.status === 'ok' && referenceParsed.status === 'ok') {
    const minIssuedYmd = formatDateOnlyParts(
      addCalendarYears(
        referenceParsed.parts,
        -BLS_APPLICANT_DATE_MAX_ISSUE_AGE_YEARS,
      ),
    );
    if (compareDateOnlyYmd(issuedParsed.ymd, minIssuedYmd) < 0) {
      push(
        'passport_issued_older_than_10y',
        BLS_APPLICANT_DATE_MSG_PASSPORT_ISSUED_OLDER_THAN_10Y,
      );
    }
  }

  return violations;
};
