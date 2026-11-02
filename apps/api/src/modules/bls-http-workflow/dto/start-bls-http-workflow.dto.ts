import { IsBoolean, IsOptional } from 'class-validator';

/** Body for `POST /api/apps/:applicationId/bls-workflow` (TASK-014 / DEC-013). */
export class StartBlsHttpWorkflowDto {
  /**
   * When true, abandon the active workflow (→ ABANDONED) and create a new one.
   * Default / omitted → 409 if an active workflow already exists.
   */
  @IsOptional()
  @IsBoolean()
  supersede?: boolean;
}
