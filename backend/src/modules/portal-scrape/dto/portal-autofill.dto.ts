import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/** Body for `POST /api/apps/:applicationId/portal-autofill` (DEC-001 / DEC-009). */
export class PortalAutofillDto {
  @IsString()
  @IsNotEmpty()
  applicantId!: string;

  /**
   * When true, abandon prior in_progress run and start a new runId (DEC-009).
   * Default / omitted → resume eligible in_progress for the same pair.
   */
  @IsOptional()
  @IsBoolean()
  supersede?: boolean;
}
