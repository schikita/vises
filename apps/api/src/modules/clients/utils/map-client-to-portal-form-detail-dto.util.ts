import type { ClientPortalFormDetailDto } from '@vises/contracts';
import type { Client } from '../../database/entities/client.entity';

/** Map Client portal-form columns → ClientPortalFormDetailDto (REQ-004). */
export const mapClientToPortalFormDetailDto = (
  client: Client,
): ClientPortalFormDetailDto => {
  return {
    address: client.address,
    phone: client.phone,
    homeAddressLine2: client.homeAddressLine2,
    homeCountry: client.homeCountry,
    homeCity: client.homeCity,
    homePostalCode: client.homePostalCode,
    employerName: client.employerName,
    employerPhone: client.employerPhone,
    employerAddress: client.employerAddress,
    occupation: client.occupation,
    purpose: client.purpose,
    firstEntry: client.firstEntry,
    entries: client.entries,
    durationDays: client.durationDays,
    previousFingerPrintStatus: client.previousFingerPrintStatus,
    previousFingerPrintDate: client.previousFingerPrintDate,
    blsInvitingAuthority: client.blsInvitingAuthority,
    invitingAuthorityName: client.invitingAuthorityName,
    invitingCountry: client.invitingCountry,
    invitingCity: client.invitingCity,
    invitingZipCode: client.invitingZipCode,
    invitingAddress: client.invitingAddress,
    invitingEmail: client.invitingEmail,
    invitingContactNo: client.invitingContactNo,
    invitingFaxNo: client.invitingFaxNo,
    invitingContactName: client.invitingContactName,
    invitingContactSurname: client.invitingContactSurname,
    invitingContactCountry: client.invitingContactCountry,
    invitingContactCity: client.invitingContactCity,
    invitingContactZipCode: client.invitingContactZipCode,
    invitingContactAddress: client.invitingContactAddress,
    invitingContactContactNo: client.invitingContactContactNo,
    invitingContactEmail: client.invitingContactEmail,
    invitingContactFaxNo: client.invitingContactFaxNo,
    costCoveredBy: client.costCoveredBy,
    meansOfSupport: client.meansOfSupport,
    memberStateSecondDestination: client.memberStateSecondDestination,
    portalFormConditionals: client.portalFormConditionals,
  };
};
