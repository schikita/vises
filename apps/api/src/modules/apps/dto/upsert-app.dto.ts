import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ALL_APP_STATUSES } from '../constants';

/**
 * FastAPI `AppIn` parity. Optional `createdAt`/`updatedAt` accepted so SPA
 * full-object upserts pass `forbidNonWhitelisted` (ignored on write).
 */
export class UpsertAppDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  clientEmail?: string;

  /**
   * Accepted so SPA full-object upserts pass `forbidNonWhitelisted`.
   * Ignored on write — portal-form email is set by autofill/seed only (DEC-001/005).
   */
  @IsOptional()
  @IsString()
  portalFormEmail?: string | null;

  /**
   * Accepted so SPA full-object upserts pass `forbidNonWhitelisted`.
   * Ignored on write — computed on read via `withPortalProgress` (DEC-007).
   */
  @IsOptional()
  portalProgress?: unknown;

  @IsOptional()
  @IsString()
  @IsIn([...ALL_APP_STATUSES])
  status?: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsString()
  visaType?: string;

  /**
   * Portal Visa Sub Type label/text (REQ-003 / DEC-003).
   * Maps to `applications.visa_sub_type`.
   */
  @IsOptional()
  @IsString()
  visaSubType?: string;

  @IsOptional()
  @IsString()
  submitCountry?: string;

  @IsOptional()
  @IsString()
  submitCity?: string;

  @IsOptional()
  @IsString()
  travelDate?: string;

  @IsOptional()
  @IsString()
  returnDate?: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsArray()
  applicants?: unknown[];

  @IsOptional()
  @IsArray()
  documents?: unknown[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  paymentAmount?: number;

  @IsOptional()
  @IsBoolean()
  paymentPaid?: boolean;

  @IsOptional()
  @IsString()
  paymentNote?: string;

  @IsOptional()
  @IsString()
  visitDate?: string;

  @IsOptional()
  @IsString()
  visitTime?: string;

  @IsOptional()
  @IsString()
  visitPlace?: string;

  @IsOptional()
  @IsString()
  manager?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  paused?: boolean;

  @IsOptional()
  @IsBoolean()
  transfer?: boolean;

  @IsOptional()
  @IsString()
  submitFrom?: string;

  @IsOptional()
  @IsString()
  submitTo?: string;

  @IsOptional()
  @IsArray()
  timeline?: unknown[];

  @IsOptional()
  @IsString()
  createdAt?: string;

  @IsOptional()
  @IsString()
  updatedAt?: string;

  /**
   * Optional workflow arming action on staff upsert (DEC-015).
   * Default ensure when omitted for admin|manager.
   */
  @IsOptional()
  @IsString()
  @IsIn(['ensure', 'supersede', 'none'])
  portalWorkflowAction?: 'ensure' | 'supersede' | 'none';
}
