import type { ClientPortalFormConditionals } from '@vises/contracts';
import type { ApplicantInput } from '../../portal-core/types/portal-mapping.types';
import { APPLICANT_CRM_STRING_KEYS } from '../constants/edit-member-crm-applicant-string-keys.constants';
import { EDIT_MEMBER_CRM_CONDITIONALS_KEY_MAP } from '../constants/edit-member-crm-conditionals-key-map.constants';
import type { EditMemberCrmApplicantSource } from '../types/edit-member-fill-input.types';
import { readEditMemberCrmString } from './read-edit-member-crm-string.util';

const assignOptionalString = (
  target: EditMemberCrmApplicantSource,
  key: string,
  value: unknown,
): void => {
  const trimmed = readEditMemberCrmString(value);
  if (trimmed !== undefined) {
    target[key] = trimmed;
  }
};

const applyPortalFormConditionals = (
  target: EditMemberCrmApplicantSource,
  conditionals: ClientPortalFormConditionals,
): void => {
  for (const [sourceKey, targetKey] of Object.entries(
    EDIT_MEMBER_CRM_CONDITIONALS_KEY_MAP,
  )) {
    const raw = conditionals[sourceKey as keyof ClientPortalFormConditionals];
    if (raw === null || raw === undefined) {
      continue;
    }
    if (typeof raw === 'boolean') {
      target[targetKey] = raw;
      continue;
    }
    assignOptionalString(target, targetKey, raw);
  }
};

/**
 * Build Edit Member CRM applicant source from ApplicantInput.
 * Copies known keys only when present — never invents values (REQ-005 / REQ-009).
 */
export const mapApplicantInputToEditMemberCrmApplicant = (
  applicant: ApplicantInput,
): EditMemberCrmApplicantSource => {
  const source: EditMemberCrmApplicantSource = {};

  for (const key of APPLICANT_CRM_STRING_KEYS) {
    assignOptionalString(source, key, applicant[key]);
  }

  // Builder reads fingerprint date via portal field id.
  const fingerprintDate = readEditMemberCrmString(
    applicant.previousFingerPrintDate,
  );
  if (fingerprintDate !== undefined) {
    source.previousFingerPrintDate = fingerprintDate;
    source.PreviousFingerPrintDate = fingerprintDate;
  }

  const conditionals = applicant.portalFormConditionals;
  if (conditionals != null && typeof conditionals === 'object') {
    applyPortalFormConditionals(
      source,
      conditionals as ClientPortalFormConditionals,
    );
  }

  const isMinor = applicant.isMinor;
  if (isMinor !== undefined && isMinor !== null) {
    source.isMinor = isMinor as boolean | string;
  }

  return source;
};
