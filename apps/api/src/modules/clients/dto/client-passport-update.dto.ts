import { IsOptional, IsString } from 'class-validator';

/**
 * Nest body for `PATCH /clients/:clientId/passport`.
 * Mirrors `@vises/contracts` `ClientPassportUpdateDto` (T1 freeze / FR-6 / §6.5).
 */
export class ClientPassportUpdateDto {
  @IsOptional()
  @IsString()
  passportNumber?: string;

  @IsOptional()
  @IsString()
  passportIssued?: string;

  @IsOptional()
  @IsString()
  passportExpires?: string;

  @IsOptional()
  @IsString()
  passportType?: string;

  @IsOptional()
  @IsString()
  passportIssueCountry?: string;

  @IsOptional()
  @IsString()
  passportIssuedBy?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  lastNameAtBirth?: string;

  @IsOptional()
  @IsString()
  dob?: string;

  @IsOptional()
  @IsString()
  placeOfBirth?: string;

  @IsOptional()
  @IsString()
  countryOfBirth?: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsString()
  nationalityAtBirth?: string;

  @IsOptional()
  @IsString()
  nationalId?: string;

  @IsOptional()
  @IsString()
  otherNames?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  maritalStatus?: string;
}
