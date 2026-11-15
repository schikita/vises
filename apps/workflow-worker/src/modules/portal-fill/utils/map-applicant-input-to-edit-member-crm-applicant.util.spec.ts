import assert from 'node:assert/strict';
import type { ApplicantInput } from '../../portal-core/types/portal-mapping.types';
import { mapApplicantInputToEditMemberCrmApplicant } from './map-applicant-input-to-edit-member-crm-applicant.util';

/**
 * APF-TASK-004 Edit Member CRM pass-through checks.
 * Run: npx --yes tsx src/modules/portal-fill/utils/map-applicant-input-to-edit-member-crm-applicant.util.spec.ts
 */

{
  const applicant = {
    id: 'a-1',
    firstName: 'Anna',
    lastName: null,
    homeCity: '  ',
    purpose: '',
    employerName: 'Acme',
  } as unknown as ApplicantInput;

  const mapped = mapApplicantInputToEditMemberCrmApplicant(applicant);

  assert.equal(mapped.firstName, 'Anna');
  assert.equal(mapped.employerName, 'Acme');
  assert.equal(
    Object.prototype.hasOwnProperty.call(mapped, 'lastName'),
    false,
    'null CRM key omitted',
  );
  assert.equal(
    Object.prototype.hasOwnProperty.call(mapped, 'homeCity'),
    false,
    'whitespace-only CRM key omitted',
  );
  assert.equal(
    Object.prototype.hasOwnProperty.call(mapped, 'purpose'),
    false,
    'blank CRM key omitted',
  );
}

{
  const applicant = {
    id: 'a-2',
    previousFingerPrintDate: ' 2020-01-15 ',
  } as ApplicantInput;

  const mapped = mapApplicantInputToEditMemberCrmApplicant(applicant);

  assert.equal(mapped.previousFingerPrintDate, '2020-01-15');
  assert.equal(mapped.PreviousFingerPrintDate, '2020-01-15');
}

console.log(
  'map-applicant-input-to-edit-member-crm-applicant.util.spec.ts: ok',
);
