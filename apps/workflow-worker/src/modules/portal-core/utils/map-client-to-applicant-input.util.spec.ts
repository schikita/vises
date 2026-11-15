import assert from 'node:assert/strict';
import type { Client } from '../../database/entities/client.entity';
import { mapClientToApplicantInput } from './map-client-to-applicant-input.util';

/**
 * APF-TASK-004 Client → ApplicantInput mapping checks.
 * Run: npx --yes tsx src/modules/portal-core/utils/map-client-to-applicant-input.util.spec.ts
 */

const baseClient = (): Client =>
  ({
    id: 'c-1',
    agentId: 'a-1',
    email: 'a@example.com',
    phone: null,
    address: '  Line1  ',
    purpose: '',
    firstEntry: null,
    entries: null,
    durationDays: null,
    relationship: null,
    passportNumber: null,
    passportIssued: null,
    passportExpires: null,
    passportType: null,
    passportIssueCountry: null,
    passportIssuedBy: null,
    firstName: null,
    lastName: null,
    lastNameAtBirth: null,
    dob: null,
    placeOfBirth: null,
    countryOfBirth: null,
    nationality: null,
    nationalityAtBirth: null,
    nationalId: null,
    otherNames: null,
    gender: null,
    maritalStatus: null,
    homeAddressLine2: null,
    homeCountry: 'Poland',
    homeCity: '  ',
    homePostalCode: '00-001',
    employerName: 'Acme',
    employerPhone: null,
    employerAddress: null,
    occupation: null,
    previousFingerPrintStatus: '1',
    previousFingerPrintDate: null,
    blsInvitingAuthority: '1',
    invitingAuthorityName: 'Corp',
    invitingCountry: null,
    invitingCity: null,
    invitingZipCode: null,
    invitingAddress: null,
    invitingEmail: null,
    invitingContactNo: null,
    invitingFaxNo: null,
    invitingContactName: null,
    invitingContactSurname: null,
    invitingContactCountry: null,
    invitingContactCity: null,
    invitingContactZipCode: null,
    invitingContactAddress: null,
    invitingContactContactNo: null,
    invitingContactEmail: null,
    invitingContactFaxNo: null,
    costCoveredBy: 'self',
    meansOfSupport: null,
    memberStateSecondDestination: null,
    portalFormConditionals: null,
    createdAt: new Date(0),
    updatedAt: new Date(0),
  }) as Client;

const decryptPacked = (packed: string): string => `plain:${packed}`;

{
  const mapped = mapClientToApplicantInput(baseClient(), decryptPacked);
  assert.equal(mapped.id, 'c-1');
  assert.equal(mapped.email, 'a@example.com');
  assert.equal(mapped.address, 'Line1');
  assert.equal(mapped.purpose, undefined, 'blank purpose omitted');
  assert.equal(mapped.phone, undefined, 'null phone omitted');
  assert.equal(mapped.homeCountry, 'Poland');
  assert.equal(mapped.homeCity, undefined, 'whitespace-only homeCity omitted');
  assert.equal(mapped.homePostalCode, '00-001');
  assert.equal(mapped.employerName, 'Acme');
  assert.equal(mapped.previousFingerPrintStatus, '1');
  assert.equal(mapped.blsInvitingAuthority, '1');
  assert.equal(mapped.invitingAuthorityName, 'Corp');
  assert.equal(mapped.costCoveredBy, 'self');
  assert.equal(mapped.portalFormConditionals, undefined);
}

{
  const client = baseClient();
  client.portalFormConditionals = {
    isMinor: true,
    minorParentSurname: 'Parent',
  };
  const mapped = mapClientToApplicantInput(client, decryptPacked);
  assert.deepEqual(mapped.portalFormConditionals, {
    isMinor: true,
    minorParentSurname: 'Parent',
  });
  assert.equal(mapped.isMinor, true);
}

{
  const client = baseClient();
  client.firstName = 'iv:tag:cipher';
  const mapped = mapClientToApplicantInput(client, decryptPacked);
  assert.equal(mapped.firstName, 'plain:iv:tag:cipher');
}

console.log('map-client-to-applicant-input.util.spec.ts: ok');
