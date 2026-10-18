import { Injectable } from '@nestjs/common';
import type { IPortalFieldMapper } from './interfaces/portal-field-mapper.interface';
import type { FieldResult } from './types/portal-field.types';
import type {
  ApplicantInput,
  ApplicationInput,
  MapFieldsOptions,
  MappingResult,
} from './types/portal-mapping.types';
import { digitsOnly } from './utils/digits-only.util';
import { fail } from './utils/fail.util';
import { filled } from './utils/filled.util';
import { mappingOk } from './utils/mapping-ok.util';
import { nonEmpty } from './utils/non-empty.util';
import { skipped } from './utils/skipped.util';

/**
 * Map Vises applicant/application → portal field values (DEC-003, DEC-004).
 * Relocated from scripts package for Nest (REQ-016).
 * Optional `emailOverride` is legacy map-time Email override only.
 * Primary OTP path fills `#Email` post-captcha (REQ-003 / DEC-001).
 * Pass `otpPathArmed` so EmailOtp skip notes defer to temporary email fill.
 */
@Injectable()
export class PortalFieldMapperService implements IPortalFieldMapper {
  mapFields(
    application: ApplicationInput,
    applicant: ApplicantInput,
    options?: MapFieldsOptions,
  ): MappingResult {
    const fields: FieldResult[] = [];
    const notes: string[] = [
      'SurName/LastName mapping is provisional (DEC-004 / OQ-4) until product confirms.',
    ];

    const lastName = nonEmpty(applicant.lastName);
    if (lastName) {
      fields.push(
        filled('SurName', lastName, {
          provisional: true,
          reason: 'provisional: SurName ← applicant.lastName (DEC-004)',
        }),
      );
    } else {
      fields.push(fail('SurName', 'missing applicant.lastName'));
    }

    const firstName = nonEmpty(applicant.firstName);
    if (firstName) {
      fields.push(filled('FirstName', firstName));
    } else {
      fields.push(fail('FirstName', 'missing applicant.firstName'));
    }

    const lastNameAtBirth = nonEmpty(applicant.lastNameAtBirth);
    if (lastNameAtBirth) {
      fields.push(
        filled('LastName', lastNameAtBirth, {
          provisional: true,
          reason:
            lastName && lastNameAtBirth !== lastName
              ? 'provisional: LastName ← lastNameAtBirth (differs from lastName)'
              : 'provisional: LastName ← lastNameAtBirth',
        }),
      );
    } else {
      fields.push(fail('LastName', 'missing applicant.lastNameAtBirth'));
    }

    const dob = nonEmpty(applicant.dob);
    if (dob) {
      fields.push(filled('DateOfBirth', dob));
    } else {
      fields.push(fail('DateOfBirth', 'missing applicant.dob'));
    }

    const passportType = nonEmpty(applicant.passportType);
    if (passportType) {
      fields.push(
        filled('PassportType', passportType, {
          reason: 'from applicant.passportType',
        }),
      );
    } else {
      fields.push(fail('PassportType', 'missing applicant.passportType'));
    }

    // REQ-007 / DEC-002: BirthCountry ← passportIssueCountry only (not countryOfBirth).
    const passportIssueCountry = nonEmpty(applicant.passportIssueCountry);
    if (passportIssueCountry) {
      fields.push(
        filled('BirthCountry', passportIssueCountry, {
          reason: 'from applicant.passportIssueCountry',
        }),
      );
    } else {
      fields.push(
        fail('BirthCountry', 'missing applicant.passportIssueCountry'),
      );
    }

    const passportNumber = nonEmpty(applicant.passportNumber);
    if (passportNumber) {
      fields.push(filled('PassportNumber', passportNumber));
    } else {
      fields.push(fail('PassportNumber', 'missing applicant.passportNumber'));
    }

    const passportIssued = nonEmpty(applicant.passportIssued);
    if (passportIssued) {
      fields.push(filled('PassportIssueDate', passportIssued));
    } else {
      fields.push(fail('PassportIssueDate', 'missing applicant.passportIssued'));
    }

    const passportExpires = nonEmpty(applicant.passportExpires);
    if (passportExpires) {
      fields.push(filled('PassportExpiryDate', passportExpires));
    } else {
      fields.push(
        fail('PassportExpiryDate', 'missing applicant.passportExpires'),
      );
    }

    const issuePlace = nonEmpty(applicant.passportIssuedBy);
    if (issuePlace) {
      fields.push(
        filled('IssuePlace', issuePlace, {
          reason: 'from applicant.passportIssuedBy',
        }),
      );
    } else {
      fields.push(
        fail(
          'IssuePlace',
          'missing applicant.passportIssuedBy (placeOfBirth is not used)',
        ),
      );
    }

    const mobileRaw = nonEmpty(applicant.phone);
    if (mobileRaw) {
      const digits = digitsOnly(mobileRaw);
      if (digits.length === 9) {
        fields.push(
          filled('Mobile', digits, {
            reason: 'from applicant.phone (digits-only)',
          }),
        );
      } else {
        fields.push(
          fail(
            'Mobile',
            `invalid mobile: expected 9 digits after stripping non-digits, got length ${digits.length}`,
          ),
        );
      }
    } else {
      fields.push(fail('Mobile', 'missing applicant.phone'));
    }

    const emailOverride = nonEmpty(options?.emailOverride);
    if (emailOverride) {
      fields.push(
        filled('Email', emailOverride, {
          reason: 'from temporary mailbox disposable account',
        }),
      );
    } else if (options?.otpPathArmed === true) {
      fields.push(
        skipped(
          'Email',
          'skipped at map; filled post-captcha via temporary mailbox (DEC-001)',
        ),
      );
    } else {
      const email =
        nonEmpty(applicant.email) ?? nonEmpty(application.clientEmail);
      if (email) {
        fields.push(
          filled('Email', email, {
            reason: nonEmpty(applicant.email)
              ? 'from applicant.email'
              : 'from application.clientEmail',
          }),
        );
      } else {
        fields.push(
          fail('Email', 'missing applicant.email and application.clientEmail'),
        );
      }
    }

    fields.push(
      skipped('CountryCode', 'leave form default (+375); do not overwrite'),
    );

    // EmailOtp is never written at map time; pipeline fills it after captcha success
    // when OTP path is armed (REQ-009 / DEC-001).
    const otpDeferred =
      Boolean(emailOverride) || options?.otpPathArmed === true;
    fields.push(
      skipped(
        'EmailOtp',
        otpDeferred
          ? 'skipped at map; filled later via temporary mailbox OTP after captcha'
          : 'not filled (email OTP path unarmed)',
      ),
    );

    return {
      applicationId: String(application.id ?? ''),
      applicantId: String(applicant.id ?? ''),
      fields,
      ok: mappingOk(fields),
      metadata: {
        nameMappingProvisional: true,
        notes,
      },
    };
  }
}
