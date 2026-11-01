import { IsOptional, IsString } from 'class-validator';

/**
 * Nest body for `POST /clients`.
 * Mirrors `@vises/contracts` `ClientCreateDto` (T1 freeze / FR-5 / §6.5).
 * Passport PII is written via ClientPassportUpdateDto after paid creation.
 */
export class ClientCreateDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  @IsString()
  firstEntry?: string;

  @IsOptional()
  @IsString()
  entries?: string;

  @IsOptional()
  @IsString()
  durationDays?: string;

  @IsOptional()
  @IsString()
  relationship?: string;
}
