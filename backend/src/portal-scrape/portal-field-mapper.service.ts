import { Injectable } from '@nestjs/common';
import type { IPortalFieldMapperService } from './interfaces';
import type {
  ApplicantInput,
  ApplicationInput,
  FieldResult,
  GapOverrides,
  MappingResult,
  PortalFieldName,
} from './types';
import { mappingOk } from './utils/mapping-ok.util';

function nonEmpty(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const t = value.trim();
  return t.length > 0 ? t : undefined;
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

function fail(
  field: PortalFieldName,
  reason: string,
  extra?: Partial<FieldResult>,
): FieldResult {
  return { field, status: 'failed', reason, ...extra };
}

function filled(
  field: PortalFieldName,
  value: string,
  extra?: Partial<FieldResult>,
): FieldResult {
  return { field, status: 'filled', value, ...extra };
}

function skipped(
  field: PortalFieldName,
  reason: string,
  extra?: Partial<FieldResult>,
): FieldResult {
  return { field, status: 'skipped', reason, ...extra };
}

/**
 * Map Vises applicant/application → portal field values (DEC-003, DEC-004).
 * Relocated from scripts package for Nest (REQ-016).
 */
@Injectable()
export class PortalFieldMapperService implements IPortalFieldMapperService {
  mapFields(
    application: ApplicationInput,
    applicant: ApplicantInput,
    overrides: GapOverrides = {},
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

    const passportType =
      nonEmpty(applicant.passportType) ?? nonEmpty(overrides.passportType);
    if (passportType) {
      const fromApplicant = Boolean(nonEmpty(applicant.passportType));
      fields.push(
        filled('PassportType', passportType, {
          reason: fromApplicant
            ? 'from applicant.passportType'
            : 'from VISES_PORTAL_OVERRIDE_PASSPORT_TYPE',
        }),
      );
    } else {
      fields.push(
        fail(
          'PassportType',
          'missing applicant.passportType and VISES_PORTAL_OVERRIDE_PASSPORT_TYPE',
        ),
      );
    }

    const birthCountry = nonEmpty(applicant.countryOfBirth);
    if (birthCountry) {
      fields.push(filled('BirthCountry', birthCountry));
    } else {
      fields.push(fail('BirthCountry', 'missing applicant.countryOfBirth'));
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

    const issuePlace =
      nonEmpty(applicant.passportIssuedBy) ?? nonEmpty(overrides.issuePlace);
    if (issuePlace) {
      const fromApplicant = Boolean(nonEmpty(applicant.passportIssuedBy));
      fields.push(
        filled('IssuePlace', issuePlace, {
          reason: fromApplicant
            ? 'from applicant.passportIssuedBy'
            : 'from VISES_PORTAL_OVERRIDE_ISSUE_PLACE',
        }),
      );
    } else {
      fields.push(
        fail(
          'IssuePlace',
          'missing applicant.passportIssuedBy and VISES_PORTAL_OVERRIDE_ISSUE_PLACE (placeOfBirth is not used)',
        ),
      );
    }

    const mobileRaw =
      nonEmpty(applicant.phone) ?? nonEmpty(overrides.mobile);
    if (mobileRaw) {
      const digits = digitsOnly(mobileRaw);
      if (digits.length === 9) {
        const fromApplicant = Boolean(nonEmpty(applicant.phone));
        fields.push(
          filled('Mobile', digits, {
            reason: fromApplicant
              ? 'from applicant.phone (digits-only)'
              : 'from VISES_PORTAL_OVERRIDE_MOBILE (digits-only)',
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
      fields.push(
        fail(
          'Mobile',
          'missing applicant.phone and VISES_PORTAL_OVERRIDE_MOBILE',
        ),
      );
    }

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

    fields.push(
      skipped('CountryCode', 'leave form default (+375); do not overwrite'),
    );

    fields.push(skipped('EmailOtp', 'out of v1 scope (fill-only; DEC-007)'));

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
