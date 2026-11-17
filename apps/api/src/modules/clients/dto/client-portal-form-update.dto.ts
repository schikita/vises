import { IsObject, IsOptional, IsString } from 'class-validator';
import type { ClientPortalFormConditionals } from '@vises/contracts';

/**
 * Nest body for `PATCH /clients/:clientId/portal-form`.
 * Mirrors `@vises/contracts` `ClientPortalFormUpdateDto` (REQ-004 / DEC-002).
 * Not gated by FR-6 passport unlock.
 * Conditionals bag is opaque jsonb — boolean|string unions allowed (CON-004).
 */
export class ClientPortalFormUpdateDto {
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  homeAddressLine2?: string;

  @IsOptional()
  @IsString()
  homeCountry?: string;

  @IsOptional()
  @IsString()
  homeCity?: string;

  @IsOptional()
  @IsString()
  homePostalCode?: string;

  @IsOptional()
  @IsString()
  employerName?: string;

  @IsOptional()
  @IsString()
  employerPhone?: string;

  @IsOptional()
  @IsString()
  employerAddress?: string;

  @IsOptional()
  @IsString()
  occupation?: string;

  @IsOptional()
  @IsString()
  previousFingerPrintStatus?: string;

  @IsOptional()
  @IsString()
  previousFingerPrintDate?: string;

  @IsOptional()
  @IsString()
  blsInvitingAuthority?: string;

  @IsOptional()
  @IsString()
  invitingAuthorityName?: string;

  @IsOptional()
  @IsString()
  invitingCountry?: string;

  @IsOptional()
  @IsString()
  invitingCity?: string;

  @IsOptional()
  @IsString()
  invitingZipCode?: string;

  @IsOptional()
  @IsString()
  invitingAddress?: string;

  @IsOptional()
  @IsString()
  invitingEmail?: string;

  @IsOptional()
  @IsString()
  invitingContactNo?: string;

  @IsOptional()
  @IsString()
  invitingFaxNo?: string;

  @IsOptional()
  @IsString()
  invitingContactName?: string;

  @IsOptional()
  @IsString()
  invitingContactSurname?: string;

  @IsOptional()
  @IsString()
  invitingContactCountry?: string;

  @IsOptional()
  @IsString()
  invitingContactCity?: string;

  @IsOptional()
  @IsString()
  invitingContactZipCode?: string;

  @IsOptional()
  @IsString()
  invitingContactAddress?: string;

  @IsOptional()
  @IsString()
  invitingContactContactNo?: string;

  @IsOptional()
  @IsString()
  invitingContactEmail?: string;

  @IsOptional()
  @IsString()
  invitingContactFaxNo?: string;

  @IsOptional()
  @IsString()
  costCoveredBy?: string;

  @IsOptional()
  @IsString()
  meansOfSupport?: string;

  @IsOptional()
  @IsString()
  memberStateSecondDestination?: string;

  @IsOptional()
  @IsObject()
  portalFormConditionals?: ClientPortalFormConditionals;
}
