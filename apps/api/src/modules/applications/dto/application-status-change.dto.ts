import { IsIn, IsOptional, IsString } from 'class-validator';
import { APPLICATION_STATUSES } from '@vises/contracts';
import type { ApplicationStatus } from '@vises/contracts';

/**
 * Nest body for `POST /applications/:applicationId/status`.
 * Mirrors `@vises/contracts` `ApplicationStatusChangeDto` (T1 freeze / AC-12).
 */
export class ApplicationStatusChangeDto {
  @IsString()
  @IsIn([...APPLICATION_STATUSES])
  targetStatus!: ApplicationStatus;

  @IsOptional()
  @IsString()
  trigger?: string;
}
