import { Client } from '../../database/entities/client.entity';
import { mapClientToPortalFormDetailDto } from './map-client-to-portal-form-detail-dto.util';

describe('mapClientToPortalFormDetailDto (APF-TASK-003 / REQ-004 / PF-TASK-002)', (): void => {
  it('maps nulls when portal fields are unset', (): void => {
    const client = Object.assign(new Client(), {
      id: 'cli-1',
      agentId: 'agent-1',
      address: null,
      homeAddressLine2: null,
      homeCountry: null,
      homeCity: null,
      homePostalCode: null,
      employerName: null,
      employerPhone: null,
      employerAddress: null,
      occupation: null,
      previousFingerPrintStatus: null,
      previousFingerPrintDate: null,
      blsInvitingAuthority: null,
      invitingAuthorityName: null,
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
      costCoveredBy: null,
      meansOfSupport: null,
      memberStateSecondDestination: null,
      phone: null,
      purpose: null,
      firstEntry: null,
      entries: null,
      durationDays: null,
      portalFormConditionals: null,
    });

    const dto = mapClientToPortalFormDetailDto(client);
    expect(dto.address).toBeNull();
    expect(dto.employerName).toBeNull();
    expect(dto.phone).toBeNull();
    expect(dto.purpose).toBeNull();
    expect(dto.firstEntry).toBeNull();
    expect(dto.entries).toBeNull();
    expect(dto.durationDays).toBeNull();
    expect(dto.portalFormConditionals).toBeNull();
  });

  it('maps stored portal values without inventing missing ones', (): void => {
    const client = Object.assign(new Client(), {
      address: 'Street 1',
      homeCity: 'Giza',
      employerName: 'Acme',
      portalFormConditionals: { isVisaIssuedBefore: true },
      homeAddressLine2: null,
      homeCountry: null,
      homePostalCode: null,
      employerPhone: null,
      employerAddress: null,
      occupation: null,
      previousFingerPrintStatus: null,
      previousFingerPrintDate: null,
      blsInvitingAuthority: null,
      invitingAuthorityName: null,
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
      costCoveredBy: null,
      meansOfSupport: null,
      memberStateSecondDestination: null,
      phone: '123456789',
      purpose: 'Tourism',
      firstEntry: 'Spain',
      entries: 'Multiple',
      durationDays: '15',
    });

    const dto = mapClientToPortalFormDetailDto(client);
    expect(dto.address).toBe('Street 1');
    expect(dto.homeCity).toBe('Giza');
    expect(dto.employerName).toBe('Acme');
    expect(dto.portalFormConditionals).toEqual({ isVisaIssuedBefore: true });
    expect(dto.occupation).toBeNull();
    expect(dto.phone).toBe('123456789');
    expect(dto.purpose).toBe('Tourism');
    expect(dto.firstEntry).toBe('Spain');
    expect(dto.entries).toBe('Multiple');
    expect(dto.durationDays).toBe('15');
  });
});
